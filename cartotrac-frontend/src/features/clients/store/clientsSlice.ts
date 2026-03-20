import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchClientsRequest } from '../api/clientsApi';
import type { Client } from '../types/client.types';

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (search?: string) => fetchClientsRequest(search),
);

type ClientsState = {
  items: Client[];
  total: number;
  isLoading: boolean;
  errorMessage: string | null;
};

const initialState: ClientsState = {
  items: [],
  total: 0,
  isLoading: false,
  errorMessage: null,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
        state.errorMessage = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.isLoading = false;
      })
      .addCase(fetchClients.rejected, (state) => {
        state.isLoading = false;
        state.errorMessage = 'Impossible de charger les clients.';
      });
  },
});

export default clientsSlice.reducer;
