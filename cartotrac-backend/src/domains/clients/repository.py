from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.domains.clients.models import Client
from src.domains.clients.schemas import ClientCreate, ClientUpdate


class ClientRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: ClientCreate) -> Client:
        client = Client(**payload.model_dump())
        self.db.add(client)
        self.db.commit()
        self.db.refresh(client)
        return client

    def list(self, skip: int = 0, limit: int = 100) -> tuple[list[Client], int]:
        items = self.db.scalars(
            select(Client).offset(skip).limit(limit).order_by(Client.id.desc())
        ).all()

        total = self.db.scalar(select(func.count()).select_from(Client)) or 0
        return list(items), total

    def get_by_id(self, client_id: int) -> Client | None:
        return self.db.get(Client, client_id)

    def get_by_email(self, email: str) -> Client | None:
        return self.db.scalar(select(Client).where(Client.email == email))

    def update(self, client: Client, payload: ClientUpdate) -> Client:
        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(client, field, value)

        self.db.add(client)
        self.db.commit()
        self.db.refresh(client)
        return client

    def delete(self, client: Client) -> None:
        self.db.delete(client)
        self.db.commit()