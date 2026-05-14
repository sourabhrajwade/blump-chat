import httpx
from fastapi import APIRouter, Depends, HTTPException, Query

from app.controller.chat_controller import ChatController
from app.models.schemas.chat import ChatQueryRequest, ChatQueryResponse, PaginatedMessagesResponse
from app.routes.deps import get_chat_controller
from app.utils.exceptions import AppError

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/query", response_model=ChatQueryResponse)
async def chat_query(
    body: ChatQueryRequest,
    controller: ChatController = Depends(get_chat_controller),
) -> ChatQueryResponse:
    try:
        return await controller.query(body)
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail={"code": exc.code, "message": exc.message}) from exc
    except (httpx.HTTPError, RuntimeError) as exc:
        raise HTTPException(
            status_code=502,
            detail={"code": "upstream_error", "message": str(exc)},
        ) from exc


@router.get("/conversations/{conversation_id}/messages", response_model=PaginatedMessagesResponse)
async def list_conversation_messages(
    conversation_id: str,
    username: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    controller: ChatController = Depends(get_chat_controller),
) -> PaginatedMessagesResponse:
    try:
        return await controller.list_messages(
            conversation_id=conversation_id,
            username=username,
            page=page,
            page_size=page_size,
        )
    except AppError as exc:
        raise HTTPException(status_code=exc.status_code, detail={"code": exc.code, "message": exc.message}) from exc
