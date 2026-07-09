import { useState } from 'react';
import { Badge } from '@/common/components/ui/Badge/Badge';
import { Modal } from '@/common/components/ui/Modal';
import { Button } from '@/common/components/ui/Button';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { usePagination } from '@/common/hooks/usePagination';
import { formatCurrency, formatDate } from '@/common/utils/format';
import { useAdminBookings } from '@/features/booking/hooks/useAdminBookings';
import { bookingService } from '@/features/booking/services/booking.service';
import { BookingStatusBadge, PaymentStatusBadge } from '@/features/booking/components/BookingStatusBadge';
import { CheckInModal } from '@/features/booking/components/CheckInModal';
import { CheckOutModal } from '@/features/booking/components/CheckOutModal';
import { CancelBookingModal } from '@/features/booking/components/CancelBookingModal';
import {
  BookingActionsDropdown,
} from '@/features/booking/components/BookingActionsDropdown';
import type { BookingAction, BookingActionKey } from '@/features/booking/components/BookingActionsDropdown';
import type { Booking, BookingStatus, CheckInRequest, CancelReason } from '@/features/booking/types/booking.types';
import type { ApiError } from '@/types/api.types';

const STATUS_OPTIONS: Array<{ value: BookingStatus | ''; label: string }> = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'checked_in', label: 'Đang ở' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'no_show', label: 'Không đến' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Ngày đặt' },
  { value: 'checkInDate', label: 'Ngày nhận phòng' },
  { value: 'totalAmount', label: 'Tổng tiền' },
] as const;

type SortBy = 'createdAt' | 'checkInDate' | 'totalAmount' | 'status';

/** Build the dropdown actions for each booking based on its status */
const buildActions = (booking: Booking): BookingAction[] => {
  const actions: BookingAction[] = [];

  if (booking.status === 'pending') {
    actions.push({ key: 'confirm', label: 'Xác nhận đặt phòng', variant: 'primary' });
    actions.push({ key: 'cancel', label: 'Hủy đặt phòng', variant: 'danger' });
  }

  if (booking.status === 'confirmed') {
    actions.push({ key: 'check-in', label: 'Nhận phòng', variant: 'success' });
    actions.push({ key: 'no-show', label: 'Đánh dấu không đến', variant: 'warning' });
    actions.push({ key: 'cancel', label: 'Hủy đặt phòng', variant: 'danger' });
  }

  if (booking.status === 'checked_in') {
    actions.push({ key: 'check-out', label: 'Trả phòng', variant: 'neutral' });
  }

  return actions;
};

interface SimpleActionState {
  booking: Booking;
  action: 'confirm' | 'no-show';
}

export const DashboardBookingsPage = (): JSX.Element => {
  const { showToast } = useToast();
  const { page, limit, nextPage, prevPage, setPage } = usePagination({ initialLimit: 10 });
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [simpleAction, setSimpleAction] = useState<SimpleActionState | null>(null);
  const [checkInTarget, setCheckInTarget] = useState<Booking | null>(null);
  const [checkOutTarget, setCheckOutTarget] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [isActing, setIsActing] = useState(false);

  const { bookings, total, pages, isLoading, error, refetch } = useAdminBookings({
    page,
    limit,
    sort_by: sortBy,
    sort_order: sortOrder,
    status: statusFilter || undefined,
  });

  const totalPages = Math.max(1, pages);

  const handleStatusFilterChange = (val: BookingStatus | ''): void => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleActionClick = (booking: Booking, key: BookingActionKey): void => {
    if (key === 'check-in') { setCheckInTarget(booking); return; }
    if (key === 'check-out') { setCheckOutTarget(booking); return; }
    if (key === 'cancel') { setCancelTarget(booking); return; }
    // confirm / no-show → simple modal
    setSimpleAction({ booking, action: key as 'confirm' | 'no-show' });
  };

  /* ── Simple actions: confirm / no-show ── */
  const handleSimpleAction = async (): Promise<void> => {
    if (!simpleAction) return;
    const { booking, action } = simpleAction;
    setIsActing(true);
    try {
      if (action === 'confirm') await bookingService.confirmBooking(booking.id);
      else await bookingService.markNoShow(booking.id);
      showToast(`Cập nhật thành công — ${booking.bookingRef}`, 'success');
      setSimpleAction(null);
      refetch();
    } catch (err) {
      showToast((err as ApiError).message ?? 'Thao tác thất bại', 'error');
    } finally {
      setIsActing(false);
    }
  };

  /* ── Check-in ── */
  const handleCheckIn = async (data: CheckInRequest): Promise<void> => {
    if (!checkInTarget) return;
    setIsActing(true);
    try {
      await bookingService.checkIn(checkInTarget.id, data);
      showToast(`Nhận phòng thành công — ${checkInTarget.bookingRef}`, 'success');
      setCheckInTarget(null);
      refetch();
    } catch (err) {
      showToast((err as ApiError).message ?? 'Nhận phòng thất bại', 'error');
    } finally {
      setIsActing(false);
    }
  };

  /* ── Check-out ── */
  const handleCheckOut = async (actualCheckOutAt?: string): Promise<void> => {
    if (!checkOutTarget) return;
    setIsActing(true);
    try {
      await bookingService.checkOut(checkOutTarget.id, actualCheckOutAt ? { actualCheckOutAt } : {});
      showToast(`Trả phòng thành công — ${checkOutTarget.bookingRef}`, 'success');
      setCheckOutTarget(null);
      refetch();
    } catch (err) {
      showToast((err as ApiError).message ?? 'Trả phòng thất bại', 'error');
    } finally {
      setIsActing(false);
    }
  };

  /* ── Cancel (admin) ── */
  const handleCancel = async (reasonType: CancelReason, reasonNote?: string): Promise<void> => {
    if (!cancelTarget) return;
    setIsActing(true);
    try {
      await bookingService.cancelBooking(cancelTarget.id, { reasonType, reasonNote });
      showToast(`Đã hủy đặt phòng — ${cancelTarget.bookingRef}`, 'success');
      setCancelTarget(null);
      refetch();
    } catch (err) {
      showToast((err as ApiError).message ?? 'Hủy đặt phòng thất bại', 'error');
    } finally {
      setIsActing(false);
    }
  };

  const SIMPLE_META: Record<
    'confirm' | 'no-show',
    { title: string; description: string; confirmLabel: string; confirmVariant: 'primary' | 'danger' }
  > = {
    confirm: {
      title: 'Xác nhận đặt phòng',
      description: `Xác nhận booking ${simpleAction?.booking.bookingRef ?? ''}? Trạng thái sẽ chuyển sang "Đã xác nhận".`,
      confirmLabel: 'Xác nhận',
      confirmVariant: 'primary',
    },
    'no-show': {
      title: 'Đánh dấu Không đến',
      description: `Booking ${simpleAction?.booking.bookingRef ?? ''} sẽ được đánh dấu "Không đến". Phòng sẽ được giải phóng.`,
      confirmLabel: 'Đánh dấu không đến',
      confirmVariant: 'danger',
    },
  };

  const simpleMeta = simpleAction ? SIMPLE_META[simpleAction.action] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Quản lý Đặt phòng</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Xem, xác nhận và xử lý tất cả các đặt phòng
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value as BookingStatus | '')}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as SortBy); setPage(1); }}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>Sắp xếp: {opt.label}</option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => { setSortOrder(e.target.value as 'asc' | 'desc'); setPage(1); }}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="desc">Mới nhất trước</option>
          <option value="asc">Cũ nhất trước</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 text-sm border-b border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Mã đặt phòng</th>
                <th className="text-left px-4 py-3 font-semibold">Nhận phòng</th>
                <th className="text-left px-4 py-3 font-semibold">Trả phòng</th>
                <th className="text-center px-4 py-3 font-semibold">Đêm</th>
                <th className="text-center px-4 py-3 font-semibold">Khách</th>
                <th className="text-right px-4 py-3 font-semibold">Tổng tiền</th>
                <th className="text-left px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-left px-4 py-3 font-semibold">Thanh toán</th>
                <th className="text-right px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 bg-neutral-200 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-neutral-500">
                    <div className="text-4xl mb-2">📋</div>
                    Không có đặt phòng nào phù hợp
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-neutral-700 tracking-wide">
                        {booking.bookingRef}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {formatDate(booking.checkInDate)}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {formatDate(booking.checkOutDate)}
                    </td>
                    <td className="px-4 py-3 text-center text-neutral-600">{booking.nights}</td>
                    <td className="px-4 py-3 text-center text-neutral-600">
                      {booking.adults + booking.children}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-neutral-800">
                      {formatCurrency(booking.totalAmount, 'VND', 'vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={booking.paymentStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BookingActionsDropdown
                        actions={buildActions(booking)}
                        onAction={(key) => handleActionClick(booking, key)}
                        disabled={isActing}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && bookings.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-sm">
            <Badge variant="default">
              Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}
            </Badge>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Trước
              </button>
              <span className="text-neutral-500 text-xs">{page} / {totalPages}</span>
              <button
                onClick={nextPage}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Xác nhận / Không đến ── */}
      {simpleMeta && (
        <Modal
          isOpen={simpleAction !== null}
          onClose={() => setSimpleAction(null)}
          title={simpleMeta.title}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">{simpleMeta.description}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSimpleAction(null)}
                disabled={isActing}
                className="flex-1"
              >
                Hủy bỏ
              </Button>
              <Button
                variant={simpleMeta.confirmVariant}
                onClick={() => { void handleSimpleAction(); }}
                isLoading={isActing}
                className="flex-1"
              >
                {simpleMeta.confirmLabel}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal: Nhận phòng ── */}
      <CheckInModal
        isOpen={checkInTarget !== null}
        onClose={() => setCheckInTarget(null)}
        onSubmit={handleCheckIn}
        isLoading={isActing}
        bookingRef={checkInTarget?.bookingRef ?? ''}
      />

      {/* ── Modal: Trả phòng ── */}
      <CheckOutModal
        isOpen={checkOutTarget !== null}
        onClose={() => setCheckOutTarget(null)}
        onSubmit={handleCheckOut}
        isLoading={isActing}
        bookingRef={checkOutTarget?.bookingRef ?? ''}
        checkOutDate={checkOutTarget?.checkOutDate ?? ''}
      />

      {/* ── Modal: Hủy đặt phòng (admin) ── */}
      <CancelBookingModal
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        isLoading={isActing}
        checkInDate={cancelTarget?.checkInDate ?? ''}
        totalAmount={cancelTarget ? Number(cancelTarget.totalAmount) : 0}
        isAdmin
      />
    </div>
  );
};
