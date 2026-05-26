from collections.abc import AsyncGenerator

from sqlalchemy.orm import Session

from src.db.session import SessionLocal


async def get_database() -> AsyncGenerator[Session, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
