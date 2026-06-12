export const USER_ROLES = ['admin', 'manager', 'sales', 'viewer'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  sales: 'Commercial',
  viewer: 'Lecture seule',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'users:manage',
    'dashboard:read',
    'dashboard:manage',
    'messages:read',
    'messages:write',
    'carto:read',
    'clients:read',
    'clients:write',
    'quotes:read',
    'quotes:write',
    'quote_requests:read',
    'quote_requests:write',
  ],
  manager: [
    'dashboard:read',
    'dashboard:manage',
    'messages:read',
    'messages:write',
    'carto:read',
    'clients:read',
    'clients:write',
    'quotes:read',
    'quotes:write',
    'quote_requests:read',
    'quote_requests:write',
  ],
  sales: [
    'dashboard:read',
    'messages:read',
    'messages:write',
    'carto:read',
    'clients:read',
    'quotes:read',
    'quotes:write',
    'quote_requests:read',
    'quote_requests:write',
  ],
  viewer: ['dashboard:read', 'messages:read', 'messages:write', 'carto:read', 'clients:read', 'quotes:read'],
};

export function hasPermission(permissions: string[] | undefined, permission: string) {
  return Boolean(permissions?.includes(permission));
}
