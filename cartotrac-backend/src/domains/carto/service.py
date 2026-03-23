from __future__ import annotations

import json
import math
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from fastapi import HTTPException, status

from src.domains.carto.schemas import (
    AddressAutocompleteResponse,
    AddressSuggestion,
    BuildingFootprintEstimateParams,
    BuildingFootprintEstimateResponse,
    CadastreSearchParams,
    CadastreSearchResponse,
)

API_CARTO_CADASTRE_BASE_URL = 'https://apicarto.ign.fr/api/cadastre'
API_GEOCODING_BASE_URL = 'https://data.geopf.fr/geocodage/search'
API_GEOPF_WFS_BASE_URL = 'https://data.geopf.fr/wfs/ows'


class CartoService:
    @staticmethod
    def search_cadastre(params: CadastreSearchParams) -> CadastreSearchResponse:
        endpoint = 'parcelle' if params.section or params.point_geometry else 'commune'
        query_params: dict[str, str] = {
            '_limit': str(params.limit),
        }

        if params.code_insee:
            query_params['code_insee'] = params.code_insee
        if params.code_dep:
            query_params['code_dep'] = params.code_dep
        if params.code_com:
            query_params['code_com'] = params.code_com
        if params.nom_com:
            query_params['nom_com'] = params.nom_com
        if params.section:
            query_params['section'] = params.section.upper()
        if params.numero:
            query_params['numero'] = params.numero.zfill(4)
        if params.point_geometry:
            query_params['geom'] = json.dumps(params.point_geometry, separators=(',', ':'))

        source_url = API_CARTO_CADASTRE_BASE_URL + '/' + endpoint + '?' + urlencode(query_params)
        payload = CartoService._fetch_json(source_url)
        feature_count = len(payload.get('features', [])) if isinstance(payload, dict) else 0

        return CadastreSearchResponse(
            search_kind=endpoint,
            source_url=source_url,
            feature_count=feature_count,
            geojson=payload,
        )

    @staticmethod
    def search_building_footprints(
        params: BuildingFootprintEstimateParams,
    ) -> BuildingFootprintEstimateResponse:
        lat_offset = params.radius_m / 111_320
        lon_offset = params.radius_m / (111_320 * max(math.cos(math.radians(params.lat)), 0.2))
        min_lon = params.lon - lon_offset
        min_lat = params.lat - lat_offset
        max_lon = params.lon + lon_offset
        max_lat = params.lat + lat_offset

        query_params = {
            'SERVICE': 'WFS',
            'VERSION': '2.0.0',
            'REQUEST': 'GetFeature',
            'TYPENAMES': 'BDTOPO_V3:batiment',
            'SRSNAME': 'EPSG:4326',
            'outputFormat': 'application/json',
            'BBOX': f'{min_lon},{min_lat},{max_lon},{max_lat},EPSG:4326',
            'count': str(params.limit),
        }

        source_url = API_GEOPF_WFS_BASE_URL + '?' + urlencode(query_params)
        payload = CartoService._fetch_json(source_url)
        features = payload.get('features', []) if isinstance(payload, dict) else []
        selected_index = _find_best_building_index(features, [params.lon, params.lat])
        estimated_area_sqm = None

        if selected_index is not None:
            estimated_area_sqm = _compute_feature_area_square_meters(features[selected_index])

        return BuildingFootprintEstimateResponse(
            source_url=source_url,
            feature_count=len(features),
            selected_index=selected_index,
            estimated_area_sqm=estimated_area_sqm,
            geojson=payload,
        )

    @staticmethod
    def autocomplete_address(query: str, limit: int = 5) -> AddressAutocompleteResponse:
        query_params = {
            'q': query,
            'limit': str(limit),
        }
        source_url = API_GEOCODING_BASE_URL + '?' + urlencode(query_params)
        payload = CartoService._fetch_json(source_url)
        features = payload.get('features', []) if isinstance(payload, dict) else []
        items: list[AddressSuggestion] = []

        for feature in features:
            properties = feature.get('properties', {}) if isinstance(feature, dict) else {}
            geometry = feature.get('geometry', {}) if isinstance(feature, dict) else {}
            coordinates = geometry.get('coordinates', []) if isinstance(geometry, dict) else []

            if not isinstance(coordinates, list) or len(coordinates) < 2:
                continue

            try:
                longitude = float(coordinates[0])
                latitude = float(coordinates[1])
            except (TypeError, ValueError):
                continue

            items.append(
                AddressSuggestion(
                    label=str(properties.get('label') or properties.get('name') or query),
                    city=str(properties.get('city')) if properties.get('city') is not None else None,
                    postcode=str(properties.get('postcode')) if properties.get('postcode') is not None else None,
                    citycode=str(properties.get('citycode')) if properties.get('citycode') is not None else None,
                    context=str(properties.get('context')) if properties.get('context') is not None else None,
                    longitude=longitude,
                    latitude=latitude,
                    kind=str(properties.get('type')) if properties.get('type') is not None else None,
                    score=float(properties.get('score')) if properties.get('score') is not None else None,
                )
            )

        return AddressAutocompleteResponse(
            items=items,
            total=len(items),
            source_url=source_url,
        )

    @staticmethod
    def _fetch_json(source_url: str) -> dict:
        try:
            with urlopen(source_url, timeout=20) as response:
                payload = json.loads(response.read().decode('utf-8'))
        except HTTPError as exc:
            detail = exc.read().decode('utf-8', errors='ignore') or 'Carto API request failed'
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail) from exc
        except URLError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail='Carto API is unreachable',
            ) from exc

        if not isinstance(payload, dict):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail='Carto API returned an unexpected payload',
            )

        return payload


def _find_best_building_index(features: list[dict], point: list[float]) -> int | None:
    containing_indexes: list[int] = []

    for index, feature in enumerate(features):
        polygons = _geometry_to_polygons(feature.get('geometry'))
        if any(_is_point_inside_polygon(point, polygon) for polygon in polygons):
            containing_indexes.append(index)

    if containing_indexes:
        return min(
            containing_indexes,
            key=lambda index: _distance_to_feature_centroid(features[index], point),
        )

    if not features:
        return None

    return min(range(len(features)), key=lambda index: _distance_to_feature_centroid(features[index], point))


def _distance_to_feature_centroid(feature: dict, point: list[float]) -> float:
    polygons = _geometry_to_polygons(feature.get('geometry'))
    all_points = [vertex for polygon in polygons for vertex in polygon]
    if not all_points:
        return float('inf')

    centroid_lon = sum(vertex[0] for vertex in all_points) / len(all_points)
    centroid_lat = sum(vertex[1] for vertex in all_points) / len(all_points)
    return math.hypot(centroid_lon - point[0], centroid_lat - point[1])


def _compute_feature_area_square_meters(feature: dict) -> float | None:
    polygons = _geometry_to_polygons(feature.get('geometry'))
    if not polygons:
        return None

    return max((_compute_polygon_area_square_meters(polygon) for polygon in polygons), default=None)


def _compute_polygon_area_square_meters(points: list[list[float]]) -> float | None:
    if len(points) < 3:
        return None

    projected = [_project_to_meters(lon, lat) for lon, lat in points]
    total = 0.0

    for index, current in enumerate(projected):
        next_point = projected[(index + 1) % len(projected)]
        total += current[0] * next_point[1] - next_point[0] * current[1]

    return abs(total) / 2


def _project_to_meters(lon: float, lat: float) -> tuple[float, float]:
    earth_radius = 6_378_137
    x = (lon * math.pi * earth_radius) / 180
    y = math.log(math.tan(math.pi / 4 + (lat * math.pi) / 360)) * earth_radius
    return x, y


def _geometry_to_polygons(geometry: dict | None) -> list[list[list[float]]]:
    if not isinstance(geometry, dict):
        return []

    geometry_type = geometry.get('type')
    coordinates = geometry.get('coordinates')

    if geometry_type == 'Polygon' and isinstance(coordinates, list) and coordinates:
        return [coordinates[0] or []]

    if geometry_type == 'MultiPolygon' and isinstance(coordinates, list):
        return [polygon[0] or [] for polygon in coordinates if polygon]

    return []


def _is_point_inside_polygon(point: list[float], polygon: list[list[float]]) -> bool:
    if len(polygon) < 3:
        return False

    px, py = point
    inside = False

    for index, vertex in enumerate(polygon):
        previous = polygon[index - 1]
        xi, yi = vertex
        xj, yj = previous
        intersects = yi > py != yj > py and px < ((xj - xi) * (py - yi)) / ((yj - yi) or float.fromhex('0x1.0p-52')) + xi
        if intersects:
            inside = not inside

    return inside
