from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Definim fișierul unde se vor salva datele (va apărea un fișier app.db în folder)
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

# 2. Creăm "motorul" care traduce Python în SQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Creăm fabrica de sesiuni (fiecare request va primi o sesiune izolată)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Clasa de bază pe care o vor moșteni toate Entitățile noastre din models.py
Base = declarative_base()

# 5. Funcție ajutătoare pe care o vom folosi în main.py pentru a oferi acces rutelor


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
