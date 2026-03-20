from decimal import Decimal

from src.common.schemas.base import BaseSchema


class QuoteBase(BaseSchema):
    reference: str
    client_id: int
    status: str = 'draft'
    total_ht: Decimal = Decimal('0')
    total_ttc: Decimal = Decimal('0')


class QuoteCreate(QuoteBase):
    pass


class QuoteUpdate(BaseSchema):
    reference: str | None = None
    client_id: int | None = None
    status: str | None = None
    total_ht: Decimal | None = None
    total_ttc: Decimal | None = None


class QuoteRead(QuoteBase):
    id: int


class QuoteListResponse(BaseSchema):
    items: list[QuoteRead]
    total: int
    limit: int
    offset: int
