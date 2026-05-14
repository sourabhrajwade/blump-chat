import uuid
from datetime import UTC, datetime
from io import BytesIO

from minio import Minio
from minio.error import S3Error
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import Settings, get_settings
from app.models.schemas.upload import FileUploadResponse


def object_url_for_key(settings: Settings, bucket: str, object_key: str) -> str:
    base = settings.minio_public_url.rstrip("/")
    return f"{base}/{bucket}/{object_key}"


async def upload_file_bytes(
    *,
    minio_client: Minio,
    mongo_db: AsyncIOMotorDatabase,
    filename: str,
    content: bytes,
    content_type: str | None,
    created_by: str | None,
    settings: Settings | None = None,
) -> FileUploadResponse:
    """Persist bytes to MinIO and metadata to MongoDB; returns the same shape as /files/upload."""
    settings = settings or get_settings()
    if not filename:
        raise ValueError("filename is required")
    if not content:
        raise ValueError("content is empty")

    file_id = str(uuid.uuid4())
    safe_name = filename.replace("\\", "/").split("/")[-1]
    object_key = f"{file_id}/{safe_name}"

    try:
        minio_client.put_object(
            settings.minio_bucket,
            object_key,
            data=BytesIO(content),
            length=len(content),
            content_type=content_type or "application/octet-stream",
        )
    except S3Error as exc:
        raise RuntimeError(f"MinIO error: {exc}") from exc

    now = datetime.now(UTC)
    url = object_url_for_key(settings, settings.minio_bucket, object_key)
    doc = {
        "id": file_id,
        "url": url,
        "created_at": now,
        "updated_at": now,
        "created_by": created_by,
    }
    await mongo_db["file_metadata"].insert_one(doc)

    return FileUploadResponse(
        id=file_id,
        url=url,
        created_at=now,
        updated_at=now,
        created_by=created_by,
    )
