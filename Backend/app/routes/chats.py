from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.security.deps import get_current_user
from app.models.users import User
from app.schemas.chat_schemas import (
    ChatCreate,
    ChatResponse,
    MessageCreate,
    MessageResponse,
    LegacyChatRequest,
    LegacyChatResponse,
)
from app.services.chat_services import (
    create_chat,
    get_user_chats,
    get_chat_messages,
    send_message,
    handle_compatibility_chat,
)

router = APIRouter(prefix="/api", tags=["Chats"])


@router.post("/chats", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
def create_new_chat(
    data: ChatCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_chat(
        db=db,
        user_id=current_user.id,
        title=data.title,
        document_id=data.document_id,
    )


@router.get("/chats", response_model=list[ChatResponse])
def list_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_chats(db=db, user_id=current_user.id)


@router.get("/chats/{chat_id}/messages", response_model=list[MessageResponse])
def list_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify ownership of the chat
    from app.models.chats import Chat
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat-ul nu a fost găsit sau nu vă aparține."
        )
    return get_chat_messages(db=db, chat_id=chat_id)


@router.post("/chats/{chat_id}/messages")
def post_message(
    chat_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        user_msg, ai_msg = send_message(
            db=db,
            user_id=current_user.id,
            chat_id=chat_id,
            content=data.content,
        )
        return {
            "user_message": MessageResponse.model_validate(user_msg),
            "ai_message": MessageResponse.model_validate(ai_msg),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Eroare la trimiterea mesajului: {str(e)}"
        )


# Legacy Compatibility Route
@router.post("/chat", response_model=LegacyChatResponse)
def chat_compatibility(
    data: LegacyChatRequest,
    db: Session = Depends(get_db),
):
    reply = handle_compatibility_chat(
        db=db,
        message=data.message,
        anul=data.anul,
        materia=data.materia,
    )
    return LegacyChatResponse(reply=reply)
