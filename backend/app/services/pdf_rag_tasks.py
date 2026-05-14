"""Sequential RAG ingestion steps for PDF (PyMuPDF, optional Tesseract OCR, chunking, Ollama, Qdrant)."""

from __future__ import annotations

import io
import uuid

import fitz
import httpx
import pytesseract
from PIL import Image
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import PointStruct

from app.config import Settings
from app.services.embeddings.bge_m3 import embed_query


def task_validate_pdf(content: bytes) -> None:
    if not content or len(content) < 5:
        raise ValueError("Empty file")
    if not content[:5].startswith(b"%PDF"):
        raise ValueError("File is not a PDF (missing %PDF header)")
    doc = fitz.open(stream=content, filetype="pdf")
    try:
        if doc.page_count < 1:
            raise ValueError("PDF has no pages")
    finally:
        doc.close()


def task_extract_combined_text(content: bytes) -> tuple[str, list[int], int]:
    """
    Per page: if embedded images exist, render page and OCR; else extract text.
    Returns (combined_text, list of 1-based page numbers that used OCR, page_count).
    """
    doc = fitz.open(stream=content, filetype="pdf")
    ocr_pages: list[int] = []
    parts: list[str] = []
    try:
        for page_index in range(doc.page_count):
            page = doc.load_page(page_index)
            images = page.get_images(full=True)
            page_no = page_index + 1
            if len(images) > 0:
                ocr_pages.append(page_no)
                mat = fitz.Matrix(2.0, 2.0)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                text = pytesseract.image_to_string(img) or ""
                parts.append(text.strip())
            else:
                parts.append((page.get_text("text") or "").strip())
    finally:
        doc.close()

    separator = "\n\n---\n\n"
    combined = separator.join(parts)
    return combined, ocr_pages, len(parts)


def task_fixed_length_chunks(
    text: str, chunk_size: int, overlap: int
) -> list[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    overlap = max(0, min(overlap, chunk_size - 1))
    step = max(1, chunk_size - overlap)
    text = text.strip()
    if not text:
        return []
    chunks: list[str] = []
    i = 0
    while i < len(text):
        chunks.append(text[i : i + chunk_size])
        i += step
    return chunks


async def ollama_embed_one(
    http: httpx.AsyncClient, settings: Settings, text: str
) -> list[float]:
    return await embed_query(http, settings, text)


async def task_embed_all_chunks_sequential(
    http: httpx.AsyncClient,
    settings: Settings,
    chunks: list[str],
) -> list[list[float]]:
    out: list[list[float]] = []
    for ch in chunks:
        out.append(await ollama_embed_one(http, settings, ch))
    return out


async def task_upsert_qdrant(
    qdrant: AsyncQdrantClient,
    settings: Settings,
    *,
    file_id: str,
    chunks: list[str],
    embeddings: list[list[float]],
) -> int:
    if len(chunks) != len(embeddings):
        raise ValueError("chunks and embeddings length mismatch")
    ns = uuid.UUID(file_id)
    points: list[PointStruct] = []
    embed_model_id = settings.openai_embed_model or settings.ollama_embed_model
    for idx, (text, vector) in enumerate(zip(chunks, embeddings)):
        pid = str(uuid.uuid5(ns, f"chunk-{idx}"))
        points.append(
            PointStruct(
                id=pid,
                vector=vector,
                payload={
                    "file_id": file_id,
                    "chunk_index": idx,
                    "text": text,
                    "tags": [],
                    "model": embed_model_id,
                },
            )
        )
    if not points:
        return 0
    await qdrant.upsert(
        collection_name=settings.qdrant_collection,
        points=points,
    )
    return len(points)
