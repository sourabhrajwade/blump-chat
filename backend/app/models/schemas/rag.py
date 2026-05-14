from pydantic import BaseModel, Field


class RagIngestResponse(BaseModel):
    file_id: str
    minio_url: str
    num_pages: int
    ocr_page_numbers: list[int] = Field(
        description="1-based page indices where OCR was used (embedded images)"
    )
    num_chunks: int
    qdrant_collection: str
    embedding_dim: int
