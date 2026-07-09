import { useAuth } from '@/contexts/auth/useAuth';
import { cn } from '@/common/utils/cn';

export const DashboardProfilePage = () => {
  const { user } = useAuth();

  const roleBadge =
    user?.role === 'ADMIN'
      ? { label: 'Quản trị viên', className: 'bg-red-100 text-red-700' }
      : { label: 'Nhân viên', className: 'bg-primary-100 text-primary-700' };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-neutral-500">Thông tin tài khoản của bạn</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-neutral-100">
          <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5">{user?.email}</p>
            <span
              className={cn(
                'inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full',
                roleBadge.className,
              )}
            >
              {roleBadge.label}
            </span>
          </div>
        </div>

        <dl className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-neutral-500 col-span-1">Họ</dt>
            <dd className="text-sm text-neutral-900 col-span-2">{user?.firstName}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-neutral-500 col-span-1">Tên</dt>
            <dd className="text-sm text-neutral-900 col-span-2">{user?.lastName}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-neutral-500 col-span-1">Email</dt>
            <dd className="text-sm text-neutral-900 col-span-2">{user?.email}</dd>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <dt className="text-sm font-medium text-neutral-500 col-span-1">Vai trò</dt>
            <dd className="text-sm text-neutral-900 col-span-2">{roleBadge.label}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
