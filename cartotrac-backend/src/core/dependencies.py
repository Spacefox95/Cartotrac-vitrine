from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from src.api.dependencies.auth import get_current_user
from src.core.database import get_database
from src.domains.auth.schemas import CurrentUserResponse

DbSession = Annotated[Session, Depends(get_database)]
CurrentUser = Annotated[CurrentUserResponse, Depends(get_current_user)]

__all__ = ['CurrentUser', 'DbSession', 'get_current_user']
