import { useState, useEffect, useCallback } from 'react';
import { roomService } from '../services/room.service';
import type {
  CreateRoomRequest,
  Room,
  RoomFilters,
  RoomStatus,
  UpdateRoomRequest,
} from '../types/room.types';
import type { ApiError } from '@/types/api.types';

interface UseAdminRoomsOptions extends RoomFilters {
  page: number;
  limit: number;
}

interface UseAdminRoomsReturn {
  rooms: Room[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createRoom: (data: CreateRoomRequest) => Promise<Room>;
  updateRoom: (id: string, data: UpdateRoomRequest) => Promise<Room>;
  updateStatus: (id: string, status: RoomStatus) => Promise<Room>;
  deleteRoom: (id: string) => Promise<void>;
}

export const useAdminRooms = (options: UseAdminRoomsOptions): UseAdminRoomsReturn => {
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
  }, [options.page, options.limit, options.status, options.roomTypeId, options.floor, refreshKey]);

  const createRoom = useCallback(async (data: CreateRoomRequest): Promise<Room> => {
    const room = await roomService.createRoom(data);
    setRefreshKey((k) => k + 1);
    return room;
  }, []);

  const updateRoom = useCallback(
    async (id: string, data: UpdateRoomRequest): Promise<Room> => {
      const room = await roomService.updateRoom(id, data);
      setRefreshKey((k) => k + 1);
      return room;
    },
    [],
  );

  const updateStatus = useCallback(async (id: string, status: RoomStatus): Promise<Room> => {
    const room = await roomService.updateRoomStatus(id, { status });
    setRefreshKey((k) => k + 1);
    return room;
  }, []);

  const deleteRoom = useCallback(async (id: string): Promise<void> => {
    await roomService.deleteRoom(id);
    setRefreshKey((k) => k + 1);
  }, []);

  return { rooms, total, isLoading, error, refetch, createRoom, updateRoom, updateStatus, deleteRoom };
};
