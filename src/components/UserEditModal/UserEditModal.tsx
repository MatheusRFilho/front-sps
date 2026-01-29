import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

import { Modal, Button, Input } from '../';
import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../services/UserService';
import PermissionService from '../../services/PermissionService';
import { 
  User, 
  Permission, 
  UserEditModalProps, 
  isAxiosError 
} from '../../types';
import { 
  updateUserSchema, 
  updateUserPermissionsSchema, 
  validateData 
} from '../../schemas';

interface FormErrors {
  [key: string]: string;
}

interface TabData {
  basic: {
    name: string;
    email: string;
    password: string;
  };
  permissions: {
    permissions: string[];
  };
}

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border: none;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0 0;
  font-weight: ${({ active, theme }) => active ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabContent = styled.div`
  min-height: 300px;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PermissionGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const PermissionGroupTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PermissionCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const PermissionLabel = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  flex: 1;
`;

const PermissionDescription = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  display: block;
  margin-top: 2px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: block;
`;

const CloseButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId
}) => {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  
  const userService = useMemo(() => new UserService(), []);
  
  const [activeTab, setActiveTab] = useState<'basic' | 'permissions'>('basic');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  const [formData, setFormData] = useState<TabData>({
    basic: {
      name: '',
      email: '',
      password: ''
    },
    permissions: {
      permissions: []
    }
  });

  const canEditUser = hasPermission('user:update');
  const canEditPermissions = hasPermission('admin:access') || hasPermission('user:permissions');

  const loadData = useCallback(async () => {
    if (!userId) return;
    
    setLoadingData(true);
    try {
      const userResponse = await userService.getById(userId);
      
      let userData: User;
      if (userResponse.data) {
        userData = userResponse.data;
      } else if (userResponse && typeof userResponse === 'object') {
        userData = userResponse as unknown as User;
      } else {
        throw new Error('Dados do usuário não encontrados na resposta');
      }
      
      setUser(userData);
      
      setFormData(prev => ({
        ...prev,
        basic: {
          name: userData?.name || '',
          email: userData?.email || '',
          password: ''
        },
        permissions: {
          permissions: userData?.permissions || []
        }
      }));

      if (canEditPermissions) {
        try {
          const permissionsResponse = await PermissionService.list();
          
          if (permissionsResponse?.data && Array.isArray(permissionsResponse.data)) {
            setPermissions(permissionsResponse.data || []);
          } else if (Array.isArray(permissionsResponse)) {
            setPermissions(permissionsResponse as Permission[]);
          } else {
            setPermissions([]);
          }
        } catch (permissionError) {
          setPermissions([]);
          if (isAxiosError(permissionError)) {
            const message = permissionError.response?.data?.message || 'Erro ao carregar lista de permissões';
            toast.error(message);
          }
        }
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message || error.response?.data?.error || 'Erro ao carregar dados do usuário';
        toast.error(message);
      } else {
        toast.error('Erro inesperado ao carregar dados');
      }
    } finally {
      setLoadingData(false);
    }
  }, [userId, canEditPermissions, userService]);

  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId, loadData]);

  useEffect(() => {
    if (isOpen && !canEditUser && canEditPermissions) {
      setActiveTab('permissions');
    }
  }, [isOpen, canEditUser, canEditPermissions]);

  const handleInputChange = (field: keyof TabData['basic'], value: string) => {
    setFormData(prev => ({
      ...prev,
      basic: {
        ...prev.basic,
        [field]: value
      }
    }));

    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => {
      const currentPermissions = prev.permissions.permissions;
      const newPermissions = checked
        ? [...currentPermissions, permissionId]
        : currentPermissions.filter(p => p !== permissionId);

      return {
        ...prev,
        permissions: {
          permissions: newPermissions
        }
      };
    });
  };

  const validateBasicData = () => {
    const dataToValidate = {
      ...formData.basic,
      ...(formData.basic.password ? { password: formData.basic.password } : {})
    };

    const validation = validateData(updateUserSchema, dataToValidate);
    
    if (!validation.success && validation.errors) {
      const formattedErrors: FormErrors = {};
      Object.entries(validation.errors).forEach(([field, messages]) => {
        formattedErrors[field] = messages[0];
      });
      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const validatePermissionsData = () => {
    const validation = validateData(updateUserPermissionsSchema, formData.permissions);
    
    if (!validation.success && validation.errors) {
      const formattedErrors: FormErrors = {};
      Object.entries(validation.errors).forEach(([field, messages]) => {
        formattedErrors[field] = messages[0];
      });
      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      const updateData: Record<string, unknown> = {};

      if (canEditUser) {
        if (!validateBasicData()) {
          setActiveTab('basic');
          return;
        }

        if (formData.basic.name) updateData.name = formData.basic.name;
        if (formData.basic.email) updateData.email = formData.basic.email;
        if (formData.basic.password) updateData.password = formData.basic.password;
      }

      if (canEditPermissions) {
        if (!validatePermissionsData()) {
          setActiveTab('permissions');
          return;
        }

        updateData.permissions = formData.permissions.permissions;
      }

      if (!userId) return;
      await userService.update(userId, updateData);
      
      toast.success(t('users.updateSuccess', 'Usuário atualizado com sucesso!'));
      onSuccess();
      onClose();
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message || error.response?.data?.error || 'Erro ao atualizar usuário';
        toast.error(message);
      } else {
        toast.error('Erro inesperado ao atualizar usuário');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      basic: { name: '', email: '', password: '' },
      permissions: { permissions: [] }
    });
    setErrors({});
    setActiveTab('basic');
    onClose();
  };

  if (!canEditUser && !canEditPermissions) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title={t('users.editUser', 'Editar Usuário')} size="md">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{t('users.noPermissionToEdit', 'Você não tem permissão para editar usuários.')}</p>
          <CloseButton onClick={handleClose}>
            {t('common.close', 'Fechar')}
          </CloseButton>
        </div>
      </Modal>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('users.editUser', 'Editar Usuário')} size="lg">
      {loadingData ? (
        <LoadingContainer>
          {t('common.loading', 'Carregando...')}
        </LoadingContainer>
      ) : (
        <>
          <TabContainer>
            {canEditUser && (
              <Tab 
                active={activeTab === 'basic'} 
                onClick={() => setActiveTab('basic')}
              >
                {t('users.basicData', 'Dados Básicos')}
              </Tab>
            )}
            {canEditPermissions && (
              <Tab 
                active={activeTab === 'permissions'} 
                onClick={() => setActiveTab('permissions')}
              >
                {t('users.permissions', 'Permissões')}
              </Tab>
            )}
          </TabContainer>

          <TabContent>
            {activeTab === 'basic' && canEditUser && (
              <div>
                <FormGroup>
                  <Input
                    label={t('users.name', 'Nome')}
                    value={formData.basic.name}
                    onChange={(value) => handleInputChange('name', value)}
                    error={errors.name}
                    placeholder={t('users.enterName', 'Digite o nome do usuário')}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    label={t('users.email', 'Email')}
                    type="email"
                    value={formData.basic.email}
                    onChange={(value) => handleInputChange('email', value)}
                    error={errors.email}
                    placeholder={t('users.enterEmail', 'Digite o email do usuário')}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    label={t('users.newPassword', 'Nova Senha (opcional)')}
                    type="password"
                    value={formData.basic.password}
                    onChange={(value) => handleInputChange('password', value)}
                    error={errors.password}
                    placeholder={t('users.enterNewPassword', 'Digite uma nova senha (deixe vazio para não alterar)')}
                  />
                </FormGroup>
              </div>
            )}

            {activeTab === 'permissions' && canEditPermissions && (
              <div>
                {!Array.isArray(permissions) || permissions.length === 0 ? (
                  <LoadingContainer>
                    {loadingData ? 
                      t('common.loading', 'Carregando...') : 
                      t('users.noPermissions', 'Nenhuma permissão disponível ou erro ao carregar')
                    }
                  </LoadingContainer>
                ) : (
                  <div>
                    {Array.isArray(permissions) && permissions.length > 0 && 
                      Object.entries(
                        permissions.reduce((groups: { [key: string]: Permission[] }, permission) => {
                          const category = permission.category || 'Geral';
                          if (!groups[category]) groups[category] = [];
                          groups[category].push(permission);
                          return groups;
                        }, {})
                      ).map(([category, categoryPermissions]) => (
                        <PermissionGroup key={category}>
                          <PermissionGroupTitle>{category}</PermissionGroupTitle>
                          {categoryPermissions.map((permission) => (
                            <PermissionItem key={permission.id}>
                              <PermissionCheckbox
                                type="checkbox"
                                id={`permission-${permission.id}`}
                                checked={formData.permissions.permissions.includes(permission.id)}
                                onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                              />
                              <PermissionLabel htmlFor={`permission-${permission.id}`}>
                                {permission.name}
                                {permission.description && (
                                  <PermissionDescription>{permission.description}</PermissionDescription>
                                )}
                              </PermissionLabel>
                            </PermissionItem>
                          ))}
                        </PermissionGroup>
                      ))
                    }
                  </div>
                )}
                {errors.permissions && <ErrorText>{errors.permissions}</ErrorText>}
              </div>
            )}
          </TabContent>

          <ButtonGroup>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={handleSave} loading={loading}>
              {t('common.save', 'Salvar')}
            </Button>
          </ButtonGroup>
        </>
      )}
    </Modal>
  );
};