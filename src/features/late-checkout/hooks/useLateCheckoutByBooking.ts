import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from '@/types/api.types';
import { lateCheckoutService } from '../services/late-checkout.service';
import type { LateCheckout } from '../types/late-checkout.types';

interface UseLateCheckoutByBookingReturn {
  lateCheckout: LateCheckout | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  requestLateCheckout: (requestedUntil: string) => Promise<LateCheckout>;
}

export const useLateCheckoutByBooking = (
  bookingId: string | null,
): UseLateCheckoutByBookingReturn => {
  const [lateCheckout, setLateCheckout] = useState<LateCheckout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback((): void => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!bookingId) {
      setLateCheckout(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    lateCheckoutService
      .getByBooking(bookingId)
      .then((data) => {
        if (!cancelled) setLateCheckout(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Không thể tải yêu cầu trả phòng muộn');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId, refreshKey]);

  const requestLateCheckout = useCallback(
    async (requestedUntil: string): Promise<LateCheckout> => {
      if (!bookingId) {
        throw new Error('Missing booking id');
      }
      const created = await lateCheckoutService.requestLateCheckout(bookingId, {
        requested_until: requestedUntil,
      });
      setLateCheckout(created);
      return created;
    },
    [bookingId],
  );

  return { lateCheckout, isLoading, error, refetch, requestLateCheckout };
};
