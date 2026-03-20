from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from src.api.dependencies.auth import get_current_user
from src.core.database import get_database
from src.domains.clients.schemas import (
    ClientCreate,
    ClientListResponse,
    ClientRead,
    ClientUpdate,
)
from src.domains.clients.service import ClientService

router = APIRouter(
    prefix='/clients',
    tags=['clients'],
    dependencies=[Depends(get_current_user)],
)


@router.get('', response_model=ClientListResponse)
def list_clients(
    db: Session = Depends(get_database),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: str | None = Query(default=None),
) -> ClientListResponse:
    return ClientService.list_clients(
        db,
        limit=limit,
        offset=offset,
        search=search,
    )


@router.get('/{client_id}', response_model=ClientRead)
def get_client(
    client_id: int,
    db: Session = Depends(get_database),
) -> ClientRead:
    try:
        return ClientService.get_client(db, client_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post('', response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreate,
    db: Session = Depends(get_database),
) -> ClientRead:
    return ClientService.create_client(db, payload)


@router.patch('/{client_id}', response_model=ClientRead)
def update_client(
    client_id: int,
    payload: ClientUpdate,
    db: Session = Depends(get_database),
) -> ClientRead:
    try:
        return ClientService.update_client(db, client_id, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.delete('/{client_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: int,
    db: Session = Depends(get_database),
) -> Response:
    try:
        ClientService.delete_client(db, client_id)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_409_CONFLICT
            if detail == 'Client has related quotes'
            else status.HTTP_404_NOT_FOUND
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
