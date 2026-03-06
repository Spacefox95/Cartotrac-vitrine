from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from src.core.database import get_database

DbSession = Annotated[Session, Depends(get_database)]