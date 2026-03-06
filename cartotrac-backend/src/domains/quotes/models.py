from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    reference: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)
    total_ht: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    total_ttc: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)