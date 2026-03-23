"""add is_admin to users

Revision ID: b1c2d3e4f5a6
Revises: 8f3a0a1b2c4d
Create Date: 2026-03-20 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, Sequence[str], None] = '8f3a0a1b2c4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.execute(
        "UPDATE users SET email = 'admin.local@cartotrac.com' WHERE email = 'admin@cartotrac.local'"
    )
    op.execute(
        "UPDATE users SET is_admin = TRUE WHERE email IN ('admin@cartotrac.com', 'admin.local@cartotrac.com')"
    )
    op.alter_column('users', 'is_admin', server_default=None)


def downgrade() -> None:
    op.drop_column('users', 'is_admin')
