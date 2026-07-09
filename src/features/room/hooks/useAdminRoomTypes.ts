import { useState, useEffect, useCallback } from 'react';
import { roomService } from '../services/room.service';
import type {
  CreateRoomTypeRequest,
  RoomType,
  UpdateRoomTypeRequest,
} from '../types/room.types';
import type { ApiError } from '@/types/api.types';

interface UseAdminRoomTypesReturn {
  roomTypes: RoomType[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createRoomType: (data: CreateRoomTypeRequest) => Promise<RoomType>;
  updateRoomType: (id: string, data: UpdateRoomTypeRequest) => Promise<RoomType>;
  deleteRoomType: (id: string) => Promise<void>;
}

export const useAdminRoomTypes = (): UseAdminRoomTypesReturn => {
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

  const createRoomType = useCallback(async (data: CreateRoomTypeRequest): Promise<RoomType> => {
    const rt = await roomService.createRoomType(data);
    setRefreshKey((k) => k + 1);
    return rt;
  }, []);

  const updateRoomType = useCallback(
    async (id: string, data: UpdateRoomTypeRequest): Promise<RoomType> => {
      const rt = await roomService.updateRoomType(id, data);
      setRefreshKey((k) => k + 1);
      return rt;
    },
    [],
  );

  const deleteRoomType = useCallback(async (id: string): Promise<void> => {
    await roomService.deleteRoomType(id);
    setRefreshKey((k) => k + 1);
  }, []);

  return { roomTypes, isLoading, error, refetch, createRoomType, updateRoomType, deleteRoomType };
};
