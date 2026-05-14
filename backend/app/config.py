from functools import lru_cache
from pathlib import Path
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Mongo: set MONGO_URL, or MONGO_USER + MONGO_PASSWORD (email usernames are OK)."""

    mongo_url: str | None = Field(default=None)
    mongo_user: str | None = Field(default=None)
    mongo_password: str | None = Field(default=None)
    mongo_host: str = Field(default="localhost")
    mongo_port: int = Field(default=27017)
    mongo_auth_source: str | None = Field(default="admin")

    mongo_db_name: str

    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket: str
    minio_use_ssl: bool = Field(default=False)
    minio_public_url: str

    ollama_base_url: str = Field(default="http://localhost:11434")
    ollama_embed_model: str = Field(default="bge-m3")
    """BGE-M3 via Ollama is typically 1024 dimensions (set to match `ollama show <model>`)."""
    embedding_dim: int = Field(default=1024)

    llm_backend: str = Field(
        default="ollama",
        description="ollama = /api/chat + /api/embed; openai = /v1/chat/completions + /v1/embeddings",
    )
    openai_api_base: str | None = Field(
        default=None,
        description="OpenAI-compatible API root including /v1, e.g. https://api.openai.com/v1",
    )
    openai_api_key: str | None = Field(default=None)
    openai_embed_model: str | None = Field(
        default=None,
        description="Embedding model id for openai backend; defaults to OLLAMA_EMBED_MODEL if unset.",
    )

    qdrant_url: str = Field(default="http://localhost:6333")
    qdrant_collection: str = Field(default="rag_chunks")

    rag_chunk_size: int = Field(default=512)
    rag_chunk_overlap: int = Field(default=64)

    ollama_chat_model: str = Field(default="llama3.2")
    chat_system_prompt: str = Field(
        default=(
            "You are a precise assistant. Answer using the provided context snippets. "
            "If the answer is not in the context, say you do not know. Cite sources briefly when relevant."
        )
    )
    chat_retrieval_top_k: int = Field(default=8)
    chat_memory_message_limit: int = Field(default=10)
    log_level: str = Field(default="INFO")

    model_config = SettingsConfigDict(
        env_file=str(_BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def resolved_mongo_url(self) -> str:
        direct = (self.mongo_url or "").strip()
        if direct:
            return direct

        user = (self.mongo_user or "").strip()
        password = (self.mongo_password or "").strip()
        if user and password:
            u = quote_plus(user)
            p = quote_plus(password)
            base = f"mongodb://{u}:{p}@{self.mongo_host}:{self.mongo_port}/"
            if self.mongo_auth_source:
                a = quote_plus(self.mongo_auth_source)
                return f"{base}?authSource={a}"
            return base

        return f"mongodb://{self.mongo_host}:{self.mongo_port}/"


@lru_cache
def get_settings() -> Settings:
    return Settings()
