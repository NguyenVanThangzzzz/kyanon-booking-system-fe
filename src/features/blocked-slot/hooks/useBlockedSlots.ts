import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from '@/types/api.types';
import { blockedSlotService } from '../services/blocked-slot.service';
import type {
  BlockedSlot,
  CreateBlockedSlotRequest,
  UpdateBlockedSlotRequest,
} from '../types/blocked-slot.types';

interface UseBlockedSlotsReturn {
  slots: BlockedSlot[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createSlot: (roomId: string, data: CreateBlockedSlotRequest) => Promise<BlockedSlot>;
  updateSlot: (id: string, data: UpdateBlockedSlotRequest) => Promise<BlockedSlot>;
  deleteSlot: (id: string) => Promise<void>;
}

export const useBlockedSlots = (roomId: string | null): UseBlockedSlotsReturn => {
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback((): void => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!roomId) {
      setSlots([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    blockedSlotService
      .listByRoom(roomId)
      .then((data) => {
        if (!cancelled) setSlots(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Cannot load blocked slot list');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomId, refreshKey]);

  const createSlot = useCallback(
    async (targetRoomId: string, data: CreateBlockedSlotRequest): Promise<BlockedSlot> => {
      const slot = await blockedSlotService.create(targetRoomId, data);
      setRefreshKey((k) => k + 1);
      return slot;
    },
    [],
  );

  const updateSlot = useCallback(
    async (id: string, data: UpdateBlockedSlotRequest): Promise<BlockedSlot> => {
      const slot = await blockedSlotService.update(id, data);
      setRefreshKey((k) => k + 1);
      return slot;
    },
    [],
  );

  const deleteSlot = useCallback(async (id: string): Promise<void> => {
    await blockedSlotService.remove(id);
    setRefreshKey((k) => k + 1);
  }, []);

  return { slots, isLoading, error, refetch, createSlot, updateSlot, deleteSlot };
};
