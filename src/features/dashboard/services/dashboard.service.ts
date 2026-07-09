import axiosInstance from '@/lib/axios/axios.instance';
import type { ApiResponse } from '@/types/api.types';
import type { DashboardStats } from '../types/dashboard.types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>(
      '/api/v1/dashboard/stats',
    );
    return response.data.data;
  },
};
