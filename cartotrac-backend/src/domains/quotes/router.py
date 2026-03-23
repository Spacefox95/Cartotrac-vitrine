from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from src.api.dependencies.auth import require_permission
from src.core.database import get_database
from src.domains.auth.schemas import CurrentUserResponse
from src.domains.quotes.schemas import (
    QuoteCreate,
    QuoteListResponse,
    QuoteRead,
    QuoteUpdate,
)
from src.domains.quotes.service import QuoteService

router = APIRouter(prefix='/quotes', tags=['quotes'])


@router.get('', response_model=QuoteListResponse)
def list_quotes(
    current_user: CurrentUserResponse = Depends(require_permission('quotes:read')),
    db: Session = Depends(get_database),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias='status'),
    client_id: int | None = Query(default=None, gt=0),
) -> QuoteListResponse:
    return QuoteService.list_quotes(
        db,
        limit=limit,
        offset=offset,
        search=search,
        status=status_filter,
        client_id=client_id,
    )


@router.get('/{quote_id}', response_model=QuoteRead)
def get_quote(
    quote_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('quotes:read')),
    db: Session = Depends(get_database),
) -> QuoteRead:
    try:
        return QuoteService.get_quote(db, quote_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post('', response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
def create_quote(
    payload: QuoteCreate,
    current_user: CurrentUserResponse = Depends(require_permission('quotes:write')),
    db: Session = Depends(get_database),
) -> QuoteRead:
    try:
        return QuoteService.create_quote(db, payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_404_NOT_FOUND
            if detail == 'Client not found'
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.patch('/{quote_id}', response_model=QuoteRead)
def update_quote(
    quote_id: int,
    payload: QuoteUpdate,
    current_user: CurrentUserResponse = Depends(require_permission('quotes:write')),
    db: Session = Depends(get_database),
) -> QuoteRead:
    try:
        return QuoteService.update_quote(db, quote_id, payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = (
            status.HTTP_404_NOT_FOUND
            if detail in {'Quote not found', 'Client not found'}
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=detail) from exc


@router.delete('/{quote_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_quote(
    quote_id: int,
    current_user: CurrentUserResponse = Depends(require_permission('quotes:write')),
    db: Session = Depends(get_database),
) -> Response:
    try:
        QuoteService.delete_quote(db, quote_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
