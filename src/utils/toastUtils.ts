import toast from 'react-hot-toast';
import i18n from '../i18n';

export const toastUtils = {
  success: (key: string, fallback?: string, interpolation?: Record<string, string | number>) => {
    const message = i18n.t(key, fallback || '', interpolation);
    toast.success(message);
  },

  error: (key: string, fallback?: string, interpolation?: Record<string, string | number>) => {
    const message = i18n.t(key, fallback || '', interpolation);
    toast.error(message);
  },

  info: (key: string, fallback?: string, interpolation?: Record<string, string | number>) => {
    const message = i18n.t(key, fallback || '', interpolation);
    toast(message);
  },

  warning: (key: string, fallback?: string, interpolation?: Record<string, string | number>) => {
    const message = i18n.t(key, fallback || '', interpolation);
    toast(message, { icon: '⚠️' });
  },

  sessionExpired: () => {
    const message = i18n.t('toast.sessionExpired', 'Sessão expirada. Faça login novamente.');
    toast.error(message);
  },

  accessDenied: () => {
    const message = i18n.t('toast.accessDenied', 'Acesso negado. Você não tem permissão para esta ação.');
    toast.error(message);
  },

  resourceNotFound: () => {
    const message = i18n.t('toast.resourceNotFound', 'Recurso não encontrado.');
    toast.error(message);
  },

  serverError: () => {
    const message = i18n.t('toast.serverError', 'Erro interno do servidor. Tente novamente mais tarde.');
    toast.error(message);
  },

  unexpectedError: () => {
    const message = i18n.t('toast.unexpectedError', 'Ocorreu um erro inesperado.');
    toast.error(message);
  },

  invalidData: (errorMessage?: string) => {
    if (errorMessage) {
      const message = i18n.t('toast.invalidData', 'Dados inválidos: {{message}}', { message: errorMessage });
      toast.error(message);
    } else {
      const message = i18n.t('toast.invalidData', 'Dados inválidos');
      toast.error(message);
    }
  },

  conflict: (errorMessage?: string) => {
    if (errorMessage) {
      const message = i18n.t('toast.conflict', 'Conflito: {{message}}', { message: errorMessage });
      toast.error(message);
    } else {
      const message = i18n.t('toast.conflict', 'Conflito');
      toast.error(message);
    }
  },

  tooManyRequests: () => {
    const message = i18n.t('toast.tooManyRequests', 'Muitas tentativas. Tente novamente mais tarde.');
    toast.error(message);
  }
};