import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/booking.service';
import type { Booking, BookingFilters } from '../types/booking.types';
import type { ApiError } from '@/types/api.types';

interface UseAdminBookingsReturn {
  bookings: Booking[];
  total: number;
  pages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAdminBookings = (filters: BookingFilters): UseAdminBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    bookingService
      .getAllBookings(filters)
      .then((res) => {
        if (!cancelled) {
          setBookings(res.data.data);
          setTotal(res.data.pagination.total);
          setPages(res.data.pagination.pages);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.status, filters.sort_by, filters.sort_order, refreshKey]);

  return { bookings, total, pages, isLoading, error, refetch };
};
