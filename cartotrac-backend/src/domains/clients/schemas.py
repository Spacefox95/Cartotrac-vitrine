from pydantic import EmailStr

from src.common.schemas.base import BaseSchema


class ClientBase(BaseSchema):
    company_name: str
    contact_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseSchema):
    company_name: str | None = None
    contact_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None


class ClientRead(ClientBase):
    id: int


class ClientListResponse(BaseSchema):
    items: list[ClientRead]
    total: int
    limit: int
    offset: int
