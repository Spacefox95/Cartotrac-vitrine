from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from src.api.dependencies.auth import require_permission
from src.core.database import get_database
from src.schemas.auth import CurrentUserResponse
from src.schemas.clients import (
    ClientCreate,
    ClientListResponse,
    ClientRead,
    ClientUpdate,
)
from src.managers.clients import ClientManager

router = APIRouter(prefix='/clients', tags=['clients'])


@router.get('', response_model=ClientListResponse)
async def list_clients(
    current_user: CurrentUserResponse = Depends(require_permission('clients:read')),
    db: Session = Depends(get_database),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: str | None = Query(default=None),
) -> ClientListResponse:
    return ClientManager.list_clients(
        db,
        limit=limit,
        offset=offset,
        search=search,
    )


@router.get('/{client_id}', response_model=ClientRead)
async def get_client(
    client_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('clients:read')),
    db: Session = Depends(get_database),
) -> ClientRead:
    try:
        return ClientManager.get_client(db, client_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post('', response_model=ClientRead, status_code=status.HTTP_201_CREATED)
async def create_client(
    payload: ClientCreate,
    current_user: CurrentUserResponse = Depends(require_permission('clients:write')),
    db: Session = Depends(get_database),
) -> ClientRead:
    return ClientManager.create_client(db, payload)


@router.patch('/{client_id}', response_model=ClientRead)
async def update_client(
    client_id: int,
    payload: ClientUpdate,
    current_user: CurrentUserResponse = Depends(require_permission('clients:write')),
    db: Session = Depends(get_database),
) -> ClientRead:
    try:
        return ClientManager.update_client(db, client_id, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.delete('/{client_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('clients:write')),
    db: Session = Depends(get_database),
) -> Response:
    try:
        ClientManager.delete_client(db, client_id)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_409_CONFLICT
            if detail == 'Client has related quotes'
            else status.HTTP_404_NOT_FOUND
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
