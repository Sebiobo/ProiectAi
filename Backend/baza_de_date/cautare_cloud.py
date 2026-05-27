import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "ulbs-coach"

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# Am adăugat anul_cerut și materia_ceruta ca parametri


def cauta_in_materie(intrebare_student, anul_cerut, materia_ceruta, top_rezultate=3):

    if not intrebare_student or intrebare_student.strip() == "":
        return []  # Returnăm o listă goală direct, nu mai deranjăm Pinecone

    # 1. Ne asigurăm că eliminăm orice spațiu accidental din frontend
    anul_curatat = str(anul_cerut).strip()
    materia_curatata = str(materia_ceruta).strip()

    vector_intrebare = pc.inference.embed(
        model="llama-text-embed-v2",
        inputs=[intrebare_student],
        parameters={"input_type": "query"}
    )

    vector_cautare = vector_intrebare[0]['values']

    # AICI ESTE FILTRUL MAGIC (Acum folosește variabilele curățate)
    rezultate = index.query(
        vector=vector_cautare,
        top_k=top_rezultate,
        include_metadata=True,
        filter={
            "anul": {"$eq": anul_curatat},
            "materia": {"$eq": materia_curatata}
        }
    )

    texte_gasite = []

    # Afișăm în terminal exact ce a găsit Pinecone, ca să știm dacă filtrul a mers
    print(
        f"\n🔍 [PINECONE] Am găsit {len(rezultate['matches'])} rezultate pentru {materia_curatata} ({anul_curatat}).")

    for match in rezultate['matches']:
        scor = match['score']
        text = match['metadata']['text']

        # Printăm detaliile în terminal ca să vezi tu, în spate, cum gândește AI-ul
        print(f"💡 [DEBUG] Scor: {scor:.3f} | Text scurt: {text[:50]}...")

        # 2. Am scăzut pragul de la 0.80 la 0.50 ca să prindem și răspunsurile parțiale
        if scor > 0.20:
            sursa = match['metadata']['sursa']
            pagina = match['metadata']['pagina']
            texte_gasite.append(
                f"[Din cursul: {sursa}, Pagina: {int(pagina)} | Scor: {scor:.2f}]\n{text}")

    return texte_gasite
