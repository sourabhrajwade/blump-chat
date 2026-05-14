from typing import Any

from pydantic import BaseModel, Field


class RetrievalFilters(BaseModel):
    """Filters applied to Qdrant dense search and lightweight keyword refinement."""

    file_ids: list[str] | None = Field(default=None)
    tags: list[str] | None = Field(
        default=None,
        description="Reserved for payload tags when ingested; filters if present on points.",
    )
    keyword: str | None = Field(
        default=None,
        description="Boost / re-order hits whose chunk text contains this substring.",
    )
    top_k: int = Field(default=8, ge=1, le=64)
    score_threshold: float | None = Field(default=None)
    use_reranker: bool = Field(default=False)
    models: list[str] | None = Field(
        default=None,
        description="Optional: restrict to chunks whose payload `model` is in this list (set at ingest).",
    )


class ChatQueryRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=32000)
    conversation_id: str | None = None
    username: str = Field(..., min_length=1, max_length=256)
    selected_model: str = Field(..., min_length=1, max_length=128)
    retrieval_filters: RetrievalFilters | None = None


class ChatCitation(BaseModel):
    file_id: str | None = None
    chunk_index: int | None = None
    text: str = ""
    score: float | None = None


class TokenUsageResponse(BaseModel):
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None


class ChatQueryResponse(BaseModel):
    conversation_id: str
    user_message_id: str
    assistant_message_id: str
    answer: str
    citations: list[ChatCitation]
    token_usage: TokenUsageResponse | None = None
    model_used: str


class MessageHistoryItem(BaseModel):
    id: str
    role: str
    content_type: str
    content: str | dict[str, Any]
    model: str | None = None
    created_at: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class PaginatedMessagesResponse(BaseModel):
    items: list[MessageHistoryItem]
    total: int
    page: int
    page_size: int
    has_next: bool
