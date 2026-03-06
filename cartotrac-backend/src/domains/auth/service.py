from sqlalchemy.orm import Session

from src.core.security import create_access_token, verify_password
from src.domains.users.models import User
from src.domains.users.repository import UserRepository


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = UserRepository.get_by_email(db=db, email=email)

        if user is None:
            raise ValueError("Invalid credentials")

        if not verify_password(password, user.hashed_password):
            raise ValueError("Invalid credentials")

        return user

    @staticmethod
    def login(db: Session, email: str, password: str) -> str:
        user = AuthService.authenticate_user(db=db, email=email, password=password)
        return create_access_token(subject=user.email)