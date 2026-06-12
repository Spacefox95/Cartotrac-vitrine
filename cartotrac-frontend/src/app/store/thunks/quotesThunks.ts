import { quotesActions } from 'app/store/slices/quotesSlice';
import type { Quote, QuotePayload, QuotesListResponse } from 'features/quotes/types/quote.types';
import { http } from 'shared/api/http';
import { apiRoutes } from 'shared/api/routes';

import type { AppThunk } from './types';

type QuotePdfDownload = {
  blob: Blob;
  filename: string;
};

export const fetchQuotes = (search?: string): AppThunk<QuotesListResponse> => {
  return async (dispatch) => {
    dispatch(quotesActions.setLoading(true));

    try {
      const response = await http.get<QuotesListResponse>(apiRoutes.quotes, {
        params: search ? { search } : undefined,
      });

      dispatch(quotesActions.setQuotes(response.data));
      return response.data;
    } catch (err) {
      dispatch(quotesActions.setError('Impossible de charger les devis.'));
      console.error(err);
      throw err;
    }
  };
};

export const fetchQuote = (quoteId: number): AppThunk<Quote> => {
  return async () => {
    try {
      const response = await http.get<Quote>(apiRoutes.quoteById(quoteId));
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const createQuote = (payload: QuotePayload): AppThunk<Quote> => {
  return async () => {
    try {
      const response = await http.post<Quote>(apiRoutes.quotes, normalizeQuotePayload(payload));
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const updateQuote = ({
  quoteId,
  payload,
}: {
  quoteId: number;
  payload: QuotePayload;
}): AppThunk<Quote> => {
  return async () => {
    try {
      const response = await http.patch<Quote>(
        apiRoutes.quoteById(quoteId),
        normalizeQuotePayload(payload),
      );

      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const deleteQuote = (quoteId: number): AppThunk => {
  return async (dispatch) => {
    try {
      await http.delete(apiRoutes.quoteById(quoteId));
      dispatch(quotesActions.removeQuote(quoteId));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const downloadQuotePdf = (quoteId: number): AppThunk<QuotePdfDownload> => {
  return async () => {
    try {
      const response = await http.get<Blob>(apiRoutes.quotePdf(quoteId), {
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'];
      const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i);

      return {
        blob: response.data,
        filename: filenameMatch?.[1] ?? `devis-${quoteId}.pdf`,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

function normalizeQuotePayload(payload: QuotePayload) {
  return {
    reference: payload.reference.trim(),
    client_id: Number(payload.client_id),
    status: payload.status,
    total_ht: Number(payload.total_ht),
    total_ttc: Number(payload.total_ttc),
    cadastre_context: payload.cadastre_context ?? null,
  };
}
