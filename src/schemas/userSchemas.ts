import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  email: z
    .string()
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase()
    .trim()
    .optional(),
  
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal(''))
});

export const updateUserPermissionsSchema = z.object({
  permissions: z
    .array(z.string())
    .optional()
    .default([])
});

export const updateUserCompleteSchema = updateUserSchema.merge(updateUserPermissionsSchema);

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido')
    .toLowerCase()
    .trim(),
  
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido')
    .toLowerCase()
    .trim()
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Token é obrigatório'),
  
  password: z
    .string()
    .min(1, 'Nova senha é obrigatória')
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres'),
  
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas devem ser iguais',
  path: ['confirmPassword']
});

export const userPreferencesSchema = z.object({
  id: z.number().positive('ID deve ser um número positivo'),
  language: z
    .enum(['pt', 'en'])
    .optional(),
  theme: z
    .enum(['light', 'dark', 'system'])
    .optional()
}).refine((data) => data.language !== undefined || data.theme !== undefined, {
  message: 'Pelo menos uma preferência deve ser fornecida'
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserPermissionsInput = z.infer<typeof updateUserPermissionsSchema>;
export type UpdateUserCompleteInput = z.infer<typeof updateUserCompleteSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: Record<string, string[]> 
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      
      return { success: false, errors };
    }
    
    return { 
      success: false, 
      errors: { general: ['Erro de validação desconhecido'] } 
    };
  }
};