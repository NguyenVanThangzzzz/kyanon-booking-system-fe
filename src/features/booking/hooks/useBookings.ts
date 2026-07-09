import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/booking.service';
import type { Booking } from '../types/booking.types';
import type { ApiError } from '@/types/api.types';

interface UseBookingsReturn {
  bookings: Booking[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBookings = (page: number, limit: number): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    bookingService
      .getBookings({ page, limit })
      .then((data) => {
        if (!cancelled) {
          setBookings(data.data);
          setTotal(data.total);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Failed to load bookings');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, refreshKey]);

  return { bookings, total, isLoading, error, refetch };
};
