import { AuthUser } from './user';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  updateUserLanguage: (language: string) => void;
  updateUserPreferences: (preferences: Omit<import('./user').UpdatePreferencesDto, 'id'>) => Promise<boolean>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export interface LoaderParams {
  params: {
    userId: string;
  };
}