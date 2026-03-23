"""create dashboard tables

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-03-23 10:45:00.000000

"""
from datetime import datetime, timedelta
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'dashboard_tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('due_at', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='todo'),
        sa.Column('priority', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('progress', sa.Integer(), nullable=False, server_default='0'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_dashboard_tasks_id'), 'dashboard_tasks', ['id'], unique=False)

    op.create_table(
        'dashboard_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('starts_at', sa.DateTime(), nullable=False),
        sa.Column('ends_at', sa.DateTime(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False, server_default='meeting'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_dashboard_events_id'), 'dashboard_events', ['id'], unique=False)

    op.create_table(
        'dashboard_notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sender', sa.String(length=255), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False, server_default='general'),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_dashboard_notifications_id'),
        'dashboard_notifications',
        ['id'],
        unique=False,
    )

    now = datetime.utcnow().replace(microsecond=0)
    dashboard_tasks = sa.table(
        'dashboard_tasks',
        sa.column('title', sa.String),
        sa.column('description', sa.Text),
        sa.column('due_at', sa.DateTime),
        sa.column('status', sa.String),
        sa.column('priority', sa.String),
        sa.column('progress', sa.Integer),
    )
    dashboard_events = sa.table(
        'dashboard_events',
        sa.column('title', sa.String),
        sa.column('description', sa.Text),
        sa.column('starts_at', sa.DateTime),
        sa.column('ends_at', sa.DateTime),
        sa.column('category', sa.String),
    )
    dashboard_notifications = sa.table(
        'dashboard_notifications',
        sa.column('sender', sa.String),
        sa.column('title', sa.String),
        sa.column('message', sa.Text),
        sa.column('category', sa.String),
        sa.column('is_read', sa.Boolean),
        sa.column('created_at', sa.DateTime),
    )

    op.bulk_insert(
        dashboard_tasks,
        [
            {
                'title': 'Relancer les devis en attente',
                'description': 'Verifier les dossiers restes au statut draft avant la fin de matinee.',
                'due_at': now + timedelta(hours=2),
                'status': 'in_progress',
                'priority': 'high',
                'progress': 60,
            },
            {
                'title': 'Completer les fiches clients incompletes',
                'description': 'Ajouter les informations de contact manquantes dans le CRM.',
                'due_at': now + timedelta(hours=5),
                'status': 'todo',
                'priority': 'medium',
                'progress': 25,
            },
            {
                'title': 'Preparer le point logistique',
                'description': 'Consolider les besoins materiel pour les installations de demain.',
                'due_at': now + timedelta(days=1, hours=1),
                'status': 'todo',
                'priority': 'medium',
                'progress': 10,
            },
        ],
    )
    op.bulk_insert(
        dashboard_events,
        [
            {
                'title': 'Point equipe exploitation',
                'description': 'Revue des interventions du jour.',
                'starts_at': now.replace(hour=10, minute=0, second=0),
                'ends_at': now.replace(hour=10, minute=30, second=0),
                'category': 'meeting',
            },
            {
                'title': 'Visio client Horizon Mobility',
                'description': 'Validation du planning de deploiement Q2.',
                'starts_at': now.replace(hour=14, minute=0, second=0),
                'ends_at': now.replace(hour=14, minute=45, second=0),
                'category': 'client',
            },
            {
                'title': 'Brief atelier materiel',
                'description': 'Preparation des kits de balises pour demain.',
                'starts_at': now + timedelta(days=2, hours=3),
                'ends_at': now + timedelta(days=2, hours=4),
                'category': 'operations',
            },
        ],
    )
    op.bulk_insert(
        dashboard_notifications,
        [
            {
                'sender': 'Sonia - ADV',
                'title': 'Confirmation client',
                'message': 'Le client Delta confirme la livraison du lot 42.',
                'category': 'message',
                'is_read': False,
                'created_at': now - timedelta(minutes=15),
            },
            {
                'sender': 'Mathieu - Commercial',
                'title': 'Verification de remise',
                'message': 'Merci de verifier la remise sur le devis CT-2026-014.',
                'category': 'message',
                'is_read': False,
                'created_at': now - timedelta(hours=1),
            },
            {
                'sender': 'Support terrain',
                'title': 'Planning modifie',
                'message': 'Deux installations sont deplacees a jeudi matin.',
                'category': 'alert',
                'is_read': True,
                'created_at': now - timedelta(hours=20),
            },
        ],
    )

    op.alter_column('dashboard_tasks', 'status', server_default=None)
    op.alter_column('dashboard_tasks', 'priority', server_default=None)
    op.alter_column('dashboard_tasks', 'progress', server_default=None)
    op.alter_column('dashboard_events', 'category', server_default=None)
    op.alter_column('dashboard_notifications', 'category', server_default=None)
    op.alter_column('dashboard_notifications', 'is_read', server_default=None)


def downgrade() -> None:
    op.drop_index(op.f('ix_dashboard_notifications_id'), table_name='dashboard_notifications')
    op.drop_table('dashboard_notifications')
    op.drop_index(op.f('ix_dashboard_events_id'), table_name='dashboard_events')
    op.drop_table('dashboard_events')
    op.drop_index(op.f('ix_dashboard_tasks_id'), table_name='dashboard_tasks')
    op.drop_table('dashboard_tasks')
