"""create refresh token sessions

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2026-05-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd5e6f7a8b9c0'
down_revision: Union[str, Sequence[str], None] = 'c4d5e6f7a8b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'refresh_token_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token_hash', sa.String(length=64), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('revoked_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('replaced_by_token_hash', sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash'),
    )
    op.create_index(op.f('ix_refresh_token_sessions_id'), 'refresh_token_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_refresh_token_sessions_token_hash'), 'refresh_token_sessions', ['token_hash'], unique=False)
    op.create_index(op.f('ix_refresh_token_sessions_user_id'), 'refresh_token_sessions', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_refresh_token_sessions_user_id'), table_name='refresh_token_sessions')
    op.drop_index(op.f('ix_refresh_token_sessions_token_hash'), table_name='refresh_token_sessions')
    op.drop_index(op.f('ix_refresh_token_sessions_id'), table_name='refresh_token_sessions')
    op.drop_table('refresh_token_sessions')
