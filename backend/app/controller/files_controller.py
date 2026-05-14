from fastapi import HTTPException, Request, UploadFile

from app.config import Settings, get_settings
from app.models.schemas.upload import FileUploadResponse
from app.services.upload_service import upload_file_bytes


class FilesController:
    async def upload(
        self,
        request: Request,
        *,
        file: UploadFile,
        created_by: str | None,
        settings: Settings | None = None,
    ) -> FileUploadResponse:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        content = await file.read()
        settings = settings or get_settings()
        mongo_db = request.app.state.mongo_client[request.app.state.mongo_db_name]
        try:
            return await upload_file_bytes(
                minio_client=request.app.state.minio,
                mongo_db=mongo_db,
                filename=file.filename,
                content=content,
                content_type=file.content_type,
                created_by=created_by,
                settings=settings,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
