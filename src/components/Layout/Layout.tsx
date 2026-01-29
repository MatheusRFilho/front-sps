import React from 'react';
import { Outlet,  useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, LanguageSelect, ThemeSelect } from '../index';

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Header = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UserName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;


const SelectsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const Main = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
`;

export const Layout: React.FC = () => {
  const { user, logout, updateUserPreferences, isAuthenticated } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleLanguageChange = async (language: string) => {
    i18n.changeLanguage(language);
    
    if (isAuthenticated) {
      await updateUserPreferences({ language });
    }
  };

  const handleThemeChange = async (theme: string) => {
    await setThemeMode(theme as 'light' | 'dark' | 'system');
  };

  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <Logo>SPS System</Logo>
          <UserSection>
            <SelectsContainer>
              <LanguageSelect
                currentLanguage={i18n.language}
                onChange={handleLanguageChange}
              />
              <ThemeSelect
                currentTheme={themeMode}
                onChange={handleThemeChange}
              />
            </SelectsContainer>
            {user && (
              <UserInfo>
                <UserName>{user.name}</UserName>
              </UserInfo>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              {t('auth.logout')}
            </Button>
          </UserSection>
        </HeaderContent>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </LayoutContainer>
  );
};
