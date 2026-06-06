from fastapi import HTTPException, UploadFile,status
from sqlalchemy.orm import Session

from app.models.documents import Document

Allowed_FILE_TYPES = {"application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",}

def upload_document(db:Session, file:UploadFile, user_id:int)->Document:
    if file.content_type not in Allowed_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipul fișierului nu este permis.",
        )
    document = Document(
        user_id=user_id,
        filename=file.filename,
        file_type=file.content_type,
        file_size=len(file.file.read()),
        status="pending",
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

