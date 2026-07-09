import { useCallback, useState } from 'react';
import type { ApiError } from '@/types/api.types';
import { lateCheckoutService } from '../services/late-checkout.service';
import type { LateCheckout } from '../types/late-checkout.types';

interface UseLateCheckoutLookupReturn {
  lateCheckout: LateCheckout | null;
  bookingIdSearched: string | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  lookup: (bookingId: string) => Promise<void>;
  setLateCheckout: (lc: LateCheckout | null) => void;
  reset: () => void;
}

export const useLateCheckoutLookup = (): UseLateCheckoutLookupReturn => {
  const [lateCheckout, setLateCheckout] = useState<LateCheckout | null>(null);
  const [bookingIdSearched, setBookingIdSearched] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const lookup = useCallback(async (bookingId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    setBookingIdSearched(bookingId);
    try {
      const data = await lateCheckoutService.getByBooking(bookingId);
      setLateCheckout(data);
      if (!data) setNotFound(true);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setLateCheckout(null);
      if (apiError.statusCode === 404) {
        setNotFound(true);
      } else {
        setError(apiError.message ?? 'Không thể tra cứu yêu cầu trả phòng muộn');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback((): void => {
    setLateCheckout(null);
    setBookingIdSearched(null);
    setError(null);
    setNotFound(false);
  }, []);

  return {
    lateCheckout,
    bookingIdSearched,
    isLoading,
    error,
    notFound,
    lookup,
    setLateCheckout,
    reset,
  };
};
