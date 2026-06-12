import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  initialAsyncResourceState,
  markFailed,
  markPending,
  markSucceeded,
  type AsyncStatus,
} from 'app/store/asyncState';
import type { Client, ClientsListResponse } from 'features/clients/types/client.types';

type ClientsState = {
  items: Client[];
  total: number;
  status: AsyncStatus;
  errorMessage: string | null;
};

const initialState: ClientsState = {
  items: [],
  total: 0,
  ...initialAsyncResourceState,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        markPending(state);
      } else if (state.status === 'loading') {
        markSucceeded(state);
      }
    },
    setClients: (state, action: PayloadAction<ClientsListResponse>) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
      markSucceeded(state);
    },
    setError: (state, action: PayloadAction<string>) => {
      markFailed(state, action.payload);
    },
    removeClient: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((client) => client.id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const clientsActions = clientsSlice.actions;
export default clientsSlice.reducer;
