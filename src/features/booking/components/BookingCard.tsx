import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/common/utils/format';
import { BookingStatusBadge } from './BookingStatusBadge';
import { cn } from '@/common/utils/cn';
import type { Booking } from '../types/booking.types';

interface BookingCardProps {
  booking: Booking;
}

const RoomImagePlaceholder = () => (
  <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
    <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  </div>
);

export const BookingCard = ({ booking }: BookingCardProps) => {
  const nights = booking.nights ?? 1;
  const room = booking.room;

  return (
    <Link
      to={`/bookings/${booking.id}`}
      className="group block bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Room image */}
      <div className="relative aspect-[16/7] overflow-hidden bg-neutral-100">
        {room?.imageUrl ? (
          <img
            src={room.imageUrl}
            alt={room.name}
            width={400}
            height={175}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <RoomImagePlaceholder />
        )}
        {/* Room type badge overlay */}
        {room?.roomTypeName && (
          <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {room.roomTypeName}
          </span>
        )}
        {/* Status badge overlay */}
        <span className="absolute top-2.5 right-2.5">
          <BookingStatusBadge status={booking.status} />
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Room name + code */}
        {room ? (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate">{room.name}</p>
              <p className={cn(
                'text-xs text-neutral-400 mt-0.5 font-mono',
              )}>
                #{room.code}{room.floor ? ` · Tầng ${room.floor}` : ''}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 font-mono">{booking.bookingRef}</p>
        )}

        {/* Booking ref (small, below room name) */}
        {room && (
          <p className="text-xs text-neutral-400 font-mono -mt-1">{booking.bookingRef}</p>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-neutral-400 mb-0.5">Nhận phòng</p>
            <p className="font-semibold text-neutral-900">{formatDate(booking.checkInDate)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 mb-0.5">Trả phòng</p>
            <p className="font-semibold text-neutral-900">{formatDate(booking.checkOutDate)}</p>
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>{nights} đêm</span>
          <span className="text-neutral-200">·</span>
          <span>{booking.adults} người lớn{booking.children > 0 ? `, ${booking.children} trẻ em` : ''}</span>
        </div>

        {/* Price + arrow */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <p className="text-base font-bold text-primary-600">
            {formatCurrency(booking.totalAmount, 'VND', 'vi-VN')}
          </p>
          <span className="text-neutral-400 group-hover:text-primary-500 transition-colors text-sm">
            Xem chi tiết →
          </span>
        </div>
      </div>
    </Link>
  );
};
