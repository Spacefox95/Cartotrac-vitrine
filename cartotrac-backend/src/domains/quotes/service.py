from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.domains.clients.models import Client
from src.domains.quotes.models import Quote
from src.domains.quotes.schemas import (
    QuoteCreate,
    QuoteListResponse,
    QuoteRead,
    QuoteUpdate,
)


class QuoteService:
    @staticmethod
    def list_quotes(
        db: Session,
        *,
        limit: int,
        offset: int,
        search: str | None = None,
        status: str | None = None,
        client_id: int | None = None,
    ) -> QuoteListResponse:
        filters = []

        if search:
            pattern = f'%{search.strip()}%'
            filters.append(Quote.reference.ilike(pattern))

        if status:
            filters.append(Quote.status == status)

        if client_id is not None:
            filters.append(Quote.client_id == client_id)

        query = select(Quote)
        count_query = select(func.count()).select_from(Quote)

        if filters:
            query = query.where(*filters)
            count_query = count_query.where(*filters)

        quotes = db.scalars(
            query.order_by(Quote.id.desc()).offset(offset).limit(limit)
        ).all()
        total = db.scalar(count_query) or 0

        return QuoteListResponse(
            items=[QuoteRead.model_validate(quote) for quote in quotes],
            total=total,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    def get_quote(db: Session, quote_id: int) -> QuoteRead:
        quote = db.get(Quote, quote_id)

        if quote is None:
            raise ValueError('Quote not found')

        return QuoteRead.model_validate(quote)

    @staticmethod
    def create_quote(db: Session, payload: QuoteCreate) -> QuoteRead:
        if db.get(Client, payload.client_id) is None:
            raise ValueError('Client not found')

        quote = Quote(**payload.model_dump())

        try:
            db.add(quote)
            db.commit()
            db.refresh(quote)
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('Quote reference already exists') from exc

        return QuoteRead.model_validate(quote)

    @staticmethod
    def update_quote(db: Session, quote_id: int, payload: QuoteUpdate) -> QuoteRead:
        quote = db.get(Quote, quote_id)

        if quote is None:
            raise ValueError('Quote not found')

        updates = payload.model_dump(exclude_unset=True)
        next_client_id = updates.get('client_id')

        if next_client_id is not None and db.get(Client, next_client_id) is None:
            raise ValueError('Client not found')

        for field, value in updates.items():
            setattr(quote, field, value)

        try:
            db.add(quote)
            db.commit()
            db.refresh(quote)
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('Quote reference already exists') from exc

        return QuoteRead.model_validate(quote)

    @staticmethod
    def delete_quote(db: Session, quote_id: int) -> None:
        quote = db.get(Quote, quote_id)

        if quote is None:
            raise ValueError('Quote not found')

        db.delete(quote)
        db.commit()
