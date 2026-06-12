"""create quote requests table

Revision ID: b2c3d4e5f6a7
Revises: a7b8c9d0e1f2
Create Date: 2026-05-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a7b8c9d0e1f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'quote_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('company', sa.String(length=255), nullable=True),
        sa.Column('service', sa.String(length=255), nullable=False),
        sa.Column('location', sa.String(length=500), nullable=False),
        sa.Column('deadline', sa.String(length=255), nullable=True),
        sa.Column('details', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='new'),
        sa.Column('converted_quote_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['converted_quote_id'], ['quotes.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_quote_requests_id'), 'quote_requests', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_quote_requests_id'), table_name='quote_requests')
    op.drop_table('quote_requests')
