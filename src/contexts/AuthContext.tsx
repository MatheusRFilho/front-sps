import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, AuthUser, LoginDto, isAxiosError, UpdatePreferencesDto } from '../types';
import { AuthService } from '../services/AuthService';
import { PreferencesService } from '../services/PreferencesService';
import { setCurrentToken } from '../utils/auth';
import { userPreferencesSchema, validateData } from '../schemas';
import { toastUtils } from '../utils/toastUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authService = new AuthService();
  const preferencesService = new PreferencesService();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginDto): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      let authToken, authUser;
      
      if (response.data && response.data.token) {
        authToken = response.data.token;
        authUser = response.data.user;
      }
      else if (response.token && response.user) {
        authToken = response.token;
        authUser = response.user;
      }
      else if (response.access_token) {
        authToken = response.access_token;
        authUser = response.user;
      }
      else if (typeof response === 'string') {
        authToken = response;
        authUser = { 
          id: 1, 
          name: 'Admin', 
          email: credentials.email,
          type: 'admin',
          language: 'pt',
          permissions: ['user:read', 'user:write', 'user:delete']
        };
      }
      else {
        authToken = response.token || response.access_token;
        authUser = response.user || { 
          id: 1, 
          name: 'Admin', 
          email: credentials.email,
          type: 'admin',
          language: 'pt',
          permissions: ['user:read', 'user:write', 'user:delete']
        };
      }
      
      if (!authToken) {
        throw new Error('Token não encontrado na resposta da API');
      }
      
      setToken(authToken);
      setUser(authUser || null);
      
      setCurrentToken(authToken);
      
      toastUtils.success('auth.loginSuccess', 'Login realizado com sucesso!');
    } catch (error: unknown) {
      let errorMessage = 'Erro ao fazer login';
      
      if (isAxiosError(error) && error.response) {
        const data = error.response.data as { message?: string; error?: string };
        errorMessage = data?.message || 
                     data?.error || 
                     `Erro ${error.response.status}: ${error.response.statusText}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toastUtils.error('auth.loginError', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    
    setCurrentToken(null);
    
    toastUtils.success('auth.logoutSuccess', 'Logout realizado com sucesso!');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.every(permission => user.permissions.includes(permission));
  };

  const updateUserLanguage = (language: string): void => {
    if (user) {
      const updatedUser = { ...user, language };
      setUser(updatedUser);
    }
  };

  const updateUserPreferences = async (preferences: Omit<UpdatePreferencesDto, 'id'>): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      
      const preferencesWithId: UpdatePreferencesDto = {
        id: Number(user.id),
        ...preferences,
      };
      
      
      const validation = validateData(userPreferencesSchema, preferencesWithId);
      
      if (!validation.success || !validation.data) {
        toastUtils.error('preferences.invalidData', 'Dados de preferências inválidos');
        return false;
      }
      
      await preferencesService.updatePreferences(validation.data);
      
      const updatedUser = { ...user };
      
      if (preferences.language !== undefined) {
        updatedUser.language = preferences.language;
      }
      
      
      setUser(updatedUser);
      
      toastUtils.success('preferences.updateSuccess', 'Preferências salvas com sucesso');
      
      return true;
    } catch (error: unknown) {
      const errorMessage = (isAxiosError(error) && error.response?.data?.message) || 
                          'Erro ao salvar preferências do usuário';
      toastUtils.error('preferences.updateError', errorMessage);
      
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    updateUserLanguage,
    updateUserPreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
