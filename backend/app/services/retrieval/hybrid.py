from qdrant_client import AsyncQdrantClient

from app.config import Settings
from app.models.schemas.chat import RetrievalFilters
from app.services.retrieval.qdrant_filters import build_qdrant_filter
from app.services.retrieval.rerank import RetrievedChunk, stub_rerank


class HybridRetriever:
    """Dense vector retrieval plus optional keyword reordering and rerank hook."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def retrieve(
        self,
        client: AsyncQdrantClient,
        query_vector: list[float],
        filters: RetrievalFilters | None,
        query_text: str = "",
    ) -> list[RetrievedChunk]:
        rf = filters or RetrievalFilters()
        qf = build_qdrant_filter(rf)
        resp = await client.query_points(
            collection_name=self._settings.qdrant_collection,
            query=query_vector,
            limit=rf.top_k,
            query_filter=qf,
            with_payload=True,
            score_threshold=rf.score_threshold,
        )
        chunks: list[RetrievedChunk] = []
        for p in resp.points:
            pl = p.payload or {}
            text = str(pl.get("text", ""))
            chunks.append(
                RetrievedChunk(
                    file_id=pl.get("file_id"),
                    chunk_index=pl.get("chunk_index"),
                    text=text,
                    score=float(p.score or 0.0),
                )
            )

        if rf.keyword:
            kw = rf.keyword.lower()
            with_kw = [c for c in chunks if kw in c.text.lower()]
            without = [c for c in chunks if kw not in c.text.lower()]
            chunks = with_kw + without

        if rf.use_reranker:
            chunks = stub_rerank(query_text, chunks)

        return chunks
