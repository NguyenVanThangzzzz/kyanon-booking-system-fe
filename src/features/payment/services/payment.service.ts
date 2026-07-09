import axiosInstance from '@/lib/axios/axios.instance';
import type { ApiResponse } from '@/types/api.types';
import type {
  CreatePaymentLinkRequest,
  Payment,
  RevenueReport,
  RevenueReportParams,
} from '../types/payment.types';

export const paymentService = {
  createPaymentLink: async (data: CreatePaymentLinkRequest): Promise<Payment> => {
    const response = await axiosInstance.post<ApiResponse<Payment>>(
      '/api/v1/payments/create-payment-link',
      data,
    );
    return response.data.data;
  },

  getPaymentByBookingId: async (bookingId: string): Promise<Payment | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Payment>>(
        `/api/v1/payments/booking/${bookingId}`,
      );
      return response.data.data;
    } catch {
      return null;
    }
  },

  verifyPayment: async (orderCode: string): Promise<Payment | null> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Payment>>(
        `/api/v1/payments/verify/${orderCode}`,
      );
      return response.data.data;
    } catch {
      return null;
    }
  },

  getRevenueReport: async (params: RevenueReportParams): Promise<RevenueReport> => {
    const response = await axiosInstance.get<ApiResponse<RevenueReport>>(
      '/api/v1/payments/admin/revenue',
      { params },
    );
    return response.data.data;
  },
};
