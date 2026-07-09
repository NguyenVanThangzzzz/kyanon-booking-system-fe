import { useState, useEffect } from 'react';
import { roomService } from '../services/room.service';
import type { Room, AvailableRoomFilters } from '../types/room.types';
import type { ApiError } from '@/types/api.types';

interface UseAvailableRoomsReturn {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
}

export const useAvailableRooms = (filters: AvailableRoomFilters): UseAvailableRoomsReturn => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    roomService
      .getAvailableRooms(filters)
      .then((data) => {
        if (!cancelled) setRooms(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Không thể tải danh sách phòng trống');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters.checkIn, filters.checkOut]);

  return { rooms, isLoading, error };
};
