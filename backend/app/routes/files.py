from fastapi import APIRouter, Depends, File, Form, Request, UploadFile

from app.controller.files_controller import FilesController
from app.models.schemas.upload import FileUploadResponse
from app.routes.deps import get_files_controller

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    created_by: str | None = Form(default=None),
    controller: FilesController = Depends(get_files_controller),
) -> FileUploadResponse:
    return await controller.upload(request, file=file, created_by=created_by)
