from collections.abc import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.core.dependencies_db import get_db
from src.core.security import decode_access_token
from src.domains.users.models import User
from src.domains.users.repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        email = payload.get("sub")

        if not email or not isinstance(email, str):
            raise credentials_exception
    except ValueError as exc:
        raise credentials_exception from exc

    user = UserRepository.get_by_email(db=db, email=email)
    if user is None:
        raise credentials_exception

    return user