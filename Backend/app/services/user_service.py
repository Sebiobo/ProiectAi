from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.users import User
from app.schemas.user_schemas import LoginRequest, RegisterRequest
from app.security.security import create_access_token, hash_password, verify_password


def register_user(db: Session, data: RegisterRequest) -> User:
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email-ul este deja înregistrat.",
        )

    user = User(
        email=data.email,
        full_name=data.full_name,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, data: LoginRequest) -> str:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email sau parolă incorectă.",
        )
    return create_access_token({"sub": str(user.id), "email": user.email})
