import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/booking.service';
import type { Booking } from '../types/booking.types';
import type { ApiError } from '@/types/api.types';

interface UseBookingDetailReturn {
  booking: Booking | null;
  isLoading: boolean;
  error: string | null;
  setBooking: (b: Booking) => void;
  refetch: () => void;
}

export const useBookingDetail = (id: string | undefined): UseBookingDetailReturn => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    bookingService
      .getBookingById(id)
      .then((data) => {
        if (!cancelled) setBooking(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Không thể tải thông tin đặt phòng');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, refreshKey]);

  return { booking, isLoading, error, setBooking, refetch };
};
