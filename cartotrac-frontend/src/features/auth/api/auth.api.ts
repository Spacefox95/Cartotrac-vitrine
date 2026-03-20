import { http } from 'shared/api/http';

import type {
  AuthTokenResponse,
  CurrentUser,
  LoginCredentials,
} from '../types/auth.types';

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthTokenResponse> {
  const response = await http.post<AuthTokenResponse>('/auth/login', credentials);

  return response.data;
}

export async function getCurrentUserRequest(): Promise<CurrentUser> {
  const response = await http.get<CurrentUser>('/auth/me');

  return response.data;
}
