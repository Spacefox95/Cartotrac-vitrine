from collections.abc import Generator
from datetime import datetime, timedelta
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.core.database import get_database
from src.core.security import create_access_token, get_password_hash
from src.db.base import Base
from src.domains.clients.models import Client
from src.domains.dashboard.models import DashboardEvent, DashboardNotification, DashboardTask
from src.domains.quotes.models import Quote
from src.domains.users.models import User
from src.main import app

TEST_DATABASE_PATH = Path('/tmp/cartotrac_rbac_test.sqlite3')
engine = create_engine(
    f'sqlite:///{TEST_DATABASE_PATH}',
    connect_args={'check_same_thread': False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_database() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_database] = override_get_database


@pytest.fixture(autouse=True)
def reset_database() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def seeded_data(db_session: Session) -> dict[str, object]:
    now = datetime.now().replace(microsecond=0)
    admin = User(
        email='admin@cartotrac.com',
        full_name='Admin User',
        hashed_password=get_password_hash('demo123'),
        role='admin',
        is_admin=True,
    )
    manager = User(
        email='manager@cartotrac.com',
        full_name='Manager User',
        hashed_password=get_password_hash('demo123'),
        role='manager',
        is_admin=False,
    )
    sales = User(
        email='sales@cartotrac.com',
        full_name='Sales User',
        hashed_password=get_password_hash('demo123'),
        role='sales',
        is_admin=False,
    )
    viewer = User(
        email='viewer@cartotrac.com',
        full_name='Viewer User',
        hashed_password=get_password_hash('demo123'),
        role='viewer',
        is_admin=False,
    )
    seeded_client = Client(
        company_name='ACME',
        contact_name='Alice',
        email='alice@acme.example',
        phone='0102030405',
    )

    db_session.add_all([admin, manager, sales, viewer, seeded_client])
    db_session.commit()
    db_session.refresh(seeded_client)

    quote = Quote(
        reference='Q-001',
        client_id=seeded_client.id,
        status='draft',
        total_ht=100,
        total_ttc=120,
    )
    second_quote = Quote(
        reference='Q-002',
        client_id=seeded_client.id,
        status='sent',
        total_ht=200,
        total_ttc=240,
    )
    task = DashboardTask(
        title='Relancer Q-001',
        description='Confirmer la validation du devis Q-001.',
        due_at=now + timedelta(hours=2),
        status='in_progress',
        priority='high',
        progress=55,
    )
    event = DashboardEvent(
        title='Revue commerciale',
        description='Point equipe autour des devis ouverts.',
        starts_at=now + timedelta(hours=1),
        ends_at=now + timedelta(hours=2),
        category='meeting',
        assigned_user_id=manager.id,
        location='Bureau principal',
        meeting_url='https://zoom.us/j/123456789',
    )
    notification = DashboardNotification(
        sender='Manager User',
        sender_user_id=manager.id,
        recipient_user_id=admin.id,
        title='Client a rappeler',
        message='Le client ACME attend un retour dans la journee.',
        category='message',
        is_read=False,
        created_at=now - timedelta(minutes=30),
    )
    db_session.add_all([quote, second_quote, task, event, notification])
    db_session.commit()
    db_session.refresh(quote)
    db_session.refresh(second_quote)
    db_session.refresh(task)
    db_session.refresh(event)
    db_session.refresh(notification)

    return {
        'users': {
            'admin': admin,
            'manager': manager,
            'sales': sales,
            'viewer': viewer,
        },
        'client': seeded_client,
        'quote': quote,
        'second_quote': second_quote,
        'task': task,
        'event': event,
        'notification': notification,
    }


def auth_headers(email: str) -> dict[str, str]:
    token = create_access_token(subject=email)
    return {'Authorization': f'Bearer {token}'}
