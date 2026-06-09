from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.document_services import upload_document
from app.schemas.document_schemas import DocumentResponse
from app.security.deps import get_current_user
from app.models.users import User
from app.models.documents import Document
from app.models.document_chunks import DocumentChunk
from pinecone import Pinecone
from app.config import settings

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


@router.post("/upload", response_model=DocumentResponse)
def upload_document_route(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = upload_document(
        db=db,
        file=file,
        user_id=current_user.id
    )
    return document


@router.get("/", response_model=list[DocumentResponse])
def list_documents_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Document).filter(
        Document.user_id == current_user.id
    ).order_by(Document.created_at.desc()).all()


@router.delete("/{document_id}")
def delete_document_route(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documentul nu a fost găsit sau nu aveți acces la el."
        )

    # 1. Ștergere vectori din Pinecone (dacă este configurat)
    try:
        chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).all()
        vector_ids = [c.pinecone_vector_id for c in chunks if c.pinecone_vector_id]
        if vector_ids and settings.PINECONE_API_KEY and settings.PINECONE_API_KEY != "your_pinecone_api_key_here":
            pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            index = pc.Index(settings.PINECONE_INDEX_NAME)
            index.delete(ids=vector_ids)
    except Exception as e:
        print(f"Eroare la ștergerea vectorilor din Pinecone: {e}")

    # 2. Ștergere chunks din baza de date
    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()

    # 3. Ștergere document din baza de date
    db.delete(document)
    db.commit()

    return {"detail": f"Documentul '{document.filename}' a fost șters cu succes."}