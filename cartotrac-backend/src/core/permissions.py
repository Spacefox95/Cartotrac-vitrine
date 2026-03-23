USER_ROLES = ('admin', 'manager', 'sales', 'viewer')

ROLE_PERMISSIONS: dict[str, tuple[str, ...]] = {
    'admin': (
        'users:manage',
        'clients:read',
        'clients:write',
        'quotes:read',
        'quotes:write',
    ),
    'manager': (
        'clients:read',
        'clients:write',
        'quotes:read',
        'quotes:write',
    ),
    'sales': (
        'clients:read',
        'quotes:read',
        'quotes:write',
    ),
    'viewer': (
        'clients:read',
        'quotes:read',
    ),
}

DEFAULT_USER_ROLE = 'viewer'


def normalize_role(role: str | None) -> str:
    if role in ROLE_PERMISSIONS:
        return role

    return DEFAULT_USER_ROLE


def get_permissions_for_role(role: str | None) -> list[str]:
    normalized_role = normalize_role(role)
    return list(ROLE_PERMISSIONS[normalized_role])


def is_admin_role(role: str | None) -> bool:
    return normalize_role(role) == 'admin'


__all__ = [
    'DEFAULT_USER_ROLE',
    'ROLE_PERMISSIONS',
    'USER_ROLES',
    'get_permissions_for_role',
    'is_admin_role',
    'normalize_role',
]
