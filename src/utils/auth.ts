
let currentToken: string | null = null;

export const setCurrentToken = (token: string | null): void => {
  currentToken = token;
};

export const getCurrentToken = (): string | null => {
  return currentToken;
};

export const clearToken = (): void => {
  currentToken = null;
};

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

export const getTokenPayload = (token: string | null): Record<string, unknown> | null => {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};