from sqlalchemy.orm import Session
import models
import schemas


def get_utilizator_by_email(db: Session, email: str):
    # Caută în baza de date primul utilizator cu acest email
    return db.query(models.Utilizator).filter(models.Utilizator.email == email).first()


def create_utilizator(db: Session, utilizator: schemas.UtilizatorCreate):
    # ATENȚIE: Aici folosim un sufix pentru test.
    # În producție vom folosi o librărie reală de criptare (ex: passlib / bcrypt).
    parola_criptata = utilizator.parola + "_hash_secret_123"

    # 1. Creăm Entitatea SQLAlchemy cu datele din DTO
    db_user = models.Utilizator(
        email=utilizator.email,
        parola_hash=parola_criptata
    )

    # 2. O trimitem spre salvare în baza de date
    db.add(db_user)
    db.commit()
    # Actualizăm obiectul ca să primească ID-ul generat de DB
    db.refresh(db_user)

    return db_user
