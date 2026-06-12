from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.db.models.quotes import Quote


class QuoteRepository:
    @staticmethod
    def get_by_id(db: Session, quote_id: int) -> Quote | None:
        return db.get(Quote, quote_id)

    @staticmethod
    def list_quotes(
        db: Session,
        *,
        limit: int,
        offset: int,
        search: str | None = None,
        status: str | None = None,
        client_id: int | None = None,
    ) -> tuple[list[Quote], int]:
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
        return quotes, total

    @staticmethod
    def add(db: Session, quote: Quote) -> None:
        db.add(quote)

    @staticmethod
    def delete(db: Session, quote: Quote) -> None:
        db.delete(quote)
