import os
from pinecone import Pinecone
from dotenv import load_dotenv  # <-- ACEASTA este linia pe care ai uitat-o!

load_dotenv()
# <-- Cheia ta Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "ulbs-coach"

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)


def cauta_in_materie(intrebare_student, top_rezultate=3):
    """
    Aceasta este funcția pe care o vor folosi colegii tăi!
    Primește întrebarea și returnează textele relevante din cursuri.
    """

    # 1. Transformăm întrebarea în vector (folosind ACELAȘI model Llama)
    vector_intrebare = pc.inference.embed(
        model="llama-text-embed-v2",
        inputs=[intrebare_student],
        # Observă că aici e "query", nu "passage"
        parameters={"input_type": "query"}
    )

    vector_cautare = vector_intrebare[0]['values']

    # 2. Căutăm în Pinecone cele mai apropiate texte
    rezultate = index.query(
        vector=vector_cautare,
        top_k=top_rezultate,
        include_metadata=True
    )

    # 3. Formatăm rezultatele și aplicăm o regulă de siguranță (Scor de relevanță)
    # La Pinecone (cosine metric), scorul e între 0 și 1. Cu cât e mai aproape de 1, cu atât e mai bun.
    texte_gasite = []

    for match in rezultate['matches']:
        scor = match['score']

        print(
            f"💡 [DEBUG] Scorul calculat de AI pentru acest paragraf este: {scor:.3f}")

        # Dacă scorul e prea mic (sub 0.4 de ex), înseamnă că nu are legătură cu materia
        if scor > 0.80:
            text = match['metadata']['text']
            sursa = match['metadata']['sursa']
            pagina = match['metadata']['pagina']

            texte_gasite.append(
                f"[Din cursul: {sursa}, Pagina: {int(pagina)} | Scor: {scor:.2f}]\n{text}")

    return texte_gasite


# ==========================================
# --- ZONA DE TESTARE ---
# ==========================================
if __name__ == "__main__":
    # Aici poți pune o întrebare din PDF-ul tău ca să testezi
    intrebare_test = "ce sunt chilotii?"

    print(f"🔍 Caut în Cloud răspunsuri pentru: '{intrebare_test}'...\n")

    rezultate_finale = cauta_in_materie(intrebare_test)

    if rezultate_finale:
        print("✅ Am găsit următoarele informații în materia ULBS:\n")
        for i, res in enumerate(rezultate_finale):
            print(f"--- REZULTATUL {i+1} ---")
            print(res)
            print("-" * 50)
    else:
        print("⛔ STOP: Această întrebare nu pare să aibă legătură cu materia predată!")
