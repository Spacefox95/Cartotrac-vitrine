from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.core.security import create_access_token
from src.db.models.clients import Client
from src.db.models.quotes import Quote
from src.db.models.users import User
from src.tests.conftest import SyncASGIClient, auth_headers


SQL_INJECTION_PROBE = "' OR 1=1 --"


def test_login_email_sql_injection_probe_is_not_authenticated(
    client: SyncASGIClient,
    seeded_data: dict[str, object],
    db_session: Session,
) -> None:
    response = client.post(
        '/api/v1/auth/login',
        json={
            'email': "admin' OR '1'='1@example.com",
            'password': SQL_INJECTION_PROBE,
        },
    )

    assert response.status_code == 422
    assert db_session.scalar(select(func.count()).select_from(User)) == 4


def test_token_subject_sql_injection_probe_cannot_impersonate_user(
    client: SyncASGIClient,
    seeded_data: dict[str, object],
) -> None:
    token = create_access_token(subject="admin@cartotrac.com' OR '1'='1")

    response = client.get(
        '/api/v1/auth/me',
        headers={'Authorization': f'Bearer {token}'},
    )

    assert response.status_code == 401
    assert response.json() == {'detail': 'User not found'}


def test_list_search_parameters_treat_sql_injection_probe_as_literal_text(
    client: SyncASGIClient,
    seeded_data: dict[str, object],
    db_session: Session,
) -> None:
    clients_response = client.get(
        '/api/v1/clients',
        headers=auth_headers('viewer@cartotrac.com'),
        params={'search': SQL_INJECTION_PROBE},
    )
    quotes_response = client.get(
        '/api/v1/quotes',
        headers=auth_headers('viewer@cartotrac.com'),
        params={'search': SQL_INJECTION_PROBE, 'status': SQL_INJECTION_PROBE},
    )
    quote_requests_response = client.get(
        '/api/v1/quote-requests',
        headers=auth_headers('sales@cartotrac.com'),
        params={'search': SQL_INJECTION_PROBE, 'status': SQL_INJECTION_PROBE},
    )

    assert clients_response.status_code == 200
    assert clients_response.json()['total'] == 0
    assert quotes_response.status_code == 200
    assert quotes_response.json()['total'] == 0
    assert quote_requests_response.status_code == 200
    assert quote_requests_response.json()['total'] == 0
    assert db_session.scalar(select(func.count()).select_from(Client)) == 1
    assert db_session.scalar(select(func.count()).select_from(Quote)) == 2


def test_path_id_sql_injection_probe_is_rejected_by_validation(
    client: SyncASGIClient,
    seeded_data: dict[str, object],
    db_session: Session,
) -> None:
    response = client.get(
        '/api/v1/clients/1%20OR%201=1',
        headers=auth_headers('viewer@cartotrac.com'),
    )

    assert response.status_code == 422
    assert db_session.scalar(select(func.count()).select_from(Client)) == 1


def test_payload_sql_injection_probe_is_persisted_as_data_only(
    client: SyncASGIClient,
    seeded_data: dict[str, object],
    db_session: Session,
) -> None:
    payload_value = "ACME'); DROP TABLE users; --"

    response = client.post(
        '/api/v1/clients',
        headers=auth_headers('manager@cartotrac.com'),
        json={
            'company_name': payload_value,
            'contact_name': SQL_INJECTION_PROBE,
            'email': 'probe@example.com',
            'phone': '0100000000',
        },
    )

    assert response.status_code == 201
    assert response.json()['company_name'] == payload_value
    assert db_session.scalar(select(func.count()).select_from(User)) == 4
    assert db_session.scalar(select(func.count()).select_from(Client)) == 2
