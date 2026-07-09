import { useCallback, useState } from 'react';
import { lateCheckoutService } from '../services/late-checkout.service';
import type {
  ApproveLateCheckoutPayload,
  DenyLateCheckoutPayload,
  LateCheckout,
} from '../types/late-checkout.types';

interface UseLateCheckoutMutationsReturn {
  isPending: boolean;
  approve: (id: string, payload: ApproveLateCheckoutPayload) => Promise<LateCheckout>;
  deny: (id: string, payload: DenyLateCheckoutPayload) => Promise<LateCheckout>;
}

export const useLateCheckoutMutations = (): UseLateCheckoutMutationsReturn => {
  const [isPending, setIsPending] = useState(false);

  const approve = useCallback(
    async (id: string, payload: ApproveLateCheckoutPayload): Promise<LateCheckout> => {
      setIsPending(true);
      try {
        return await lateCheckoutService.approve(id, payload);
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  const deny = useCallback(
    async (id: string, payload: DenyLateCheckoutPayload): Promise<LateCheckout> => {
      setIsPending(true);
      try {
        return await lateCheckoutService.deny(id, payload);
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { isPending, approve, deny };
};
