from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from src.api.dependencies.auth import require_permission
from src.core.database import get_database
from src.domains.auth.schemas import CurrentUserResponse
from src.domains.users.schemas import UserCreate, UserListResponse, UserRead, UserUpdate
from src.domains.users.service import UsersService

router = APIRouter(prefix='/users', tags=['users'])


@router.get('', response_model=UserListResponse)
def list_users(
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> UserListResponse:
    return UsersService.list_users(db)


@router.get('/{user_id}', response_model=UserRead)
def get_user(
    user_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> UserRead:
    try:
        return UsersService.get_user(db, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post('', response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> UserRead:
    try:
        return UsersService.create_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch('/{user_id}', response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> UserRead:
    try:
        return UsersService.update_user(db, user_id, payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_404_NOT_FOUND if detail == 'User not found' else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.delete('/{user_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> Response:
    try:
        UsersService.delete_user(db, user_id, current_user.email)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_404_NOT_FOUND if detail == 'User not found' else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
