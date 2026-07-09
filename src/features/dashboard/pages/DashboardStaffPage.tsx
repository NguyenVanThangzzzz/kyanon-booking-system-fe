import { useState } from 'react';
import { cn } from '@/common/utils/cn';
import { Badge } from '@/common/components/ui/Badge/Badge';
import { Modal } from '@/common/components/ui/Modal';
import { Button } from '@/common/components/ui/Button';
import { UserAvatar } from '@/common/components/ui/UserAvatar';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { usePagination } from '@/common/hooks/usePagination';
import { useDebounce } from '@/common/hooks/useDebounce';
import { formatDate, formatDateTime } from '@/common/utils/format';
import { useAdminUsers } from '@/features/user/hooks/useAdminUsers';
import { useAuditLogs } from '@/features/user/hooks/useAuditLogs';
import { CreateStaffModal } from '@/features/user/components/CreateStaffModal';
import type { AdminUser, UserRole, UserStatus, CreateStaffRequest } from '@/features/user/types/user.types';
import type { ApiError } from '@/types/api.types';

// ── Display maps ───────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Admin',
  STAFF: 'Nhân viên',
  USER: 'Khách hàng',
};

const ROLE_VARIANT: Record<UserRole, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline'> = {
  ADMIN: 'primary',
  STAFF: 'outline',
  USER: 'default',
};

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Không hoạt động',
  SUSPENDED: 'Bị khóa',
  DELETED: 'Đã xóa',
};

const STATUS_VARIANT: Record<UserStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline'> = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  SUSPENDED: 'warning',
  DELETED: 'error',
};

const CHANGEABLE_STATUSES: Array<{ value: UserStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Không hoạt động' },
  { value: 'SUSPENDED', label: 'Bị khóa' },
];

type ActiveTab = 'users' | 'audit';

// ── Shared input class ─────────────────────────────────────────────────────────

const fieldClass =
  'rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

// ── Page ───────────────────────────────────────────────────────────────────────

export const DashboardStaffPage = (): JSX.Element => {
  const { showToast } = useToast();

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<ActiveTab>('users');

  // ── Users tab ──
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const { page, limit, nextPage, prevPage, setPage } = usePagination({ initialLimit: 10 });

  // ── Audit tab ──
  const [auditPerformedBy, setAuditPerformedBy] = useState('');
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');
  const {
    page: auditPage,
    limit: auditLimit,
    nextPage: auditNextPage,
    prevPage: auditPrevPage,
    setPage: setAuditPage,
  } = usePagination({ initialLimit: 20 });

  // ── Modal state ──
  const [createOpen, setCreateOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);
  const [newStatus, setNewStatus] = useState<UserStatus>('ACTIVE');
  const [isUpdating, setIsUpdating] = useState(false);

  // ── Data ──
  const { users, total, isLoading, error, createStaff, updateStatus } = useAdminUsers({
    page,
    limit,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
  });

  const {
    logs,
    total: auditTotal,
    isLoading: auditLoading,
    error: auditError,
  } = useAuditLogs({
    page: auditPage,
    limit: auditLimit,
    performedBy: auditPerformedBy || undefined,
    startDate: auditStartDate || undefined,
    endDate: auditEndDate || undefined,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const auditTotalPages = Math.max(1, Math.ceil(auditTotal / auditLimit));

  // ── Handlers ──
  const handleCreateStaff = async (data: CreateStaffRequest): Promise<void> => {
    try {
      await createStaff(data);
      showToast('Tạo tài khoản nhân viên thành công', 'success');
    } catch (err) {
      showToast((err as ApiError).message ?? 'Tạo tài khoản thất bại', 'error');
      throw err;
    }
  };

  const openStatusModal = (user: AdminUser): void => {
    const firstOther = CHANGEABLE_STATUSES.find((s) => s.value !== user.status);
    setNewStatus(firstOther?.value ?? 'ACTIVE');
    setStatusTarget(user);
  };

  const handleUpdateStatus = async (): Promise<void> => {
    if (!statusTarget) return;
    setIsUpdating(true);
    try {
      await updateStatus(statusTarget.id, newStatus);
      showToast(
        `Đã cập nhật: ${statusTarget.lastName} ${statusTarget.firstName} → ${STATUS_LABEL[newStatus]}`,
        'success',
      );
      setStatusTarget(null);
    } catch (err) {
      showToast((err as ApiError).message ?? 'Cập nhật trạng thái thất bại', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Quản lý Người dùng</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Xem, thêm nhân viên và quản lý trạng thái tài khoản
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          + Thêm nhân viên
        </Button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-neutral-200 -mb-2">
        {(
          [
            { key: 'users', label: 'Người dùng' },
            { key: 'audit', label: 'Nhật ký hoạt động' },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          Tab 1: Người dùng
      ════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Tìm theo tên, email..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              className={fieldClass}
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as UserRole | '');
                setPage(1);
              }}
              className={fieldClass}
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Nhân viên</option>
              <option value="USER">Khách hàng</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as UserStatus | '');
                setPage(1);
              }}
              className={fieldClass}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="SUSPENDED">Bị khóa</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 text-sm border-b border-red-100">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Người dùng</th>
                    <th className="text-left px-4 py-3 font-semibold">Vai trò</th>
                    <th className="text-left px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="text-center px-4 py-3 font-semibold">Đăng nhập lỗi</th>
                    <th className="text-left px-4 py-3 font-semibold">Ngày tạo</th>
                    <th className="text-right px-4 py-3 font-semibold">Thao tác</th>
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
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-neutral-500">
                        <div className="text-4xl mb-2">👥</div>
                        Không tìm thấy người dùng nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                        {/* Avatar + name + email */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              firstName={user.firstName}
                              lastName={user.lastName}
                              avatarUrl={user.avatar ?? undefined}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-neutral-900 truncate">
                                {user.lastName} {user.firstName}
                              </p>
                              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                              {user.phone && (
                                <p className="text-xs text-neutral-400">{user.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3">
                          <Badge variant={ROLE_VARIANT[user.role]}>
                            {ROLE_LABEL[user.role]}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[user.status]}>
                            {STATUS_LABEL[user.status]}
                          </Badge>
                          {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                            <p className="text-xs text-amber-600 mt-0.5">
                              Mở lúc: {formatDateTime(user.lockedUntil)}
                            </p>
                          )}
                        </td>

                        {/* Login attempts */}
                        <td className="px-4 py-3 text-center">
                          {user.loginAttempts > 0 ? (
                            <span
                              className={cn(
                                'text-sm font-semibold',
                                user.loginAttempts >= 5 ? 'text-red-600' : 'text-amber-600',
                              )}
                            >
                              {user.loginAttempts}
                            </span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>

                        {/* Created at */}
                        <td className="px-4 py-3 text-xs text-neutral-500">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          {user.status !== 'DELETED' && (
                            <button
                              onClick={() => openStatusModal(user)}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                              Đổi trạng thái
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && users.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-sm">
                <Badge variant="default">
                  {(page - 1) * limit + 1}–{Math.min(page * limit, total)} / {total}
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
        </>
      )}

      {/* ════════════════════════════════════════════
          Tab 2: Nhật ký hoạt động
      ════════════════════════════════════════════ */}
      {activeTab === 'audit' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="ID người thực hiện..."
              value={auditPerformedBy}
              onChange={(e) => {
                setAuditPerformedBy(e.target.value);
                setAuditPage(1);
              }}
              className={fieldClass}
            />
            <input
              type="date"
              value={auditStartDate}
              onChange={(e) => {
                setAuditStartDate(e.target.value);
                setAuditPage(1);
              }}
              className={fieldClass}
            />
            <input
              type="date"
              value={auditEndDate}
              onChange={(e) => {
                setAuditEndDate(e.target.value);
                setAuditPage(1);
              }}
              className={fieldClass}
            />
            <button
              onClick={() => {
                setAuditPerformedBy('');
                setAuditStartDate('');
                setAuditEndDate('');
                setAuditPage(1);
              }}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            {auditError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 text-sm border-b border-red-100">
                {auditError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Thời gian</th>
                    <th className="text-left px-4 py-3 font-semibold">Người thực hiện</th>
                    <th className="text-left px-4 py-3 font-semibold">Hành động</th>
                    <th className="text-left px-4 py-3 font-semibold">Tài nguyên</th>
                    <th className="text-left px-4 py-3 font-semibold">Chi tiết</th>
                    <th className="text-left px-4 py-3 font-semibold">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {auditLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-3 bg-neutral-200 rounded w-3/4" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center text-neutral-500">
                        <div className="text-4xl mb-2">📋</div>
                        Không có nhật ký hoạt động nào
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-500">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {log.performedBy.length > 12
                              ? `${log.performedBy.slice(0, 12)}…`
                              : log.performedBy}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-neutral-700">{log.resource}</p>
                          <p className="text-xs font-mono text-neutral-400">
                            {log.resourceId.length > 8
                              ? `${log.resourceId.slice(0, 8)}…`
                              : log.resourceId}
                          </p>
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <p className="text-xs text-neutral-500 truncate">{log.details ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-neutral-400">
                          {log.ipAddress ?? '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!auditLoading && logs.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-sm">
                <Badge variant="default">
                  {(auditPage - 1) * auditLimit + 1}–
                  {Math.min(auditPage * auditLimit, auditTotal)} / {auditTotal}
                </Badge>
                <div className="flex items-center gap-2">
                  <button
                    onClick={auditPrevPage}
                    disabled={auditPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Trước
                  </button>
                  <span className="text-neutral-500 text-xs">
                    {auditPage} / {auditTotalPages}
                  </span>
                  <button
                    onClick={auditNextPage}
                    disabled={auditPage >= auditTotalPages}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Tiếp →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modal: Thêm nhân viên ── */}
      <CreateStaffModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateStaff}
      />

      {/* ── Modal: Đổi trạng thái ── */}
      {statusTarget && (
        <Modal
          isOpen
          onClose={() => setStatusTarget(null)}
          title="Cập nhật trạng thái tài khoản"
          size="sm"
        >
          <div className="space-y-4">
            {/* User preview */}
            <div className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3">
              <UserAvatar
                firstName={statusTarget.firstName}
                lastName={statusTarget.lastName}
                avatarUrl={statusTarget.avatar ?? undefined}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 text-sm truncate">
                  {statusTarget.lastName} {statusTarget.firstName}
                </p>
                <p className="text-xs text-neutral-500 truncate">{statusTarget.email}</p>
              </div>
              <Badge variant={STATUS_VARIANT[statusTarget.status]}>
                {STATUS_LABEL[statusTarget.status]}
              </Badge>
            </div>

            {/* New status select */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Trạng thái mới
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as UserStatus)}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {CHANGEABLE_STATUSES.filter((s) => s.value !== statusTarget.status).map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStatusTarget(null)}
                disabled={isUpdating}
                className="flex-1"
              >
                Hủy bỏ
              </Button>
              <Button
                variant={newStatus === 'SUSPENDED' ? 'danger' : 'primary'}
                onClick={() => {
                  void handleUpdateStatus();
                }}
                isLoading={isUpdating}
                className="flex-1"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
