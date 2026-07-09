import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/common/components/ui/Button';
import { Spinner } from '@/common/components/ui/Spinner';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { formatCurrency, formatDate, formatDateTime } from '@/common/utils/format';
import { useBookingDetail } from '../hooks/useBookingDetail';
import { bookingService } from '../services/booking.service';
import { BookingStatusBadge, PaymentStatusBadge } from '../components/BookingStatusBadge';
import { CancelBookingModal } from '../components/CancelBookingModal';
import { LateCheckoutCard } from '@/features/late-checkout/components/LateCheckoutCard';
import type { ApiError } from '@/types/api.types';
import type { CancelReason } from '../types/booking.types';

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'Tiền mặt',
  card: 'Thẻ ngân hàng',
  transfer: 'Chuyển khoản',
  wallet: 'Ví điện tử',
};

const REFUND_STATUS_LABEL: Record<string, string> = {
  none: 'Không hoàn tiền',
  pending: 'Chờ hoàn tiền',
  completed: 'Đã hoàn tiền',
};

export const BookingDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { booking, isLoading, error, setBooking } = useBookingDetail(id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async (reasonType: CancelReason, reasonNote?: string): Promise<void> => {
    if (!id) return;
    setIsCancelling(true);
    try {
      const updated = await bookingService.cancelBooking(id, { reasonType, reasonNote });
      setBooking(updated);
      setCancelOpen(false);
      showToast('Đặt phòng đã được hủy thành công', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Không thể hủy đặt phòng', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container-app py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-lg font-semibold text-neutral-900">
          {error ?? 'Không tìm thấy đặt phòng'}
        </p>
        <Button variant="outline" className="mt-5" onClick={() => navigate('/bookings')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div className="container-app py-10">
      {/* Back */}
      <button
        onClick={() => navigate('/bookings')}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors mb-6"
      >
        ← Đặt phòng của tôi
      </button>

      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <p className="text-xs text-neutral-400 font-mono tracking-wide mb-1">
            {booking.bookingRef}
          </p>
          <h1 className="text-2xl font-bold text-neutral-900">Chi tiết đặt phòng</h1>
        </div>
        <BookingStatusBadge status={booking.status} className="text-sm px-3 py-1 self-start" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Room info */}
          {booking.room && (
            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
              {booking.room.imageUrl && (
                <div className="relative aspect-[16/5] overflow-hidden">
                  <img
                    src={booking.room.imageUrl}
                    alt={booking.room.name}
                    width={800}
                    height={250}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
                  Thông tin phòng
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Tên phòng</p>
                    <p className="font-semibold text-neutral-900">{booking.room.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Mã phòng</p>
                    <p className="font-semibold text-neutral-900 font-mono">{booking.room.code}</p>
                  </div>
                  {booking.room.floor && (
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Tầng</p>
                      <p className="font-semibold text-neutral-900">Tầng {booking.room.floor}</p>
                    </div>
                  )}
                  {booking.room.roomTypeName && (
                    <div>
                      <p className="text-xs text-neutral-400 mb-1">Loại phòng</p>
                      <span className="inline-block bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {booking.room.roomTypeName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dates & stay info */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
              Thông tin lưu trú
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Nhận phòng</p>
                <p className="font-semibold text-neutral-900">{formatDate(booking.checkInDate)}</p>
                {booking.actualCheckInAt && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Thực tế: {formatDateTime(booking.actualCheckInAt)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Trả phòng</p>
                <p className="font-semibold text-neutral-900">{formatDate(booking.checkOutDate)}</p>
                {booking.actualCheckOutAt && (
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Thực tế: {formatDateTime(booking.actualCheckOutAt)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Số đêm</p>
                <p className="font-semibold text-neutral-900">{booking.nights} đêm</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Người lớn</p>
                <p className="font-semibold text-neutral-900">{booking.adults} người</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Trẻ em</p>
                <p className="font-semibold text-neutral-900">{booking.children} người</p>
              </div>
              {booking.specialRequests && (
                <div className="col-span-2 sm:col-span-3">
                  <p className="text-xs text-neutral-400 mb-1">Yêu cầu đặc biệt</p>
                  <p className="font-medium text-neutral-700 text-sm">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
              Thanh toán
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-700">
                <span>Giá/đêm</span>
                <span className="font-medium">
                  {formatCurrency(booking.roomRatePerNight, 'VND', 'vi-VN')}
                </span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Số đêm</span>
                <span className="font-medium">× {booking.nights}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-100 text-base">
                <span>Tổng cộng</span>
                <span className="text-primary-600">
                  {formatCurrency(booking.totalAmount, 'VND', 'vi-VN')}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Trạng thái thanh toán</p>
                <PaymentStatusBadge status={booking.paymentStatus} />
              </div>
              {booking.paymentMethod && (
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Phương thức</p>
                  <p className="font-medium text-neutral-700">
                    {PAYMENT_METHOD_LABEL[booking.paymentMethod] ?? booking.paymentMethod}
                  </p>
                </div>
              )}
              {booking.paidAmount > 0 && (
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Đã thanh toán</p>
                  <p className="font-medium text-green-700">
                    {formatCurrency(booking.paidAmount, 'VND', 'vi-VN')}
                  </p>
                </div>
              )}
              {booking.paidAt && (
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Ngày thanh toán</p>
                  <p className="font-medium text-neutral-700">{formatDate(booking.paidAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation info — only when cancelled */}
          {booking.status === 'cancelled' && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
              <h2 className="text-sm font-semibold text-red-700 mb-3">Thông tin hủy phòng</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {booking.cancelledAt && (
                  <div>
                    <p className="text-xs text-red-400 mb-1">Ngày hủy</p>
                    <p className="font-medium text-red-800">{formatDateTime(booking.cancelledAt)}</p>
                  </div>
                )}
                {booking.cancelReason && (
                  <div>
                    <p className="text-xs text-red-400 mb-1">Lý do</p>
                    <p className="font-medium text-red-800 capitalize">
                      {booking.cancelReason.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {booking.cancelNote && (
                  <div className="col-span-2">
                    <p className="text-xs text-red-400 mb-1">Ghi chú</p>
                    <p className="text-red-700">{booking.cancelNote}</p>
                  </div>
                )}
                {booking.refundAmount > 0 && (
                  <div>
                    <p className="text-xs text-red-400 mb-1">Hoàn tiền</p>
                    <p className="font-bold text-red-800">
                      {formatCurrency(booking.refundAmount, 'VND', 'vi-VN')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-red-400 mb-1">Trạng thái hoàn tiền</p>
                  <p className="font-medium text-red-800">
                    {REFUND_STATUS_LABEL[booking.refundStatus] ?? booking.refundStatus}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guest info — only after check-in */}
          {booking.guests?.primary && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
                Khách lưu trú
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Họ tên</p>
                  <p className="font-medium text-neutral-900">{booking.guests.primary.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Số giấy tờ</p>
                  <p className="font-medium text-neutral-900">{booking.guests.primary.idNumber}</p>
                </div>
                {booking.guests.primary.nationality && (
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Quốc tịch</p>
                    <p className="font-medium text-neutral-900">{booking.guests.primary.nationality}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancel action */}
          {canCancel && (
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5">
              <h2 className="text-sm font-semibold text-neutral-700 mb-1">Hủy đặt phòng</h2>
              <p className="text-xs text-neutral-500 mb-4">
                Việc hoàn tiền phụ thuộc vào thời điểm hủy so với ngày nhận phòng.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCancelOpen(true)}
              >
                Hủy đặt phòng
              </Button>
            </div>
          )}

          {/* Late checkout */}
          <LateCheckoutCard bookingId={booking.id} bookingStatus={booking.status} />
        </div>

        {/* Right sidebar — booking summary */}
        <div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 sticky top-20 space-y-4 text-sm">
            {/* Room thumbnail */}
            {booking.room && (
              <div className="space-y-3">
                {booking.room.imageUrl && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <img
                      src={booking.room.imageUrl}
                      alt={booking.room.name}
                      width={400}
                      height={300}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-neutral-900">{booking.room.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {booking.room.roomTypeName && (
                      <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {booking.room.roomTypeName}
                      </span>
                    )}
                    {booking.room.floor && (
                      <span className="text-xs text-neutral-400">Tầng {booking.room.floor}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={booking.room ? 'border-t border-neutral-100 pt-4' : ''}>
              <p className="text-xs text-neutral-400 mb-1">Mã đặt phòng</p>
              <p className="font-mono font-semibold text-neutral-900 text-base tracking-wider">
                {booking.bookingRef}
              </p>
            </div>
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-xs text-neutral-400 mb-1">Ngày đặt</p>
              <p className="font-medium text-neutral-700">{formatDate(booking.createdAt)}</p>
            </div>
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-xs text-neutral-400 mb-2">Trạng thái</p>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="border-t border-neutral-100 pt-4">
              <p className="text-xs text-neutral-400 mb-1">Tổng tiền</p>
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(booking.totalAmount, 'VND', 'vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      <CancelBookingModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        isLoading={isCancelling}
        checkInDate={booking.checkInDate}
        totalAmount={booking.totalAmount}
      />
    </div>
  );
};
