export const USER_ROLES = ['admin', 'manager', 'sales', 'viewer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  sales: 'Commercial',
  viewer: 'Lecture seule',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['users:manage', 'clients:read', 'clients:write', 'quotes:read', 'quotes:write'],
  manager: ['clients:read', 'clients:write', 'quotes:read', 'quotes:write'],
  sales: ['clients:read', 'quotes:read', 'quotes:write'],
  viewer: ['clients:read', 'quotes:read'],
};

export function hasPermission(permissions: string[] | undefined, permission: string) {
  return Boolean(permissions?.includes(permission));
}
