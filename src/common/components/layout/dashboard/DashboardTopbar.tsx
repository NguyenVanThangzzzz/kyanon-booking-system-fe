import { useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { useClickOutside } from '@/common/hooks/useClickOutside';
import { cn } from '@/common/utils/cn';

interface DashboardTopbarProps {
  onMobileMenuOpen: () => void;
}

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Tổng quan',
  bookings: 'Quản lý Booking',
  rooms: 'Quản lý Phòng',
  customers: 'Khách hàng',
  staff: 'Nhân viên',
  reports: 'Báo cáo & Thống kê',
  settings: 'Cài đặt hệ thống',
  profile: 'Hồ sơ cá nhân',
};

const useBreadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  return segments.map((seg, idx) => ({
    label: breadcrumbMap[seg] ?? seg,
    to: '/' + segments.slice(0, idx + 1).join('/'),
    isLast: idx === segments.length - 1,
  }));
};

const HamburgerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export const DashboardTopbar = ({ onMobileMenuOpen }: DashboardTopbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);
  useClickOutside(dropdownRef, closeDropdown);

  const handleLogout = () => {
    closeDropdown();
    logout();
    navigate('/');
  };

  const roleBadge =
    user?.role === 'ADMIN'
      ? { label: 'Admin', className: 'bg-red-100 text-red-700 border border-red-200' }
      : { label: 'Staff', className: 'bg-primary-100 text-primary-700 border border-primary-200' };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-neutral-200 bg-white px-4 shadow-sm shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuOpen}
        className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors lg:hidden"
        aria-label="Mở menu"
      >
        <HamburgerIcon />
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 min-w-0 flex-1" aria-label="Đường dẫn">
        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.to} className="flex items-center gap-1 min-w-0">
            {idx > 0 && <ChevronRightIcon />}
            {crumb.isLast ? (
              <span className="text-sm font-semibold text-neutral-900 truncate">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.to}
                className="text-sm text-neutral-500 hover:text-primary-600 transition-colors truncate"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors">
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          >
            <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-neutral-900 leading-tight">
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
            <svg className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown panel */}
          <div
            className={cn(
              'absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden z-50',
              'transition-all duration-200 ease-in-out origin-top-right',
              dropdownOpen
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95 pointer-events-none',
            )}
          >
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
              <p className="text-sm font-semibold text-neutral-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-neutral-500 mt-0.5 truncate">{user?.email}</p>
            </div>

            <div className="py-1">
              <Link
                to="/"
                onClick={closeDropdown}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <HomeIcon />
                Về trang chủ
              </Link>
              <Link
                to="/dashboard/profile"
                onClick={closeDropdown}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Hồ sơ cá nhân
              </Link>
            </div>

            <div className="border-t border-neutral-100 py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogoutIcon />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
