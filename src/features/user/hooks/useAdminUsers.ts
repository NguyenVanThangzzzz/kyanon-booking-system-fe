import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/user.service';
import type {
  AdminUser,
  AdminUserListParams,
  CreateStaffRequest,
  UserStatus,
} from '../types/user.types';
import type { ApiError } from '@/types/api.types';

interface UseAdminUsersReturn {
  users: AdminUser[];
  total: number;
  isLoading: boolean;
  error: string | null;
  createStaff: (data: CreateStaffRequest) => Promise<void>;
  updateStatus: (id: string, status: UserStatus) => Promise<void>;
  refetch: () => void;
}

export const useAdminUsers = (params: AdminUserListParams): UseAdminUsersReturn => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    userService
      .getAdminUserList(params)
      .then((res) => {
        if (!cancelled) {
          setUsers(res.data.data);
          setTotal(res.data.pagination.total);
        }
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err.message ?? 'Không thể tải danh sách người dùng');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.page, params.limit, params.role, params.status, params.search, refreshKey]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  const createStaff = useCallback(
    async (data: CreateStaffRequest) => {
      await userService.createStaff(data);
      refetch();
    },
    [refetch],
  );

  const updateStatus = useCallback(
    async (id: string, status: UserStatus) => {
      await userService.updateUserStatus(id, status);
      refetch();
    },
    [refetch],
  );

  return { users, total, isLoading, error, createStaff, updateStatus, refetch };
};
