import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db, engine
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cautare_cloud import cauta_in_materie
# Nou: Importăm funcția de procesare
from procesare_fisiere import proceseaza_si_incarca
from groq import Groq
from dotenv import load_dotenv
import models
import schemas
import crud
from database import engine

models.Base.metadata.create_all(bind=engine)
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Inițializăm "Profesorul" AI
client_groq = Groq(api_key=os.getenv("GROQ_API_KEY"))


class ChatRequest(BaseModel):
    message: str
    anul: str
    materia: str


# ==========================================
# RUTA MANDATORIE PENTRU CONVERSAȚIE (CHAT)
# ==========================================
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    print(
        f"👤 [FRONTEND] Mesaj: {request.message} | Context: {request.anul} - {request.materia}")

    # 2. Cerem paragrafele brute de la Pinecone (Bibliotecarul)
    paragrafe_gasite = cauta_in_materie(
        request.message, request.anul, request.materia)

    if len(paragrafe_gasite) == 0:
        raspuns_final = f"⛔ Nu am găsit informații relevante în cursul de {request.materia} ({request.anul})."
        return {"reply": raspuns_final}

    # 3. Lipim textul pentru a i-l arăta AI-ului
    context_curs = "\n\n".join(paragrafe_gasite)

    # 4. Îi dăm ordinul strict cum să se comporte
    system_prompt = f"""Ești un asistent universitar prietenos. 
    Răspunde la întrebarea studentului folosind EXCLUSIV informațiile din rubrica "CONTEXT DIN CURS" de mai jos. 
    Explică frumos, folosește paragrafe scurte și liste cu puncte (bullet points) pentru a face textul ușor de citit. 
    Nu folosi cunoștințele tale generale de pe internet, bazează-te DOAR pe context.

    CONTEXT DIN CURS:
    {context_curs}
    """

    print("🧠 [GROQ] Formulez răspunsul inteligent...")

    # 5. Generăm răspunsul final!
    chat_completion = client_groq.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": request.message}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.2
    )

    raspuns_final = chat_completion.choices[0].message.content

    return {"reply": raspuns_final}


# ==========================================
# NOUA RUTĂ DISPONIBILĂ PENTRU UPLOAD (AGRAFĂ)
# ==========================================
@app.post("/api/upload")
async def upload_endpoint(
    file: UploadFile = File(...),
    anul: str = Form(...),
    materia: str = Form(...)
):
    print(
        f"📥 [UPLOAD] Am primit fișierul: {file.filename} pentru {materia} (Anul {anul})")

    # 1. Salvăm fișierul temporar în folderul curent ca să îl putem citi
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Îl dăm funcției noastre să îl taie și să îl trimită în Pinecone
    print("⏳ [UPLOAD] Procesez și trimit în baza de date...")
    succes = proceseaza_si_incarca(temp_path, file.filename, anul, materia)

    # 3. Ștergem fișierul temporar pentru a păstra calculatorul curat
    os.remove(temp_path)

    if succes:
        print("✅ [UPLOAD] Gata!")
        return {"reply": "Fișierul a fost procesat și urcat cu succes în baza de date!"}
    else:
        print("❌ [UPLOAD] Format invalid.")
        return {"reply": "Eroare: Te rog să urci doar fișiere PDF sau DOCX."}

    # ==========================================
# RUTA PENTRU ÎNREGISTRARE UTILIZATORI
# ==========================================


@app.post("/api/inregistrare", response_model=schemas.UtilizatorResponse)
def inregistrare_endpoint(
    utilizator: schemas.UtilizatorCreate,
    db: Session = Depends(get_db)
):
    print(f"👤 [AUTH] Cerere înregistrare pentru: {utilizator.email}")

    # 1. Verificăm dacă email-ul există deja
    user_existent = crud.get_utilizator_by_email(db, email=utilizator.email)
    if user_existent:
        print("❌ [AUTH] Eroare: Email-ul există deja!")
        raise HTTPException(
            status_code=400, detail="Email-ul este deja înregistrat!")

    # 2. Creăm utilizatorul prin CRUD
    user_nou = crud.create_utilizator(db=db, utilizator=utilizator)
    print(f"✅ [AUTH] Utilizator creat cu succes! ID: {user_nou.id}")

    # 3. FastAPI ia "user_nou", observă "response_model=schemas.UtilizatorResponse"
    # și taie automat parola înainte să trimită JSON-ul la Frontend!
    return user_nou
