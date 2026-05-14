import httpx

from app.config import Settings


async def _ollama_embed(
    http: httpx.AsyncClient,
    settings: Settings,
    text: str,
) -> list[float]:
    base = settings.ollama_base_url.rstrip("/")
    url = f"{base}/api/embed"
    r = await http.post(
        url,
        json={"model": settings.ollama_embed_model, "input": [text]},
    )
    if r.status_code == 404:
        r = await http.post(
            f"{base}/api/embeddings",
            json={"model": settings.ollama_embed_model, "prompt": text},
        )
    r.raise_for_status()
    data = r.json()
    if "embeddings" in data and data["embeddings"]:
        vec = data["embeddings"][0]
    elif "embedding" in data:
        vec = data["embedding"]
    else:
        raise RuntimeError(f"Unexpected Ollama embed response keys: {data.keys()}")
    return vec


async def _openai_embed(
    http: httpx.AsyncClient,
    settings: Settings,
    text: str,
) -> list[float]:
    api_base = (settings.openai_api_base or "").strip()
    if not api_base:
        raise ValueError(
            "llm_backend=openai requires OPENAI_API_BASE (e.g. https://api.openai.com/v1)"
        )
    model = settings.openai_embed_model or settings.ollama_embed_model
    url = f"{api_base.rstrip('/')}/embeddings"
    headers: dict[str, str] = {"Content-Type": "application/json"}
    if settings.openai_api_key:
        headers["Authorization"] = f"Bearer {settings.openai_api_key}"
    r = await http.post(
        url,
        json={"model": model, "input": text},
        headers=headers,
    )
    r.raise_for_status()
    data = r.json()
    rows = data.get("data") or []
    if not rows or "embedding" not in rows[0]:
        raise RuntimeError(f"Unexpected OpenAI embed response keys: {data.keys()}")
    return list(rows[0]["embedding"])


async def embed_query(
    http: httpx.AsyncClient,
    settings: Settings,
    text: str,
) -> list[float]:
    """Dense embeddings: Ollama (/api/embed) or OpenAI-compatible (/v1/embeddings)."""
    if settings.llm_backend.lower() == "openai":
        vec = await _openai_embed(http, settings, text)
    else:
        vec = await _ollama_embed(http, settings, text)
    if len(vec) != settings.embedding_dim:
        raise RuntimeError(
            f"Embedding length {len(vec)} does not match EMBEDDING_DIM={settings.embedding_dim}"
        )
    return vec
