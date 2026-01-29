import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useToast } from '../../hooks';
import { CreateUserDto, isAxiosError } from '../../types';
import { UserService } from '../../services/UserService';
import { Modal, Button, Input } from '../index';
import { createUserSchema, validateData } from '../../schemas';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

const ModalContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;


export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const userService = new UserService();

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const validation = validateData(createUserSchema, formData);
    
    if (!validation.success && validation.errors) {
      const newErrors: FormErrors = {};
      Object.entries(validation.errors).forEach(([field, messages]) => {
        newErrors[field] = messages[0];
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
      
      const validation = validateData(createUserSchema, formData);
      
      if (!validation.success || !validation.data) {
        throw new Error('Dados inválidos');
      }
      
      const userData: CreateUserDto = validation.data;
      await userService.create(userData);
      toast.success('users.createSuccess');
      
      setFormData({ name: '', email: '', password: '' });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = (isAxiosError(error) && error.response?.data?.message) || 
        t('users.createError');
      toast.error('users.createError', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setFormData({ name: '', email: '', password: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('users.create')}
      size="md"
    >
      <ModalContent>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              label={t('users.name')}
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={errors.name}
              placeholder="Digite o nome completo"
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
              placeholder="Digite o email"
              required
            />
          </FormGroup>

          <FormGroup>
            <Input
              label={t('users.password')}
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              placeholder="Digite a senha (mínimo 6 caracteres)"
              required
            />
          </FormGroup>

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
            >
              {t('users.create')}
            </Button>
          </FormActions>
        </Form>
      </ModalContent>
    </Modal>
  );
};