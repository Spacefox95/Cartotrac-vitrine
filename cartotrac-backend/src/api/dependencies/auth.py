from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from src.core.database import get_database
from src.core.permissions import get_permissions_for_role, is_admin_role, normalize_role
from src.core.security import JWTError, decode_access_token
from src.domains.auth.schemas import CurrentUserResponse
from src.domains.users.service import UsersService

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    db: Session = Depends(get_database),
) -> CurrentUserResponse:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Not authenticated',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid token',
            headers={'WWW-Authenticate': 'Bearer'},
        ) from exc

    subject = payload.get('sub')

    if not isinstance(subject, str) or not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid token payload',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    user = UsersService.get_by_email(db, subject)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not found',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    role = normalize_role(user.role)

    return CurrentUserResponse(
        email=user.email,
        full_name=user.full_name,
        role=role,
        permissions=get_permissions_for_role(role),
        is_admin=is_admin_role(role),
    )


def get_current_admin(
    current_user: CurrentUserResponse = Depends(get_current_user),
) -> CurrentUserResponse:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Admin access required',
        )

    return current_user


def require_permission(permission: str) -> Callable[[CurrentUserResponse], CurrentUserResponse]:
    def dependency(
        current_user: CurrentUserResponse = Depends(get_current_user),
    ) -> CurrentUserResponse:
        if permission not in current_user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Insufficient permissions',
            )

        return current_user

    return dependency
