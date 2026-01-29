import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AutoRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const hasUserPermissions = user.permissions && (
        user.permissions.includes('user:list') || 
        user.permissions.includes('user:read') ||
        user.type === 'admin'
      );
      
      if (hasUserPermissions) {
        navigate('/users', { replace: true });
      } else {
        navigate('/no-access', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Carregando...
      </div>
    );
  }

  return null;
};