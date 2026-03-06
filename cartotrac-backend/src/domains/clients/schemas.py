from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ClientBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    contact_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=50)


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=255)
    contact_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=50)


class ClientRead(ClientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class PaginationMeta(BaseModel):
    limit: int
    offset: int
    total: int


class ClientListResponse(BaseModel):
    meta: PaginationMeta
    items: list[ClientRead]