import { http } from 'shared/api/http';

import type {
  AdminUser,
  AdminUserPayload,
  AdminUsersListResponse,
} from '../types/user.types';

export async function fetchUsersRequest() {
  const response = await http.get<AdminUsersListResponse>('/users');
  return response.data;
}

export async function createUserRequest(payload: AdminUserPayload) {
  const response = await http.post<AdminUser>('/users', normalizePayload(payload, false));
  return response.data;
}

export async function updateUserRequest(userId: number, payload: AdminUserPayload) {
  const response = await http.patch<AdminUser>(
    `/users/${userId}`,
    normalizePayload(payload, true),
  );
  return response.data;
}

export async function deleteUserRequest(userId: number) {
  await http.delete(`/users/${userId}`);
}

function normalizePayload(payload: AdminUserPayload, isUpdate: boolean) {
  const base = {
    email: payload.email.trim(),
    full_name: payload.full_name.trim() || null,
    role: payload.role,
  };

  if (isUpdate) {
    return {
      ...base,
      ...(payload.password.trim() ? { password: payload.password } : {}),
    };
  }

  return {
    ...base,
    password: payload.password,
  };
}
