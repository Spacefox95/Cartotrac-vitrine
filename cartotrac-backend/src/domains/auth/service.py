from sqlalchemy.orm import Session

from src.core.security import create_access_token, verify_password
from src.domains.users.models import User
from src.domains.users.service import UsersService


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = UsersService.get_by_email(db, email)

        if user is None or not verify_password(password, user.hashed_password):
            raise ValueError('Invalid credentials')

        return user

    @staticmethod
    def login(db: Session, email: str, password: str) -> str:
        user = AuthService.authenticate_user(db, email, password)
        return create_access_token(subject=user.email)
