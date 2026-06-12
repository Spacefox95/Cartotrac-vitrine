import type {
  AddressAutocompleteResponse,
  AddressReverseGeocodeResponse,
  CadastreSearchParams,
  CadastreSearchResponse,
} from 'features/cadastre/types/cadastre.types';
import { http } from 'shared/api/http';
import { apiRoutes } from 'shared/api/routes';

import type { AppThunk } from './types';

export const fetchAddressSuggestions = ({
  query,
  limit = 5,
}: {
  query: string;
  limit?: number;
}): AppThunk<AddressAutocompleteResponse> => {
  return async () => {
    try {
      const response = await http.get<AddressAutocompleteResponse>(apiRoutes.cartoAddressAutocomplete, {
        params: {
          q: query.trim(),
          limit,
        },
      });

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const reverseGeocodeAddress = ({
  lon,
  lat,
}: {
  lon: number;
  lat: number;
}): AppThunk<AddressReverseGeocodeResponse> => {
  return async () => {
    try {
      const response = await http.get<AddressReverseGeocodeResponse>(apiRoutes.cartoAddressReverse, {
        params: { lon, lat },
      });

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const searchCadastre = (params: CadastreSearchParams): AppThunk<CadastreSearchResponse> => {
  return async () => {
    try {
      const response = await http.get<CadastreSearchResponse>(apiRoutes.cartoCadastreSearch, {
        params: normalizeParams(params),
      });

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

function normalizeParams(params: CadastreSearchParams = {}) {
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
