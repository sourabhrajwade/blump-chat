from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase

from app.models.domain import ContentType, MessageDocument, MessageRole, TokenUsage


class MessagesRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._coll: AsyncIOMotorCollection = db["messages"]

    async def insert(self, doc: MessageDocument) -> None:
        await self._coll.insert_one(doc.to_mongo())

    async def list_recent_for_memory(
        self,
        conversation_id: str,
        *,
        limit: int,
    ) -> list[dict[str, Any]]:
        cursor = self._coll.find(
            {"conversation_id": conversation_id, "role": {"$ne": MessageRole.SYSTEM.value}},
            sort=[("created_at", -1)],
            limit=limit,
        )
        rows: list[dict[str, Any]] = await cursor.to_list(length=limit)
        rows.reverse()
        return rows

    async def list_paginated(
        self,
        conversation_id: str,
        *,
        page: int,
        page_size: int,
    ) -> tuple[list[dict[str, Any]], int]:
        skip = (page - 1) * page_size
        total = await self._coll.count_documents({"conversation_id": conversation_id})
        cursor = (
            self._coll.find({"conversation_id": conversation_id})
            .sort("created_at", 1)
            .skip(skip)
            .limit(page_size)
        )
        items = await cursor.to_list(length=page_size)
        return items, total

    def build_user_message(
        self,
        *,
        conversation_id: str,
        content: str,
        model: str | None,
    ) -> MessageDocument:
        now = datetime.now(UTC)
        return MessageDocument(
            id=str(uuid4()),
            conversation_id=conversation_id,
            role=MessageRole.USER,
            content_type=ContentType.TEXT,
            content=content,
            model=model,
            token_usage=None,
            retrieval_metadata=None,
            created_at=now,
            updated_at=now,
            metadata={},
        )

    def build_assistant_message(
        self,
        *,
        conversation_id: str,
        content: str,
        model: str,
        token_usage: TokenUsage | None,
        retrieval_metadata: dict[str, Any] | None,
    ) -> MessageDocument:
        now = datetime.now(UTC)
        return MessageDocument(
            id=str(uuid4()),
            conversation_id=conversation_id,
            role=MessageRole.ASSISTANT,
            content_type=ContentType.TEXT,
            content=content,
            model=model,
            token_usage=token_usage,
            retrieval_metadata=retrieval_metadata,
            created_at=now,
            updated_at=now,
            metadata={},
        )
