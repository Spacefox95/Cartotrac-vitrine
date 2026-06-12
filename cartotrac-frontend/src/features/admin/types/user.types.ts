import type { components } from 'shared/api/generated/schema';

export type AdminUser = components['schemas']['UserRead'];
export type AdminUserPayload = components['schemas']['UserCreate'];
export type AdminUserUpdatePayload = components['schemas']['UserUpdate'];
export type AdminUsersListResponse = components['schemas']['UserListResponse'];
