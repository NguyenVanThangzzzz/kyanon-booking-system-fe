import { useState } from 'react';
import { Button } from '@/common/components/ui/Button';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { cn } from '@/common/utils/cn';
import { formatDateTime } from '@/common/utils/format';
import { useAdminRooms } from '@/features/room/hooks/useAdminRooms';
import type { ApiError } from '@/types/api.types';
import { BlockedSlotFormModal } from '../components/BlockedSlotFormModal';
import { useBlockedSlots } from '../hooks/useBlockedSlots';
import type {
  BlockedSlot,
  CreateBlockedSlotRequest,
  UpdateBlockedSlotRequest,
} from '../types/blocked-slot.types';
import { REASON_BADGE } from '../types/blocked-slot.types';

const DashboardBlockedSlotsPage = (): JSX.Element => {
  const { showToast } = useToast();
  const { rooms, isLoading: roomsLoading } = useAdminRooms({ page: 1, limit: 100 });
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<BlockedSlot | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { slots, isLoading, error, createSlot, updateSlot, deleteSlot } = useBlockedSlots(
    selectedRoomId || null,
  );

  const handleOpenCreate = (): void => {
    setEditingSlot(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (slot: BlockedSlot): void => {
    setEditingSlot(slot);
    setModalOpen(true);
  };

  const handleSubmitForm = async (
    data: CreateBlockedSlotRequest | UpdateBlockedSlotRequest,
  ): Promise<void> => {
    try {
      if (editingSlot) {
        await updateSlot(editingSlot.id, data as UpdateBlockedSlotRequest);
        showToast('Blocked slot updated successfully', 'success');
      } else {
        await createSlot(selectedRoomId, data as CreateBlockedSlotRequest);
        showToast('Blocked slot created successfully', 'success');
      }
      setModalOpen(false);
      setEditingSlot(null);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Failed to save blocked slot', 'error');
    }
  };

  const handleDelete = async (slot: BlockedSlot): Promise<void> => {
    const confirmed = window.confirm(
      `Delete blocked slot starting ${formatDateTime(slot.startAt)}? This action cannot be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(slot.id);
    try {
      await deleteSlot(slot.id);
      showToast('Blocked slot deleted', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Failed to delete blocked slot', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Blocked Slots</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Block rooms for specific time periods (maintenance, cleaning, events…)
          </p>
        </div>
        <Button onClick={handleOpenCreate} disabled={!selectedRoomId}>
          + Add blocked slot
        </Button>
      </div>

      {/* Room picker */}
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
          <option value="">Select a room to view blocked slots</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.code})
            </option>
          ))}
        </select>
      </div>

      {!selectedRoomId ? (
        <div className="bg-white rounded-2xl border border-neutral-200 py-20 text-center text-neutral-500">
          <div className="text-4xl mb-2">⛔</div>
          Select a room to view and manage blocked slots
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          {error && (
            <div className="bg-error-50 text-error-600 px-4 py-3 text-sm border-b border-error-100">
              {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Start</th>
                  <th className="text-left px-4 py-3 font-semibold">End</th>
                  <th className="text-left px-4 py-3 font-semibold">Reason</th>
                  <th className="text-left px-4 py-3 font-semibold">Notes</th>
                  <th className="text-left px-4 py-3 font-semibold">Created at</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-3 bg-neutral-200 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : slots.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-neutral-500">
                      <div className="text-4xl mb-2">📭</div>
                      No blocked slots for this room yet
                    </td>
                  </tr>
                ) : (
                  slots.map((slot) => {
                    const badge = REASON_BADGE[slot.reason];
                    return (
                      <tr key={slot.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 text-neutral-700">
                          {formatDateTime(slot.startAt)}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">{formatDateTime(slot.endAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex items-center text-xs font-medium px-3 py-1 rounded-full',
                              badge.className,
                            )}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">
                          {slot.notes ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-neutral-500 text-xs">
                          {formatDateTime(slot.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(slot)}
                              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => void handleDelete(slot)}
                              disabled={deletingId === slot.id}
                              className="text-error-600 hover:text-error-700 font-medium text-sm disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BlockedSlotFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSlot(null);
        }}
        slot={editingSlot}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default DashboardBlockedSlotsPage;
export { DashboardBlockedSlotsPage };
