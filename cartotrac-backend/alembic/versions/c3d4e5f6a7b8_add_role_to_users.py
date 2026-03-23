"""add role to users

Revision ID: c3d4e5f6a7b8
Revises: b1c2d3e4f5a6
Create Date: 2026-03-20 00:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b1c2d3e4f5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('role', sa.String(length=50), nullable=False, server_default='viewer'),
    )
    op.execute("UPDATE users SET role = CASE WHEN is_admin THEN 'admin' ELSE 'viewer' END")
    op.execute("UPDATE users SET is_admin = CASE WHEN role = 'admin' THEN TRUE ELSE FALSE END")
    op.alter_column('users', 'role', server_default=None)


def downgrade() -> None:
    op.drop_column('users', 'role')
