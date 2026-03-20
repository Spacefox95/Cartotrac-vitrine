"""create quotes table

Revision ID: 8f3a0a1b2c4d
Revises: 39549068e3dd
Create Date: 2026-03-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f3a0a1b2c4d'
down_revision: Union[str, Sequence[str], None] = '39549068e3dd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'quotes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('reference', sa.String(length=100), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('total_ht', sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.Column('total_ttc', sa.Numeric(10, 2), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('reference'),
    )
    op.create_index(op.f('ix_quotes_id'), 'quotes', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_quotes_id'), table_name='quotes')
    op.drop_table('quotes')
