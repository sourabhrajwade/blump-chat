"""Backward-compatible re-exports; prefer `app.llm.chat_client`."""

from app.llm.chat_client import (
    BaseLLMProvider,
    chat_complete,
    ollama_chat_complete,
    openai_compatible_chat_complete,
)

__all__ = [
    "BaseLLMProvider",
    "chat_complete",
    "ollama_chat_complete",
    "openai_compatible_chat_complete",
]
