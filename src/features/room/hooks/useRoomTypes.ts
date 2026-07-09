import { useState, useEffect, useCallback } from 'react';
import { roomService } from '../services/room.service';
import type { RoomType } from '../types/room.types';
import type { ApiError } from '@/types/api.types';

interface UseRoomTypesReturn {
  roomTypes: RoomType[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRoomTypes = (): UseRoomTypesReturn => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    roomService
      .getRoomTypes()
      .then((data) => {
        if (!cancelled) setRoomTypes(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Cannot load room types');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { roomTypes, isLoading, error, refetch };
};
