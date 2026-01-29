import { AuthUser } from '../types';

export const hasPermission = (user: AuthUser | null, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export const hasAnyPermission = (user: AuthUser | null, permissions: string[]): boolean => {
  if (!user || !user.permissions) return false;
  return permissions.some(permission => user.permissions.includes(permission));
};

export const hasAllPermissions = (user: AuthUser | null, permissions: string[]): boolean => {
  if (!user || !user.permissions) return false;
  return permissions.every(permission => user.permissions.includes(permission));
};

export const isAdmin = (user: AuthUser | null): boolean => {
  return hasPermission(user, 'admin:access');
};

export const canManageUsers = (user: AuthUser | null): boolean => {
  return hasAnyPermission(user, ['user:create', 'user:update', 'user:delete']);
};

export const getUserPermissionLevel = (user: AuthUser | null): 'admin' | 'manager' | 'user' | 'guest' => {
  if (!user) return 'guest';
  
  if (isAdmin(user)) return 'admin';
  if (canManageUsers(user)) return 'manager';
  if (user.permissions.length > 0) return 'user';
  
  return 'guest';
};