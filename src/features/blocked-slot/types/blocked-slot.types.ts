import type { BlockedSlotReason } from '@/features/room/types/room.types';

export type { BlockedSlotReason };

export interface BlockedSlot {
  id: string;
  roomId: string;
  startAt: string;
  endAt: string;
  reason: BlockedSlotReason;
  notes?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface CreateBlockedSlotRequest {
  startAt: string;
  endAt: string;
  reason: BlockedSlotReason;
  notes?: string;
}

export interface UpdateBlockedSlotRequest {
  startAt?: string;
  endAt?: string;
  reason?: BlockedSlotReason;
  notes?: string;
}

export const REASON_LABELS_VI: Record<BlockedSlotReason, string> = {
  maintenance: 'Maintenance',
  cleaning: 'Cleaning',
  event: 'Event',
  other: 'Other',
};

export const REASON_BADGE: Record<
  BlockedSlotReason,
  { className: string; label: string }
> = {
  maintenance: { className: 'bg-warning-50 text-warning-600', label: 'Maintenance' },
  cleaning: { className: 'bg-info-50 text-info-600', label: 'Cleaning' },
  event: { className: 'bg-primary-50 text-primary-600', label: 'Event' },
  other: { className: 'bg-neutral-100 text-neutral-700', label: 'Other' },
};
