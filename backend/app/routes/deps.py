from fastapi import Depends, Request

from app.config import Settings, get_settings
from app.controller.chat_controller import ChatController
from app.controller.files_controller import FilesController
from app.controller.rag_controller import RagController
from app.services.chat_service import ChatService
from app.services.repositories.conversations import ConversationsRepository
from app.services.repositories.messages import MessagesRepository
from app.services.retrieval.hybrid import HybridRetriever


def get_settings_dep() -> Settings:
    return get_settings()


def get_messages_repository(request: Request) -> MessagesRepository:
    db = request.app.state.mongo_client[request.app.state.mongo_db_name]
    return MessagesRepository(db)


def get_conversations_repository(request: Request) -> ConversationsRepository:
    db = request.app.state.mongo_client[request.app.state.mongo_db_name]
    return ConversationsRepository(db)


def get_chat_service(
    request: Request,
    settings: Settings = Depends(get_settings_dep),
    messages_repo: MessagesRepository = Depends(get_messages_repository),
    conversations_repo: ConversationsRepository = Depends(get_conversations_repository),
) -> ChatService:
    return ChatService(
        settings=settings,
        messages_repo=messages_repo,
        conversations_repo=conversations_repo,
        http=request.app.state.http,
        qdrant=request.app.state.qdrant,
        retriever=HybridRetriever(settings),
    )


def get_chat_controller(
    chat_service: ChatService = Depends(get_chat_service),
    messages_repo: MessagesRepository = Depends(get_messages_repository),
    conversations_repo: ConversationsRepository = Depends(get_conversations_repository),
) -> ChatController:
    return ChatController(
        chat_service=chat_service,
        messages_repo=messages_repo,
        conversations_repo=conversations_repo,
    )


def get_files_controller() -> FilesController:
    return FilesController()


def get_rag_controller() -> RagController:
    return RagController()
