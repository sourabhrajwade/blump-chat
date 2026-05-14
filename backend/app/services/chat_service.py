import logging
import time
from typing import Any

import httpx
from qdrant_client import AsyncQdrantClient

from app.config import Settings
from app.llm.chat_client import chat_complete
from app.models.domain import TokenUsage
from app.models.schemas.chat import (
    ChatCitation,
    ChatQueryRequest,
    ChatQueryResponse,
    RetrievalFilters,
    TokenUsageResponse,
)
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
            model=body.selected_model,
        )
        await self._messages.insert(user_msg)
        await self._conversations.append_message_id(
            conversation_id,
            user_msg.id,
            model=body.selected_model,
            set_title=body.message[:200] if body.message else None,
        )

        query_vector = await embed_query(self._http, self._settings, body.message)
        chunks = await self._retriever.retrieve(
            self._qdrant,
            query_vector,
            retrieval_filters,
            query_text=body.message,
        )

        system_content = (
            f"{self._settings.chat_system_prompt}\n\n"
            f"### Retrieved context\n{_format_retrieved_context(chunks)}"
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
            answer=answer,
            citations=citations,
            token_usage=TokenUsageResponse(
                prompt_tokens=token_usage.prompt_tokens,
                completion_tokens=token_usage.completion_tokens,
                total_tokens=token_usage.total_tokens,
            ),
            model_used=body.selected_model,
        )
