from datetime import UTC, datetime, timedelta

import bcrypt
from jose import JWTError, jwt

from src.core.config import settings

ALGORITHM = 'HS256'


def create_access_token(subject: str) -> str:
    expire = datetime.now(UTC) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {
        'sub': subject,
        'exp': expire,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, object]:
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8'),
    )


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


__all__ = [
    'ALGORITHM',
    'JWTError',
    'create_access_token',
    'decode_access_token',
    'get_password_hash',
    'verify_password',
]
