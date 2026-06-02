from pydantic import BaseModel

# 1. Baza (ce e comun)


class UtilizatorBase(BaseModel):
    email: str

# 2. DTO pentru Creare: Ce primim de la Frontend (are parolă)


class UtilizatorCreate(UtilizatorBase):
    parola: str

# 3. DTO pentru Răspuns: Ce trimitem spre Frontend (fără parolă, cu ID)


class UtilizatorResponse(UtilizatorBase):
    id: int

    class Config:
        from_attributes = True  # Permite Pydantic să citească din formatul SQLAlchemy
