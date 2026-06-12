from datetime import datetime

from pydantic import EmailStr, Field

from src.schemas.base import BaseSchema
from src.schemas.quotes import QuoteRead


class QuoteRequestBase(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    company: str | None = Field(default=None, max_length=255)
    service: str = Field(min_length=1, max_length=255)
    location: str = Field(min_length=1, max_length=500)
    deadline: str | None = Field(default=None, max_length=255)
    details: str = Field(min_length=1)


class QuoteRequestCreate(QuoteRequestBase):
    pass


class QuoteRequestUpdate(BaseSchema):
    status: str | None = Field(default=None, min_length=1, max_length=50)


class QuoteRequestRead(QuoteRequestBase):
    id: int
    status: str
    converted_quote_id: int | None = None
    created_at: datetime
    updated_at: datetime


class QuoteRequestListResponse(BaseSchema):
    items: list[QuoteRequestRead]
    total: int
    limit: int
    offset: int


class QuoteRequestConvertPayload(BaseSchema):
    reference: str | None = Field(default=None, max_length=100)
    status: str = Field(default='draft', min_length=1, max_length=50)
    total_ht: str = '0'
    total_ttc: str = '0'


class QuoteRequestConvertResponse(BaseSchema):
    quote_request: QuoteRequestRead
    quote: QuoteRead
