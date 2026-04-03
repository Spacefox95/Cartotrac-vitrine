"""add event scheduling fields

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-04-03 10:30:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = 'f6a7b8c9d0e1'
down_revision: str | None = 'e5f6a7b8c9d0'
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('dashboard_events', sa.Column('assigned_user_id', sa.Integer(), nullable=True))
    op.add_column('dashboard_events', sa.Column('location', sa.String(length=255), nullable=True))
    op.add_column('dashboard_events', sa.Column('meeting_url', sa.String(length=500), nullable=True))
    op.create_foreign_key(
        'fk_dashboard_events_assigned_user_id_users',
        'dashboard_events',
        'users',
        ['assigned_user_id'],
        ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint('fk_dashboard_events_assigned_user_id_users', 'dashboard_events', type_='foreignkey')
    op.drop_column('dashboard_events', 'meeting_url')
    op.drop_column('dashboard_events', 'location')
    op.drop_column('dashboard_events', 'assigned_user_id')
