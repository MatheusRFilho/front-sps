import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components';

const NoAccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 500px;
`;

const UserInfo = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const UserDetail = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text};
`;

const NoAccess: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <NoAccessContainer>
      <Title>🚫 Acesso Restrito</Title>
      <Message>
        Você não possui as permissões necessárias para acessar o sistema de gerenciamento de usuários.
        Entre em contato com o administrador para solicitar acesso.
      </Message>
      
      {user && (
        <UserInfo>
          <UserDetail><strong>Usuário:</strong> {user.name}</UserDetail>
          <UserDetail><strong>E-mail:</strong> {user.email}</UserDetail>
          <UserDetail><strong>Tipo:</strong> {user.type}</UserDetail>
          <UserDetail><strong>Permissões:</strong> {user.permissions?.join(', ') || 'Nenhuma'}</UserDetail>
        </UserInfo>
      )}
      
      <Button onClick={logout}>
        {t('auth.logout')}
      </Button>
    </NoAccessContainer>
  );
};

export default NoAccess;