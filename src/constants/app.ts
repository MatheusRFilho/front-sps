export const APP_CONFIG = {
  NAME: 'SPS Admin',
  VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'pt',
  DEFAULT_THEME: 'system',
} as const;

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/signin',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  USERS: '/users',
  USER_EDIT: (id: string | number) => `/users/${id}`,
  NO_ACCESS: '/no-access',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme_mode',
  LANGUAGE: 'language',
} as const;

export const DEBOUNCE_DELAYS = {
  SEARCH: 500,
  INPUT: 300,
  RESIZE: 100,
} as const;

export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  WARNING: 4000,
  INFO: 3000,
} as const;