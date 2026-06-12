from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.db.models.clients import Client
from src.db.repositories.clients import ClientRepository
from src.schemas.clients import (
    ClientCreate,
    ClientListResponse,
    ClientRead,
    ClientUpdate,
)


class ClientManager:
    @staticmethod
    def list_clients(
        db: Session,
        *,
        limit: int,
        offset: int,
        search: str | None = None,
    ) -> ClientListResponse:
        clients, total = ClientRepository.list_clients(
            db,
            limit=limit,
            offset=offset,
            search=search,
        )

        return ClientListResponse(
            items=[ClientRead.model_validate(client) for client in clients],
            total=total,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    def get_client(db: Session, client_id: int) -> ClientRead:
        client = ClientRepository.get_by_id(db, client_id)

        if client is None:
            raise ValueError('Client not found')

        return ClientRead.model_validate(client)

    @staticmethod
    def create_client(db: Session, payload: ClientCreate) -> ClientRead:
        client = Client(**payload.model_dump())
        ClientRepository.add(db, client)
        db.commit()
        db.refresh(client)
        return ClientRead.model_validate(client)

    @staticmethod
    def update_client(db: Session, client_id: int, payload: ClientUpdate) -> ClientRead:
        client = ClientRepository.get_by_id(db, client_id)

        if client is None:
            raise ValueError('Client not found')

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(client, field, value)

            ClientRepository.add(db, client)
        db.commit()
        db.refresh(client)
        return ClientRead.model_validate(client)

    @staticmethod
    def delete_client(db: Session, client_id: int) -> None:
        client = ClientRepository.get_by_id(db, client_id)

        if client is None:
            raise ValueError('Client not found')

        try:
            ClientRepository.delete(db, client)
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('Client has related quotes') from exc
