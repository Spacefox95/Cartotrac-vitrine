import { http } from 'shared/api/http';

import type { Quote, QuotePayload, QuotesListResponse } from '../types/quote.types';

export async function fetchQuotesRequest(search?: string) {
  const response = await http.get<QuotesListResponse>('/quotes', {
    params: search ? { search } : undefined,
  });

  return response.data;
}

export async function fetchQuoteRequest(quoteId: number) {
  const response = await http.get<Quote>(`/quotes/${quoteId}`);

  return response.data;
}

export async function createQuoteRequest(payload: QuotePayload) {
  const response = await http.post<Quote>('/quotes', normalizePayload(payload));

  return response.data;
}

export async function updateQuoteRequest(quoteId: number, payload: QuotePayload) {
  const response = await http.patch<Quote>(
    `/quotes/${quoteId}`,
    normalizePayload(payload),
  );

  return response.data;
}

export async function deleteQuoteRequest(quoteId: number) {
  await http.delete(`/quotes/${quoteId}`);
}

export async function downloadQuotePdfRequest(quoteId: number) {
  const response = await http.get<Blob>(`/quotes/${quoteId}/pdf`, {
    responseType: 'blob',
  });

  const disposition = response.headers['content-disposition'];
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i);

  return {
    blob: response.data,
    filename: filenameMatch?.[1] ?? `devis-${quoteId}.pdf`,
  };
}

function normalizePayload(payload: QuotePayload) {
  return {
    reference: payload.reference.trim(),
    client_id: Number(payload.client_id),
    status: payload.status,
    total_ht: Number(payload.total_ht),
    total_ttc: Number(payload.total_ttc),
    cadastre_context: payload.cadastre_context ?? null,
  };
}
