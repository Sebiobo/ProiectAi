import os
from pinecone import Pinecone
from pypdf import PdfReader

# 1. Conectarea la Cloud
# <-- Pune cheia ta din secțiunea API Keys
PINECONE_API_KEY = "pcsk_6dNx7a_nSmrWP1zv9eKwVX6HPUxLFJUE14pp8jT48iCWdYBXirx8EzYF8o6JEoxdwPNpQ"
INDEX_NAME = "ulbs-coach"

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# 2. Funcțiile de citire și tăiere a PDF-ului


def extrage_text_pdf(cale):
    reader = PdfReader(cale)
    pagini_text = []
    for i, pagina in enumerate(reader.pages):
        text = pagina.extract_text()
        if text:
            pagini_text.append((i+1, text))
    return pagini_text


def imparte_inteligent(text, dim=400, suprap=50):
    bucati = []
    for i in range(0, len(text), dim - suprap):
        bucati.append(text[i: i + dim])
    return bucati


# 3. Procesarea și Trimiterea în Cloud
FOLDER = "cursuri_pdf"

print("🚀 Încep procesul de încărcare în Pinecone Cloud...\n")

for fisier in [f for f in os.listdir(FOLDER) if f.endswith('.pdf')]:
    print(f"📄 Procesez fișierul: {fisier}")
    pagini = extrage_text_pdf(os.path.join(FOLDER, fisier))

    for nr_pag, text_pag in pagini:
        bucati = imparte_inteligent(text_pag)

        # NOU: Curățăm fiecare bucată de spații inutile și le păstrăm doar pe cele care au text real
        bucati_brute = imparte_inteligent(text_pag)

        # NOU: Curățăm fiecare bucată de spații inutile și le păstrăm doar pe cele care au text real
        bucati = [b.strip() for b in bucati_brute if b.strip() != ""]

        # Dacă după curățare lista e complet goală, trecem la pagina următoare
        if len(bucati) == 0:
            continue

        # AICI E MAGIA: Cerem serverului Pinecone să transforme textul în vectori folosind Llama
        vectori_raspuns = pc.inference.embed(
            model="llama-text-embed-v2",
            inputs=bucati,
            parameters={"input_type": "passage", "truncate": "END"}
        )

        # Pregătim pachetul de date (ID unic, Vector, și Metadate)
        to_upsert = []
        for i, embedding in enumerate(vectori_raspuns):
            id_unic = f"{fisier}_pag{nr_pag}_bucata{i}"
            vector = embedding['values']
            metadate = {"text": bucati[i], "sursa": fisier, "pagina": nr_pag}

            to_upsert.append((id_unic, vector, metadate))

        # Trimitem pachetul în "sertarul" tău
        index.upsert(vectors=to_upsert)

    print(f"   ✅ {fisier} a fost urcat cu succes!")

print("\n🎉 GATA! Intră pe site-ul Pinecone și dă un Refresh la pagină!")
