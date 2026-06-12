"""attach tasks to business objects

Revision ID: c4d5e6f7a8b9
Revises: b2c3d4e5f6a7
Create Date: 2026-05-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c4d5e6f7a8b9'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('dashboard_tasks', sa.Column('assigned_user_id', sa.Integer(), nullable=True))
    op.add_column('dashboard_tasks', sa.Column('client_id', sa.Integer(), nullable=True))
    op.add_column('dashboard_tasks', sa.Column('quote_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_dashboard_tasks_assigned_user_id_users',
        'dashboard_tasks',
        'users',
        ['assigned_user_id'],
        ['id'],
    )
    op.create_foreign_key(
        'fk_dashboard_tasks_client_id_clients',
        'dashboard_tasks',
        'clients',
        ['client_id'],
        ['id'],
    )
    op.create_foreign_key(
        'fk_dashboard_tasks_quote_id_quotes',
        'dashboard_tasks',
        'quotes',
        ['quote_id'],
        ['id'],
    )


def downgrade() -> None:
    op.drop_constraint('fk_dashboard_tasks_quote_id_quotes', 'dashboard_tasks', type_='foreignkey')
    op.drop_constraint('fk_dashboard_tasks_client_id_clients', 'dashboard_tasks', type_='foreignkey')
    op.drop_constraint('fk_dashboard_tasks_assigned_user_id_users', 'dashboard_tasks', type_='foreignkey')
    op.drop_column('dashboard_tasks', 'quote_id')
    op.drop_column('dashboard_tasks', 'client_id')
    op.drop_column('dashboard_tasks', 'assigned_user_id')
