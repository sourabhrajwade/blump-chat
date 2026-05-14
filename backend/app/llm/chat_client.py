from typing import Any

import httpx


async def ollama_chat_complete(
    http: httpx.AsyncClient,
    *,
    base_url: str,
    model: str,
    messages: list[dict[str, str]],
) -> tuple[str, dict[str, Any]]:
    """Ollama native: POST /api/chat"""
    url = f"{base_url.rstrip('/')}/api/chat"
    body: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "stream": False,
    }
    r = await http.post(url, json=body)
    r.raise_for_status()
    data = r.json()
    msg = data.get("message") or {}
    content = msg.get("content") or ""
    usage = {
        "prompt_tokens": data.get("prompt_eval_count"),
        "completion_tokens": data.get("eval_count"),
        "total_tokens": None,
    }
    if usage["prompt_tokens"] is not None and usage["completion_tokens"] is not None:
        usage["total_tokens"] = (
            int(usage["prompt_tokens"]) + int(usage["completion_tokens"])
        )
    return str(content), usage


async def openai_compatible_chat_complete(
    http: httpx.AsyncClient,
    *,
    api_base: str,
    api_key: str | None,
    model: str,
    messages: list[dict[str, str]],
) -> tuple[str, dict[str, Any]]:
    """OpenAI-compatible: POST {api_base}/chat/completions (api_base should end with /v1)."""
    base = api_base.rstrip("/")
    url = f"{base}/chat/completions"
    headers: dict[str, str] = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    body: dict[str, Any] = {"model": model, "messages": messages}
    r = await http.post(url, json=body, headers=headers)
    r.raise_for_status()
    data = r.json()
    choices = data.get("choices") or []
    content = ""
    if choices:
        msg = choices[0].get("message") or {}
        content = str(msg.get("content") or "")
    usage_raw = data.get("usage") or {}
    usage = {
        "prompt_tokens": usage_raw.get("prompt_tokens"),
        "completion_tokens": usage_raw.get("completion_tokens"),
        "total_tokens": usage_raw.get("total_tokens"),
    }
    return content, usage


async def chat_complete(
    http: httpx.AsyncClient,
    settings: Any,
    *,
    model: str,
    messages: list[dict[str, str]],
) -> tuple[str, dict[str, Any]]:
    """Dispatch chat completion by configured backend (see Settings.llm_backend)."""
    # Settings is app.config.Settings at runtime; avoid circular import by duck-typing
    backend = str(getattr(settings, "llm_backend", "ollama")).lower()
    if backend == "openai":
        api_base = getattr(settings, "openai_api_base", None)
        if not api_base or not str(api_base).strip():
            raise ValueError(
                "llm_backend=openai requires OPENAI_API_BASE (e.g. https://api.openai.com/v1)"
            )
        return await openai_compatible_chat_complete(
            http,
            api_base=str(api_base).strip(),
            api_key=getattr(settings, "openai_api_key", None),
            model=model,
            messages=messages,
        )
    base_url = getattr(settings, "ollama_base_url", "http://localhost:11434")
    return await ollama_chat_complete(
        http, base_url=base_url, model=model, messages=messages
    )


class BaseLLMProvider:
    """Extension point: streaming, multi-provider routing, tool calls."""

    async def chat_stream(self, *args: Any, **kwargs: Any) -> Any:
        raise NotImplementedError(
            "Streaming reserved for future WebSocket / SSE integration."
        )
