'use client';

import { useState, useCallback, useEffect } from 'react';
import { adminService, type AdminUser, type PagedResponse, type FilterCriteria, FilterOperation } from '@/services/admin.service';
import { toast } from 'sonner';

interface UseAdminUsersOptions {
  initialPage?: number;
  pageSize?: number;
}

interface UseAdminUsersReturn {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  fetchUsers: (page?: number) => Promise<void>;
  searchUsers: (searchTerm: string) => Promise<void>;
  filterUsers: (filters: FilterCriteria[]) => Promise<void>;
  updateUserLimits: (userId: number, cvLimit?: number, apiLimit?: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}): UseAdminUsersReturn {
  const { initialPage = 0, pageSize = 10 } = options;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    size: pageSize,
    totalElements: 0,
    totalPages: 0,
  });
  const [currentFilters, setCurrentFilters] = useState<FilterCriteria[]>([]);

  const fetchUsers = useCallback(async (page = pagination.page) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.filterUsers({
        filters: currentFilters,
        page,
        size: pagination.size,
        sorts: [{ fieldName: 'createdAt', direction: 'DESC' }],
      });

      setUsers(response.data.content);
      setPagination({
        page: response.data.page,
        size: response.data.size,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, pagination.page, pagination.size]);

  const searchUsers = useCallback(async (searchTerm: string) => {
    const filters: FilterCriteria[] = searchTerm
      ? [
          {
            fieldName: 'email',
            operation: FilterOperation.MATCH,
            value: searchTerm,
          },
        ]
      : [];

    setCurrentFilters(filters);
    
    setIsLoading(true);
    try {
      const response = await adminService.filterUsers({
        filters,
        page: 0,
        size: pagination.size,
        sorts: [{ fieldName: 'createdAt', direction: 'DESC' }],
      });

      setUsers(response.data.content);
      setPagination({
        page: response.data.page,
        size: response.data.size,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search users';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.size]);

  const filterUsers = useCallback(async (filters: FilterCriteria[]) => {
    setCurrentFilters(filters);
    
    setIsLoading(true);
    try {
      const response = await adminService.filterUsers({
        filters,
        page: 0,
        size: pagination.size,
        sorts: [{ fieldName: 'createdAt', direction: 'DESC' }],
      });

      setUsers(response.data.content);
      setPagination({
        page: response.data.page,
        size: response.data.size,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to filter users';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.size]);

  const updateUserLimits = useCallback(async (
    userId: number,
    cvLimit?: number,
    apiLimit?: number
  ) => {
    try {
      await adminService.updateUserLimits(userId, cvLimit, apiLimit);
      toast.success('User limits updated');
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user limits';
      toast.error(message);
      throw err;
    }
  }, [fetchUsers]);

  const refresh = useCallback(async () => {
    await fetchUsers(pagination.page);
  }, [fetchUsers, pagination.page]);

  // Initial fetch
  useEffect(() => {
    fetchUsers(initialPage);
  }, []);

  return {
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    searchUsers,
    filterUsers,
    updateUserLimits,
    refresh,
  };
}
