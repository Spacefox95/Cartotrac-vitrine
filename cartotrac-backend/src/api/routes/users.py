from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from src.api.dependencies.auth import require_permission
from src.core.database import get_database
from src.schemas.auth import CurrentUserResponse
from src.schemas.users import UserCreate, UserListResponse, UserRead, UserUpdate
from src.managers.users import UsersManager

router = APIRouter(prefix='/users', tags=['users'])


@router.get('', response_model=UserListResponse)
async def list_users(
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> UserListResponse:
    return UsersManager.list_users(db)


@router.get('/{user_id}', response_model=UserRead)
async def get_user(
    user_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> UserRead:
    try:
        return UsersManager.get_user(db, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post('', response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> UserRead:
    try:
        return UsersManager.create_user(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch('/{user_id}', response_model=UserRead)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> UserRead:
    try:
        return UsersManager.update_user(db, user_id, payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_404_NOT_FOUND if detail == 'User not found' else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.delete('/{user_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('users:manage')),
    db: Session = Depends(get_database),
) -> Response:
    try:
        UsersManager.delete_user(db, user_id, current_user.email)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_404_NOT_FOUND if detail == 'User not found' else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
