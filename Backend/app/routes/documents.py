from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.document_services import upload_document
from app.schemas.document_schemas import DocumentResponse

from app.models.users import User


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


@router.post("/upload", response_model=DocumentResponse)
def upload_document_route(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
  
):
    user_id = 1

    document = upload_document(
        db=db,
        file=file,
        user_id=user_id
    )

    return document