import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button, Input } from '../components';
import { LoginFormData } from '../types';
import { loginSchema, validateData } from '../schemas';

const SignInContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
`;

const SignInCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xxl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  width: 100%;
  max-width: 400px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ThemeLanguageControls = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const ForgotPasswordLink = styled(Link)`
  display: block;
  text-align: center;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  
  &:hover {
    text-decoration: underline;
  }
`;

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  
  const { login, isLoading, isAuthenticated } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = (): boolean => {
    const validation = validateData(loginSchema, formData);
    
    if (!validation.success && validation.errors) {
      const newErrors: Partial<LoginFormData> = {};
      
      Object.entries(validation.errors).forEach(([field, messages]) => {
        newErrors[field as keyof LoginFormData] = messages[0];
      });
      
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await login(formData);
    } catch (error) {
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  };

  return (
    <SignInContainer>
      <SignInCard>
        <Header>
          <Title>{t('auth.loginTitle')}</Title>
          <Subtitle>{t('auth.loginSubtitle')}</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <Input
            label={t('auth.email')}
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            required
          />

          <Input
            label={t('auth.password')}
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            required
          />

          <Button
            type="submit"
            loading={isLoading}
            fullWidth
          >
            {t('auth.login')}
          </Button>
        </Form>

        <ForgotPasswordLink to="/forgot-password">
          {t('auth.forgotPassword')}
        </ForgotPasswordLink>

        <ThemeLanguageControls>
          <ControlButton onClick={toggleLanguage}>
            {i18n.language === 'pt' ? '🇺🇸 English' : '🇧🇷 Português'}
          </ControlButton>
          <ControlButton onClick={toggleTheme}>
            {themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}
          </ControlButton>
        </ThemeLanguageControls>
      </SignInCard>
    </SignInContainer>
  );
};

export default SignIn;
