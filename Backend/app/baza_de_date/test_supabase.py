import os
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. Încărcăm cheile secrete din fișierul .env
load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

# 2. Ne conectăm la serverul tău din Paris
supabase: Client = create_client(url, key)

print("🌐 Conectare la Supabase reușită!\n")

# ==========================================
# --- ZONA DE TESTARE ---
# ==========================================

# 3. Definim datele noului student
student_nou = {
    "nume": "Dan Fogoros",
    "email": "dan.fogoros@student.ulbsibiu.ro"
}

print(f"⏳ Adăugăm studentul {student_nou['nume']} în baza de date...")

# 4. Inserăm datele direct în tabelul 'users' creat de tine adineauri
raspuns_insert = supabase.table("users").insert(student_nou).execute()

# 5. Ca să fim 100% siguri, cerem bazei de date să ne dea înapoi toți utilizatorii
print("📥 Extragem lista de studenți din Cloud...\n")
raspuns_citire = supabase.table("users").select("*").execute()

print("✅ Baza de date conține acum următorii studenți:")
print("=" * 50)
for student in raspuns_citire.data:
    print(f"👤 Nume:  {student['nume']}")
    print(f"📧 Email: {student['email']}")
    print(f"🔑 ID:    {student['id']}")
    print(f"📅 Creat: {student['data_crearii']}")
    print("-" * 50)
