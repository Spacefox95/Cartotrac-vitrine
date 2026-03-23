export type Position = [number, number];

export type PolygonGeometry = {
  type: 'Polygon';
  coordinates: Position[][];
};

export type MultiPolygonGeometry = {
  type: 'MultiPolygon';
  coordinates: Position[][][];
};

export type CadastreGeometry = PolygonGeometry | MultiPolygonGeometry;

export type CadastreFeature = {
  type: 'Feature';
  properties: Record<string, string | number | boolean | null>;
  geometry: CadastreGeometry | null;
};

export type CadastreFeatureCollection = {
  type: 'FeatureCollection';
  features: CadastreFeature[];
};

export type AddressSuggestion = {
  label: string;
  city: string | null;
  postcode: string | null;
  citycode: string | null;
  context: string | null;
  longitude: number;
  latitude: number;
  kind: string | null;
  score: number | null;
};

export type AddressAutocompleteResponse = {
  items: AddressSuggestion[];
  total: number;
  source_url: string;
};

export type CadastreSearchParams = {
  code_insee?: string;
  code_dep?: string;
  code_com?: string;
  nom_com?: string;
  section?: string;
  numero?: string;
  lon?: number;
  lat?: number;
  limit?: number;
};

export type CadastreSearchResponse = {
  search_kind: 'commune' | 'parcelle';
  source_url: string;
  feature_count: number;
  geojson: CadastreFeatureCollection;
};


export type BuildingFootprintEstimateResponse = {
  source_url: string;
  feature_count: number;
  selected_index: number | null;
  estimated_area_sqm: number | null;
  geojson: CadastreFeatureCollection;
};
