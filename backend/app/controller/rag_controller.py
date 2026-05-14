import asyncio

import httpx
from fastapi import HTTPException, Request, UploadFile

from app.config import Settings, get_settings
from app.models.schemas.rag import RagIngestResponse
from app.services.pdf_rag_tasks import (
    task_embed_all_chunks_sequential,
    task_extract_combined_text,
    task_fixed_length_chunks,
    task_upsert_qdrant,
    task_validate_pdf,
)
from app.services.upload_service import upload_file_bytes


class RagController:
    async def ingest_pdf(
        self,
        request: Request,
        *,
        file: UploadFile,
        created_by: str | None,
        settings: Settings | None = None,
    ) -> RagIngestResponse:
        settings = settings or get_settings()
        content = await file.read()

        try:
            task_validate_pdf(content)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        mongo_db = request.app.state.mongo_client[request.app.state.mongo_db_name]
        try:
            uploaded = await upload_file_bytes(
                minio_client=request.app.state.minio,
                mongo_db=mongo_db,
                filename=file.filename or "document.pdf",
                content=content,
                content_type=file.content_type or "application/pdf",
                created_by=created_by,
                settings=settings,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

        full_text, ocr_pages, num_pages = await asyncio.to_thread(
            task_extract_combined_text, content
        )

        chunks = task_fixed_length_chunks(
            full_text,
            settings.rag_chunk_size,
            settings.rag_chunk_overlap,
        )
        chunks = [c for c in chunks if c.strip()]

        try:
            embeddings = await task_embed_all_chunks_sequential(
                request.app.state.http, settings, chunks
            )
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Ollama HTTP error: {exc.response.text[:500]}",
            ) from exc
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Ollama request failed: {exc}",
            ) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

        try:
            await task_upsert_qdrant(
                request.app.state.qdrant,
                settings,
                file_id=uploaded.id,
                chunks=chunks,
                embeddings=embeddings,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Qdrant upsert failed: {exc}") from exc

        return RagIngestResponse(
            file_id=uploaded.id,
            minio_url=uploaded.url,
            num_pages=num_pages,
            ocr_page_numbers=ocr_pages,
            num_chunks=len(chunks),
            qdrant_collection=settings.qdrant_collection,
            embedding_dim=settings.embedding_dim,
        )
