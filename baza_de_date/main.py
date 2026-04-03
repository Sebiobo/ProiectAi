from cautare_cloud import cauta_in_materie

print("🌐 Conectare la sistemul ULBS Coach...\n")

# 1. Studentul pune o întrebare
intrebare_student = "ce sunt chilotii?"

print(f"👤 Studentul întreabă: '{intrebare_student}'")
print("🔍 Caut în baza de date din Cloud...\n")

# 2. Apelăm funcția ta inteligentă (care filtrează automat prostiile)
paragrafe_gasite = cauta_in_materie(intrebare_student)

# 3. Verificăm ce ne-a răspuns baza de date
if len(paragrafe_gasite) == 0:
    # Dacă lista e goală, înseamnă că întrebarea a picat testul de scor (< 0.75)
    print("⛔ AI-ul zice: Îmi pare rău, dar această întrebare nu are legătură cu materia predată la ULBS!")
else:
    # Dacă a trecut filtrul, afișăm textele ca să le dăm mai departe modelului de limbaj
    print("✅ Am găsit informații relevante!")
    print("=" * 50)
    for paragraf in paragrafe_gasite:
        print(paragraf)
        print("-" * 50)
