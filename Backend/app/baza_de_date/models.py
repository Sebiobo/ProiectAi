from sqlalchemy import Column, Integer, String
from Backend.app.baza_de_date.database import Base


class Utilizator(Base):
    __tablename__ = "utilizatori"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    parola_hash = Column(String, nullable=False)
