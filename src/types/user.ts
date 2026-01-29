export interface User {
  id: number;
  name: string;
  email: string;
  type?: string;
  language?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  permissions?: string[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  type: string;
  language: string;
  permissions: string[];
}

export interface UserPreferences {
  language?: string;
  theme?: string;
}

export interface UpdatePreferencesDto {
  id: number;
  language?: string;
  theme?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

export interface UserPermissionsDto {
  permissions: string[];
}