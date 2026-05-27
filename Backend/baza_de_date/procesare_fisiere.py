import os
import docx
from pypdf import PdfReader
from pinecone import Pinecone
from dotenv import load_dotenv

# Conectarea la Cloud
load_dotenv()
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("ulbs-coach")


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


def proceseaza_si_incarca(cale_absoluta, nume_fisier, anul, materia):
    if nume_fisier.endswith('.pdf'):
        pagini = extrage_text_pdf(cale_absoluta)
    elif nume_fisier.endswith('.docx'):
        pagini = extrage_text_docx(cale_absoluta)
    else:
        return False  # Format greșit

    for nr_pag, text_pag in pagini:
        bucati_brute = imparte_inteligent(text_pag)
        bucati = [b.strip() for b in bucati_brute if b.strip() != ""]
        if len(bucati) == 0:
            continue

        LOT_MAXIM = 90
        for j in range(0, len(bucati), LOT_MAXIM):
            lot_curent = bucati[j: j + LOT_MAXIM]
            vectori_raspuns = pc.inference.embed(
                model="llama-text-embed-v2",
                inputs=lot_curent,
                parameters={"input_type": "passage", "truncate": "END"}
            )

            to_upsert = []
            for k, embedding in enumerate(vectori_raspuns):
                idx_absolut = j + k
                id_unic = f"{nume_fisier}_pag{nr_pag}_bucata{idx_absolut}"
                metadate = {
                    "text": lot_curent[k],
                    "sursa": nume_fisier,
                    "pagina": nr_pag,
                    "anul": str(anul).strip(),
                    "materia": str(materia).strip()
                }
                to_upsert.append((id_unic, embedding['values'], metadate))

            index.upsert(vectors=to_upsert)

    return True
