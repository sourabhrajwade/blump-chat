from contextlib import asynccontextmanager
from typing import AsyncIterator

import httpx
from fastapi import FastAPI
from minio import Minio
from motor.motor_asyncio import AsyncIOMotorClient
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams

from app.config import get_settings
from app.utils.logging import configure_logging


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    configure_logging(settings.log_level)

    app.state.mongo_client = AsyncIOMotorClient(settings.resolved_mongo_url)
    app.state.mongo_db_name = settings.mongo_db_name

    db = app.state.mongo_client[settings.mongo_db_name]
    await db["messages"].create_index([("conversation_id", 1), ("created_at", 1)])
    await db["messages"].create_index("id", unique=True)
    await db["conversations"].create_index("id", unique=True)
    await db["conversations"].create_index([("username", 1), ("updated_at", -1)])

    app.state.minio = Minio(
        settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_use_ssl,
    )
    if not app.state.minio.bucket_exists(settings.minio_bucket):
        app.state.minio.make_bucket(settings.minio_bucket)

    app.state.http = httpx.AsyncClient(timeout=120.0)

    app.state.qdrant = AsyncQdrantClient(url=settings.qdrant_url)
    cols = await app.state.qdrant.get_collections()
    names = {c.name for c in cols.collections}
    if settings.qdrant_collection not in names:
        await app.state.qdrant.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=VectorParams(
                size=settings.embedding_dim,
                distance=Distance.COSINE,
            ),
        )

    yield

    await app.state.http.aclose()
    await app.state.qdrant.close()
    app.state.mongo_client.close()
