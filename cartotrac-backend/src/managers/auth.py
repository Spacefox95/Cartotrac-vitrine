from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from src.core.config import settings
from src.core.security import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    verify_password,
)
from src.db.repositories.auth import RefreshTokenRepository
from src.schemas.auth import TokenResponse
from src.db.models.users import User
from src.managers.users import UsersManager


class AuthManager:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = UsersManager.get_by_email(db, email)

        if user is None or not verify_password(password, user.hashed_password):
            raise ValueError('Invalid credentials')

        return user

    @staticmethod
    def login(db: Session, email: str, password: str) -> TokenResponse:
        user = AuthManager.authenticate_user(db, email, password)
        return AuthManager._issue_tokens(db, user)

    @staticmethod
    def refresh(db: Session, refresh_token: str) -> TokenResponse:
        token_hash = hash_refresh_token(refresh_token)
        session = RefreshTokenRepository.get_by_token_hash(db, token_hash)

        if session is None or session.revoked_at is not None:
            raise ValueError('Invalid refresh token')

        now = datetime.now(UTC).replace(tzinfo=None)
        if session.expires_at <= now:
            RefreshTokenRepository.revoke(session)
            db.commit()
            raise ValueError('Refresh token expired')

        user = db.get(User, session.user_id)
        if user is None:
            RefreshTokenRepository.revoke(session)
            db.commit()
            raise ValueError('User not found')

        next_refresh_token = create_refresh_token()
        next_refresh_hash = hash_refresh_token(next_refresh_token)
        RefreshTokenRepository.revoke(session, replaced_by_token_hash=next_refresh_hash)
        RefreshTokenRepository.create(
            db,
            user_id=user.id,
            token_hash=next_refresh_hash,
            expires_at=AuthManager._refresh_expires_at(),
        )
        db.commit()

        return TokenResponse(
            access_token=create_access_token(subject=user.email),
            refresh_token=next_refresh_token,
        )

    @staticmethod
    def logout(db: Session, refresh_token: str) -> None:
        session = RefreshTokenRepository.get_by_token_hash(
            db,
            hash_refresh_token(refresh_token),
        )

        if session is None or session.revoked_at is not None:
            return

        RefreshTokenRepository.revoke(session)
        db.commit()

    @staticmethod
    def _issue_tokens(db: Session, user: User) -> TokenResponse:
        refresh_token = create_refresh_token()
        RefreshTokenRepository.create(
            db,
            user_id=user.id,
            token_hash=hash_refresh_token(refresh_token),
            expires_at=AuthManager._refresh_expires_at(),
        )
        db.commit()

        return TokenResponse(
            access_token=create_access_token(subject=user.email),
            refresh_token=refresh_token,
        )

    @staticmethod
    def _refresh_expires_at() -> datetime:
        return datetime.now(UTC).replace(tzinfo=None) + timedelta(
            days=settings.refresh_token_expire_days,
        )
