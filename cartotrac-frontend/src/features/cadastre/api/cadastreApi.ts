import { http } from 'shared/api/http';

import type {
  AddressAutocompleteResponse,
  AddressReverseGeocodeResponse,
  CadastreSearchParams,
  CadastreSearchResponse,
} from '../types/cadastre.types';

export async function fetchAddressSuggestionsRequest(query: string, limit = 5) {
  const response = await http.get<AddressAutocompleteResponse>('/carto/address/autocomplete', {
    params: {
      q: query.trim(),
      limit,
    },
  });

  return response.data;
}

export async function reverseGeocodeAddressRequest(lon: number, lat: number) {
  const response = await http.get<AddressReverseGeocodeResponse>('/carto/address/reverse', {
    params: { lon, lat },
  });

  return response.data;
}

export async function searchCadastreRequest(params: CadastreSearchParams) {
  const response = await http.get<CadastreSearchResponse>('/carto/cadastre/search', {
    params: normalizeParams(params),
  });

  return response.data;
}


function normalizeParams(params: CadastreSearchParams) {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return [key, value.trim()];
        }

        return [key, value];
      })
      .filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}
