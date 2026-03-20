from sqlalchemy.orm import Session

from src.domains.users.models import User
from src.domains.users.repository import UsersRepository


class UsersService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return UsersRepository.get_by_email(db, email)
