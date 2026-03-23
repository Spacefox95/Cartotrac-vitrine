from fastapi.testclient import TestClient

from src.tests.conftest import auth_headers


def test_login_and_me_include_role_permissions_and_admin_flag(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    login_response = client.post(
        '/api/v1/auth/login',
        json={'email': 'admin@cartotrac.com', 'password': 'demo123'},
    )

    assert login_response.status_code == 200
    token = login_response.json()['access_token']

    me_response = client.get(
        '/api/v1/auth/me',
        headers={'Authorization': f'Bearer {token}'},
    )

    assert me_response.status_code == 200
    assert me_response.json() == {
        'email': 'admin@cartotrac.com',
        'full_name': 'Admin User',
        'role': 'admin',
        'permissions': [
            'users:manage',
            'clients:read',
            'clients:write',
            'quotes:read',
            'quotes:write',
        ],
        'is_admin': True,
    }


def test_users_management_requires_admin_permission(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    viewer_response = client.get(
        '/api/v1/users',
        headers=auth_headers('viewer@cartotrac.com'),
    )

    assert viewer_response.status_code == 403
    assert viewer_response.json() == {'detail': 'Insufficient permissions'}

    admin_response = client.get(
        '/api/v1/users',
        headers=auth_headers('admin@cartotrac.com'),
    )

    assert admin_response.status_code == 200
    assert admin_response.json()['total'] == 4


def test_manager_can_write_clients_but_cannot_manage_users(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    create_client_response = client.post(
        '/api/v1/clients',
        headers=auth_headers('manager@cartotrac.com'),
        json={
            'company_name': 'Beta Corp',
            'contact_name': 'Bob',
            'email': 'bob@beta.example',
            'phone': '0607080910',
        },
    )

    assert create_client_response.status_code == 201
    assert create_client_response.json()['company_name'] == 'Beta Corp'

    users_response = client.get(
        '/api/v1/users',
        headers=auth_headers('manager@cartotrac.com'),
    )

    assert users_response.status_code == 403


def test_sales_can_write_quotes_but_cannot_write_clients(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    seeded_client = seeded_data['client']

    create_quote_response = client.post(
        '/api/v1/quotes',
        headers=auth_headers('sales@cartotrac.com'),
        json={
            'reference': 'Q-003',
            'client_id': seeded_client.id,
            'status': 'draft',
            'total_ht': '200.00',
            'total_ttc': '240.00',
            'cadastre_context': {
                'address_label': '10 Rue de Rivoli 75001 Paris',
                'trace_area_sqm': 112.4,
                'trace_points': [[2.0, 48.0], [2.001, 48.0], [2.001, 48.001]],
            },
        },
    )

    assert create_quote_response.status_code == 201
    assert create_quote_response.json()['reference'] == 'Q-003'
    assert create_quote_response.json()['cadastre_context']['trace_area_sqm'] == 112.4

    create_client_response = client.post(
        '/api/v1/clients',
        headers=auth_headers('sales@cartotrac.com'),
        json={
            'company_name': 'Gamma Corp',
            'contact_name': 'Gina',
            'email': 'gina@gamma.example',
            'phone': '0708091011',
        },
    )

    assert create_client_response.status_code == 403
    assert create_client_response.json() == {'detail': 'Insufficient permissions'}


def test_viewer_has_read_only_access(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    list_clients_response = client.get(
        '/api/v1/clients',
        headers=auth_headers('viewer@cartotrac.com'),
    )
    list_quotes_response = client.get(
        '/api/v1/quotes',
        headers=auth_headers('viewer@cartotrac.com'),
    )
    update_quote_response = client.patch(
        '/api/v1/quotes/1',
        headers=auth_headers('viewer@cartotrac.com'),
        json={'status': 'sent'},
    )

    assert list_clients_response.status_code == 200
    assert list_quotes_response.status_code == 200
    assert update_quote_response.status_code == 403
    assert update_quote_response.json() == {'detail': 'Insufficient permissions'}


def test_dashboard_returns_live_summary_and_recent_items(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    response = client.get(
        '/api/v1/dashboard',
        headers=auth_headers('admin@cartotrac.com'),
    )

    assert response.status_code == 200
    payload = response.json()

    assert payload['summary'] == {
        'clients_total': 1,
        'quotes_total': 2,
        'draft_quotes_total': 1,
        'sent_quotes_total': 1,
        'pipeline_total_ttc': 360.0,
        'open_tasks_total': 1,
        'unread_notifications_total': 1,
        'today_events_total': 1,
    }
    assert payload['tasks'][0]['title'] == 'Relancer Q-001'
    assert payload['events'][0]['title'] == 'Revue commerciale'
    assert payload['notifications'][0]['sender'] == 'Sonia - ADV'
    assert payload['recent_quotes'][0]['reference'] == 'Q-002'


def test_admin_can_crud_dashboard_tasks(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    viewer_response = client.get(
        '/api/v1/dashboard/tasks',
        headers=auth_headers('viewer@cartotrac.com'),
    )
    assert viewer_response.status_code == 403

    create_response = client.post(
        '/api/v1/dashboard/tasks',
        headers=auth_headers('admin@cartotrac.com'),
        json={
            'title': 'Nouvelle tache QA',
            'description': 'Verifier le flux dashboard.',
            'due_at': '2026-03-24T09:30:00',
            'status': 'todo',
            'priority': 'medium',
            'progress': 15,
        },
    )
    assert create_response.status_code == 201
    task_id = create_response.json()['id']

    update_response = client.patch(
        '/api/v1/dashboard/tasks/' + str(task_id),
        headers=auth_headers('admin@cartotrac.com'),
        json={
            'status': 'in_progress',
            'progress': 65,
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()['status'] == 'in_progress'
    assert update_response.json()['progress'] == 65

    list_response = client.get(
        '/api/v1/dashboard/tasks',
        headers=auth_headers('admin@cartotrac.com'),
    )
    assert list_response.status_code == 200
    assert list_response.json()['total'] == 2

    delete_response = client.delete(
        '/api/v1/dashboard/tasks/' + str(task_id),
        headers=auth_headers('admin@cartotrac.com'),
    )
    assert delete_response.status_code == 204




def test_authenticated_user_can_estimate_building_footprint_via_carto_proxy(
    client: TestClient,
    seeded_data: dict[str, object],
    monkeypatch,
) -> None:
    from src.domains.carto.schemas import BuildingFootprintEstimateResponse
    from src.domains.carto.service import CartoService

    def fake_search(_params):
        return BuildingFootprintEstimateResponse(
            source_url='https://data.geopf.fr/wfs/ows?...',
            feature_count=1,
            selected_index=0,
            estimated_area_sqm=112.4,
            geojson={
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'properties': {'nature': 'Bâtiment'},
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [
                                [
                                    [2.0, 48.0],
                                    [2.0003, 48.0],
                                    [2.0003, 48.0002],
                                    [2.0, 48.0002],
                                    [2.0, 48.0],
                                ]
                            ],
                        },
                    }
                ],
            },
        )

    monkeypatch.setattr(CartoService, 'search_building_footprints', staticmethod(fake_search))

    response = client.get(
        '/api/v1/carto/buildings/estimate',
        headers=auth_headers('viewer@cartotrac.com'),
        params={'lon': 2.0, 'lat': 48.0, 'radius_m': 25},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload['feature_count'] == 1
    assert payload['selected_index'] == 0
    assert payload['estimated_area_sqm'] == 112.4


def test_authenticated_user_can_search_cadastre_via_carto_proxy(
    client: TestClient,
    seeded_data: dict[str, object],
    monkeypatch,
) -> None:
    from src.domains.carto.schemas import CadastreSearchResponse
    from src.domains.carto.service import CartoService

    def fake_search(_params):
        return CadastreSearchResponse(
            search_kind='parcelle',
            source_url='https://apicarto.ign.fr/api/cadastre/parcelle?code_insee=75056&section=AB&numero=0012',
            feature_count=1,
            geojson={
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'properties': {
                            'code_insee': '75056',
                            'section': 'AB',
                            'numero': '0012',
                        },
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [
                                [
                                    [2.0, 48.0],
                                    [2.001, 48.0],
                                    [2.001, 48.001],
                                    [2.0, 48.001],
                                    [2.0, 48.0],
                                ]
                            ],
                        },
                    }
                ],
            },
        )

    monkeypatch.setattr(CartoService, 'search_cadastre', staticmethod(fake_search))

    response = client.get(
        '/api/v1/carto/cadastre/search',
        headers=auth_headers('viewer@cartotrac.com'),
        params={
            'code_insee': '75056',
            'section': 'AB',
            'numero': '12',
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload['search_kind'] == 'parcelle'
    assert payload['feature_count'] == 1
    assert payload['geojson']['features'][0]['properties']['numero'] == '0012'



def test_authenticated_user_can_fetch_address_autocomplete_suggestions(
    client: TestClient,
    seeded_data: dict[str, object],
    monkeypatch,
) -> None:
    from src.domains.carto.schemas import AddressAutocompleteResponse, AddressSuggestion
    from src.domains.carto.service import CartoService

    def fake_autocomplete(_query: str, limit: int = 5):
        return AddressAutocompleteResponse(
            items=[
                AddressSuggestion(
                    label='10 Rue de Rivoli 75001 Paris',
                    city='Paris',
                    postcode='75001',
                    citycode='75056',
                    context='75, Paris, Ile-de-France',
                    longitude=2.3415,
                    latitude=48.8552,
                    kind='housenumber',
                    score=0.98,
                )
            ],
            total=1,
            source_url='https://data.geopf.fr/geocodage/search?q=10+rue+de+rivoli&limit=' + str(limit),
        )

    monkeypatch.setattr(CartoService, 'autocomplete_address', staticmethod(fake_autocomplete))

    response = client.get(
        '/api/v1/carto/address/autocomplete',
        headers=auth_headers('viewer@cartotrac.com'),
        params={'q': '10 rue de rivoli', 'limit': 5},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload['total'] == 1
    assert payload['items'][0]['citycode'] == '75056'
    assert payload['items'][0]['longitude'] == 2.3415
