import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeContextType, ThemeMode, Theme } from '../types';
import { themes } from '../constants/theme';
import { useAuth } from './AuthContext';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const { updateUserPreferences, isAuthenticated } = useAuth();

  const determineActualTheme = (mode: ThemeMode): 'light' | 'dark' => {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  };

  useEffect(() => {
    setThemeMode('system');
    setActualTheme(determineActualTheme('system'));
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setActualTheme(mediaQuery.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  const toggleTheme = async (): Promise<void> => {
    let newTheme: ThemeMode;
    
    if (themeMode === 'light') {
      newTheme = 'dark';
    } else if (themeMode === 'dark') {
      newTheme = 'system';
    } else {
      newTheme = 'light';
    }
    
    setThemeMode(newTheme);
    setActualTheme(determineActualTheme(newTheme));
    
    if (isAuthenticated) {
      await updateUserPreferences({ theme: newTheme });
    }
  };

  const handleSetThemeMode = async (mode: ThemeMode): Promise<void> => {
    setThemeMode(mode);
    setActualTheme(determineActualTheme(mode));
    
    if (isAuthenticated) {
      await updateUserPreferences({ theme: mode });
    }
  };

  const theme: Theme = themes[actualTheme];

  const value: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode: handleSetThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
