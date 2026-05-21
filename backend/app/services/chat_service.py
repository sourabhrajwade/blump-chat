import logging
import time
from typing import Any

import httpx
from minio import Minio
from motor.motor_asyncio import AsyncIOMotorDatabase
from qdrant_client import AsyncQdrantClient

from app.config import Settings
from app.llm.chat_client import chat_complete
from app.models.domain import TokenUsage
from app.models.schemas.chat import (
    AttachFileResponse,
    ChatCitation,
    ChatQueryRequest,
    ChatQueryResponse,
    ConversationListItem,
    ConversationListResponse,
    RetrievalFilters,
    SaveMessageRequest,
    SaveMessageResponse,
    TokenUsageResponse,
)
from app.services.upload_service import upload_file_bytes
from app.services.conversation_title import generate_conversation_title
from app.services.embeddings.bge_m3 import embed_query
from app.services.memory.conversation_memory import rows_to_chat_messages
from app.services.repositories.conversations import ConversationsRepository
from app.services.repositories.messages import MessagesRepository
from app.services.retrieval.hybrid import HybridRetriever
from app.services.retrieval.rerank import RetrievedChunk

logger = logging.getLogger(__name__)


def _format_retrieved_context(chunks: list[RetrievedChunk]) -> str:
    parts: list[str] = []
    for i, ch in enumerate(chunks, start=1):
        parts.append(
            f"[{i}] file_id={ch.file_id} chunk_index={ch.chunk_index} score={ch.score:.4f}\n{ch.text}"
        )
    return "\n\n".join(parts) if parts else "(no relevant chunks retrieved)"


class ChatService:
    """Business logic for conversational RAG (Model layer in MVP: persistence + retrieval + LLM)."""

    def __init__(
        self,
        *,
        settings: Settings,
        messages_repo: MessagesRepository,
        conversations_repo: ConversationsRepository,
        http: httpx.AsyncClient,
        qdrant: AsyncQdrantClient,
        retriever: HybridRetriever,
    ) -> None:
        self._settings = settings
        self._messages = messages_repo
        self._conversations = conversations_repo
        self._http = http
        self._qdrant = qdrant
        self._retriever = retriever

    async def attach_file(
        self,
        *,
        minio_client: Minio,
        mongo_db: AsyncIOMotorDatabase,
        username: str,
        conversation_id: str | None,
        filename: str,
        content: bytes,
        content_type: str | None,
    ) -> AttachFileResponse:
        created = False
        if conversation_id:
            await self._conversations.require_for_user(conversation_id, username)
            conv_id = conversation_id
        else:
            conv = await self._conversations.create_new(username=username)
            conv_id = conv.id
            created = True

        upload = await upload_file_bytes(
            minio_client=minio_client,
            mongo_db=mongo_db,
            filename=filename,
            content=content,
            content_type=content_type,
            created_by=username,
            settings=self._settings,
        )

        await self._conversations.append_file_id(conv_id, upload.id)

        msg = self._messages.build_attachment_message(
            conversation_id=conv_id,
            user_id=username,
            file_id=upload.id,
            url=upload.url,
            filename=filename,
            mime_type=content_type,
        )
        await self._messages.insert(msg)
        await self._conversations.append_message_id(
            conv_id,
            msg.id,
            model=self._settings.ollama_chat_model,
            set_title=filename[:200],
        )

        return AttachFileResponse(
            conversation_id=conv_id,
            file_id=upload.id,
            url=upload.url,
            message_id=msg.id,
            filename=filename,
            created=created,
        )

    async def save_message(self, body: SaveMessageRequest) -> SaveMessageResponse:
        model = (body.model or self._settings.ollama_chat_model).strip()
        created = False
        if body.conversation_id:
            await self._conversations.require_for_user(
                body.conversation_id, body.username
            )
            conversation_id = body.conversation_id
        else:
            conv = await self._conversations.create_new(username=body.username)
            conversation_id = conv.id
            created = True
            logger.info(
                "conversation_created",
                extra={"conversation_id": conversation_id, "username": body.username},
            )

        user_msg = self._messages.build_user_message(
            conversation_id=conversation_id,
            content=body.message,
            user_id=body.username,
            model=model,
        )
        await self._messages.insert(user_msg)
        await self._conversations.append_message_id(
            conversation_id,
            user_msg.id,
            model=model,
            set_title=body.message[:200] if body.message else None,
        )

        conv_doc = await self._conversations.get_by_id(conversation_id)
        message_ids = list((conv_doc or {}).get("message_ids") or [])

        return SaveMessageResponse(
            conversation_id=conversation_id,
            message_id=user_msg.id,
            user_id=body.username,
            message_ids=message_ids,
            created=created,
        )

    async def process_query(self, body: ChatQueryRequest) -> ChatQueryResponse:
        t0 = time.perf_counter()
        if body.conversation_id:
            await self._conversations.require_for_user(
                body.conversation_id, body.username
            )
            conversation_id = body.conversation_id
        else:
            conv = await self._conversations.create_new(username=body.username)
            conversation_id = conv.id
            logger.info(
                "conversation_created",
                extra={"conversation_id": conversation_id, "username": body.username},
            )

        memory_rows = await self._messages.list_recent_for_memory(
            conversation_id,
            limit=self._settings.chat_memory_message_limit,
        )

        retrieval_filters = body.retrieval_filters or RetrievalFilters(
            top_k=self._settings.chat_retrieval_top_k,
        )

        user_msg = self._messages.build_user_message(
            conversation_id=conversation_id,
            content=body.message,
            user_id=body.username,
            model=body.selected_model,
        )
        await self._messages.insert(user_msg)
        await self._conversations.append_message_id(
            conversation_id,
            user_msg.id,
            model=body.selected_model,
            set_title=None,
        )

        agent_id = (body.selected_model or self._settings.chat_agent_id).strip()

        chunks: list[RetrievedChunk] = []
        try:
            query_vector = await embed_query(self._http, self._settings, body.message)
            chunks = await self._retriever.retrieve(
                self._qdrant,
                query_vector,
                retrieval_filters,
                query_text=body.message,
            )
        except Exception:
            logger.warning(
                "retrieval_skipped",
                exc_info=True,
                extra={"conversation_id": conversation_id},
            )

        if chunks:
            system_content = (
                f"{self._settings.chat_system_prompt}\n\n"
                f"### Retrieved context\n{_format_retrieved_context(chunks)}"
            )
        else:
            system_content = (
                "You are a helpful assistant. Reply naturally and concisely to the user."
            )
        llm_messages: list[dict[str, str]] = [{"role": "system", "content": system_content}]
        llm_messages.extend(rows_to_chat_messages(memory_rows))
        llm_messages.append({"role": "user", "content": body.message})

        answer, raw_usage = await chat_complete(
            self._http,
            self._settings,
            model=body.selected_model,
            messages=llm_messages,
        )

        citations = [
            ChatCitation(
                file_id=c.file_id,
                chunk_index=c.chunk_index,
                text=c.text[:800],
                score=c.score,
            )
            for c in chunks
        ]
        retrieval_meta: dict[str, Any] = {
            "citations": [c.model_dump() for c in citations],
            "filters": retrieval_filters.model_dump(exclude_none=True),
        }

        token_usage = TokenUsage(
            prompt_tokens=raw_usage.get("prompt_tokens"),
            completion_tokens=raw_usage.get("completion_tokens"),
            total_tokens=raw_usage.get("total_tokens"),
        )
        assistant_msg = self._messages.build_assistant_message(
            conversation_id=conversation_id,
            content=answer,
            agent_id=agent_id,
            model=body.selected_model,
            token_usage=token_usage,
            retrieval_metadata=retrieval_meta,
        )
        await self._messages.insert(assistant_msg)
        await self._conversations.append_message_id(
            conversation_id,
            assistant_msg.id,
            model=body.selected_model,
            set_title=None,
        )

        conv_doc = await self._conversations.get_by_id(conversation_id)
        conversation_title: str | None = (conv_doc or {}).get("title")
        if not conversation_title:
            try:
                conversation_title = await generate_conversation_title(
                    self._http,
                    self._settings,
                    model=body.selected_model,
                    user_message=body.message,
                    assistant_message=answer,
                )
                await self._conversations.set_title(conversation_id, conversation_title)
            except Exception:
                logger.warning(
                    "title_generation_failed",
                    exc_info=True,
                    extra={"conversation_id": conversation_id},
                )
                conversation_title = body.message[:80].strip() or "New chat"
                await self._conversations.set_title(conversation_id, conversation_title)

        elapsed_ms = int((time.perf_counter() - t0) * 1000)
        logger.info(
            "chat_query_completed",
            extra={
                "conversation_id": conversation_id,
                "latency_ms": elapsed_ms,
                "username": body.username,
            },
        )

        return ChatQueryResponse(
            conversation_id=conversation_id,
            user_message_id=user_msg.id,
            assistant_message_id=assistant_msg.id,
            user_id=body.username,
            agent_id=agent_id,
            title=conversation_title,
            answer=answer,
            citations=citations,
            token_usage=TokenUsageResponse(
                prompt_tokens=token_usage.prompt_tokens,
                completion_tokens=token_usage.completion_tokens,
                total_tokens=token_usage.total_tokens,
            ),
            model_used=body.selected_model,
        )

    async def list_conversations(
        self,
        username: str,
        *,
        limit: int = 50,
    ) -> ConversationListResponse:
        rows = await self._conversations.list_for_user(username, limit=limit)
        items: list[ConversationListItem] = []
        for r in rows:
            last = await self._messages.get_latest(r["id"])
            preview: str | None = None
            if last:
                raw = last.get("content", "")
                preview = (raw if isinstance(raw, str) else str(raw))[:160]
            updated = r.get("updated_at")
            updated_str = (
                updated.isoformat().replace("+00:00", "Z")
                if hasattr(updated, "isoformat")
                else str(updated)
            )
            meta = r.get("metadata") or {}
            total = meta.get("total_messages", len(r.get("message_ids") or []))
            items.append(
                ConversationListItem(
                    id=r["id"],
                    title=r.get("title"),
                    preview=preview,
                    updated_at=updated_str,
                    message_count=int(total),
                    file_ids=list(r.get("file_ids") or []),
                )
            )
        return ConversationListResponse(items=items)
