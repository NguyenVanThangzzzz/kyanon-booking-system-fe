import axiosInstance from '@/lib/axios/axios.instance';
import type { ApiResponse } from '@/types/api.types';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth.types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/api/v1/auth/login',
      data,
    );
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<ApiResponse<RegisterResponse>>(
      '/api/v1/auth/register',
      data,
    );
    return response.data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post('/api/v1/auth/logout', { refreshToken });
  },
};
