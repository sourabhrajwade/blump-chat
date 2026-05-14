from app.models.schemas.chat import (
    ChatQueryRequest,
    ChatQueryResponse,
    MessageHistoryItem,
    PaginatedMessagesResponse,
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
