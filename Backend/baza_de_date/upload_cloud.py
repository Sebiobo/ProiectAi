import os
import docx
from pinecone import Pinecone
from pypdf import PdfReader
from dotenv import load_dotenv

# Încărcăm variabilele secrete din fișierul .env
load_dotenv()

# 1. Conectarea la Cloud (Securizată)
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "ulbs-coach"

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# 2. Funcțiile de citire


def extrage_text_pdf(cale):
    reader = PdfReader(cale)
    pagini_text = []
    for i, pagina in enumerate(reader.pages):
        text = pagina.extract_text()
        if text:
            pagini_text.append((i+1, text))
    return pagini_text


def extrage_text_docx(cale):
    doc = docx.Document(cale)
    text_complet = "\n".join([para.text for para in doc.paragraphs])
    return [(1, text_complet)]


def imparte_inteligent(text, dim=400, suprap=50):
    bucati = []
    for i in range(0, len(text), dim - suprap):
        bucati.append(text[i: i + dim])
    return bucati


# 3. Procesarea și Trimiterea în Cloud
FOLDER = "/Users/danfogoros/Desktop/ProiectAi/Backend/cursuri_pdf"

if not os.path.exists(FOLDER):
    os.makedirs(FOLDER)
    print(f"📁 Am creat folderul '{FOLDER}'.")
    exit()

print("🚀 Pregătire pentru încărcare...")
anul_ales = input("Pentru ce AN încarci aceste cursuri? (ex: 2): ")
materia_aleasa = input("Pentru ce MATERIE încarci aceste cursuri? (ex: OOP): ")

print(f"\n🚀 Încep procesul pentru {materia_aleasa} (Anul {anul_ales})...\n")

for fisier in os.listdir(FOLDER):
    cale_absoluta = os.path.join(FOLDER, fisier)

    if fisier.endswith('.pdf'):
        print(f"📄 Citesc PDF: {fisier}")
        pagini = extrage_text_pdf(cale_absoluta)
    elif fisier.endswith('.docx'):
        print(f"📝 Citesc Word (DOCX): {fisier}")
        pagini = extrage_text_docx(cale_absoluta)
    else:
        continue

    for nr_pag, text_pag in pagini:
        bucati_brute = imparte_inteligent(text_pag)
        bucati = [b.strip() for b in bucati_brute if b.strip() != ""]

        if len(bucati) == 0:
            continue

        # 👇 NOU: Împărțim bucățile în "loturi" de câte 90 pentru a nu depăși limita serverului
        LOT_MAXIM = 90

        for j in range(0, len(bucati), LOT_MAXIM):
            lot_curent = bucati[j: j + LOT_MAXIM]

            # 1. Cerem vectorii doar pentru lotul curent
            vectori_raspuns = pc.inference.embed(
                model="llama-text-embed-v2",
                inputs=lot_curent,
                parameters={"input_type": "passage", "truncate": "END"}
            )

            # 2. Pregătim pachetul pentru baza de date
            to_upsert = []
            for k, embedding in enumerate(vectori_raspuns):
                idx_absolut = j + k
                id_unic = f"{fisier}_pag{nr_pag}_bucata{idx_absolut}"
                vector = embedding['values']
                metadate = {
                    "text": lot_curent[k],
                    "sursa": fisier,
                    "pagina": nr_pag,
                    "anul": anul_ales,
                    "materia": materia_aleasa
                }
                to_upsert.append((id_unic, vector, metadate))

            # 3. Trimitem lotul curent
            index.upsert(vectors=to_upsert)

    print(f"   ✅ {fisier} a fost urcat cu succes (în loturi)!")

print("\n🎉 GATA! Toate fișierele au fost procesate!")
