import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateData } from '../schemas';

interface UseZodValidationReturn<T> {
  errors: Record<string, string>;
  validate: (data: unknown) => { isValid: boolean; data?: T };
  clearErrors: () => void;
  clearError: (field: string) => void;
}

export function useZodValidation<T>(schema: z.ZodSchema<T>): UseZodValidationReturn<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: unknown) => {
    const validation = validateData(schema, data);
    
    if (!validation.success && validation.errors) {
      const newErrors: Record<string, string> = {};
      
      Object.entries(validation.errors).forEach(([field, messages]) => {
        newErrors[field] = messages[0];
      });
      
      setErrors(newErrors);
      return { isValid: false };
    }
    
    setErrors({});
    return { isValid: true, data: validation.data };
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validate,
    clearErrors,
    clearError,
  };
}