import { useState } from 'react';
import { Button } from '@/common/components/ui/Button';
import { Spinner } from '@/common/components/ui/Spinner';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { formatCurrency, formatDateTime } from '@/common/utils/format';
import type { BookingStatus } from '@/features/booking/types/booking.types';
import { useLateCheckoutByBooking } from '../hooks/useLateCheckoutByBooking';
import type { LateCheckout } from '../types/late-checkout.types';
import { LateCheckoutStatusBadge } from './LateCheckoutStatusBadge';
import { RequestLateCheckoutModal } from './RequestLateCheckoutModal';

interface LateCheckoutCardProps {
  bookingId: string;
  bookingStatus: BookingStatus;
}

const ELIGIBLE_BOOKING_STATUSES: BookingStatus[] = ['confirmed', 'checked_in'];

const renderApprovalSource = (lc: LateCheckout): string => {
  if (lc.status === 'approved' && !lc.approvedBy) return 'Đã được hệ thống tự động duyệt';
  if (lc.status === 'approved') return 'Đã được staff duyệt';
  if (lc.status === 'denied') return 'Đã bị staff từ chối';
  return '';
};

export const LateCheckoutCard = ({
  bookingId,
  bookingStatus,
}: LateCheckoutCardProps): JSX.Element | null => {
  const { showToast } = useToast();
  const { lateCheckout, isLoading, error, requestLateCheckout } =
    useLateCheckoutByBooking(bookingId);
  const [modalOpen, setModalOpen] = useState(false);

  if (!ELIGIBLE_BOOKING_STATUSES.includes(bookingStatus)) {
    return null;
  }

  const handleSubmit = async (requestedUntil: string): Promise<void> => {
    const created = await requestLateCheckout(requestedUntil);
    setModalOpen(false);
    if (created.status === 'approved') {
      showToast('Yêu cầu đã được tự động duyệt', 'success');
    } else {
      showToast('Đã gửi yêu cầu, chờ staff duyệt', 'info');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Trả phòng muộn</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Yêu cầu trả phòng sau giờ trả phòng chuẩn (12:00)
          </p>
        </div>
        {lateCheckout && <LateCheckoutStatusBadge status={lateCheckout.status} />}
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <Spinner size="md" />
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-error-50 border border-error-100 rounded-lg px-3 py-2 text-sm text-error-700">
          {error}
        </div>
      )}

      {!isLoading && !error && !lateCheckout && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <p className="text-sm text-neutral-600">
            Bạn chưa có yêu cầu trả phòng muộn cho đặt phòng này.
          </p>
          <Button onClick={() => setModalOpen(true)}>Yêu cầu trả phòng muộn</Button>
        </div>
      )}

      {!isLoading && !error && lateCheckout && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-neutral-500">Giờ yêu cầu</p>
              <p className="mt-0.5 font-semibold text-neutral-900">
                {lateCheckout.requestedUntil}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-neutral-500">Giờ chuẩn</p>
              <p className="mt-0.5 text-neutral-700">{lateCheckout.standardCheckOutTime}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-neutral-500">Phụ phí</p>
              <p className="mt-0.5 font-semibold text-primary-700">
                {lateCheckout.extraCharge > 0
                  ? formatCurrency(lateCheckout.extraCharge, 'VND', 'vi-VN')
                  : 'Miễn phí'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-neutral-500">Thời gian gửi</p>
              <p className="mt-0.5 text-neutral-700">{formatDateTime(lateCheckout.requestedAt)}</p>
            </div>
            {lateCheckout.approvedAt && (
              <div className="col-span-2">
                <p className="text-xs font-medium uppercase text-neutral-500">
                  {lateCheckout.status === 'denied' ? 'Thời gian từ chối' : 'Thời gian duyệt'}
                </p>
                <p className="mt-0.5 text-neutral-700">
                  {formatDateTime(lateCheckout.approvedAt)}
                  <span className="ml-2 text-neutral-500">— {renderApprovalSource(lateCheckout)}</span>
                </p>
              </div>
            )}
          </div>

          {lateCheckout.status === 'requested' && lateCheckout.conflictsWithBookingId && (
            <div className="bg-warning-50 border border-warning-100 rounded-lg px-3 py-2 text-sm text-warning-700">
              ⚠ Có đặt phòng kế tiếp ngay sau ngày bạn trả phòng. Staff sẽ cân nhắc trước khi duyệt.
            </div>
          )}

          {lateCheckout.status === 'approved' && lateCheckout.extraCharge > 0 && (
            <div className="bg-info-50 border border-info-100 rounded-lg px-3 py-2 text-sm text-info-700">
              Phụ phí sẽ được thu khi nhận phòng / trả phòng. Tính năng thanh toán trực tuyến cho phụ phí sẽ có sau.
            </div>
          )}
        </div>
      )}

      <RequestLateCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
