import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { useClickOutside } from '@/common/hooks/useClickOutside';
import { UserAvatar } from '@/common/components/ui/UserAvatar';
import { cn } from '@/common/utils/cn';

const MOBILE_BREAKPOINT = 768;
const HOVER_OPEN_DELAY = 150;
const HOVER_CLOSE_DELAY = 150;

interface MenuItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const MenuItem = ({ to, label, icon, onClick }: MenuItemProps) => (
  <Link
    to={to}
    role="menuitem"
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
  >
    {icon}
    {label}
  </Link>
);

const ProfileIcon = () => (
  <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const BookingsIcon = () => (
  <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4 text-neutral-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export const UserDropdown = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  const closeDropdown = useCallback(() => setIsOpen(false), []);

  useClickOutside(containerRef, closeDropdown);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDropdown();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeDropdown]);

  const openTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setIsOpen(true), HOVER_OPEN_DELAY);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setIsOpen(false), HOVER_CLOSE_DELAY);
  };

  const handleAvatarClick = () => {
    if (!isMobile) return;
    setIsOpen((v) => !v);
  };

  const handleLogout = () => {
    closeDropdown();
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar trigger button */}
      <button
        onClick={handleAvatarClick}
        className="flex items-center rounded-full p-0.5 ring-2 ring-transparent hover:ring-primary-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Tài khoản của tôi"
      >
        <UserAvatar firstName={user.firstName} lastName={user.lastName} size="sm" />
      </button>

      {/* Dropdown panel */}
      <div
        role="menu"
        aria-label="Menu tài khoản"
        className={cn(
          'absolute right-0 top-full pt-2 z-50',
          'transition-all duration-200 ease-in-out origin-top-right',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none',
        )}
      >
        {/* Arrow indicator */}
        <div className="absolute top-[3px] right-[14px] w-2.5 h-2.5 bg-white rotate-45 border-l border-t border-neutral-100 z-10" />

        {/* Dropdown box */}
        <div className="w-64 bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
          {/* User info section */}
          <div className="px-4 py-4 bg-gradient-to-br from-neutral-50 to-white border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <UserAvatar firstName={user.firstName} lastName={user.lastName} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-neutral-500 truncate mt-0.5">{user.email}</p>
                {user.role !== 'USER' && (
                  <span className="inline-flex items-center mt-1.5 text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <MenuItem
              to="/profile"
              label="Hồ sơ cá nhân"
              onClick={closeDropdown}
              icon={<ProfileIcon />}
            />
            <MenuItem
              to="/bookings"
              label="Đặt phòng của tôi"
              onClick={closeDropdown}
              icon={<BookingsIcon />}
            />
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'STAFF') && (
              <MenuItem
                to="/dashboard"
                label="Quản lý hệ thống"
                onClick={closeDropdown}
                icon={<DashboardIcon />}
              />
            )}
            {user?.role === 'USER' && (
              <MenuItem
                to="/settings"
                label="Cài đặt"
                onClick={closeDropdown}
                icon={<SettingsIcon />}
              />
            )}
          </div>

          <div className="border-t border-neutral-100" />

          {/* Logout */}
          <div className="py-1.5">
            <button
              role="menuitem"
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
  );
};
