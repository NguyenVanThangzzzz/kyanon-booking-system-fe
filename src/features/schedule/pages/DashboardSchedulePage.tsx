import { useState } from 'react';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { useAdminRooms } from '@/features/room/hooks/useAdminRooms';
import type { ApiError } from '@/types/api.types';
import { ScheduleWeeklyEditor } from '../components/ScheduleWeeklyEditor';
import { useRoomSchedules } from '../hooks/useRoomSchedules';
import type { UpsertScheduleRequest } from '../types/schedule.types';

const DashboardSchedulePage = (): JSX.Element => {
  const { showToast } = useToast();
  const { rooms, isLoading: roomsLoading } = useAdminRooms({ page: 1, limit: 100 });
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const { schedules, isLoading, error, upsertSchedule } = useRoomSchedules(selectedRoomId || null);

  const handleSubmitAll = async (payloads: UpsertScheduleRequest[]): Promise<void> => {
    setIsSaving(true);
    try {
      await Promise.all(payloads.map((p) => upsertSchedule(p)));
      showToast('Schedule saved successfully', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Failed to save schedule', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Room Schedule</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Configure weekly operating hours for each room (Sunday → Saturday)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-4">
        <label htmlFor="room-picker" className="block text-sm font-medium text-neutral-700 mb-2">
          Select room
        </label>
        <select
          id="room-picker"
          value={selectedRoomId}
          onChange={(e) => setSelectedRoomId(e.target.value)}
          disabled={roomsLoading}
          className="w-full sm:w-96 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select a room to view schedule</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.code})
            </option>
          ))}
        </select>
      </div>

      {!selectedRoomId ? (
        <div className="bg-white rounded-2xl border border-neutral-200 py-20 text-center text-neutral-500">
          <div className="text-4xl mb-2">📅</div>
          Select a room to view and edit the weekly schedule
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-4 border-b border-neutral-100 animate-pulse"
            >
              <div className="h-3 bg-neutral-200 rounded w-24" />
              <div className="h-8 bg-neutral-200 rounded w-28" />
              <div className="h-8 bg-neutral-200 rounded w-28" />
              <div className="h-4 bg-neutral-200 rounded w-16" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-error-50 text-error-600 px-4 py-3 text-sm rounded-2xl border border-error-100">
          {error}
        </div>
      ) : (
        <ScheduleWeeklyEditor
          roomId={selectedRoomId}
          schedules={schedules}
          isSaving={isSaving}
          onSubmit={handleSubmitAll}
        />
      )}
    </div>
  );
};

export default DashboardSchedulePage;
export { DashboardSchedulePage };
