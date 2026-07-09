export interface Schedule {
  id: string;
  roomId: string;
  availableOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleUpsertResponse extends Schedule {
  action: 'created' | 'updated';
}

export interface UpsertScheduleRequest {
  roomId: string;
  availableOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed?: boolean;
}

export interface UpdateScheduleRequest {
  openTime?: string;
  closeTime?: string;
  isClosed?: boolean;
}

export const DAY_LABELS_VI = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DEFAULT_OPEN_TIME = '08:00';
export const DEFAULT_CLOSE_TIME = '22:00';
