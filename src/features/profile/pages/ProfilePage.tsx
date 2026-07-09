import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { UserAvatar } from '@/common/components/ui/UserAvatar';
import { cn } from '@/common/utils/cn';

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5 text-neutral-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CogIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface QuickLinkCardProps {
  to: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

const QuickLinkCard = ({ to, icon, iconBg, title, description }: QuickLinkCardProps) => (
  <Link
    to={to}
    className="group flex items-center gap-4 bg-white rounded-2xl shadow-sm hover:shadow-md border border-neutral-100 px-5 py-4 transition-all duration-200"
  >
    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', iconBg)}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">{title}</p>
      <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
    </div>
    <ChevronRightIcon />
  </Link>
);

export const ProfilePage = (): JSX.Element => {
  const { user } = useAuth();

  const roleLabel =
    user?.role === 'ADMIN'
      ? 'Quản trị viên'
      : user?.role === 'STAFF'
        ? 'Nhân viên'
        : 'Khách hàng';

  const roleBadgeClass =
    user?.role === 'ADMIN'
      ? 'bg-red-50 text-red-700'
      : user?.role === 'STAFF'
        ? 'bg-primary-50 text-primary-700'
        : 'bg-emerald-50 text-emerald-700';

  return (
    <div className="container-app py-10 max-w-2xl mx-auto">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Hồ sơ cá nhân</h1>
        <p className="text-sm text-neutral-500 mt-1">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* User info card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <UserAvatar
            firstName={user?.firstName ?? ''}
            lastName={user?.lastName ?? ''}
            size="lg"
            className="w-16 h-16 text-xl"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-neutral-900 truncate">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-neutral-500 mt-0.5 truncate">{user?.email}</p>
            <span className={`inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <dl className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Họ</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{user?.firstName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Tên</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{user?.lastName}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Email</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{user?.email}</dd>
          </div>
        </dl>
      </div>

      {/* Quick links */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide px-1">Dịch vụ của tôi</p>

        <QuickLinkCard
          to="/bookings"
          icon={<CalendarIcon />}
          iconBg="bg-primary-50 text-primary-600"
          title="Đặt phòng của tôi"
          description="Quản lý tất cả lịch đặt phòng của bạn"
        />

        <QuickLinkCard
          to="/settings"
          icon={<CogIcon />}
          iconBg="bg-neutral-100 text-neutral-500"
          title="Cài đặt tài khoản"
          description="Cập nhật mật khẩu và thông tin cá nhân"
        />

        <QuickLinkCard
          to="#"
          icon={<ShieldIcon />}
          iconBg="bg-emerald-50 text-emerald-600"
          title="Bảo mật"
          description="Quản lý bảo mật và đăng nhập tài khoản"
        />
      </div>
    </div>
  );
};
