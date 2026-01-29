import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useToast } from '../hooks';
import { User, isAxiosError, PaginationParams } from '../types';
import { UserService } from '../services/UserService';
import { Button, Modal, PermissionGuard, SearchInput, UserCreateModal, UserEditModal } from '../components';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../contexts/AuthContext';

const UsersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const SearchAndActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
`;

const ResultsInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const TableHeader = styled.thead`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActionsCell = styled(TableCell)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;


const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const PaginationInfo = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PaginationControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 ${({ theme }) => theme.spacing.md};
`;

const ConfirmationContent = styled.div`
  text-align: center;
  
  p {
    margin: ${({ theme }) => theme.spacing.md} 0;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ConfirmationActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const Users: React.FC = () => {
  const toast = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({ isOpen: false, user: null });
  const [deleting, setDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    userId: number | null;
  }>({ isOpen: false, userId: null });

  const userService = useMemo(() => new UserService(), []);
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const ITEMS_PER_PAGE = 20;

  const loadUsers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);

      const params: PaginationParams = {
        page,
        limit: ITEMS_PER_PAGE,
        ...(search && { search }),
      };

      const response = await userService.list(params);
      
      let usersData: User[] = [];
      let pagination = null;
      
      if ('pagination' in response && response.pagination) {
        usersData = response.data;
        pagination = response.pagination;
      } else if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      }
      
      
      const safeUsersData = Array.isArray(usersData) ? usersData : [];
      
      setUsers(safeUsersData);
      
      if (pagination) {
        setTotalPages(pagination.totalPages);
        setTotalUsers(pagination.total);
        setCurrentPage(pagination.page);
      } else {
        setTotalPages(1);
        setTotalUsers(safeUsersData.length);
        setCurrentPage(1);
      }
      
    } catch (error: unknown) {
      const errorMessage = (isAxiosError(error) && error.response?.data?.message) || t('users.loadError');
      toast.error('users.loadError', errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [userService, t, toast]);

  useEffect(() => {
    loadUsers(1, debouncedSearchTerm);
    setCurrentPage(1);
  }, [debouncedSearchTerm, loadUsers]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      loadUsers(newPage, debouncedSearchTerm);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      loadUsers(newPage, debouncedSearchTerm);
    }
  };

  const handleEdit = (user: User) => {
    setEditModal({ isOpen: true, userId: user.id });
  };

  const handleDeleteClick = (user: User) => {
    if (currentUser && user.id === currentUser.id) {
      toast.error('users.cannotDeleteSelf', 'Você não pode excluir sua própria conta');
      return;
    }
    
    setDeleteModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;

    try {
      setDeleting(true);
      
      await userService.delete(deleteModal.user.id);
      
      toast.success('users.deleteSuccess', 'Usuário excluído com sucesso!');
      setDeleteModal({ isOpen: false, user: null });
      
      if (users.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        loadUsers(newPage, debouncedSearchTerm);
      } else {
        loadUsers(currentPage, debouncedSearchTerm);
      }
    } catch (error: unknown) {
      let errorMessage = t('users.deleteError', 'Erro ao excluir usuário');
      
      if (isAxiosError(error)) {
        const apiMessage = error.response?.data?.message || error.response?.data?.error;
        if (apiMessage) {
          errorMessage = apiMessage;
        } else if (error.response?.status === 403) {
          errorMessage = t('users.deletePermissionError', 'Você não tem permissão para excluir este usuário');
        } else if (error.response?.status === 404) {
          errorMessage = t('users.deleteNotFoundError', 'Usuário não encontrado');
        } else if (error.response?.status === 409) {
          errorMessage = t('users.deleteConflictError', 'Não é possível excluir este usuário pois ele possui dependências');
        }
      }
      
      toast.error('users.deleteError', errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const handleCreateUser = () => {
    setCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setCreateModalOpen(false);
  };

  const handleCreateSuccess = () => {
    loadUsers(currentPage, debouncedSearchTerm);
  };

  const handleEditModalClose = () => {
    setEditModal({ isOpen: false, userId: null });
  };

  const handleEditSuccess = () => {
    loadUsers(currentPage, debouncedSearchTerm);
  };

  if (loading) {
    return (
      <LoadingContainer>
        {t('common.loading')}
      </LoadingContainer>
    );
  }

  return (
    <UsersContainer>
      <Header>
        <Title>{t('users.title')}</Title>
        <PermissionGuard permission="user:create">
          <Button onClick={handleCreateUser}>
            {t('users.create')}
          </Button>
        </PermissionGuard>
      </Header>

      <SearchAndActions>
        <SearchSection>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('common.search')}
            disabled={loading}
          />
          {totalUsers > 0 && (
            <ResultsInfo>
              {searchTerm 
                ? `${totalUsers} usuários encontrados`
                : `${totalUsers} usuários no total`
              }
            </ResultsInfo>
          )}
        </SearchSection>
      </SearchAndActions>

      {!users || users.length === 0 ? (
        <EmptyState>
          <h3>
            {searchTerm 
              ? t('users.noUsersFound', 'Nenhum usuário encontrado para "{{searchTerm}}"', { searchTerm })
              : t('users.noUsers')
            }
          </h3>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              {t('common.clearSearch', 'Limpar busca')}
            </Button>
          )}
        </EmptyState>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>{t('users.name')}</TableHeaderCell>
                <TableHeaderCell>{t('users.email')}</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>{t('users.actions')}</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.type || t('common.notAvailable', 'N/A')}</TableCell>
                  <ActionsCell>
                    <PermissionGuard permission="user:update">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        {t('common.edit')}
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permission="user:delete">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(user)}
                      >
                        {t('common.delete')}
                      </Button>
                    </PermissionGuard>
                  </ActionsCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          
          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationInfo>
                {t('users.showingUsers', 'Mostrando {{count}} usuários de {{total}}', { 
                  count: users.length, 
                  total: totalUsers 
                })}
              </PaginationInfo>
              
              <PaginationControls>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  {t('common.previous')}
                </Button>
                
                <PageInfo>
                  {t('users.pageInfo', 'Página {{current}} de {{total}}', { 
                    current: currentPage, 
                    total: totalPages 
                  })}
                </PageInfo>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  {t('common.next')}
                </Button>
              </PaginationControls>
            </PaginationContainer>
          )}
        </>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        title={t('users.deleteTitle', 'Excluir Usuário')}
        size="md"
      >
        <ConfirmationContent>
          <p>{t('users.deleteConfirm', { name: deleteModal.user?.name || '' })}</p>
          
          <p style={{ color: '#ef4444', fontWeight: 'bold' }}>
            {t('users.deleteWarning', '⚠️ Esta ação não pode ser desfeita!')}
          </p>
          <p>{t('users.deleteConfirmText', 'Todos os dados relacionados a este usuário serão permanentemente removidos.')}</p>
          
          <ConfirmationActions>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button
              variant="secondary"
              onClick={handleDeleteConfirm}
              loading={deleting}
            >
              {deleting ? t('users.deleting', 'Excluindo...') : t('common.delete', 'Excluir')}
            </Button>
          </ConfirmationActions>
        </ConfirmationContent>
      </Modal>

      <UserCreateModal
        isOpen={createModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
      />

      <UserEditModal
        isOpen={editModal.isOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditSuccess}
        userId={editModal.userId}
      />
    </UsersContainer>
  );
};

export default Users;