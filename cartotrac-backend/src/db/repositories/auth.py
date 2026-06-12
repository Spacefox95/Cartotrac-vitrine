from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.db.models.auth import RefreshTokenSession


class RefreshTokenRepository:
    @staticmethod
    def get_by_token_hash(db: Session, token_hash: str) -> RefreshTokenSession | None:
        return db.scalar(
            select(RefreshTokenSession).where(RefreshTokenSession.token_hash == token_hash)
        )

    @staticmethod
    def create(
        db: Session,
        *,
        user_id: int,
        token_hash: str,
        expires_at: datetime,
    ) -> RefreshTokenSession:
        now = datetime.now(UTC).replace(tzinfo=None)
        session = RefreshTokenSession(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            created_at=now,
        )
        db.add(session)
        return session

    @staticmethod
    def revoke(
        session: RefreshTokenSession,
        *,
        replaced_by_token_hash: str | None = None,
    ) -> None:
        session.revoked_at = datetime.now(UTC).replace(tzinfo=None)
        session.replaced_by_token_hash = replaced_by_token_hash
