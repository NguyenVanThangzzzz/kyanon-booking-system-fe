import axiosInstance from '@/lib/axios/axios.instance';
import type { ApiResponse } from '@/types/api.types';
import type {
  Schedule,
  ScheduleUpsertResponse,
  UpdateScheduleRequest,
  UpsertScheduleRequest,
} from '../types/schedule.types';

export const scheduleService = {
  listByRoom: async (roomId: string): Promise<Schedule[]> => {
    const response = await axiosInstance.get<ApiResponse<Schedule[]>>(
      `/api/v1/admin/rooms/${roomId}/schedules`,
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Schedule> => {
    const response = await axiosInstance.get<ApiResponse<Schedule>>(`/api/v1/schedules/${id}`);
    return response.data.data;
  },

  upsert: async (data: UpsertScheduleRequest): Promise<ScheduleUpsertResponse> => {
    const response = await axiosInstance.post<ApiResponse<ScheduleUpsertResponse>>(
      '/api/v1/admin/schedules',
      data,
    );
    return response.data.data;
  },

  update: async (id: string, data: UpdateScheduleRequest): Promise<Schedule> => {
    const response = await axiosInstance.patch<ApiResponse<Schedule>>(
      `/api/v1/schedules/${id}`,
      data,
    );
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/v1/schedules/${id}`);
  },
};
