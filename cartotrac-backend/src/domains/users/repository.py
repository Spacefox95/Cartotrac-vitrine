from sqlalchemy import select
from sqlalchemy.orm import Session

from src.domains.users.models import User


class UsersRepository:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return db.scalar(statement)
