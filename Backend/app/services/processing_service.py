import io

import docx
from pypdf import PdfReader
from pinecone import Pinecone
from sqlalchemy.orm import Session

from app.config import settings
from app.models.documents import Document
from app.models.document_chunks import DocumentChunk

_pc = Pinecone(api_key=settings.PINECONE_API_KEY)
_index = _pc.Index(settings.PINECONE_INDEX_NAME)

CHUNK_SIZE = 400
CHUNK_OVERLAP = 50
BATCH_SIZE = 90


def _extract_text(file_bytes: bytes, file_type: str) -> list[tuple[int, str]]:
    if file_type == "application/pdf":
        reader = PdfReader(io.BytesIO(file_bytes))
        return [
            (i + 1, page.extract_text())
            for i, page in enumerate(reader.pages)
            if page.extract_text()
        ]
    elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join(p.text for p in doc.paragraphs)
        return [(1, text)] if text.strip() else []
    elif file_type == "text/plain":
        text = file_bytes.decode("utf-8", errors="ignore")
        return [(1, text)] if text.strip() else []
    return []


def _chunk_text(text: str) -> list[str]:
    chunks = []
    for i in range(0, len(text), CHUNK_SIZE - CHUNK_OVERLAP):
        chunk = text[i: i + CHUNK_SIZE].strip()
        if chunk:
            chunks.append(chunk)
    return chunks


def process_document(db: Session, document: Document, file_bytes: bytes) -> None:
    try:
        pages = _extract_text(file_bytes, document.file_type)

        chunk_index = 0
        for page_num, page_text in pages:
            chunks = _chunk_text(page_text)

            for batch_start in range(0, len(chunks), BATCH_SIZE):
                batch = chunks[batch_start: batch_start + BATCH_SIZE]

                embeddings = _pc.inference.embed(
                    model="llama-text-embed-v2",
                    inputs=batch,
                    parameters={"input_type": "passage", "truncate": "END"},
                )

                vectors_to_upsert = []
                for k, embedding in enumerate(embeddings):
                    abs_idx = batch_start + k
                    vector_id = f"doc{document.id}_pag{page_num}_chunk{abs_idx}"
                    vectors_to_upsert.append((
                        vector_id,
                        embedding["values"],
                        {
                            "text": batch[k],
                            "sursa": document.filename,
                            "pagina": page_num,
                            "document_id": document.id,
                        },
                    ))

                    db_chunk = DocumentChunk(
                        document_id=document.id,
                        chunk_index=chunk_index,
                        content=batch[k],
                        pinecone_vector_id=vector_id,
                    )
                    db.add(db_chunk)
                    chunk_index += 1

                _index.upsert(vectors=vectors_to_upsert)

        document.status = "processed"
    except Exception:
        document.status = "error"
        raise
    finally:
        db.commit()
