from datetime import UTC, datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.db.models.clients import Client
from src.db.models.quote_requests import QuoteRequest
from src.db.repositories.quote_requests import QuoteRequestRepository
from src.schemas.quote_requests import (
    QuoteRequestConvertPayload,
    QuoteRequestConvertResponse,
    QuoteRequestCreate,
    QuoteRequestListResponse,
    QuoteRequestRead,
    QuoteRequestUpdate,
)
from src.db.models.quotes import Quote
from src.schemas.quotes import QuoteRead


class QuoteRequestManager:
    @staticmethod
    def list_quote_requests(
        db: Session,
        *,
        limit: int,
        offset: int,
        search: str | None = None,
        status: str | None = None,
    ) -> QuoteRequestListResponse:
        quote_requests, total = QuoteRequestRepository.list_quote_requests(
            db,
            limit=limit,
            offset=offset,
            search=search,
            status=status,
        )

        return QuoteRequestListResponse(
            items=[
                QuoteRequestRead.model_validate(quote_request)
                for quote_request in quote_requests
            ],
            total=total,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    def get_quote_request(db: Session, quote_request_id: int) -> QuoteRequestRead:
        quote_request = QuoteRequestRepository.get_by_id(db, quote_request_id)

        if quote_request is None:
            raise ValueError('Quote request not found')

        return QuoteRequestRead.model_validate(quote_request)

    @staticmethod
    def create_quote_request(
        db: Session,
        payload: QuoteRequestCreate,
    ) -> QuoteRequestRead:
        quote_request = QuoteRequest(
            **payload.model_dump(),
            status='new',
        )

        QuoteRequestRepository.add(db, quote_request)
        db.commit()
        db.refresh(quote_request)

        return QuoteRequestRead.model_validate(quote_request)

    @staticmethod
    def update_quote_request(
        db: Session,
        quote_request_id: int,
        payload: QuoteRequestUpdate,
    ) -> QuoteRequestRead:
        quote_request = QuoteRequestRepository.get_by_id(db, quote_request_id)

        if quote_request is None:
            raise ValueError('Quote request not found')

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(quote_request, field, value)

        QuoteRequestRepository.add(db, quote_request)
        db.commit()
        db.refresh(quote_request)

        return QuoteRequestRead.model_validate(quote_request)

    @staticmethod
    def convert_quote_request(
        db: Session,
        quote_request_id: int,
        payload: QuoteRequestConvertPayload,
    ) -> QuoteRequestConvertResponse:
        quote_request = QuoteRequestRepository.get_by_id(db, quote_request_id)

        if quote_request is None:
            raise ValueError('Quote request not found')

        if quote_request.converted_quote_id is not None:
            raise ValueError('Quote request already converted')

        client = Client(
            company_name=(quote_request.company or quote_request.name).strip(),
            contact_name=quote_request.name.strip(),
            email=quote_request.email,
            phone=quote_request.phone,
        )
        db.add(client)
        db.flush()

        reference = (
            payload.reference.strip()
            if payload.reference and payload.reference.strip()
            else build_quote_reference(quote_request.id)
        )
        quote = Quote(
            reference=reference,
            client_id=client.id,
            status=payload.status,
            total_ht=payload.total_ht,
            total_ttc=payload.total_ttc,
            cadastre_context={
                'source': 'quote_request',
                'quote_request_id': quote_request.id,
                'service': quote_request.service,
                'location': quote_request.location,
                'deadline': quote_request.deadline,
                'details': quote_request.details,
            },
        )
        quote_request.status = 'converted'
        quote_request.converted_quote_id = quote.id
        quote_request.updated_at = utc_now()

        try:
            db.add(quote)
            db.flush()
            quote_request.converted_quote_id = quote.id
            QuoteRequestRepository.add(db, quote_request)
            db.commit()
            db.refresh(quote)
            db.refresh(quote_request)
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('Quote reference already exists') from exc

        return QuoteRequestConvertResponse(
            quote_request=QuoteRequestRead.model_validate(quote_request),
            quote=QuoteRead.model_validate(quote),
        )


def build_quote_reference(quote_request_id: int) -> str:
    today = utc_now().strftime('%Y%m%d')
    return f'QR-{today}-{quote_request_id:04d}'


def utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)
