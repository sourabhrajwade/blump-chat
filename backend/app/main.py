from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.lifespan import lifespan
from app.routes import chat, files, health, rag
from app.utils.exceptions import AppError

app = FastAPI(
    title="RAG Chat API",
    description=(
        "MVP-style layering: routes → controller → services → models. "
        "DocumentDB-compatible MongoDB, Qdrant, BGE-M3, Ollama LLM."
    ),
    lifespan=lifespan,
)


@app.exception_handler(AppError)
async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "message": exc.message},
    )


app.include_router(health.router)
app.include_router(chat.router)
app.include_router(files.router)
app.include_router(rag.router)
