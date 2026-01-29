import { useCallback } from 'react';
import { isAxiosError } from '../types';
import { useToast } from './useToast';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const toast = useToast();
  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      fallbackMessage = 'Ocorreu um erro inesperado'
    } = options;

    let message = fallbackMessage;
    let statusCode: number | undefined;

    if (isAxiosError(error)) {
      message = error.response?.data?.message || 
                error.response?.data?.error || 
                fallbackMessage;
      statusCode = error.response?.status;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    
    
    if (showToast) {
      if (statusCode) {
        switch (statusCode) {
          case 400:
            toast.invalidData(message);
            break;
          case 401:
            toast.sessionExpired();
            break;
          case 403:
            toast.accessDenied();
            break;
          case 404:
            toast.resourceNotFound();
            break;
          case 409:
            toast.conflict(message);
            break;
          case 422:
            toast.invalidData(message);
            break;
          case 429:
            toast.tooManyRequests();
            break;
          case 500:
            toast.serverError();
            break;
          default:
            toast.error('toast.unexpectedError', message);
        }
      } else {
        toast.error('toast.unexpectedError', message);
      }
    }

    return {
      message,
      statusCode,
      handled: true,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<unknown>,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, options);
      throw error;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};