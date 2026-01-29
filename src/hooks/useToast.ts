import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?: 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right';
}

interface ToastMessages {
  success: (key: string, fallback?: string, interpolation?: Record<string, string | number>) => void;
  error: (key: string, fallback?: string, interpolation?: Record<string, string | number>) => void;
  info: (key: string, fallback?: string, interpolation?: Record<string, string | number>) => void;
  warning: (key: string, fallback?: string, interpolation?: Record<string, string | number>) => void;
  loading: (key: string, fallback?: string, interpolation?: Record<string, string | number>) => string;
  dismiss: (toastId?: string) => void;
  
  sessionExpired: () => void;
  accessDenied: () => void;
  resourceNotFound: () => void;
  serverError: () => void;
  unexpectedError: () => void;
  invalidData: (message?: string) => void;
  conflict: (message?: string) => void;
  tooManyRequests: () => void;
}

export const useToast = (options: ToastOptions = {}): ToastMessages => {
  const { t } = useTranslation();
  
  const defaultOptions = {
    duration: 4000,
    position: 'top-right' as const,
    ...options,
  };

  const success = (key: string, fallback?: string, interpolation?: Record<string, string | number>) => {
    const message = t(key, { defaultValue: fallback, ...interpolation });
    toast.success(message, defaultOptions);
  };

  const error = (key: string, fallback?: string, interpolation?: Record<string, string | number>) => {
    const message = t(key, { defaultValue: fallback, ...interpolation });
    toast.error(message, defaultOptions);
  };

  const info = (key: string, fallback?: string, interpolation?: Record<string, string | number>) => {
    const message = t(key, { defaultValue: fallback, ...interpolation });
    toast(message, defaultOptions);
  };

  const warning = (key: string, fallback?: string, interpolation?: Record<string, string | number>) => {
    const message = t(key, { defaultValue: fallback, ...interpolation });
    toast(message, { ...defaultOptions, icon: '⚠️' });
  };

  const loading = (key: string, fallback?: string, interpolation?: Record<string, string | number>) => {
    const message = t(key, { defaultValue: fallback, ...interpolation });
    return toast.loading(message, defaultOptions);
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const sessionExpired = () => {
    error('toast.sessionExpired', 'Sessão expirada. Faça login novamente.');
  };

  const accessDenied = () => {
    error('toast.accessDenied', 'Acesso negado. Você não tem permissão para esta ação.');
  };

  const resourceNotFound = () => {
    error('toast.resourceNotFound', 'Recurso não encontrado.');
  };

  const serverError = () => {
    error('toast.serverError', 'Erro interno do servidor. Tente novamente mais tarde.');
  };

  const unexpectedError = () => {
    error('toast.unexpectedError', 'Ocorreu um erro inesperado.');
  };

  const invalidData = (message?: string) => {
    if (message) {
      error('toast.invalidData', 'Dados inválidos: {{message}}', { message });
    } else {
      error('toast.invalidData', 'Dados inválidos');
    }
  };

  const conflict = (message?: string) => {
    if (message) {
      error('toast.conflict', 'Conflito: {{message}}', { message });
    } else {
      error('toast.conflict', 'Conflito');
    }
  };

  const tooManyRequests = () => {
    error('toast.tooManyRequests', 'Muitas tentativas. Tente novamente mais tarde.');
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    sessionExpired,
    accessDenied,
    resourceNotFound,
    serverError,
    unexpectedError,
    invalidData,
    conflict,
    tooManyRequests,
  };
};