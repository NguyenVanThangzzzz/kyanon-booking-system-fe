import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/common/utils/format';
import { Modal } from '@/common/components/ui/Modal';
import { RoomAvailabilityCalendar } from './RoomAvailabilityCalendar';
import { roomService } from '@/features/room/services/room.service';
import { cn } from '@/common/utils/cn';
import type { BlockedSlotReason, Room, RoomSlotStatus } from '../types/room.types';

interface BookingWidgetProps {
  room: Room;
}

interface UnavailableState {
  status: RoomSlotStatus;
  blocked_reason?: BlockedSlotReason;
}

const today = new Date().toISOString().split('T')[0] ?? '';
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0] ?? '';

const diffDays = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86400000));
};

const BLOCKED_REASON_LABELS: Record<BlockedSlotReason, string> = {
  maintenance: 'maintenance',
  cleaning: 'cleaning',
  event: 'internal event',
  other: 'other reason',
};

function getModalIconConfig(info: UnavailableState): { bg: string; color: string } {
  if (info.status === 'maintenance') return { bg: 'bg-amber-50', color: 'text-amber-500' };
  if (info.status === 'inactive') return { bg: 'bg-error/10', color: 'text-error' };
  if (info.status === 'closed') return { bg: 'bg-neutral-100', color: 'text-neutral-500' };
  return { bg: 'bg-warning/10', color: 'text-warning' };
}

function getStatusTag(info: UnavailableState): string {
  if (info.status === 'blocked') {
    const reasonLabel = BLOCKED_REASON_LABELS[info.blocked_reason ?? 'other'];
    return `Blocked · ${reasonLabel.charAt(0).toUpperCase() + reasonLabel.slice(1)}`;
  }
  switch (info.status) {
    case 'maintenance': return 'Under Maintenance';
    case 'closed':      return 'No Operating Schedule';
    case 'inactive':    return 'Deactivated';
    default:            return 'Unavailable';
  }
}

function getUnavailableMessage(info: UnavailableState, checkInDate: string): { title: string; description: string } {
  const dateLabel = formatDate(checkInDate);
  switch (info.status) {
    case 'blocked':
      return {
        title: 'Room cannot be booked',
        description: `${dateLabel} is not available for booking. Please select a different check-in date.`,
      };
    case 'maintenance':
      return {
        title: 'Room under maintenance',
        description: `The room is not accepting guests on ${dateLabel}. Please choose another date.`,
      };
    case 'closed':
      return {
        title: 'Room not operating',
        description: `The room is not open on ${dateLabel}. Please choose another date.`,
      };
    case 'inactive':
      return {
        title: 'Room deactivated',
        description: 'This room is no longer accepting guests. Please choose another room.',
      };
    default:
      return {
        title: 'Cannot book room',
        description: `The room is unavailable on ${dateLabel}. Please try another date.`,
      };
  }
}

export const BookingWidget = ({ room }: BookingWidgetProps) => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [calendarMode, setCalendarMode] = useState<'check-in' | 'check-out' | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [unavailable, setUnavailable] = useState<UnavailableState | null>(null);

  const nights = diffDays(checkIn, checkOut);
  const pricePerNight = room.roomType?.basePricePerNight ?? 0;
  const subtotal = pricePerNight * nights;

  const handlePickDate = (date: string) => {
    if (calendarMode === 'check-in') {
      setCheckIn(date);
      if (checkOut <= date) {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        setCheckOut(next.toISOString().split('T')[0] ?? '');
      }
      setCalendarMode('check-out');
    } else {
      setCheckOut(date);
      setCalendarMode(null);
    }
  };

  const handleBook = async () => {
    setIsChecking(true);
    try {
      const range = await roomService.getRoomSlotsRange(room.id, checkIn, checkOut);
      if (!range.all_available) {
        const firstUnavailable = range.slots.find((s) => !s.is_available);
        if (firstUnavailable) {
          setUnavailable({
            status: firstUnavailable.status,
            blocked_reason: firstUnavailable.blocked_reason,
          });
          return;
        }
      }

      const slot = await roomService.getRoomSlotAvailability(room.id, checkIn);
      if (!slot.is_available && slot.status !== 'booked') {
        setUnavailable({ status: slot.status, blocked_reason: slot.blocked_reason });
        return;
      }
      const params = new URLSearchParams({ roomId: room.id, checkIn, checkOut });
      void navigate(`/bookings/new?${params.toString()}`);
    } finally {
      setIsChecking(false);
    }
  };

  const modalInfo = unavailable ? getUnavailableMessage(unavailable, checkIn) : null;
  const modalIcon = unavailable ? getModalIconConfig(unavailable) : null;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-widget border border-neutral-100 p-6 sticky top-20">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-6">
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(pricePerNight)}
          </span>
          <span className="text-neutral-400 text-sm">/night</span>
        </div>

        {/* Date picker */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden mb-3">
          <div className="grid grid-cols-2 divide-x divide-neutral-200">
            <button
              type="button"
              onClick={() => setCalendarMode((m) => (m === 'check-in' ? null : 'check-in'))}
              className={cn('p-3 text-left transition-colors', calendarMode === 'check-in' && 'bg-primary-50')}
            >
              <p className="text-xs font-medium text-neutral-400 mb-1">CHECK-IN</p>
              <p className="text-sm font-semibold text-neutral-800">{formatDate(checkIn)}</p>
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode((m) => (m === 'check-out' ? null : 'check-out'))}
              className={cn('p-3 text-left transition-colors', calendarMode === 'check-out' && 'bg-primary-50')}
            >
              <p className="text-xs font-medium text-neutral-400 mb-1">CHECK-OUT</p>
              <p className="text-sm font-semibold text-neutral-800">{formatDate(checkOut)}</p>
            </button>
          </div>
        </div>

        {calendarMode !== null && (
          <RoomAvailabilityCalendar
            roomId={room.id}
            selectedCheckIn={checkIn}
            selectedCheckOut={checkOut}
            mode={calendarMode}
            onPickDate={handlePickDate}
            className="mb-3"
          />
        )}

        {/* CTA */}
        <button
          onClick={() => { void handleBook(); }}
          disabled={isChecking || room.status !== 'available'}
          className="btn-primary w-full py-3.5 text-base rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isChecking
            ? 'Checking...'
            : room.status === 'maintenance'
              ? 'Under Maintenance'
              : room.status === 'inactive'
                ? 'Room Unavailable'
                : 'Book now'}
        </button>

        <p className="text-center text-xs text-neutral-400 mt-3">
          {room.status === 'maintenance'
            ? 'This room is temporarily under maintenance'
            : room.status === 'inactive'
              ? 'This room is no longer accepting bookings'
              : 'No charge yet — confirm before payment'}
        </p>

        {/* Price breakdown */}
        <div className="border-t border-neutral-100 mt-5 pt-5 space-y-3">
          <div className="flex justify-between text-sm text-neutral-600">
            <span>{formatCurrency(pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-neutral-900 pt-3 border-t border-neutral-200">
            <span>Subtotal</span>
            <span className="text-primary-600">{formatCurrency(subtotal)}</span>
          </div>
          <p className="text-xs text-neutral-400 italic">
            Taxes & fees will be calculated at the booking step
          </p>
        </div>
      </div>

      {modalInfo && modalIcon && (
        <Modal
          isOpen={unavailable !== null}
          onClose={() => setUnavailable(null)}
          title={modalInfo.title}
          size="sm"
        >
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', modalIcon.bg)}>
              <svg className={cn('w-6 h-6', modalIcon.color)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            {unavailable && (
              <span className={cn('text-xs font-medium px-3 py-1 rounded-full', modalIcon.bg, modalIcon.color)}>
                {getStatusTag(unavailable)}
              </span>
            )}
            <p className="text-sm text-neutral-600">{modalInfo.description}</p>
            <button
              onClick={() => setUnavailable(null)}
              className="btn-primary w-full py-2.5 rounded-full text-sm"
            >
              Understood
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};
