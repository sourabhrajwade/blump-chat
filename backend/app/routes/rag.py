from fastapi import APIRouter, Depends, File, Form, Request, UploadFile

from app.controller.rag_controller import RagController
from app.models.schemas.rag import RagIngestResponse
from app.routes.deps import get_rag_controller

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/ingest", response_model=RagIngestResponse)
async def rag_ingest_pdf(
    request: Request,
    file: UploadFile = File(...),
    created_by: str | None = Form(default=None),
    controller: RagController = Depends(get_rag_controller),
) -> RagIngestResponse:
    return await controller.ingest_pdf(request, file=file, created_by=created_by)
