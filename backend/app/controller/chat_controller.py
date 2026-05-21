from fastapi import HTTPException, Request, UploadFile

from app.models.schemas.chat import (
    AttachFileResponse,
    ChatQueryRequest,
    ChatQueryResponse,
    ConversationListResponse,
    MessageHistoryItem,
    PaginatedMessagesResponse,
    SaveMessageRequest,
    SaveMessageResponse,
)
from app.models.schemas.pagination import PageParams
from app.services.chat_service import ChatService
from app.services.repositories.conversations import ConversationsRepository
from app.services.repositories.messages import MessagesRepository


class ChatController:
    """Presenter: maps HTTP/API contracts to services and shapes responses."""

    def __init__(
        self,
        *,
        chat_service: ChatService,
        messages_repo: MessagesRepository,
        conversations_repo: ConversationsRepository,
    ) -> None:
        self._chat = chat_service
        self._messages = messages_repo
        self._conversations = conversations_repo

    async def query(self, body: ChatQueryRequest) -> ChatQueryResponse:
        return await self._chat.process_query(body)

    async def save_message(self, body: SaveMessageRequest) -> SaveMessageResponse:
        return await self._chat.save_message(body)

    async def attach_file(
        self,
        request: Request,
        *,
        file: UploadFile,
        username: str,
        conversation_id: str | None,
    ) -> AttachFileResponse:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="File is empty")
        mongo_db = request.app.state.mongo_client[request.app.state.mongo_db_name]
        try:
            return await self._chat.attach_file(
                minio_client=request.app.state.minio,
                mongo_db=mongo_db,
                username=username,
                conversation_id=conversation_id,
                filename=file.filename,
                content=content,
                content_type=file.content_type,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

    async def list_conversations(self, username: str, *, limit: int = 50) -> ConversationListResponse:
        return await self._chat.list_conversations(username, limit=limit)

    async def list_messages(
        self,
        *,
        conversation_id: str,
        username: str,
        page: int,
        page_size: int,
    ) -> PaginatedMessagesResponse:
        await self._conversations.require_for_user(conversation_id, username)
        params = PageParams(page=page, page_size=page_size)
        rows, total = await self._messages.list_paginated(
            conversation_id,
            page=params.page,
            page_size=params.page_size,
        )
        items = [
            MessageHistoryItem(
                id=r["id"],
                role=r["role"],
                user_id=r.get("user_id"),
                agent_id=r.get("agent_id"),
                content_type=r.get("content_type", "text"),
                content=r.get("content", ""),
                model=r.get("model"),
                created_at=r["created_at"].isoformat().replace("+00:00", "Z")
                if hasattr(r["created_at"], "isoformat")
                else str(r["created_at"]),
                metadata=r.get("metadata") or {},
            )
            for r in rows
        ]
        has_next = params.page * params.page_size < total
        return PaginatedMessagesResponse(
            items=items,
            total=total,
            page=params.page,
            page_size=params.page_size,
            has_next=has_next,
        )
