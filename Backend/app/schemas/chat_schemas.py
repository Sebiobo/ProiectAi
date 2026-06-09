from datetime import datetime
from pydantic import BaseModel


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatCreate(BaseModel):
    title: str | None = None
    document_id: int | None = None


class ChatResponse(BaseModel):
    id: int
    user_id: int
    document_id: int | None = None
    title: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LegacyChatRequest(BaseModel):
    message: str
    anul: str | None = None
    materia: str | None = None


class LegacyChatResponse(BaseModel):
    reply: str
