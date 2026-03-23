from pydantic import BaseModel, EmailStr, Field

from src.domains.users.schemas import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class CurrentUserResponse(BaseModel):
    email: EmailStr
    full_name: str | None = None
    role: UserRole
    permissions: list[str] = Field(default_factory=list)
    is_admin: bool
