import axiosInstance from '@/lib/axios/axios.instance';
import type { ApiPaginatedResponse, ApiResponse, PaginationParams } from '@/types/api.types';

import type {
  AvailableRoomFilters,
  CreateRoomRequest,
  CreateRoomTypeRequest,
  Room,
  RoomFilters,
  RoomSchedule,
  RoomSlotAvailability,
  RoomSlotMonthResponse,
  RoomSlotRangeResponse,
  RoomType,
  UpdateRoomRequest,
  UpdateRoomStatusRequest,
  UpdateRoomTypeRequest,
} from '../types/room.types';

export const roomService = {
  getRooms: async (params: PaginationParams & RoomFilters): Promise<ApiPaginatedResponse<Room>> => {
    const { roomTypeIds, ...rest } = params;
    const response = await axiosInstance.get<ApiPaginatedResponse<Room>>('/api/v1/rooms', {
      params: {
        ...rest,
        ...(roomTypeIds?.length ? { roomTypeIds: roomTypeIds.join(',') } : {}),
      },
    });
    return response.data;
  },

  getAvailableRooms: async (filters: AvailableRoomFilters): Promise<Room[]> => {
    const response = await axiosInstance.get<ApiResponse<Room[]>>('/api/v1/rooms/available', {
      params: {
        check_in_date: filters.checkIn,
        check_out_date: filters.checkOut,
      },
    });
    return response.data.data;
  },

  getRoomById: async (id: string): Promise<Room> => {
    const response = await axiosInstance.get<ApiResponse<Room>>(`/api/v1/rooms/${id}`);
    return response.data.data;
  },

  createRoom: async (data: CreateRoomRequest): Promise<Room> => {
    const response = await axiosInstance.post<ApiResponse<Room>>('/api/v1/rooms', data);
    return response.data.data;
  },

  updateRoom: async (id: string, data: UpdateRoomRequest): Promise<Room> => {
    const response = await axiosInstance.patch<ApiResponse<Room>>(`/api/v1/rooms/${id}`, data);
    return response.data.data;
  },

  updateRoomStatus: async (id: string, data: UpdateRoomStatusRequest): Promise<Room> => {
    const response = await axiosInstance.patch<ApiResponse<Room>>(
      `/api/v1/rooms/${id}/status`,
      data,
    );
    return response.data.data;
  },

  deleteRoom: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/v1/rooms/${id}`);
  },

  getRoomTypes: async (): Promise<RoomType[]> => {
    const response = await axiosInstance.get<ApiResponse<RoomType[]>>('/api/v1/room-types');
    return response.data.data;
  },

  getRoomTypeById: async (id: string): Promise<RoomType> => {
    const response = await axiosInstance.get<ApiResponse<RoomType>>(`/api/v1/room-types/${id}`);
    return response.data.data;
  },

  createRoomType: async (data: CreateRoomTypeRequest): Promise<RoomType> => {
    const response = await axiosInstance.post<ApiResponse<RoomType>>('/api/v1/room-types', data);
    return response.data.data;
  },

  updateRoomType: async (id: string, data: UpdateRoomTypeRequest): Promise<RoomType> => {
    const response = await axiosInstance.patch<ApiResponse<RoomType>>(
      `/api/v1/room-types/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteRoomType: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/v1/room-types/${id}`);
  },

  getRoomSlotAvailability: async (id: string, date: string): Promise<RoomSlotAvailability> => {
    const response = await axiosInstance.get<ApiResponse<RoomSlotAvailability>>(
      `/api/v1/rooms/${id}/slots`,
      { params: { date } },
    );
    return response.data.data;
  },

  getRoomSlotsRange: async (
    id: string,
    checkIn: string,
    checkOut: string,
  ): Promise<RoomSlotRangeResponse> => {
    const response = await axiosInstance.get<ApiResponse<RoomSlotRangeResponse>>(
      `/api/v1/rooms/${id}/slots/range`,
      { params: { check_in: checkIn, check_out: checkOut } },
    );
    return response.data.data;
  },

  getRoomSlotsMonth: async (
    id: string,
    year: number,
    month: number,
  ): Promise<RoomSlotMonthResponse> => {
    const response = await axiosInstance.get<ApiResponse<RoomSlotMonthResponse>>(
      `/api/v1/rooms/${id}/slots/month`,
      { params: { year, month } },
    );
    return response.data.data;
  },

  getRoomSchedules: async (id: string): Promise<RoomSchedule[]> => {
    const response = await axiosInstance.get<ApiResponse<RoomSchedule[]>>(
      `/api/v1/rooms/${id}/schedules`,
    );
    return response.data.data;
  },
};
