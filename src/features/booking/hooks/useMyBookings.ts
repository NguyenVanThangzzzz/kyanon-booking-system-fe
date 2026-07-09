import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/booking.service';
import type { Booking } from '../types/booking.types';
import type { ApiError } from '@/types/api.types';

interface UseMyBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMyBookings = (): UseMyBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    bookingService
      .getMyBookings()
      .then((data) => {
        if (!cancelled) setBookings(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Không thể tải danh sách đặt phòng');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { bookings, isLoading, error, refetch };
};
