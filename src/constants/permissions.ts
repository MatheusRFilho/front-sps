export const PERMISSIONS = {
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    LIST: 'user:list',
  },
  ADMIN: {
    ACCESS: 'admin:access',
  },
  EMAIL: {
    BLOCK_DUPLICATE: 'email:block_duplicate',
  },
} as const;

export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.READ,
    PERMISSIONS.USER.UPDATE,
    PERMISSIONS.USER.DELETE,
    PERMISSIONS.USER.LIST,
  ],
  ADMIN: [
    PERMISSIONS.ADMIN.ACCESS,
  ],
} as const;