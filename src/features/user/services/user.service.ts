import axiosInstance from '@/lib/axios/axios.instance';
import type { ApiResponse, ApiPaginatedResponse } from '@/types/api.types';
import type {
  AdminUser,
  AdminUserListParams,
  AuditLog,
  AuditLogParams,
  CreateStaffRequest,
  UserStatus,
} from '../types/user.types';

export const userService = {
  getAdminUserList: async (
    params: AdminUserListParams,
  ): Promise<ApiPaginatedResponse<AdminUser>> => {
    const response = await axiosInstance.get<ApiPaginatedResponse<AdminUser>>(
      '/api/v1/users/admin/list',
      { params },
    );
    return response.data;
  },

  createStaff: async (data: CreateStaffRequest): Promise<AdminUser> => {
    const response = await axiosInstance.post<ApiResponse<AdminUser>>(
      '/api/v1/users/staff',
      data,
    );
    return response.data.data;
  },

  updateUserStatus: async (id: string, status: UserStatus): Promise<AdminUser> => {
    const response = await axiosInstance.patch<ApiResponse<AdminUser>>(
      `/api/v1/users/${id}/status`,
      { status },
    );
    return response.data.data;
  },

  getAuditLogs: async (params: AuditLogParams): Promise<ApiPaginatedResponse<AuditLog>> => {
    const response = await axiosInstance.get<ApiPaginatedResponse<AuditLog>>(
      '/api/v1/users/audit-logs',
      { params },
    );
    return response.data;
  },
};
