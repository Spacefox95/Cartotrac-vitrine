from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.domains.clients.models import Client
from src.domains.clients.repository import ClientRepository
from src.domains.clients.schemas import ClientCreate, ClientUpdate


class ClientService:
    def __init__(self, db: Session) -> None:
        self.repository = ClientRepository(db)

    def create_client(self, payload: ClientCreate) -> Client:
        existing = self.repository.get_by_email(payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A client with this email already exists.",
            )

        return self.repository.create(payload)

    def list_clients(self, skip: int = 0, limit: int = 100) -> tuple[list[Client], int]:
        return self.repository.list(skip=skip, limit=limit)

    def get_client(self, client_id: int) -> Client:
        client = self.repository.get_by_id(client_id)
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found.",
            )
        return client

    def update_client(self, client_id: int, payload: ClientUpdate) -> Client:
        client = self.get_client(client_id)

        if payload.email and payload.email != client.email:
            existing = self.repository.get_by_email(payload.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A client with this email already exists.",
                )

        return self.repository.update(client, payload)

    def delete_client(self, client_id: int) -> None:
        client = self.get_client(client_id)
        self.repository.delete(client)