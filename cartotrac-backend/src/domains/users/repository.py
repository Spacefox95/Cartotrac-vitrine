from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.domains.users.models import User


class UsersRepository:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return db.scalar(statement)

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        return db.get(User, user_id)

    @staticmethod
    def list_users(db: Session) -> tuple[list[User], int]:
        users = db.scalars(select(User).order_by(User.email.asc())).all()
        total = db.scalar(select(func.count()).select_from(User)) or 0
        return users, total
