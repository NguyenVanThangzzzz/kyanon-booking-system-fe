import axiosInstance from '@/lib/axios/axios.instance';
import type { ApiResponse } from '@/types/api.types';
import type {
  BlockedSlot,
  CreateBlockedSlotRequest,
  UpdateBlockedSlotRequest,
} from '../types/blocked-slot.types';

export const blockedSlotService = {
  listByRoom: async (roomId: string): Promise<BlockedSlot[]> => {
    const response = await axiosInstance.get<ApiResponse<BlockedSlot[]>>(
      `/api/v1/rooms/${roomId}/blocked-slots`,
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<BlockedSlot> => {
    const response = await axiosInstance.get<ApiResponse<BlockedSlot>>(
      `/api/v1/blocked-slots/${id}`,
    );
    return response.data.data;
  },

  create: async (roomId: string, data: CreateBlockedSlotRequest): Promise<BlockedSlot> => {
    const response = await axiosInstance.post<ApiResponse<BlockedSlot>>(
      `/api/v1/rooms/${roomId}/blocked-slots`,
      data,
    );
    return response.data.data;
  },

  update: async (id: string, data: UpdateBlockedSlotRequest): Promise<BlockedSlot> => {
    const response = await axiosInstance.patch<ApiResponse<BlockedSlot>>(
      `/api/v1/blocked-slots/${id}`,
      data,
    );
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/v1/blocked-slots/${id}`);
  },
};
