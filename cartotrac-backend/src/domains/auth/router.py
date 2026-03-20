from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.api.dependencies.auth import get_current_user
from src.core.database import get_database
from src.domains.auth.schemas import (
    CurrentUserResponse,
    LoginRequest,
    TokenResponse,
)
from src.domains.auth.service import AuthService

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/login', response_model=TokenResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_database),
) -> TokenResponse:
    try:
        token = AuthService.login(db, payload.email, payload.password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    return TokenResponse(access_token=token)


@router.get('/me', response_model=CurrentUserResponse)
def get_me(
    current_user: CurrentUserResponse = Depends(get_current_user),
) -> CurrentUserResponse:
    return current_user
