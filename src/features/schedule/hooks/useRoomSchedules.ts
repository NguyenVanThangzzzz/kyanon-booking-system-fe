import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from '@/types/api.types';
import { scheduleService } from '../services/schedule.service';
import type {
  Schedule,
  ScheduleUpsertResponse,
  UpsertScheduleRequest,
} from '../types/schedule.types';

interface UseRoomSchedulesReturn {
  schedules: Schedule[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  upsertSchedule: (data: UpsertScheduleRequest) => Promise<ScheduleUpsertResponse>;
  deleteSchedule: (id: string) => Promise<void>;
}

export const useRoomSchedules = (roomId: string | null): UseRoomSchedulesReturn => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback((): void => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!roomId) {
      setSchedules([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    scheduleService
      .listByRoom(roomId)
      .then((data) => {
        if (!cancelled) setSchedules(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const apiError = err as ApiError;
          setError(apiError.message ?? 'Cannot load room schedule');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomId, refreshKey]);

  const upsertSchedule = useCallback(
    async (data: UpsertScheduleRequest): Promise<ScheduleUpsertResponse> => {
      const result = await scheduleService.upsert(data);
      setRefreshKey((k) => k + 1);
      return result;
    },
    [],
  );

  const deleteSchedule = useCallback(async (id: string): Promise<void> => {
    await scheduleService.remove(id);
    setRefreshKey((k) => k + 1);
  }, []);

  return { schedules, isLoading, error, refetch, upsertSchedule, deleteSchedule };
};
