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


def test_viewer_can_download_quote_pdf(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    quote = seeded_data['quote']

    response = client.get(
        f'/api/v1/quotes/{quote.id}/pdf',
        headers=auth_headers('viewer@cartotrac.com'),
    )

    assert response.status_code == 200
    assert response.headers['content-type'] == 'application/pdf'
    assert 'attachment; filename="Q-001.pdf"' == response.headers['content-disposition']
    assert response.content.startswith(b'%PDF-1.4')


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
    assert payload['events'][0]['assigned_user_name'] == 'Manager User'
    assert payload['events'][0]['meeting_url'] == 'https://zoom.us/j/123456789'
    assert payload['notifications'][0]['sender'] == 'Manager User'
    assert payload['notifications'][0]['recipient_email'] == 'admin@cartotrac.com'
    assert payload['recent_quotes'][0]['reference'] == 'Q-002'


def test_admin_can_crud_dashboard_events_with_assignment_and_meeting_link(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    users = seeded_data['users']
    manager = users['manager']

    create_response = client.post(
        '/api/v1/dashboard/events',
        headers=auth_headers('admin@cartotrac.com'),
        json={
            'title': 'Point Zoom client',
            'description': 'Validation du cadrage et du prochain sprint.',
            'starts_at': '2026-04-03T09:30:00',
            'ends_at': '2026-04-03T10:15:00',
            'category': 'client',
            'assigned_user_id': manager.id,
            'location': 'Visio',
            'meeting_url': 'https://zoom.us/j/987654321',
        },
    )
    assert create_response.status_code == 201
    event_id = create_response.json()['id']
    assert create_response.json()['assigned_user_name'] == 'Manager User'
    assert create_response.json()['meeting_url'] == 'https://zoom.us/j/987654321'

    update_response = client.patch(
        '/api/v1/dashboard/events/' + str(event_id),
        headers=auth_headers('admin@cartotrac.com'),
        json={
            'location': 'Salle projet / Zoom',
            'meeting_url': 'https://zoom.us/j/111222333',
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()['location'] == 'Salle projet / Zoom'
    assert update_response.json()['meeting_url'] == 'https://zoom.us/j/111222333'

    list_response = client.get(
        '/api/v1/dashboard/events',
        headers=auth_headers('admin@cartotrac.com'),
    )
    assert list_response.status_code == 200
    assert list_response.json()['total'] == 2

    delete_response = client.delete(
        '/api/v1/dashboard/events/' + str(event_id),
        headers=auth_headers('admin@cartotrac.com'),
    )
    assert delete_response.status_code == 204


def test_authenticated_user_can_send_and_read_messages(
    client: TestClient,
    seeded_data: dict[str, object],
) -> None:
    users = seeded_data['users']
    admin = users['admin']

    contacts_response = client.get(
        '/api/v1/dashboard/message-contacts',
        headers=auth_headers('manager@cartotrac.com'),
    )
    assert contacts_response.status_code == 200
    assert contacts_response.json()['total'] == 3

    send_response = client.post(
        '/api/v1/dashboard/messages',
        headers=auth_headers('manager@cartotrac.com'),
        json={
          'recipient_user_id': admin.id,
          'title': 'Point rapide',
          'message': 'On valide la priorite du client ACME cet apres-midi.',
        },
    )
    assert send_response.status_code == 201
    message_id = send_response.json()['id']
    assert send_response.json()['sender_email'] == 'manager@cartotrac.com'
    assert send_response.json()['recipient_email'] == 'admin@cartotrac.com'

    list_response = client.get(
        '/api/v1/dashboard/messages',
        headers=auth_headers('admin@cartotrac.com'),
    )
    assert list_response.status_code == 200
    assert list_response.json()['total'] >= 2

    read_response = client.patch(
        f'/api/v1/dashboard/messages/{message_id}/read',
        headers=auth_headers('admin@cartotrac.com'),
    )
    assert read_response.status_code == 200
    assert read_response.json()['is_read'] is True


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



def test_building_polygon_helpers_ignore_extra_coordinate_dimensions() -> None:
    from src.domains.carto.service import _compute_feature_area_square_meters, _find_best_building_index

    features = [
        {
            'type': 'Feature',
            'properties': {'nature': 'Batiment'},
            'geometry': {
                'type': 'Polygon',
                'coordinates': [
                    [
                        [1.3777, 43.5855, 0.0],
                        [1.3779, 43.5855, 0.0],
                        [1.3779, 43.5857, 0.0],
                        [1.3777, 43.5857, 0.0],
                        [1.3777, 43.5855, 0.0],
                    ]
                ],
            },
        }
    ]

    selected_index = _find_best_building_index(features, [1.377775, 43.585555])
    estimated_area = _compute_feature_area_square_meters(features[0])

    assert selected_index == 0
    assert estimated_area is not None
    assert estimated_area > 0


def test_authenticated_user_can_reverse_geocode_address_via_carto_proxy(
    client: TestClient,
    seeded_data: dict[str, object],
    monkeypatch,
) -> None:
    from src.domains.carto.schemas import AddressReverseGeocodeResponse, AddressSuggestion
    from src.domains.carto.service import CartoService

    def fake_reverse(*, lon: float, lat: float):
        return AddressReverseGeocodeResponse(
            item=AddressSuggestion(
                label='2 Rue des Lapins 31000 Toulouse',
                city='Toulouse',
                postcode='31000',
                citycode='31555',
                context='31, Haute-Garonne, Occitanie',
                longitude=lon,
                latitude=lat,
                kind='housenumber',
                score=None,
            ),
            source_url='https://data.geopf.fr/geocodage/reverse?lon=' + str(lon) + '&lat=' + str(lat),
        )

    monkeypatch.setattr(CartoService, 'reverse_geocode_address', staticmethod(fake_reverse))

    response = client.get(
        '/api/v1/carto/address/reverse',
        headers=auth_headers('viewer@cartotrac.com'),
        params={'lon': 1.377775, 'lat': 43.585555},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload['item']['label'] == '2 Rue des Lapins 31000 Toulouse'
    assert payload['item']['longitude'] == 1.377775
    assert payload['item']['latitude'] == 43.585555


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
