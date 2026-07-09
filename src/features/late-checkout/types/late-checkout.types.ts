export type LateCheckoutStatus = 'requested' | 'approved' | 'denied';

export interface LateCheckout {
  id: string;
  bookingId: string;
  requestedUntil: string;
  standardCheckOutTime: string;
  status: LateCheckoutStatus;
  extraCharge: number;
  conflictsWithBookingId?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
}

export interface RequestLateCheckoutPayload {
  requested_until: string;
}

export interface ApproveLateCheckoutPayload {
  extra_charge?: number;
  notes?: string;
}

export interface DenyLateCheckoutPayload {
  notes?: string;
}

export const STATUS_LABELS_VI: Record<LateCheckoutStatus, string> = {
  requested: 'Đang chờ duyệt',
  approved: 'Đã duyệt',
  denied: 'Bị từ chối',
};

export const STATUS_BADGE: Record<LateCheckoutStatus, { className: string; label: string }> = {
  requested: { className: 'bg-warning-50 text-warning-600', label: 'Đang chờ duyệt' },
  approved: { className: 'bg-success-50 text-success-600', label: 'Đã duyệt' },
  denied: { className: 'bg-error-50 text-error-600', label: 'Bị từ chối' },
};

export const STANDARD_CHECKOUT_TIME = '12:00';
export const AUTO_APPROVE_TIME_LIMIT = '14:00';
