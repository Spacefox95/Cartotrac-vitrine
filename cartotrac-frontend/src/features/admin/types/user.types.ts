import type { UserRole } from 'shared/auth/permissions';

export type AdminUser = {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  permissions: string[];
  is_admin: boolean;
};

export type AdminUserPayload = {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
};

export type AdminUserUpdatePayload = {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
};

export type AdminUsersListResponse = {
  items: AdminUser[];
  total: number;
};
