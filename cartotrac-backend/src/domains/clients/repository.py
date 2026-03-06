from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from src.domains.clients.models import Client
from src.domains.clients.schemas import ClientCreate, ClientUpdate


class ClientRepository:
    @staticmethod
    def list(
        db: Session,
        *,
        limit: int,
        offset: int,
        search: str | None = None,
    ) -> list[Client]:
        stmt = select(Client)

        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Client.company_name.ilike(pattern),
                    Client.contact_name.ilike(pattern),
                    Client.email.ilike(pattern),
                    Client.phone.ilike(pattern),
                )
            )

        stmt = stmt.order_by(Client.id.desc()).offset(offset).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def count(
        db: Session,
        *,
        search: str | None = None,
    ) -> int:
        stmt = select(func.count(Client.id))

        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Client.company_name.ilike(pattern),
                    Client.contact_name.ilike(pattern),
                    Client.email.ilike(pattern),
                    Client.phone.ilike(pattern),
                )
            )

        return int(db.execute(stmt).scalar_one())

    @staticmethod
    def get_by_id(db: Session, client_id: int) -> Client | None:
        stmt = select(Client).where(Client.id == client_id)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def create(db: Session, payload: ClientCreate) -> Client:
        client = Client(
            company_name=payload.company_name,
            contact_name=payload.contact_name,
            email=str(payload.email) if payload.email else None,
            phone=payload.phone,
        )
        db.add(client)
        db.commit()
        db.refresh(client)
        return client

    @staticmethod
    def update(db: Session, client: Client, payload: ClientUpdate) -> Client:
        update_data = payload.model_dump(exclude_unset=True)

        if "email" in update_data and update_data["email"] is not None:
            update_data["email"] = str(update_data["email"])

        for field, value in update_data.items():
            setattr(client, field, value)

        db.add(client)
        db.commit()
        db.refresh(client)
        return client

    @staticmethod
    def delete(db: Session, client: Client) -> None:
        db.delete(client)
        db.commit()