from datetime import datetime

from pydantic import BaseModel, Field


class FileUploadResponse(BaseModel):
    id: str
    url: str
    created_at: datetime = Field(description="UTC timestamp")
    updated_at: datetime = Field(description="UTC timestamp")
    created_by: str | None
