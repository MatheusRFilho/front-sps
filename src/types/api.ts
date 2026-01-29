export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface CustomAxiosError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status: number;
    statusText: string;
  };
}

export function isAxiosError(error: unknown): error is CustomAxiosError {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchFilters {
  search: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    type: string;
    language: string;
    permissions: string[];
  };
  data?: {
    token?: string;
    access_token?: string;
    user?: {
      id: number;
      name: string;
      email: string;
      type: string;
      language: string;
      permissions: string[];
    };
  };
}

export interface AuthValidateResponse {
  valid: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    type: string;
    language: string;
    permissions: string[];
  };
}

export interface AuthRefreshResponse {
  token: string;
  user?: {
    id: number;
    name: string;
    email: string;
    type: string;
    language: string;
    permissions: string[];
  };
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}