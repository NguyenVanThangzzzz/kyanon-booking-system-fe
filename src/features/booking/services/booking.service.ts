import axiosInstance from '@/lib/axios/axios.instance';
import type { ApiPaginatedResponse, ApiResponse } from '@/types/api.types';
import type {
  Booking,
  BookingFilters,
  CancelBookingRequest,
  CheckInRequest,
  CheckOutRequest,
  CreateBookingRequest,
  CreateBookingResponse,
} from '../types/booking.types';

export const bookingService = {
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await axiosInstance.get<ApiResponse<Booking[]>>('/api/v1/bookings/my');
    return response.data.data;
  },

  getAllBookings: async (filters: BookingFilters): Promise<ApiPaginatedResponse<Booking>> => {
    const response = await axiosInstance.get<ApiPaginatedResponse<Booking>>('/api/v1/bookings', {
      params: filters,
    });
    return response.data;
  },

  getBookingById: async (id: string): Promise<Booking> => {
    const response = await axiosInstance.get<ApiResponse<Booking>>(`/api/v1/bookings/${id}`);
    return response.data.data;
  },

  createBooking: async (data: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const response = await axiosInstance.post<ApiResponse<CreateBookingResponse>>(
      '/api/v1/bookings',
      data,
    );
    return response.data.data;
  },

  cancelBooking: async (id: string, data: CancelBookingRequest): Promise<Booking> => {
    const response = await axiosInstance.post<ApiResponse<Booking>>(
      `/api/v1/bookings/${id}/cancel`,
      data,
    );
    return response.data.data;
  },

  confirmBooking: async (id: string): Promise<Booking> => {
    const response = await axiosInstance.patch<ApiResponse<Booking>>(
      `/api/v1/bookings/${id}/confirm`,
    );
    return response.data.data;
  },

  checkIn: async (id: string, data: CheckInRequest): Promise<Booking> => {
    const response = await axiosInstance.patch<ApiResponse<Booking>>(
      `/api/v1/bookings/${id}/check-in`,
      data,
    );
    return response.data.data;
  },

  checkOut: async (id: string, data?: CheckOutRequest): Promise<Booking> => {
    const response = await axiosInstance.patch<ApiResponse<Booking>>(
      `/api/v1/bookings/${id}/check-out`,
      data ?? {},
    );
    return response.data.data;
  },

  markNoShow: async (id: string): Promise<Booking> => {
    const response = await axiosInstance.patch<ApiResponse<Booking>>(
      `/api/v1/bookings/${id}/no-show`,
    );
    return response.data.data;
  },
};
