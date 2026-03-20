import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from 'shared/api/authStorage';

import { getCurrentUserRequest } from '../api/auth.api';
import type { CurrentUser } from '../types/auth.types';

export const bootstrapSession = createAsyncThunk(
  'auth/bootstrapSession',
  async () => getCurrentUserRequest(),
);

export type AuthState = {
  accessToken: string | null;
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
};

const initialAccessToken = getStoredAccessToken();

const initialState: AuthState = {
  accessToken: initialAccessToken,
  currentUser: null,
  isAuthenticated: Boolean(initialAccessToken),
  isBootstrapping: Boolean(initialAccessToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.currentUser = null;
      state.isAuthenticated = true;
      state.isBootstrapping = true;
      setStoredAccessToken(action.payload);
    },
    logout: (state) => {
      state.accessToken = null;
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isBootstrapping = false;
      clearStoredAccessToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.pending, (state) => {
        state.isBootstrapping = true;
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.isBootstrapping = false;
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.accessToken = null;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.isBootstrapping = false;
        clearStoredAccessToken();
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
