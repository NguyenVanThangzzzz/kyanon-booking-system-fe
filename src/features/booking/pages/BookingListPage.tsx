import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyBookings } from '../hooks/useMyBookings';
import { BookingCard } from '../components/BookingCard';
import { Button } from '@/common/components/ui/Button';
import { cn } from '@/common/utils/cn';
import type { BookingStatus } from '../types/booking.types';

const STATUS_FILTERS: Array<{ value: BookingStatus | ''; label: string }> = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'checked_in', label: 'Đang ở' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export const BookingListPage = (): JSX.Element => {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | ''>('');
  const { bookings, isLoading, error, refetch } = useMyBookings();

  const filtered =
    activeFilter === ''
      ? bookings
      : bookings.filter((b) => b.status === activeFilter);

  return (
    <div className="container-app py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Đặt phòng của tôi</h1>
          <p className="text-sm text-neutral-500 mt-1">Quản lý tất cả lịch đặt phòng của bạn</p>
        </div>
        <Link
          to="/rooms"
          className="inline-flex items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 px-4 py-1.5 text-sm font-medium transition-colors"
        >
          + Đặt phòng mới
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              'text-sm px-4 py-1.5 rounded-full transition-all duration-200 font-medium',
              activeFilter === f.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={refetch}
            className="text-xs font-medium text-red-600 hover:text-red-800 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden animate-pulse">
              <div className="bg-neutral-100 px-4 py-3 flex justify-between">
                <div className="h-3 bg-neutral-200 rounded-full w-32" />
                <div className="h-5 bg-neutral-200 rounded-full w-20" />
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-neutral-100 rounded-full w-16" />
                    <div className="h-4 bg-neutral-200 rounded-full w-24" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-neutral-100 rounded-full w-16" />
                    <div className="h-4 bg-neutral-200 rounded-full w-24" />
                  </div>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full w-2/3" />
                <div className="pt-2 border-t border-neutral-100 flex justify-between">
                  <div className="h-5 bg-neutral-200 rounded-full w-28" />
                  <div className="h-4 bg-neutral-100 rounded-full w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {activeFilter ? 'Không có đặt phòng nào' : 'Bạn chưa có đặt phòng nào'}
          </h3>
          <p className="text-neutral-500 mt-1 mb-6">
            {activeFilter
              ? 'Không có đặt phòng nào ở trạng thái này'
              : 'Khám phá phòng và đặt ngay hôm nay!'}
          </p>
          {!activeFilter && (
            <Link
              to="/rooms"
              className="inline-flex items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 px-5 py-2 text-sm font-medium transition-colors"
            >
              Xem danh sách phòng
            </Link>
          )}
          {activeFilter && (
            <Button variant="outline" onClick={() => setActiveFilter('')}>
              Xem tất cả đặt phòng
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};
