import { useState, useEffect, useRef, useCallback } from 'react';
import { bookingService } from '@/features/booking/services/booking.service';

const COUNTDOWN_SECONDS = 120;

export interface UsePaymentCountdownReturn {
  secondsLeft: number;
  isExpired: boolean;
  isCancelling: boolean;
  isActive: boolean;
}

/**
 * Counts down from booking.createdAt + 2 minutes.
 * When time runs out, auto-cancels the booking and calls onExpired().
 * Persists correctly across page refreshes since deadline is derived from server time.
 */
export const usePaymentCountdown = (
  bookingId: string | undefined,
  bookingCreatedAt: string | undefined,
  onExpired: () => void,
): UsePaymentCountdownReturn => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const hasCancelledRef = useRef(false);
  const onExpiredRef = useRef(onExpired);

  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  useEffect(() => {
    if (!bookingId || !bookingCreatedAt) return;

    const deadline = new Date(bookingCreatedAt).getTime() + COUNTDOWN_SECONDS * 1000;
    const initialRemaining = Math.floor((deadline - Date.now()) / 1000);

    // Already expired before page loaded
    if (initialRemaining <= 0) {
      setSecondsLeft(0);
      setIsExpired(true);
      setIsActive(false);
      if (!hasCancelledRef.current) {
        hasCancelledRef.current = true;
        setIsCancelling(true);
        void bookingService
          .cancelBooking(bookingId, {
            reasonType: 'user_request',
            reasonNote: 'Hết thời gian thanh toán',
          })
          .finally(() => {
            setIsCancelling(false);
            onExpiredRef.current();
          });
      }
      return;
    }

    setIsActive(true);
    setSecondsLeft(initialRemaining);

    const id = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining === 0 && !hasCancelledRef.current) {
        hasCancelledRef.current = true;
        setIsExpired(true);
        setIsActive(false);
        setIsCancelling(true);
        void bookingService
          .cancelBooking(bookingId, {
            reasonType: 'user_request',
            reasonNote: 'Hết thời gian thanh toán',
          })
          .finally(() => {
            setIsCancelling(false);
            onExpiredRef.current();
          });
      }
    }, 1000);

    return () => clearInterval(id);
  }, [bookingId, bookingCreatedAt]);

  return { secondsLeft, isExpired, isCancelling, isActive };
};

export const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
