from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from src.db.models.clients import Client


class ClientRepository:
    @staticmethod
    def get_by_id(db: Session, client_id: int) -> Client | None:
        return db.get(Client, client_id)

    @staticmethod
    def list_clients(
        db: Session,
        *,
        limit: int,
        offset: int,
        search: str | None = None,
    ) -> tuple[list[Client], int]:
        filters = []

        if search:
            pattern = f'%{search.strip()}%'
            filters.append(
                or_(
                    Client.company_name.ilike(pattern),
                    Client.contact_name.ilike(pattern),
                    Client.email.ilike(pattern),
                )
            )

        query = select(Client)
        count_query = select(func.count()).select_from(Client)

        if filters:
            query = query.where(*filters)
            count_query = count_query.where(*filters)

        clients = db.scalars(
            query.order_by(Client.company_name.asc()).offset(offset).limit(limit)
        ).all()
        total = db.scalar(count_query) or 0
        return clients, total

    @staticmethod
    def add(db: Session, client: Client) -> None:
        db.add(client)

    @staticmethod
    def delete(db: Session, client: Client) -> None:
        db.delete(client)
