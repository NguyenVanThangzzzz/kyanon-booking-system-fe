import { useState } from 'react';
import { Button } from '@/common/components/ui/Button';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { formatCurrency } from '@/common/utils/format';
import { useAdminRoomTypes } from '@/features/room/hooks/useAdminRoomTypes';
import { RoomTypeFormModal } from '@/features/room/components/RoomTypeFormModal';
import type {
  CreateRoomTypeRequest,
  RoomType,
  UpdateRoomTypeRequest,
} from '@/features/room/types/room.types';
import type { ApiError } from '@/types/api.types';

const DashboardRoomTypesPage = (): JSX.Element => {
  const { showToast } = useToast();
  const { roomTypes, isLoading, error, createRoomType, updateRoomType, deleteRoomType } =
    useAdminRoomTypes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenCreate = (): void => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (rt: RoomType): void => {
    setEditing(rt);
    setModalOpen(true);
  };

  const handleSubmitForm = async (
    data: CreateRoomTypeRequest | UpdateRoomTypeRequest,
  ): Promise<void> => {
    try {
      if (editing) {
        await updateRoomType(editing.id, data as UpdateRoomTypeRequest);
        showToast('Cập nhật loại phòng thành công', 'success');
      } else {
        await createRoomType(data as CreateRoomTypeRequest);
        showToast('Tạo loại phòng thành công', 'success');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Lưu loại phòng thất bại', 'error');
    }
  };

  const handleDelete = async (rt: RoomType): Promise<void> => {
    const confirmed = window.confirm(
      `Xóa loại phòng "${rt.name}"? Sẽ thất bại nếu vẫn còn phòng thuộc loại này.`,
    );
    if (!confirmed) return;
    setDeletingId(rt.id);
    try {
      await deleteRoomType(rt.id);
      showToast('Đã xóa loại phòng', 'success');
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Xóa loại phòng thất bại', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Quản lý Loại phòng</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Mỗi phòng vật lý phải thuộc một loại phòng (chứa giá, sức chứa, mô tả chung)
          </p>
        </div>
        <Button onClick={handleOpenCreate}>+ Thêm loại phòng</Button>
      </div>

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
                <th className="text-left px-4 py-3 font-semibold">Mô tả</th>
                <th className="text-right px-4 py-3 font-semibold">Sức chứa</th>
                <th className="text-right px-4 py-3 font-semibold">Giá / đêm</th>
                <th className="text-right px-4 py-3 font-semibold">Số phòng</th>
                <th className="text-right px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3 bg-neutral-200 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : roomTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-neutral-500">
                    <div className="text-4xl mb-2">🛏️</div>
                    Chưa có loại phòng nào — nhấn "Thêm loại phòng" để tạo mới
                  </td>
                </tr>
              ) : (
                roomTypes.map((rt) => (
                  <tr key={rt.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-900">{rt.name}</td>
                    <td className="px-4 py-3 text-neutral-600 max-w-md truncate">
                      {rt.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">{rt.defaultCapacity}</td>
                    <td className="px-4 py-3 text-right text-neutral-700 font-medium">
                      {formatCurrency(rt.basePricePerNight)}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">
                      {rt.availableRoomCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(rt)}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => void handleDelete(rt)}
                          disabled={deletingId === rt.id}
                          className="text-error-600 hover:text-error-700 font-medium text-sm disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RoomTypeFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        roomType={editing}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default DashboardRoomTypesPage;
export { DashboardRoomTypesPage };
