from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.domains.clients.models import Client
from src.domains.clients.schemas import (
    ClientCreate,
    ClientListResponse,
    ClientRead,
    ClientUpdate,
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

        return ClientListResponse(
            items=[ClientRead.model_validate(client) for client in clients],
            total=total,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    def get_client(db: Session, client_id: int) -> ClientRead:
        client = db.get(Client, client_id)

        if client is None:
            raise ValueError('Client not found')

        return ClientRead.model_validate(client)

    @staticmethod
    def create_client(db: Session, payload: ClientCreate) -> ClientRead:
        client = Client(**payload.model_dump())
        db.add(client)
        db.commit()
        db.refresh(client)
        return ClientRead.model_validate(client)

    @staticmethod
    def update_client(db: Session, client_id: int, payload: ClientUpdate) -> ClientRead:
        client = db.get(Client, client_id)

        if client is None:
            raise ValueError('Client not found')

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(client, field, value)

        db.add(client)
        db.commit()
        db.refresh(client)
        return ClientRead.model_validate(client)

    @staticmethod
    def delete_client(db: Session, client_id: int) -> None:
        client = db.get(Client, client_id)

        if client is None:
            raise ValueError('Client not found')

        try:
            db.delete(client)
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('Client has related quotes') from exc
