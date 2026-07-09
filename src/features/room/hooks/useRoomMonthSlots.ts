import { useEffect, useMemo, useState, useCallback } from 'react';
import { roomService } from '../services/room.service';
import type { RoomDateSlot } from '../types/room.types';
import type { ApiError } from '@/types/api.types';

interface UseRoomMonthSlotsReturn {
  year: number;
  month: number;
  slotsByDate: Map<string, RoomDateSlot>;
  isLoading: boolean;
  error: string | null;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  setYearMonth: (year: number, month: number) => void;
}

const todayYearMonth = (): { year: number; month: number } => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

export const useRoomMonthSlots = (roomId: string | undefined): UseRoomMonthSlotsReturn => {
  const [{ year, month }, setYM] = useState(todayYearMonth);
  const [slots, setSlots] = useState<RoomDateSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    roomService
      .getRoomSlotsMonth(roomId, year, month)
      .then((response) => {
        if (!cancelled) setSlots(response.slots);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Cannot load room calendar');
          setSlots([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomId, year, month]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, RoomDateSlot>();
    for (const s of slots) map.set(s.date, s);
    return map;
  }, [slots]);

  const goToPrevMonth = useCallback(() => {
    setYM((cur) => {
      if (cur.month === 1) return { year: cur.year - 1, month: 12 };
      return { year: cur.year, month: cur.month - 1 };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setYM((cur) => {
      if (cur.month === 12) return { year: cur.year + 1, month: 1 };
      return { year: cur.year, month: cur.month + 1 };
    });
  }, []);

  const setYearMonth = useCallback((y: number, m: number) => {
    setYM({ year: y, month: m });
  }, []);

  return { year, month, slotsByDate, isLoading, error, goToPrevMonth, goToNextMonth, setYearMonth };
};
