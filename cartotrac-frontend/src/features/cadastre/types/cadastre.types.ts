import type { components, paths } from 'shared/api/generated/schema';

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

export type AddressSuggestion = components['schemas']['AddressSuggestion'];
export type AddressAutocompleteResponse = components['schemas']['AddressAutocompleteResponse'];
export type AddressReverseGeocodeResponse = components['schemas']['AddressReverseGeocodeResponse'];
export type CadastreSearchResponse = Omit<
  components['schemas']['CadastreSearchResponse'],
  'geojson'
> & {
  geojson: CadastreFeatureCollection;
};

export type CadastreSearchParams =
  paths['/api/v1/carto/cadastre/search']['get']['parameters']['query'];
