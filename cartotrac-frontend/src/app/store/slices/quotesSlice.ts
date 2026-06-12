import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  initialAsyncResourceState,
  markFailed,
  markPending,
  markSucceeded,
  type AsyncStatus,
} from 'app/store/asyncState';
import type { Quote, QuotesListResponse } from 'features/quotes/types/quote.types';

type QuotesState = {
  items: Quote[];
  total: number;
  status: AsyncStatus;
  errorMessage: string | null;
};

const initialState: QuotesState = {
  items: [],
  total: 0,
  ...initialAsyncResourceState,
};

const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        markPending(state);
      } else if (state.status === 'loading') {
        markSucceeded(state);
      }
    },
    setQuotes: (state, action: PayloadAction<QuotesListResponse>) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
      markSucceeded(state);
    },
    setError: (state, action: PayloadAction<string>) => {
      markFailed(state, action.payload);
    },
    removeQuote: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((quote) => quote.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const quotesActions = quotesSlice.actions;
export default quotesSlice.reducer;
