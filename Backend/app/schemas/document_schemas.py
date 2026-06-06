from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_type: str | None = None
    file_size: int | None = None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }