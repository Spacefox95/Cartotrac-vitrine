import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  clearStoredAuthTokens,
  getStoredAccessToken,
  setStoredAuthTokens,
} from 'shared/api/authStorage';

import type { CurrentUser } from 'features/auth/types/auth.types';

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
    loginSuccess: (state, action: PayloadAction<{ access_token: string; refresh_token: string }>) => {
      state.accessToken = action.payload.access_token;
      state.currentUser = null;
      state.isAuthenticated = true;
      state.isBootstrapping = true;
      setStoredAuthTokens(action.payload.access_token, action.payload.refresh_token);
    },
    logout: (state) => {
      state.accessToken = null;
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isBootstrapping = false;
      clearStoredAuthTokens();
    },
    setBootstrapping: (state, action: PayloadAction<boolean>) => {
      state.isBootstrapping = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<CurrentUser>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.isBootstrapping = false;
    },
  },
});

export const authActions = authSlice.actions;
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
