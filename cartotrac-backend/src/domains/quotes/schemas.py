from decimal import Decimal

from src.common.schemas.base import BaseSchema


class QuoteCadastreContext(BaseSchema):
    saved_at: str | None = None
    address_label: str | None = None
    address_point: list[float] | None = None
    search_kind: str | None = None
    source_url: str | None = None
    parcel_title: str | None = None
    parcel_subtitle: str | None = None
    parcel_area_label: str | None = None
    measured_area_sqm: float | None = None
    estimated_building_area_sqm: float | None = None
    trace_area_sqm: float | None = None
    trace_points: list[list[float]] = []
    preview_svg: str | None = None


class QuoteBase(BaseSchema):
    reference: str
    client_id: int
    status: str = 'draft'
    total_ht: Decimal = Decimal('0')
    total_ttc: Decimal = Decimal('0')
    cadastre_context: QuoteCadastreContext | None = None


class QuoteCreate(QuoteBase):
    pass


class QuoteUpdate(BaseSchema):
    reference: str | None = None
    client_id: int | None = None
    status: str | None = None
    total_ht: Decimal | None = None
    total_ttc: Decimal | None = None
    cadastre_context: QuoteCadastreContext | None = None


class QuoteRead(QuoteBase):
    id: int


class QuoteListResponse(BaseSchema):
    items: list[QuoteRead]
    total: int
    limit: int
    offset: int
