export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'wallet';

export type RefundStatus = 'none' | 'pending' | 'completed';

export type CancelReason = 'user_request' | 'no_show' | 'room_issue' | 'admin';

export type IdType = 'cccd' | 'passport' | 'driver_license';

export interface GuestInfo {
  fullName: string;
  idNumber: string;
  idType: IdType;
  nationality?: string;
  dateOfBirth?: string;
}

export interface CompanionGuest {
  full_name: string;
  id_number: string;
  id_type: IdType;
  nationality?: string;
}

export interface BookingGuests {
  primary: GuestInfo | null;
  companions: CompanionGuest[];
}

export interface BookingRoom {
  id: string;
  name: string;
  code: string;
  imageUrl: string | null;
  floor: string | null;
  roomTypeName: string | null;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  bookingRef: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  specialRequests: string | null;
  roomRatePerNight: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  refundStatus: RefundStatus;
  actualCheckInAt: string | null;
  actualCheckOutAt: string | null;
  guests: BookingGuests | null;
  paymentMethod: PaymentMethod | null;
  paidAmount: number;
  paidAt: string | null;
  cancelledBy: string | null;
  cancelReason: CancelReason | null;
  cancelNote: string | null;
  refundAmount: number;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  room?: BookingRoom | null;
}

export interface CreateBookingRequest {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  specialRequests?: string;
}

export interface CreateBookingResponse {
  booking_ref: string;
  status: BookingStatus;
  total_amount: number;
  lock_released: boolean;
  booking: Booking;
}

export interface CancelBookingRequest {
  reasonType: CancelReason;
  reasonNote?: string;
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  sort_by?: 'createdAt' | 'checkInDate' | 'totalAmount' | 'status';
  sort_order?: 'asc' | 'desc';
  status?: BookingStatus;
}

export interface CheckInRequest {
  primaryGuest: {
    fullName: string;
    idNumber: string;
    idType: IdType;
    nationality?: string;
    dateOfBirth?: string;
  };
  actualCheckInAt?: string;
}

export interface CheckOutRequest {
  actualCheckOutAt?: string;
}
