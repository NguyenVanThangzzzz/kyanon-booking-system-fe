export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type PaymentMethodType = 'cash' | 'card' | 'transfer' | 'wallet';

export interface Payment {
  id: string;
  bookingId: string;
  paymentRef: string;
  orderCode: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethodType;
  checkoutUrl?: string;
  qrCode?: string;
  amountPaid: number;
  amountRemaining: number;
  transactionId?: string;
  transactionDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePaymentLinkRequest {
  bookingId: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  paymentMethod?: PaymentMethodType;
}

export interface PaymentMethodBreakdown {
  method: PaymentMethodType;
  count: number;
  amount: number;
  percentage: number;
}

export interface RevenueReport {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  periodSummary: {
    startDate: string;
    endDate: string;
  };
}

export interface RevenueReportParams {
  startDate: string;
  endDate: string;
  paymentMethod?: PaymentMethodType;
}
