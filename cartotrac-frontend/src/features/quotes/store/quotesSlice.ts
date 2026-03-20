import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchQuotesRequest } from '../api/quotesApi';
import type { Quote } from '../types/quote.types';

export const fetchQuotes = createAsyncThunk(
  'quotes/fetchQuotes',
  async (search?: string) => fetchQuotesRequest(search),
);

type QuotesState = {
  items: Quote[];
  total: number;
  isLoading: boolean;
  errorMessage: string | null;
};

const initialState: QuotesState = {
  items: [],
  total: 0,
  isLoading: false,
  errorMessage: null,
};

const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotes.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.isLoading = false;
      })
      .addCase(fetchQuotes.rejected, (state) => {
        state.isLoading = false;
        state.errorMessage = 'Impossible de charger les devis.';
      });
  },
});

export default quotesSlice.reducer;
