from dataclasses import dataclass


@dataclass(slots=True)
class RetrievedChunk:
    file_id: str | None
    chunk_index: int | None
    text: str
    score: float


def stub_rerank(_query: str, chunks: list[RetrievedChunk]) -> list[RetrievedChunk]:
    """Placeholder for cross-encoder / ColBERT reranking (streaming-safe swap-in later)."""
    return chunks
