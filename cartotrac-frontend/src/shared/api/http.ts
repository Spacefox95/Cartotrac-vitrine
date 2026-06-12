import axios from 'axios';

import {
  clearStoredAuthTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredAuthTokens,
} from './authStorage';
import { apiRoutes } from './routes';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1',
});

http.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url === apiRoutes.authLogin ||
      originalRequest.url === apiRoutes.authRefresh
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      clearStoredAuthTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    refreshPromise =
      refreshPromise ??
      http
        .post<{ access_token: string; refresh_token: string }>(apiRoutes.authRefresh, {
          refresh_token: refreshToken,
        })
        .then((response) => {
          setStoredAuthTokens(response.data.access_token, response.data.refresh_token);
          return response.data.access_token;
        })
        .catch((refreshError) => {
          clearStoredAuthTokens();
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });

    const nextAccessToken = await refreshPromise;
    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
    return http(originalRequest);
  },
);
