import { cn } from '@/common/utils/cn';
import type { BookingStatus, PaymentStatus } from '../types/booking.types';

const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Chờ xác nhận',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  confirmed: {
    label: 'Đã xác nhận',
    className: 'bg-primary-50 text-primary-700 border border-primary-200',
  },
  checked_in: {
    label: 'Đã nhận phòng',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  completed: {
    label: 'Hoàn thành',
    className: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  },
  no_show: {
    label: 'Không đến',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  unpaid: { label: 'Chưa thanh toán', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  paid: { label: 'Đã thanh toán', className: 'bg-green-50 text-green-700 border border-green-200' },
  refunded: { label: 'Đã hoàn tiền', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export const BookingStatusBadge = ({ status, className }: BookingStatusBadgeProps) => {
  const config = BOOKING_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
};

export const PaymentStatusBadge = ({ status, className }: PaymentStatusBadgeProps) => {
  const config = PAYMENT_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
};

export { BOOKING_STATUS_CONFIG };
