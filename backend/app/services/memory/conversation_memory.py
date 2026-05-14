from typing import Any


def rows_to_chat_messages(rows: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Convert Mongo message rows to Ollama/OpenAI-style chat messages (text only for now)."""
    out: list[dict[str, str]] = []
    for r in rows:
        role = str(r.get("role", "user"))
        raw = r.get("content", "")
        if isinstance(raw, dict):
            content = str(raw.get("text", raw))
        else:
            content = str(raw)
        out.append({"role": role, "content": content})
    return out
