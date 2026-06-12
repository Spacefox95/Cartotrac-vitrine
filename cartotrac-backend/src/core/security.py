from datetime import UTC, datetime, timedelta
from hashlib import sha256
from secrets import token_urlsafe
from uuid import uuid4

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
        'jti': str(uuid4()),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def create_refresh_token() -> str:
    return token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return sha256(token.encode('utf-8')).hexdigest()


def decode_access_token(token: str) -> dict[str, object]:
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8'),
    )


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt(rounds=settings.bcrypt_rounds),
    ).decode('utf-8')


__all__ = [
    'ALGORITHM',
    'JWTError',
    'create_access_token',
    'create_refresh_token',
    'decode_access_token',
    'get_password_hash',
    'hash_refresh_token',
    'verify_password',
]
