from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import ValidationError

from src.api.dependencies.auth import get_current_user
from src.domains.auth.schemas import CurrentUserResponse
from src.domains.carto.schemas import (
    AddressAutocompleteResponse,
    BuildingFootprintEstimateParams,
    BuildingFootprintEstimateResponse,
    CadastreSearchParams,
    CadastreSearchResponse,
)
from src.domains.carto.service import CartoService

router = APIRouter(prefix='/carto', tags=['carto'])


@router.get('/address/autocomplete', response_model=AddressAutocompleteResponse)
def autocomplete_address(
    current_user: CurrentUserResponse = Depends(get_current_user),
    q: str = Query(min_length=3),
    limit: int = Query(default=5, ge=1, le=10),
) -> AddressAutocompleteResponse:
    return CartoService.autocomplete_address(q.strip(), limit=limit)




@router.get('/buildings/estimate', response_model=BuildingFootprintEstimateResponse)
def estimate_building_footprint(
    current_user: CurrentUserResponse = Depends(get_current_user),
    lon: float = Query(ge=-180, le=180),
    lat: float = Query(ge=-90, le=90),
    radius_m: float = Query(default=30, gt=0, le=150),
    limit: int = Query(default=30, ge=1, le=200),
) -> BuildingFootprintEstimateResponse:
    try:
        params = BuildingFootprintEstimateParams(
            lon=lon,
            lat=lat,
            radius_m=radius_m,
            limit=limit,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    return CartoService.search_building_footprints(params)


@router.get('/cadastre/search', response_model=CadastreSearchResponse)
def search_cadastre(
    current_user: CurrentUserResponse = Depends(get_current_user),
    code_insee: str | None = Query(default=None, min_length=5, max_length=5),
    code_dep: str | None = Query(default=None, min_length=2, max_length=3),
    code_com: str | None = Query(default=None, min_length=2, max_length=3),
    nom_com: str | None = Query(default=None, min_length=1),
    section: str | None = Query(default=None, min_length=2, max_length=2),
    numero: str | None = Query(default=None, min_length=1, max_length=4),
    lon: float | None = Query(default=None, ge=-180, le=180),
    lat: float | None = Query(default=None, ge=-90, le=90),
    limit: int = Query(default=25, ge=1, le=250),
) -> CadastreSearchResponse:
    try:
        params = CadastreSearchParams(
            code_insee=code_insee,
            code_dep=code_dep,
            code_com=code_com,
            nom_com=nom_com.strip() if nom_com else None,
            section=section.strip().upper() if section else None,
            numero=numero.strip() if numero else None,
            lon=lon,
            lat=lat,
            limit=limit,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    return CartoService.search_cadastre(params)
