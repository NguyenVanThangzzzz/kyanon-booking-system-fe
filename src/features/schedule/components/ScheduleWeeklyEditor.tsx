import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/common/components/ui/Button';
import { cn } from '@/common/utils/cn';
import {
  DAY_LABELS_VI,
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  type Schedule,
  type UpsertScheduleRequest,
} from '../types/schedule.types';

interface ScheduleRow {
  availableOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  existingId: string | null;
}

interface ScheduleWeeklyEditorProps {
  roomId: string;
  schedules: Schedule[];
  isSaving: boolean;
  onSubmit: (payloads: UpsertScheduleRequest[]) => Promise<void>;
}

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  return (h ?? 0) * 60 + (m ?? 0);
};

const buildRowsFromSchedules = (schedules: Schedule[]): ScheduleRow[] => {
  return DAY_LABELS_VI.map((_, day) => {
    const existing = schedules.find((s) => s.availableOfWeek === day);
    if (existing) {
      return {
        availableOfWeek: day,
        openTime: existing.openTime,
        closeTime: existing.closeTime,
        isClosed: existing.isClosed,
        existingId: existing.id,
      };
    }
    return {
      availableOfWeek: day,
      openTime: DEFAULT_OPEN_TIME,
      closeTime: DEFAULT_CLOSE_TIME,
      isClosed: false,
      existingId: null,
    };
  });
};

export const ScheduleWeeklyEditor = ({
  roomId,
  schedules,
  isSaving,
  onSubmit,
}: ScheduleWeeklyEditorProps): JSX.Element => {
  const [rows, setRows] = useState<ScheduleRow[]>(() => buildRowsFromSchedules(schedules));

  useEffect(() => {
    setRows(buildRowsFromSchedules(schedules));
  }, [schedules, roomId]);

  const rowErrors = useMemo(() => {
    return rows.map((r) => {
      if (r.isClosed) return null;
      if (!r.openTime || !r.closeTime) return 'Please enter both open and close times';
      if (timeToMinutes(r.openTime) >= timeToMinutes(r.closeTime)) {
        return 'Open time must be before close time';
      }
      return null;
    });
  }, [rows]);

  const hasError = rowErrors.some((e) => e !== null);

  const updateRow = (day: number, patch: Partial<ScheduleRow>): void => {
    setRows((prev) => prev.map((r) => (r.availableOfWeek === day ? { ...r, ...patch } : r)));
  };

  const handleSubmit = async (): Promise<void> => {
    if (hasError) return;
    const payloads: UpsertScheduleRequest[] = rows.map((r) => ({
      roomId,
      availableOfWeek: r.availableOfWeek,
      openTime: r.openTime,
      closeTime: r.closeTime,
      isClosed: r.isClosed,
    }));
    await onSubmit(payloads);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-semibold w-32">Day</th>
              <th className="text-left px-4 py-3 font-semibold">Open time</th>
              <th className="text-left px-4 py-3 font-semibold">Close time</th>
              <th className="text-center px-4 py-3 font-semibold w-32">Closed all day</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row, idx) => {
              const error = rowErrors[idx];
              return (
                <tr key={row.availableOfWeek} className="hover:bg-neutral-50/50">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {DAY_LABELS_VI[row.availableOfWeek]}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={row.openTime}
                      disabled={row.isClosed}
                      onChange={(e) =>
                        updateRow(row.availableOfWeek, { openTime: e.target.value })
                      }
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                        row.isClosed
                          ? 'border-neutral-200 bg-neutral-50 text-neutral-400'
                          : 'border-neutral-300',
                      )}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={row.closeTime}
                      disabled={row.isClosed}
                      onChange={(e) =>
                        updateRow(row.availableOfWeek, { closeTime: e.target.value })
                      }
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                        row.isClosed
                          ? 'border-neutral-200 bg-neutral-50 text-neutral-400'
                          : 'border-neutral-300',
                      )}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={row.isClosed}
                      onChange={(e) =>
                        updateRow(row.availableOfWeek, { isClosed: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {error ? (
                      <span className="text-error-600">{error}</span>
                    ) : row.isClosed ? (
                      <span className="text-neutral-500">Closed</span>
                    ) : row.existingId ? (
                      <span className="text-success-600">Saved</span>
                    ) : (
                      <span className="text-warning-600">Unsaved</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 text-sm">
        <p className="text-neutral-500">
          {hasError
            ? 'Please fix the rows with errors'
            : 'Click "Save all" to update the schedule for all 7 days'}
        </p>
        <Button onClick={() => void handleSubmit()} disabled={hasError} isLoading={isSaving}>
          Save all
        </Button>
      </div>
    </div>
  );
};
