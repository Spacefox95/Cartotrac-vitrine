from pydantic import BaseModel, EmailStr, Field

from src.schemas.users import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class CurrentUserResponse(BaseModel):
    email: EmailStr
    full_name: str | None = None
    role: UserRole
    permissions: list[str] = Field(default_factory=list)
    is_admin: bool
