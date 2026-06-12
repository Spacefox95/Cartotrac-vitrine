import { http } from 'shared/api/http';
import type { components } from 'shared/api/generated/schema';
import { apiRoutes } from 'shared/api/routes';

import type { AppThunk } from './types';

export type PublicQuoteRequestPayload = components['schemas']['QuoteRequestCreate'];
export type PublicQuoteRequest = components['schemas']['QuoteRequestRead'];

export const submitPublicQuoteRequest = (
  payload: PublicQuoteRequestPayload,
): AppThunk<PublicQuoteRequest> => {
  return async () => {
    try {
      const response = await http.post<PublicQuoteRequest>(
        apiRoutes.publicQuoteRequests,
        normalizePublicQuoteRequestPayload(payload),
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

function normalizePublicQuoteRequestPayload(payload: PublicQuoteRequestPayload) {
  return {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone?.trim() || null,
    company: payload.company?.trim() || null,
    service: payload.service.trim(),
    location: payload.location.trim(),
    deadline: payload.deadline?.trim() || null,
    details: payload.details.trim(),
  };
}
