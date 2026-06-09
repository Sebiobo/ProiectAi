import os
import requests
from sqlalchemy.orm import Session
from pinecone import Pinecone

from app.config import settings
from app.models.chats import Chat
from app.models.messages import Message
from app.models.documents import Document

# Initialize Pinecone if API key is present
try:
    _pc = None
    _index = None
    if settings.PINECONE_API_KEY and settings.PINECONE_API_KEY != "your_pinecone_api_key_here":
        _pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        _index = _pc.Index(settings.PINECONE_INDEX_NAME)
except Exception as e:
    print(f"Error initializing Pinecone in chat services: {e}")


def create_chat(db: Session, user_id: int, title: str | None = None, document_id: int | None = None) -> Chat:
    if not title:
        title = "Conversație Nouă"
    chat = Chat(
        user_id=user_id,
        document_id=document_id,
        title=title
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


def get_user_chats(db: Session, user_id: int) -> list[Chat]:
    return db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.created_at.desc()).all()


def get_chat_messages(db: Session, chat_id: int) -> list[Message]:
    return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()


def _get_rag_context(db: Session, user_id: int, chat: Chat, query_text: str) -> str:
    if not _pc or not _index:
        return ""

    try:
        # Embed the query
        embeddings = _pc.inference.embed(
            model="llama-text-embed-v2",
            inputs=[query_text],
            parameters={"input_type": "query", "truncate": "END"},
        )
        query_vector = embeddings[0]["values"]

        # Determine filtering based on chat context
        filter_dict = None
        if chat.document_id:
            filter_dict = {"document_id": chat.document_id}
        else:
            # Query across all user's documents
            user_doc_ids = [d.id for d in db.query(Document).filter(Document.user_id == user_id).all()]
            if user_doc_ids:
                if len(user_doc_ids) == 1:
                    filter_dict = {"document_id": user_doc_ids[0]}
                else:
                    filter_dict = {"document_id": {"$in": user_doc_ids}}
            else:
                return "" # No documents uploaded

        # Query Pinecone
        res = _index.query(
            vector=query_vector,
            top_k=5,
            include_metadata=True,
            filter=filter_dict
        )

        context_parts = []
        for match in res.get("matches", []):
            metadata = match.get("metadata", {})
            text = metadata.get("text", "")
            source = metadata.get("sursa", "Necunoscut")
            page = metadata.get("pagina", "?")
            if text:
                context_parts.append(f"--- Fragmente din {source} (Pagina {page}) ---\n{text}")

        return "\n\n".join(context_parts)
    except Exception as e:
        print(f"RAG search error: {e}")
        return ""


def _call_groq_api(messages: list) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        return "⚠️ Groq API key is not configured in .env file. Te rog să configurezi cheia GROQ_API_KEY pentru a primi răspunsuri."

    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
    for model in models:
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": 0.3
                },
                timeout=15.0
            )
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                print(f"Groq API error with model {model}: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error calling Groq API with model {model}: {e}")
    return "⚠️ Erori la conectarea cu Groq API (Timeout sau eroare de rețea). Te rog să verifici cheia API sau conexiunea la internet."


def send_message(db: Session, user_id: int, chat_id: int, content: str) -> tuple[Message, Message]:
    # 1. Verify chat belongs to user
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user_id).first()
    if not chat:
        raise ValueError("Chat-ul nu a fost găsit sau nu aveți acces.")

    # 2. Save user message
    user_msg = Message(
        chat_id=chat_id,
        role="user",
        content=content
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 3. Retrieve context via RAG
    context = _get_rag_context(db, user_id, chat, content)

    # 4. Build message payload for Groq
    system_prompt = (
        "Ești CampusMind Coach, un asistent academic inteligent pentru studenții ULBS.\n"
        "Misiunea ta este să ajuți studentul să înțeleagă materia, oferind răspunsuri clare, structurate și bazate pe contextul oferit din cursuri.\n\n"
    )
    if context:
        system_prompt += (
            "Iată contextul relevant extras din cursurile încărcate de student:\n"
            f"{context}\n\n"
            "Folosește aceste informații pentru a răspunde detaliat. Dacă informația nu se află în documente sau este insuficientă, "
            "folosește-ți cunoștințele generale pentru a completa răspunsul, dar menționează acest lucru subtil.\n"
        )
    else:
        system_prompt += (
            "În prezent nu există documente relevante încărcate în context pentru această întrebare. "
            "Răspunde din cunoștințele tale generale ca asistent academic.\n"
        )

    system_prompt += "Răspunde în limba română (sau în limba în care a pus studentul întrebarea), folosind formatare Markdown bogată."

    # Load history
    history_msgs = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()

    messages_payload = [{"role": "system", "content": system_prompt}]
    for msg in history_msgs:
        # Avoid duplicating the very last user message we just saved
        if msg.id == user_msg.id:
            continue
        role = "assistant" if msg.role == "ai" else msg.role
        messages_payload.append({"role": role, "content": msg.content})

    # Add the current user message
    messages_payload.append({"role": "user", "content": content})

    # 5. Call LLM
    ai_content = _call_groq_api(messages_payload)

    # 6. Save AI reply
    ai_msg = Message(
        chat_id=chat_id,
        role="ai",
        content=ai_content
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return user_msg, ai_msg


def handle_compatibility_chat(db: Session, message: str, anul: str | None, materia: str | None) -> str:
    # Simpler flow for the legacy POST /api/chat endpoint without authenticated users
    # Embed the query
    context = ""
    if _pc and _index:
        try:
            embeddings = _pc.inference.embed(
                model="llama-text-embed-v2",
                inputs=[message],
                parameters={"input_type": "query", "truncate": "END"},
            )
            query_vector = embeddings[0]["values"]

            res = _index.query(
                vector=query_vector,
                top_k=5,
                include_metadata=True
            )

            context_parts = []
            for match in res.get("matches", []):
                metadata = match.get("metadata", {})
                text = metadata.get("text", "")
                if text:
                    context_parts.append(text)
            context = "\n\n".join(context_parts)
        except Exception:
            pass

    system_prompt = (
        "Ești CampusMind Coach, un asistent academic inteligent pentru studenții ULBS.\n"
    )
    if anul or materia:
        system_prompt += f"Context academic: Anul {anul or '?'}, Materia {materia or '?'}.\n"
    if context:
        system_prompt += f"Context din documente:\n{context}\n"

    system_prompt += "Răspunde în limba română (sau în limba în care a pus studentul întrebarea), folosind formatare Markdown bogată."

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": message}
    ]

    return _call_groq_api(messages)
