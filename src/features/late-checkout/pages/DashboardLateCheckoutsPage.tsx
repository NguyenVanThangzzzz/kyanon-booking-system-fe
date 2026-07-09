import { LateCheckoutDetailCard } from '../components/LateCheckoutDetailCard';
import { LateCheckoutLookupForm } from '../components/LateCheckoutLookupForm';
import { useLateCheckoutLookup } from '../hooks/useLateCheckoutLookup';
import type { LateCheckout } from '../types/late-checkout.types';

const DashboardLateCheckoutsPage = (): JSX.Element => {
  const { lateCheckout, bookingIdSearched, isLoading, error, notFound, lookup, setLateCheckout } =
    useLateCheckoutLookup();

  const handleLookup = async (bookingId: string): Promise<void> => {
    await lookup(bookingId);
  };

  const handleUpdated = (updated: LateCheckout): void => {
    setLateCheckout(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Trả phòng muộn</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Tra cứu và xử lý yêu cầu trả phòng muộn từ khách.
        </p>
      </div>

      <div className="bg-info-50 border border-info-100 rounded-xl p-3 text-sm text-info-700">
        <p className="font-medium mb-1">Tra cứu theo mã booking</p>
        <p className="text-xs">
          Hiện tại hệ thống chưa hỗ trợ danh sách đầy đủ. Vui lòng nhập mã booking để xem yêu cầu
          trả phòng muộn tương ứng.
        </p>
      </div>

      <LateCheckoutLookupForm onLookup={handleLookup} isLoading={isLoading} />

      {error && (
        <div className="bg-error-50 border border-error-100 rounded-xl px-4 py-3 text-sm text-error-700">
          {error}
        </div>
      )}

      {!isLoading && !error && bookingIdSearched && notFound && (
        <div className="bg-white border border-neutral-200 rounded-2xl py-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="text-base font-semibold text-neutral-900">
            Không có yêu cầu trả phòng muộn
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Booking{' '}
            <span className="font-mono text-neutral-700">{bookingIdSearched.slice(0, 8)}…</span>{' '}
            chưa có yêu cầu trả phòng muộn nào.
          </p>
        </div>
      )}

      {lateCheckout && (
        <LateCheckoutDetailCard lateCheckout={lateCheckout} onUpdated={handleUpdated} />
      )}

      {!bookingIdSearched && !isLoading && (
        <div className="bg-white border border-neutral-200 rounded-2xl py-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-base font-semibold text-neutral-900">Tra cứu để bắt đầu</h3>
          <p className="text-sm text-neutral-500 mt-1">
            Nhập mã booking ở form trên để xem chi tiết yêu cầu trả phòng muộn.
          </p>
        </div>
      )}
    </div>
  );
};

export { DashboardLateCheckoutsPage };
export default DashboardLateCheckoutsPage;
