from sqlalchemy.orm import Session

from src.domains.clients.models import Client
from src.domains.clients.repository import ClientRepository
from src.domains.clients.schemas import (
    ClientCreate,
    ClientListResponse,
    ClientRead,
    ClientUpdate,
    PaginationMeta,
)


class ClientService:
    @staticmethod
    def list_clients(
        db: Session,
        *,
        limit: int,
        offset: int,
        search: str | None = None,
    ) -> ClientListResponse:
        items = ClientRepository.list(
            db,
            limit=limit,
            offset=offset,
            search=search,
        )
        total = ClientRepository.count(db, search=search)

        return ClientListResponse(
            meta=PaginationMeta(
                limit=limit,
                offset=offset,
                total=total,
            ),
            items=[ClientRead.model_validate(item) for item in items],
        )

    @staticmethod
    def get_client_or_raise(db: Session, client_id: int) -> Client:
        client = ClientRepository.get_by_id(db, client_id)
        if client is None:
            raise ValueError("Client not found")
        return client

    @staticmethod
    def create_client(db: Session, payload: ClientCreate) -> ClientRead:
        client = ClientRepository.create(db, payload)
        return ClientRead.model_validate(client)

    @staticmethod
    def get_client(db: Session, client_id: int) -> ClientRead:
        client = ClientService.get_client_or_raise(db, client_id)
        return ClientRead.model_validate(client)

    @staticmethod
    def update_client(
        db: Session,
        client_id: int,
        payload: ClientUpdate,
    ) -> ClientRead:
        client = ClientService.get_client_or_raise(db, client_id)
        updated_client = ClientRepository.update(db, client, payload)
        return ClientRead.model_validate(updated_client)

    @staticmethod
    def delete_client(db: Session, client_id: int) -> None:
        client = ClientService.get_client_or_raise(db, client_id)
        ClientRepository.delete(db, client)