from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from src.core.dependencies import get_db
from src.domains.clients.schemas import (
    ClientCreate,
    ClientListResponse,
    ClientRead,
    ClientUpdate,
)
from src.domains.clients.service import ClientService

router = APIRouter(prefix="/clients", tags=["clients"])


@router.post(
    "",
    response_model=ClientRead,
    status_code=status.HTTP_201_CREATED,
)
def create_client(
    payload: ClientCreate,
    db: Annotated[Session, Depends(get_db)],
) -> ClientRead:
    service = ClientService(db)
    client = service.create_client(payload)
    return ClientRead.model_validate(client)


@router.get(
    "",
    response_model=ClientListResponse,
    status_code=status.HTTP_200_OK,
)
def list_clients(
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
) -> ClientListResponse:
    service = ClientService(db)
    items, total = service.list_clients(skip=skip, limit=limit)

    return ClientListResponse(
        items=[ClientRead.model_validate(item) for item in items],
        total=total,
    )


@router.get(
    "/{client_id}",
    response_model=ClientRead,
    status_code=status.HTTP_200_OK,
)
def get_client(
    client_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> ClientRead:
    service = ClientService(db)
    client = service.get_client(client_id)
    return ClientRead.model_validate(client)


@router.patch(
    "/{client_id}",
    response_model=ClientRead,
    status_code=status.HTTP_200_OK,
)
def update_client(
    client_id: int,
    payload: ClientUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ClientRead:
    service = ClientService(db)
    client = service.update_client(client_id, payload)
    return ClientRead.model_validate(client)


@router.delete(
    "/{client_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_client(
    client_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    service = ClientService(db)
    service.delete_client(client_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)