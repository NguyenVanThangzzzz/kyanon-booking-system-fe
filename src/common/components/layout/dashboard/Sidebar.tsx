import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { usePermission } from '@/common/hooks/usePermission';
import { cn } from '@/common/utils/cn';
import type { UserRole } from '@/contexts/auth/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  to: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
  end?: boolean;
}

const DashIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const BookingIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const RoomIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const RoomTypeIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 6v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2" />
  </svg>
);

const CustomerIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StaffIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ReportIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BlockIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className={cn('w-4 h-4 transition-transform duration-300', collapsed ? 'rotate-180' : '')}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

const menuItems: MenuItem[] = [
  {
    id: 'overview',
    label: 'Tổng quan',
    to: '/dashboard',
    icon: <DashIcon />,
    allowedRoles: ['ADMIN', 'STAFF'],
    end: true,
  },
  {
    id: 'bookings',
    label: 'Quản lý Booking',
    to: '/dashboard/bookings',
    icon: <BookingIcon />,
    allowedRoles: ['ADMIN', 'STAFF'],
  },
  {
    id: 'late-checkouts',
    label: 'Trả phòng muộn',
    to: '/dashboard/late-checkouts',
    icon: <ClockIcon />,
    allowedRoles: ['ADMIN', 'STAFF'],
  },
  {
    id: 'rooms',
    label: 'Quản lý Phòng',
    to: '/dashboard/rooms',
    icon: <RoomIcon />,
    allowedRoles: ['ADMIN', 'STAFF'],
  },
  {
    id: 'room-types',
    label: 'Loại phòng',
    to: '/dashboard/room-types',
    icon: <RoomTypeIcon />,
    allowedRoles: ['ADMIN'],
  },
  {
    id: 'schedules',
    label: 'Lịch biểu phòng',
    to: '/dashboard/schedules',
    icon: <CalendarIcon />,
    allowedRoles: ['ADMIN'],
  },
  {
    id: 'blocked-slots',
    label: 'Khung thời gian chặn',
    to: '/dashboard/blocked-slots',
    icon: <BlockIcon />,
    allowedRoles: ['ADMIN', 'STAFF'],
  },
  {
    id: 'customers',
    label: 'Khách hàng',
    to: '/dashboard/customers',
    icon: <CustomerIcon />,
    allowedRoles: ['ADMIN', 'STAFF'],
  },
  {
    id: 'staff',
    label: 'Nhân viên',
    to: '/dashboard/staff',
    icon: <StaffIcon />,
    allowedRoles: ['ADMIN'],
  },
  {
    id: 'reports',
    label: 'Báo cáo & Thống kê',
    to: '/dashboard/reports',
    icon: <ReportIcon />,
    allowedRoles: ['ADMIN'],
  },
  {
    id: 'settings',
    label: 'Cài đặt hệ thống',
    to: '/dashboard/settings',
    icon: <SettingsIcon />,
    allowedRoles: ['ADMIN'],
  },
];

const profileItem: MenuItem = {
  id: 'profile',
  label: 'Hồ sơ cá nhân',
  to: '/dashboard/profile',
  icon: <ProfileIcon />,
  allowedRoles: ['ADMIN', 'STAFF'],
};

export const Sidebar = ({ collapsed, mobileOpen, onToggle, onMobileClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const { hasRole } = usePermission();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const visibleItems = menuItems.filter((item) => hasRole(item.allowedRoles));

  const renderItem = (item: MenuItem) => (
    <NavLink
      key={item.id}
      to={item.to}
      end={item.end}
      onClick={onMobileClose}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500 pl-2'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border-l-4 border-transparent pl-2',
        )
      }
      title={collapsed ? item.label : undefined}
    >
      {item.icon}
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150">
          {item.label}
        </div>
      )}
    </NavLink>
  );

  const roleBadge =
    user?.role === 'ADMIN'
      ? { label: 'Admin', className: 'bg-red-100 text-red-700' }
      : { label: 'Staff', className: 'bg-primary-100 text-primary-700' };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-neutral-200',
          'transition-all duration-300 ease-in-out',
          // Desktop: always visible, width depends on collapsed state
          collapsed ? 'lg:w-16' : 'lg:w-64',
          // Mobile: drawer
          mobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo + Toggle */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-neutral-200 px-3 shrink-0',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-sm font-bold text-neutral-900">
                Kyanon<span className="text-primary-500">Stay</span>
              </span>
            </Link>
          )}

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors hidden lg:flex"
            aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            <ChevronIcon collapsed={!collapsed} />
          </button>

          {collapsed && (
            <Link to="/" className="flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </Link>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {visibleItems.map(renderItem)}

          {/* Divider before profile */}
          <div className="my-2 border-t border-neutral-100" />

          {hasRole(profileItem.allowedRoles) && renderItem(profileItem)}
        </nav>

        {/* User mini info + logout */}
        <div className="shrink-0 border-t border-neutral-200 p-2">
          {!collapsed ? (
            <div className="px-2 py-2 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span
                    className={cn(
                      'inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                      roleBadge.className,
                    )}
                  >
                    {roleBadge.label}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-1">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors duration-200',
              collapsed ? 'justify-center' : '',
            )}
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <LogoutIcon />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
