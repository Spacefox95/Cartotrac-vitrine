from typing import Literal

from pydantic import BaseModel, EmailStr, Field

UserRole = Literal['admin', 'manager', 'sales', 'viewer']


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None
    role: UserRole
    permissions: list[str] = Field(default_factory=list)
    is_admin: bool

    model_config = {'from_attributes': True}


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str | None = None
    password: str
    role: UserRole = 'viewer'


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    role: UserRole | None = None


class UserListResponse(BaseModel):
    items: list[UserRead]
    total: int
