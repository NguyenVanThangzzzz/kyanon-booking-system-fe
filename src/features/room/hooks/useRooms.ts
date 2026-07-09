import { useState, useEffect, useCallback } from 'react';
import { roomService } from '../services/room.service';
import type { Room, RoomFilters } from '../types/room.types';
import type { ApiError } from '@/types/api.types';

interface UseRoomsReturn {
  rooms: Room[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseRoomsOptions extends RoomFilters {
  page: number;
  limit: number;
}

export const useRooms = (options: UseRoomsOptions): UseRoomsReturn => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    roomService
      .getRooms(options)
      .then((response) => {
        if (!cancelled) {
          setRooms(response.data.data);
          setTotal(response.data.pagination.total);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Cannot load room list');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.page, options.limit, options.status, options.roomTypeIds?.join(','), options.floor, options.search, options.minPrice, options.maxPrice, options.sortBy, options.sortOrder, refreshKey]);

  return { rooms, total, isLoading, error, refetch };
};
