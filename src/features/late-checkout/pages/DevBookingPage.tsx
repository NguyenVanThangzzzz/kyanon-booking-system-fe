import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/common/components/ui/Button';
import type { BookingStatus } from '@/features/booking/types/booking.types';
import { LateCheckoutCard } from '../components/LateCheckoutCard';

const STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show',
];

const STATUS_LABEL_VI: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  checked_in: 'Đã nhận phòng',
  checked_out: 'Đã trả phòng',
  cancelled: 'Đã hủy',
  no_show: 'Không đến',
};

const DevBookingPage = (): JSX.Element => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState<string>(paramId ?? '');
  const [activeId, setActiveId] = useState<string>(paramId ?? '');
  const [status, setStatus] = useState<BookingStatus>('confirmed');

  const handleApply = (): void => {
    const trimmed = bookingId.trim();
    setActiveId(trimmed);
    if (trimmed && trimmed !== paramId) {
      navigate(`/dev/bookings/${trimmed}`, { replace: true });
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 text-sm text-warning-700">
        <p className="font-semibold mb-1">🧪 Dev test page</p>
        <p>
          Trang này chỉ dùng để test view <strong>LateCheckoutCard</strong> khi BE chưa có
          <code className="bg-warning-100 px-1 py-0.5 rounded mx-1">GET /api/v1/bookings/:id</code>.
          Nó bypass việc fetch booking thật, chỉ render card với booking ID và status do bạn chỉ
          định. API late-checkout vẫn được gọi thật.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Cấu hình test</h2>

        <div>
          <label htmlFor="bookingId" className="block text-sm font-medium text-neutral-700 mb-1">
            Booking ID (UUID từ seed DB)
          </label>
          <p className="text-xs text-neutral-500 mb-2">
            Lấy bằng cách query DB:{' '}
            <code className="bg-neutral-100 px-1 py-0.5 rounded">
              SELECT id, booking_ref, status FROM bookings;
            </code>
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="bookingId"
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="VD: 4c8b1234-...-9f1e"
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <Button onClick={handleApply} disabled={!bookingId.trim()}>
              Áp dụng
            </Button>
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">
            Booking status (giả lập)
          </label>
          <p className="text-xs text-neutral-500 mb-2">
            Card chỉ render khi status là <code>confirmed</code> hoặc <code>checked_in</code>.
          </p>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus)}
            className="block w-full sm:w-72 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s} — {STATUS_LABEL_VI[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="text-sm text-neutral-500 mb-1">Booking giả lập</div>
        <div className="text-base font-semibold text-neutral-900">
          Booking #{activeId ? activeId.slice(0, 8).toUpperCase() : '— chưa có'}
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          Status: <span className="font-mono text-neutral-700">{status}</span>
        </div>
      </div>

      {activeId ? (
        <LateCheckoutCard bookingId={activeId} bookingStatus={status} />
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-neutral-300 py-12 text-center text-sm text-neutral-500">
          Nhập Booking ID và bấm <strong>Áp dụng</strong> để render card.
        </div>
      )}
    </div>
  );
};

export { DevBookingPage };
export default DevBookingPage;
