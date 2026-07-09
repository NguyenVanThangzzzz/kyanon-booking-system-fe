import { useMemo, useState } from 'react';
import { Button } from '@/common/components/ui/Button';
import { Badge } from '@/common/components/ui/Badge/Badge';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { usePagination } from '@/common/hooks/usePagination';
import { useDebounce } from '@/common/hooks/useDebounce';
import { formatCurrency } from '@/common/utils/format';
import { cn } from '@/common/utils/cn';
import { useAdminRooms } from '@/features/room/hooks/useAdminRooms';
import { useRoomTypes } from '@/features/room/hooks/useRoomTypes';
import { RoomFormModal } from '@/features/room/components/RoomFormModal';
import type {
  CreateRoomRequest,
  Room,
  RoomStatus,
  UpdateRoomRequest,
} from '@/features/room/types/room.types';
import type { ApiError } from '@/types/api.types';

const STATUS_OPTIONS: Array<{ value: RoomStatus | ''; label: string }> = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'available', label: 'Còn phòng' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'inactive', label: 'Tạm dừng' },
];

const STATUS_BADGE: Record<RoomStatus, { variant: 'success' | 'warning' | 'default'; label: string }> = {
  available: { variant: 'success', label: 'Còn phòng' },
  maintenance: { variant: 'warning', label: 'Bảo trì' },
  inactive: { variant: 'default', label: 'Tạm dừng' },
};

const DashboardRoomsPage = (): JSX.Element => {
  const { showToast } = useToast();
  const { page, limit, nextPage, prevPage, setPage } = usePagination({ initialLimit: 10 });
  const [statusFilter, setStatusFilter] = useState<RoomStatus | ''>('');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { roomTypes } = useRoomTypes();
  const { rooms, total, isLoading, error, createRoom, updateRoom, updateStatus, deleteRoom } =
    useAdminRooms({
      page,
      limit,
      status: statusFilter || undefined,
      roomTypeId: roomTypeFilter || undefined,
    });

  const filteredRooms = useMemo(() => {
    if (!debouncedSearch) return rooms;
    const q = debouncedSearch.toLowerCase();
    return rooms.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
    );
  }, [rooms, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleOpenCreate = (): void => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (room: Room): void => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleSubmitForm = async (data: CreateRoomRequest | UpdateRoomRequest): Promise<void> => {
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, data as UpdateRoomRequest);
        showToast('Cập nhật phòng thành công', 'success');
      } else {
        await createRoom(data as CreateRoomRequest);
        showToast('Tạo phòng thành công', 'success');
      }
      setModalOpen(false);
      setEditingRoom(null);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Lưu phòng thất bại', 'error');
    }
  };

  const handleStatusChange = async (room: Room, status: RoomStatus): Promise<void> => {
    if (room.status === status) return;
    try {
      await updateStatus(room.id, status);
      showToast('Cập nhật trạng thái thành công', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Đổi trạng thái thất bại', 'error');
    }
  };

  const handleDelete = async (room: Room): Promise<void> => {
    const confirmed = window.confirm(`Xóa phòng "${room.name}"? Hành động không thể hoàn tác.`);
    if (!confirmed) return;
    setDeletingId(room.id);
    try {
      await deleteRoom(room.id);
      showToast('Đã xóa phòng', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Xóa phòng thất bại', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Quản lý Phòng</h1>
          <p className="mt-1 text-sm text-neutral-500">Thêm, sửa, xóa và đổi trạng thái phòng</p>
        </div>
        <Button onClick={handleOpenCreate}>+ Thêm phòng</Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm theo tên hoặc mã phòng..."
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as RoomStatus | '');
            setPage(1);
          }}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={roomTypeFilter}
          onChange={(e) => {
            setRoomTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tất cả loại phòng</option>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
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
                <th className="text-left px-4 py-3 font-semibold">Tên</th>
                <th className="text-left px-4 py-3 font-semibold">Mã</th>
                <th className="text-left px-4 py-3 font-semibold">Loại</th>
                <th className="text-left px-4 py-3 font-semibold">Tầng</th>
                <th className="text-right px-4 py-3 font-semibold">Sức chứa</th>
                <th className="text-right px-4 py-3 font-semibold">Giá/đêm</th>
                <th className="text-left px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-right px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 bg-neutral-200 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-neutral-500">
                    <div className="text-4xl mb-2">🏨</div>
                    Không có phòng nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => {
                  const badge = STATUS_BADGE[room.status];
                  const price = room.roomType?.basePricePerNight ?? 0;
                  return (
                    <tr key={room.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-neutral-900">{room.name}</td>
                      <td className="px-4 py-3 text-neutral-600">{room.code}</td>
                      <td className="px-4 py-3 text-neutral-600">{room.roomType?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-neutral-600">{room.floor ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-neutral-600">{room.capacity}</td>
                      <td className="px-4 py-3 text-right text-neutral-700 font-medium">
                        {formatCurrency(price)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={room.status}
                          onChange={(e) =>
                            void handleStatusChange(room, e.target.value as RoomStatus)
                          }
                          className={cn(
                            'rounded-full text-xs font-medium px-3 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer',
                            badge.variant === 'success' && 'bg-success-50 text-success-600',
                            badge.variant === 'warning' && 'bg-warning-50 text-warning-600',
                            badge.variant === 'default' && 'bg-neutral-100 text-neutral-700',
                          )}
                        >
                          <option value="available">Còn phòng</option>
                          <option value="maintenance">Bảo trì</option>
                          <option value="inactive">Tạm dừng</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(room)}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => void handleDelete(room)}
                            disabled={deletingId === room.id}
                            className="text-error-600 hover:text-error-700 font-medium text-sm disabled:opacity-50"
                          >
                            Xóa
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

        {/* Pagination */}
        {!isLoading && filteredRooms.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-sm">
            <Badge variant="default">
              Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}
            </Badge>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Trước
              </button>
              <span className="text-neutral-500 text-xs">
                {page} / {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>

      <RoomFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRoom(null);
        }}
        room={editingRoom}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default DashboardRoomsPage;
export { DashboardRoomsPage };
