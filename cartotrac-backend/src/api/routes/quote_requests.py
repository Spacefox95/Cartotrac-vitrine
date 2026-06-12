from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from src.api.dependencies.auth import require_permission
from src.core.database import get_database
from src.schemas.auth import CurrentUserResponse
from src.schemas.quote_requests import (
    QuoteRequestConvertPayload,
    QuoteRequestConvertResponse,
    QuoteRequestCreate,
    QuoteRequestListResponse,
    QuoteRequestRead,
    QuoteRequestUpdate,
)
from src.managers.quote_requests import QuoteRequestManager

router = APIRouter(prefix='/quote-requests', tags=['quote-requests'])


@router.post('/public', response_model=QuoteRequestRead, status_code=status.HTTP_201_CREATED)
async def create_public_quote_request(
    payload: QuoteRequestCreate,
    db: Session = Depends(get_database),
) -> QuoteRequestRead:
    return QuoteRequestManager.create_quote_request(db, payload)


@router.get('', response_model=QuoteRequestListResponse)
async def list_quote_requests(
    current_user: CurrentUserResponse = Depends(require_permission('quote_requests:read')),
    db: Session = Depends(get_database),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias='status'),
) -> QuoteRequestListResponse:
    return QuoteRequestManager.list_quote_requests(
        db,
        limit=limit,
        offset=offset,
        search=search,
        status=status_filter,
    )


@router.get('/{quote_request_id}', response_model=QuoteRequestRead)
async def get_quote_request(
    quote_request_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('quote_requests:read')),
    db: Session = Depends(get_database),
) -> QuoteRequestRead:
    try:
        return QuoteRequestManager.get_quote_request(db, quote_request_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.patch('/{quote_request_id}', response_model=QuoteRequestRead)
async def update_quote_request(
    quote_request_id: int,
    payload: QuoteRequestUpdate,
    current_user: CurrentUserResponse = Depends(require_permission('quote_requests:write')),
    db: Session = Depends(get_database),
) -> QuoteRequestRead:
    try:
        return QuoteRequestManager.update_quote_request(db, quote_request_id, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post(
    '/{quote_request_id}/convert',
    response_model=QuoteRequestConvertResponse,
    status_code=status.HTTP_201_CREATED,
)
async def convert_quote_request(
    quote_request_id: int,
    payload: QuoteRequestConvertPayload,
    current_user: CurrentUserResponse = Depends(require_permission('quote_requests:write')),
    db: Session = Depends(get_database),
) -> QuoteRequestConvertResponse:
    try:
        return QuoteRequestManager.convert_quote_request(db, quote_request_id, payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_404_NOT_FOUND
            if detail == 'Quote request not found'
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc
