import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { Button, Input } from '../components';
import { ForgotPasswordFormData, isAxiosError } from '../types';
import { forgotPasswordSchema, validateData } from '../schemas';
import { AuthService } from '../services/AuthService';

const ForgotPasswordContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
`;

const ForgotPasswordCard = styled.div`
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

const SuccessMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.success}20;
  border: 1px solid ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.success};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ForgotPassword: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { themeMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const authService = new AuthService();

  const validateForm = (): boolean => {
    const validation = validateData(forgotPasswordSchema, formData);
    
    if (!validation.success && validation.errors) {
      const newErrors: Partial<ForgotPasswordFormData> = {};
      
      Object.entries(validation.errors).forEach(([field, messages]) => {
        newErrors[field as keyof ForgotPasswordFormData] = messages[0];
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
      setIsLoading(true);
      await authService.forgotPassword(formData.email);
      
      setEmailSent(true);
      toast.success(t('auth.resetLinkSent'));
    } catch (error: unknown) {
      let errorMessage = t('auth.forgotPasswordError');
      
      if (isAxiosError(error) && error.response) {
        const data = error.response.data as { message?: string; error?: string };
        errorMessage = data?.message || 
                     data?.error || 
                     errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ForgotPasswordFormData) => (value: string) => {
    setFormData((prev: ForgotPasswordFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Partial<ForgotPasswordFormData>) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  };

  if (emailSent) {
    return (
      <ForgotPasswordContainer>
        <ForgotPasswordCard>
          <Header>
            <Title>{t('auth.forgotPasswordTitle')}</Title>
          </Header>

          <SuccessMessage>
            <p>{t('auth.resetLinkSent')}</p>
            <p>{t('Verifique sua caixa de entrada e spam.')}</p>
          </SuccessMessage>

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
        </ForgotPasswordCard>
      </ForgotPasswordContainer>
    );
  }

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordCard>
        <Header>
          <Title>{t('auth.forgotPasswordTitle')}</Title>
          <Subtitle>{t('auth.forgotPasswordSubtitle')}</Subtitle>
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

          <Button
            type="submit"
            loading={isLoading}
            fullWidth
          >
            {t('auth.sendResetLink')}
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
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;