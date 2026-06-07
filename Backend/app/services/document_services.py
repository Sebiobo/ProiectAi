from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.documents import Document
from app.services.processing_service import process_document

ALLOWED_FILE_TYPES = {
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def upload_document(db: Session, file: UploadFile, user_id: int) -> Document:
    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipul fișierului nu este permis.",
        )

    file_bytes = file.file.read()

    document = Document(
        user_id=user_id,
        filename=file.filename,
        file_type=file.content_type,
        file_size=len(file_bytes),
        status="pending",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    process_document(db=db, document=document, file_bytes=file_bytes)

    return document
