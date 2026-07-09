import axiosInstance from '@/lib/axios/axios.instance';
import type { ApiResponse } from '@/types/api.types';
import type {
  ApproveLateCheckoutPayload,
  DenyLateCheckoutPayload,
  LateCheckout,
  RequestLateCheckoutPayload,
} from '../types/late-checkout.types';

export const lateCheckoutService = {
  requestLateCheckout: async (
    bookingId: string,
    payload: RequestLateCheckoutPayload,
  ): Promise<LateCheckout> => {
    const response = await axiosInstance.post<ApiResponse<LateCheckout>>(
      `/api/v1/bookings/${bookingId}/late-checkout`,
      payload,
    );
    return response.data.data;
  },

  getByBooking: async (bookingId: string): Promise<LateCheckout | null> => {
    const response = await axiosInstance.get<ApiResponse<LateCheckout | null>>(
      `/api/v1/bookings/${bookingId}/late-checkout`,
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<LateCheckout> => {
    const response = await axiosInstance.get<ApiResponse<LateCheckout>>(
      `/api/v1/late-checkouts/${id}`,
    );
    return response.data.data;
  },

  approve: async (
    id: string,
    payload: ApproveLateCheckoutPayload,
  ): Promise<LateCheckout> => {
    const response = await axiosInstance.patch<ApiResponse<LateCheckout>>(
      `/api/v1/late-checkouts/${id}/approve`,
      payload,
    );
    return response.data.data;
  },

  deny: async (id: string, payload: DenyLateCheckoutPayload): Promise<LateCheckout> => {
    const response = await axiosInstance.patch<ApiResponse<LateCheckout>>(
      `/api/v1/late-checkouts/${id}/deny`,
      payload,
    );
    return response.data.data;
  },
};
