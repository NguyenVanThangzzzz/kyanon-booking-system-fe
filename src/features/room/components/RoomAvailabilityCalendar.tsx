import { useMemo } from 'react';
import { cn } from '@/common/utils/cn';
import { useRoomMonthSlots } from '../hooks/useRoomMonthSlots';
import type { RoomDateSlot, RoomSlotStatus, BlockedSlotReason } from '../types/room.types';

interface RoomAvailabilityCalendarProps {
  roomId: string;
  selectedCheckIn?: string;
  selectedCheckOut?: string;
  mode: 'check-in' | 'check-out';
  onPickDate: (date: string) => void;
  className?: string;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const BLOCKED_REASON_LABELS: Record<BlockedSlotReason, string> = {
  maintenance: 'Maintenance',
  cleaning: 'Cleaning',
  event: 'Internal Event',
  other: 'Other Reason',
};

const STATUS_LABELS: Record<RoomSlotStatus, string> = {
  available: 'Available',
  booked: 'Booked',
  locked: 'On Hold',
  blocked: 'Blocked',
  maintenance: 'Under Maintenance',
  inactive: 'Deactivated',
  closed: 'Closed',
};

const formatDateKey = (year: number, month: number, day: number): string => {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

const todayDateKey = (): string => {
  const now = new Date();
  return formatDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
};

interface CalendarCell {
  day: number | null;
  dateKey: string | null;
}

const buildMonthCells = (year: number, month: number): CalendarCell[] => {
  const firstDayUTC = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekday = firstDayUTC.getUTCDay(); // 0=Sun..6=Sat
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push({ day: null, dateKey: null });
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ day: d, dateKey: formatDateKey(year, month, d) });
  }
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push({ day: null, dateKey: null });
  return cells;
};

const getSlotDotColor = (status: RoomSlotStatus): string => {
  switch (status) {
    case 'booked':  return 'bg-error';
    case 'blocked': return 'bg-orange-400';
    case 'maintenance':
    case 'inactive': return 'bg-neutral-400';
    default:        return 'bg-neutral-300';
  }
};

const getCellTooltip = (slot: RoomDateSlot | undefined): string => {
  if (!slot) return '';
  if (slot.is_available) return STATUS_LABELS.available;
  if (slot.status === 'blocked' && slot.blocked_reason) {
    return `${STATUS_LABELS.blocked}: ${BLOCKED_REASON_LABELS[slot.blocked_reason]}`;
  }
  return STATUS_LABELS[slot.status];
};

export const RoomAvailabilityCalendar = ({
  roomId,
  selectedCheckIn,
  selectedCheckOut,
  mode,
  onPickDate,
  className,
}: RoomAvailabilityCalendarProps) => {
  const { year, month, slotsByDate, isLoading, error, goToPrevMonth, goToNextMonth } =
    useRoomMonthSlots(roomId);

  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const today = todayDateKey();

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="w-8 h-8 rounded-full hover:bg-neutral-100 text-neutral-600 flex items-center justify-center transition-colors"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-neutral-900">
          {MONTH_LABELS[month - 1]} {year}
        </p>
        <button
          type="button"
          onClick={goToNextMonth}
          className="w-8 h-8 rounded-full hover:bg-neutral-100 text-neutral-600 flex items-center justify-center transition-colors"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="text-xs text-neutral-400 text-center font-medium py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Cells */}
      {error ? (
        <div className="text-sm text-error text-center py-8">{error}</div>
      ) : (
        <div className={cn('grid grid-cols-7 gap-1', isLoading && 'opacity-50')}>
          {cells.map((cell, idx) => {
            if (cell.day === null || cell.dateKey === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const slot = slotsByDate.get(cell.dateKey);
            const isPast = cell.dateKey < today;
            const isToday = cell.dateKey === today;
            const isCheckIn = cell.dateKey === selectedCheckIn;
            const isCheckOut = cell.dateKey === selectedCheckOut;
            const isInRange =
              selectedCheckIn !== undefined &&
              selectedCheckOut !== undefined &&
              cell.dateKey > selectedCheckIn &&
              cell.dateKey < selectedCheckOut;

            const checkOutMinReached =
              mode === 'check-out' &&
              selectedCheckIn !== undefined &&
              cell.dateKey <= selectedCheckIn;

            const isDisabled =
              isPast || !slot || !slot.is_available || checkOutMinReached;

            return (
              <button
                key={cell.dateKey}
                type="button"
                disabled={isDisabled}
                onClick={() => onPickDate(cell.dateKey!)}
                title={isPast ? 'Past date' : getCellTooltip(slot)}
                className={cn(
                  'aspect-square rounded-lg text-sm font-medium relative transition-colors',
                  'flex items-center justify-center',
                  isDisabled && 'text-neutral-300 cursor-not-allowed bg-neutral-50',
                  !isDisabled && !isCheckIn && !isCheckOut && 'text-neutral-700 hover:bg-primary-50 hover:text-primary-700',
                  isInRange && !isCheckIn && !isCheckOut && 'bg-primary-50 text-primary-700',
                  (isCheckIn || isCheckOut) && 'bg-primary-500 text-white hover:bg-primary-600',
                  isToday && !isCheckIn && !isCheckOut && 'ring-1 ring-primary-400',
                )}
              >
                {cell.day}
                {slot && !slot.is_available && !isPast && (
                  <span
                    className={cn(
                      'absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                      getSlotDotColor(slot.status),
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-error" />
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          Blocked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-neutral-400" />
          Maintenance / Closed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary-500" />
          Selected
        </span>
      </div>
    </div>
  );
};
