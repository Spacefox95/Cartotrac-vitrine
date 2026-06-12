from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.db.repositories.clients import ClientRepository
from src.db.models.quotes import Quote
from src.renderers.quote_pdf import QuotePdfDocument, render_quote_pdf
from src.db.repositories.quotes import QuoteRepository
from src.schemas.quotes import (
    QuoteCreate,
    QuoteListResponse,
    QuoteRead,
    QuoteUpdate,
)


class QuoteManager:
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
        quotes, total = QuoteRepository.list_quotes(
            db,
            limit=limit,
            offset=offset,
            search=search,
            status=status,
            client_id=client_id,
        )

        return QuoteListResponse(
            items=[QuoteRead.model_validate(quote) for quote in quotes],
            total=total,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    def get_quote(db: Session, quote_id: int) -> QuoteRead:
        quote = QuoteRepository.get_by_id(db, quote_id)

        if quote is None:
            raise ValueError('Quote not found')

        return QuoteRead.model_validate(quote)

    @staticmethod
    def create_quote(db: Session, payload: QuoteCreate) -> QuoteRead:
        if ClientRepository.get_by_id(db, payload.client_id) is None:
            raise ValueError('Client not found')

        quote = Quote(**payload.model_dump(mode='python'))

        try:
            QuoteRepository.add(db, quote)
            db.commit()
            db.refresh(quote)
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('Quote reference already exists') from exc

        return QuoteRead.model_validate(quote)

    @staticmethod
    def update_quote(db: Session, quote_id: int, payload: QuoteUpdate) -> QuoteRead:
        quote = QuoteRepository.get_by_id(db, quote_id)

        if quote is None:
            raise ValueError('Quote not found')

        updates = payload.model_dump(exclude_unset=True)
        next_client_id = updates.get('client_id')

        if next_client_id is not None and ClientRepository.get_by_id(db, next_client_id) is None:
            raise ValueError('Client not found')

        for field, value in updates.items():
            setattr(quote, field, value)

        try:
            QuoteRepository.add(db, quote)
            db.commit()
            db.refresh(quote)
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('Quote reference already exists') from exc

        return QuoteRead.model_validate(quote)

    @staticmethod
    def delete_quote(db: Session, quote_id: int) -> None:
        quote = QuoteRepository.get_by_id(db, quote_id)

        if quote is None:
            raise ValueError('Quote not found')

        QuoteRepository.delete(db, quote)
        db.commit()

    @staticmethod
    def generate_quote_pdf(db: Session, quote_id: int) -> QuotePdfDocument:
        quote = QuoteRepository.get_by_id(db, quote_id)

        if quote is None:
            raise ValueError('Quote not found')

        client = ClientRepository.get_by_id(db, quote.client_id)
        if client is None:
            raise ValueError('Client not found')

        return render_quote_pdf(quote, client)
