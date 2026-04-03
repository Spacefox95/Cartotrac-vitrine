"""add message participants to notifications

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-04-03 12:10:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = 'a7b8c9d0e1f2'
down_revision: str | None = 'f6a7b8c9d0e1'
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('dashboard_notifications', sa.Column('sender_user_id', sa.Integer(), nullable=True))
    op.add_column('dashboard_notifications', sa.Column('recipient_user_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_dashboard_notifications_sender_user_id_users',
        'dashboard_notifications',
        'users',
        ['sender_user_id'],
        ['id'],
        ondelete='SET NULL',
    )
    op.create_foreign_key(
        'fk_dashboard_notifications_recipient_user_id_users',
        'dashboard_notifications',
        'users',
        ['recipient_user_id'],
        ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint(
        'fk_dashboard_notifications_recipient_user_id_users',
        'dashboard_notifications',
        type_='foreignkey',
    )
    op.drop_constraint(
        'fk_dashboard_notifications_sender_user_id_users',
        'dashboard_notifications',
        type_='foreignkey',
    )
    op.drop_column('dashboard_notifications', 'recipient_user_id')
    op.drop_column('dashboard_notifications', 'sender_user_id')
