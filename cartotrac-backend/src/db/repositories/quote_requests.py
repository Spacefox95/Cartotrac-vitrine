from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from src.db.models.quote_requests import QuoteRequest


class QuoteRequestRepository:
    @staticmethod
    def get_by_id(db: Session, quote_request_id: int) -> QuoteRequest | None:
        return db.get(QuoteRequest, quote_request_id)

    @staticmethod
    def list_quote_requests(
        db: Session,
        *,
        limit: int,
        offset: int,
        search: str | None = None,
        status: str | None = None,
    ) -> tuple[list[QuoteRequest], int]:
        filters = []

        if search:
            pattern = f'%{search.strip()}%'
            filters.append(
                or_(
                    QuoteRequest.name.ilike(pattern),
                    QuoteRequest.email.ilike(pattern),
                    QuoteRequest.company.ilike(pattern),
                    QuoteRequest.service.ilike(pattern),
                    QuoteRequest.location.ilike(pattern),
                )
            )

        if status:
            filters.append(QuoteRequest.status == status)

        query = select(QuoteRequest)
        count_query = select(func.count()).select_from(QuoteRequest)

        if filters:
            query = query.where(*filters)
            count_query = count_query.where(*filters)

        quote_requests = db.scalars(
            query.order_by(QuoteRequest.created_at.desc()).offset(offset).limit(limit)
        ).all()
        total = db.scalar(count_query) or 0
        return quote_requests, total

    @staticmethod
    def add(db: Session, quote_request: QuoteRequest) -> None:
        db.add(quote_request)
