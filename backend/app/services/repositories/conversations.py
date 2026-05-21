from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase

from app.models.domain import ConversationDocument, ConversationMetadata
from app.utils.exceptions import AppError, NotFoundError


class ConversationsRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._coll: AsyncIOMotorCollection = db["conversations"]

    async def get_by_id(self, conversation_id: str) -> dict[str, Any] | None:
        return await self._coll.find_one({"id": conversation_id})

    async def insert(self, doc: ConversationDocument) -> None:
        await self._coll.insert_one(doc.to_mongo())

    async def create_new(self, *, username: str, title: str | None = None) -> ConversationDocument:
        now = datetime.now(UTC)
        doc = ConversationDocument(
            id=str(uuid4()),
            username=username,
            title=title,
            message_ids=[],
            file_ids=[],
            models_used=[],
            created_at=now,
            updated_at=now,
            metadata=ConversationMetadata(),
        )
        await self.insert(doc)
        return doc

    async def require_for_user(self, conversation_id: str, username: str) -> dict[str, Any]:
        doc = await self.get_by_id(conversation_id)
        if not doc:
            raise NotFoundError("Conversation not found")
        if doc.get("username") != username:
            raise AppError("Forbidden", code="forbidden", status_code=403)
        return doc

    async def list_for_user(
        self,
        username: str,
        *,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        cursor = (
            self._coll.find({"username": username})
            .sort("updated_at", -1)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def set_title(self, conversation_id: str, title: str) -> None:
        now = datetime.now(UTC)
        await self._coll.update_one(
            {"id": conversation_id},
            {"$set": {"title": title[:200], "updated_at": now}},
        )

    async def append_file_id(self, conversation_id: str, file_id: str) -> None:
        now = datetime.now(UTC)
        await self._coll.update_one(
            {"id": conversation_id},
            {"$addToSet": {"file_ids": file_id}, "$set": {"updated_at": now}},
        )

    async def append_message_id(
        self,
        conversation_id: str,
        message_id: str,
        *,
        model: str,
        set_title: str | None = None,
    ) -> None:
        conv = await self.get_by_id(conversation_id)
        if not conv:
            raise NotFoundError("Conversation not found")
        now = datetime.now(UTC)
        set_doc: dict[str, Any] = {
            "updated_at": now,
            "metadata.last_model_used": model,
        }
        if set_title and not conv.get("title"):
            set_doc["title"] = set_title[:200]

        await self._coll.update_one(
            {"id": conversation_id},
            {
                "$push": {"message_ids": message_id},
                "$set": set_doc,
                "$addToSet": {"models_used": model},
                "$inc": {"metadata.total_messages": 1},
            },
        )
