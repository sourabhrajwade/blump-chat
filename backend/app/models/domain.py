from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class MessageRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ContentType(StrEnum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"


class TokenUsage(BaseModel):
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None


class ConversationMetadata(BaseModel):
    """Extensible conversation-level metadata (multi-tenant tags, counters, etc.)."""

    total_messages: int = 0
    tags: list[str] = Field(default_factory=list)
    last_model_used: str | None = None
    extra: dict[str, Any] = Field(default_factory=dict)


class MessageDocument(BaseModel):
    """MongoDB `messages` document shape (DocumentDB-compatible)."""

    id: str
    conversation_id: str
    role: MessageRole
    content_type: ContentType = ContentType.TEXT
    content: str | dict[str, Any]
    model: str | None = None
    token_usage: TokenUsage | None = None
    retrieval_metadata: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime
    metadata: dict[str, Any] = Field(default_factory=dict)

    def to_mongo(self) -> dict[str, Any]:
        d = self.model_dump(mode="json")
        d["_id"] = self.id
        return d


class ConversationDocument(BaseModel):
    """MongoDB `conversations` document — metadata + ordered message id references."""

    id: str
    username: str
    title: str | None = None
    message_ids: list[str] = Field(default_factory=list)
    models_used: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    metadata: ConversationMetadata = Field(default_factory=ConversationMetadata)

    def to_mongo(self) -> dict[str, Any]:
        d = self.model_dump(mode="json")
        d["_id"] = self.id
        d["metadata"] = self.metadata.model_dump(mode="json")
        return d
