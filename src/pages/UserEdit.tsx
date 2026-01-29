import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, LoaderFunctionArgs } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { User, UserFormData, CreateUserDto, isAxiosError } from '../types';
import { createUserSchema, updateUserSchema, validateData } from '../schemas';
import { UserService } from '../services/UserService';
import { Button, Input } from '../components';

export async function userLoader({ params }: LoaderFunctionArgs) {
  return { userId: params.userId };
}

const UserEditContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  padding: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:hover {
    text-decoration: underline;
  }
`;

const Form = styled.form`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const userService = useMemo(() => new UserService(), []);
  const isNewUser = userId === 'new';

  const loadUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await userService.get(id);
      const userData = response.data;
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        password: '',
      });
    } catch (error: unknown) {
      const errorMessage = (isAxiosError(error) && error.response?.data?.message) || t('users.loadError');
      toast.error(errorMessage);
      navigate('/users');
    } finally {
      setLoading(false);
    }
  }, [navigate, t, userService]);

  useEffect(() => {
    if (!isNewUser && userId) {
      loadUser(userId);
    }
  }, [userId, isNewUser, loadUser]);

  const validateForm = (): boolean => {
    const schema = isNewUser ? createUserSchema : updateUserSchema;
    const validation = validateData(schema, formData);
    
    if (!validation.success && validation.errors) {
      const newErrors: Partial<UserFormData> = {};
      
      Object.entries(validation.errors).forEach(([field, messages]) => {
        newErrors[field as keyof UserFormData] = messages[0];
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
      setSaving(true);
      
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...(formData.password && { password: formData.password }),
      };

      if (isNewUser) {
        await userService.create(userData as CreateUserDto);
        toast.success(t('users.createSuccess'));
      } else if (userId) {
        await userService.update(userId, userData);
        toast.success(t('users.updateSuccess'));
      }
      
      navigate('/users');
    } catch (error: unknown) {
      const errorMessage = (isAxiosError(error) && error.response?.data?.message) || 
        (isNewUser ? t('users.createError') : t('users.updateError'));
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData) => (value: string) => {
    setFormData((prev: UserFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Partial<UserFormData>) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBack = () => {
    navigate('/users');
  };

  if (loading) {
    return (
      <UserEditContainer>
        <LoadingContainer>
          {t('common.loading')}
        </LoadingContainer>
      </UserEditContainer>
    );
  }

  return (
    <UserEditContainer>
      <Header>
        <BackButton onClick={handleBack}>
          ← {t('common.back')}
        </BackButton>
        <Title>
          {isNewUser ? t('users.create') : t('users.edit')}
        </Title>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Input
            label={t('users.name')}
            value={formData.name}
            onChange={handleInputChange('name')}
            error={errors.name}
            required
          />
        </FormGroup>

        <FormGroup>
          <Input
            label={t('users.email')}
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            required
          />
        </FormGroup>

        <FormGroup>
          <Input
            label={t('auth.password')}
            type="password"
            value={formData.password || ''}
            onChange={handleInputChange('password')}
            error={errors.password}
            required={isNewUser}
            placeholder={isNewUser ? '' : 'Deixe em branco para manter a senha atual'}
          />
        </FormGroup>

        <FormActions>
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            loading={saving}
          >
            {t('common.save')}
          </Button>
        </FormActions>
      </Form>
    </UserEditContainer>
  );
};

export default UserEdit;
