from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class CadastreSearchParams(BaseModel):
    code_insee: str | None = Field(default=None, min_length=5, max_length=5)
    code_dep: str | None = Field(default=None, min_length=2, max_length=3)
    code_com: str | None = Field(default=None, min_length=2, max_length=3)
    nom_com: str | None = None
    section: str | None = Field(default=None, min_length=2, max_length=2)
    numero: str | None = Field(default=None, min_length=1, max_length=4)
    lon: float | None = Field(default=None, ge=-180, le=180)
    lat: float | None = Field(default=None, ge=-90, le=90)
    limit: int = Field(default=25, ge=1, le=250)

    @model_validator(mode='after')
    def validate_location(self) -> 'CadastreSearchParams':
        has_location = bool(self.code_insee) or bool(self.nom_com) or bool(self.code_dep and self.code_com)
        has_point = self.lon is not None and self.lat is not None

        if not has_location and not has_point:
            raise ValueError('Provide code_insee, nom_com, code_dep/code_com, or lon/lat')

        if (self.lon is None) != (self.lat is None):
            raise ValueError('lon and lat must be provided together')

        if self.numero and not self.section:
            raise ValueError('section is required when numero is provided')

        return self

    @property
    def point_geometry(self) -> dict[str, Any] | None:
        if self.lon is None or self.lat is None:
            return None

        return {
            'type': 'Point',
            'coordinates': [self.lon, self.lat],
        }


class CadastreSearchResponse(BaseModel):
    search_kind: Literal['commune', 'parcelle']
    source_url: str
    feature_count: int
    geojson: dict[str, Any]


class BuildingFootprintEstimateParams(BaseModel):
    lon: float = Field(ge=-180, le=180)
    lat: float = Field(ge=-90, le=90)
    radius_m: float = Field(default=30, gt=0, le=150)
    limit: int = Field(default=30, ge=1, le=200)


class BuildingFootprintEstimateResponse(BaseModel):
    source_url: str
    feature_count: int
    selected_index: int | None = None
    estimated_area_sqm: float | None = None
    geojson: dict[str, Any]


class AddressSuggestion(BaseModel):
    label: str
    city: str | None = None
    postcode: str | None = None
    citycode: str | None = None
    context: str | None = None
    longitude: float
    latitude: float
    kind: str | None = None
    score: float | None = None


class AddressAutocompleteResponse(BaseModel):
    items: list[AddressSuggestion]
    total: int
    source_url: str


class AddressReverseGeocodeResponse(BaseModel):
    item: AddressSuggestion | None = None
    source_url: str
