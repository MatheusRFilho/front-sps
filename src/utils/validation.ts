export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string, minLength = 6): boolean => {
  return password.length >= minLength;
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const isValidId = (id: string | number): boolean => {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  return !isNaN(numId) && numId > 0;
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const validateRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};