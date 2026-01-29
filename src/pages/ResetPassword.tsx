import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useToast } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { Button, Input } from '../components';
import { ResetPasswordFormData, isAxiosError } from '../types';
import { resetPasswordSchema, validateData } from '../schemas';
import { AuthService } from '../services/AuthService';

const ResetPasswordContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
`;

const ResetPasswordCard = styled.div`
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

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  text-decoration: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
  
  &:hover {
    text-decoration: underline;
  }
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

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error}20;
  border: 1px solid ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<ResetPasswordFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const { themeMode, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const authService = new AuthService();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setTokenError(t('auth.invalidToken'));
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, t]);

  const validateForm = (): boolean => {
    if (!token) return false;
    
    const dataToValidate = {
      token,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };
    
    const validation = validateData(resetPasswordSchema, dataToValidate);
    
    if (!validation.success && validation.errors) {
      const newErrors: Partial<ResetPasswordFormData> = {};
      
      Object.entries(validation.errors).forEach(([field, messages]) => {
        if (field !== 'token') {
          newErrors[field as keyof ResetPasswordFormData] = messages[0];
        }
      });
      
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;

    try {
      setIsLoading(true);
      await authService.resetPassword(token, formData.password);
      
      toast.success('auth.passwordResetSuccess');
      
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
      
    } catch (error: unknown) {
      let errorMessage = t('auth.resetPasswordError');
      
      if (isAxiosError(error) && error.response) {
        const data = error.response.data as { message?: string; error?: string };
        errorMessage = data?.message || 
                     data?.error || 
                     errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error('auth.resetPasswordError', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ResetPasswordFormData) => (value: string) => {
    setFormData((prev: ResetPasswordFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Partial<ResetPasswordFormData>) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  };

  if (tokenError) {
    return (
      <ResetPasswordContainer>
        <ResetPasswordCard>
          <Header>
            <Title>{t('auth.resetPasswordTitle')}</Title>
          </Header>

          <ErrorMessage>
            <p>{tokenError}</p>
          </ErrorMessage>

          <BackLink to="/signin">
            ← {t('auth.backToLogin')}
          </BackLink>

          <ThemeLanguageControls>
            <ControlButton onClick={toggleLanguage}>
              {i18n.language === 'pt' ? '🇺🇸 English' : '🇧🇷 Português'}
            </ControlButton>
            <ControlButton onClick={toggleTheme}>
              {themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}
            </ControlButton>
          </ThemeLanguageControls>
        </ResetPasswordCard>
      </ResetPasswordContainer>
    );
  }

  return (
    <ResetPasswordContainer>
      <ResetPasswordCard>
        <Header>
          <Title>{t('auth.resetPasswordTitle')}</Title>
          <Subtitle>{t('auth.resetPasswordSubtitle')}</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <Input
            label={t('auth.password')}
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            required
          />

          <Input
            label={t('auth.confirmPassword')}
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            loading={isLoading}
            fullWidth
          >
            {t('auth.resetPassword')}
          </Button>
        </Form>

        <BackLink to="/signin">
          ← {t('auth.backToLogin')}
        </BackLink>

        <ThemeLanguageControls>
          <ControlButton onClick={toggleLanguage}>
            {i18n.language === 'pt' ? '🇺🇸 English' : '🇧🇷 Português'}
          </ControlButton>
          <ControlButton onClick={toggleTheme}>
            {themeMode === 'light' ? '🌙 Dark' : '☀️ Light'}
          </ControlButton>
        </ThemeLanguageControls>
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};

export default ResetPassword;