import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { UserAvatar } from '@/common/components/ui/UserAvatar';
import { UserDropdown } from '@/common/components/ui/UserDropdown';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { cn } from '@/common/utils/cn';

type AuthView = 'login' | 'register';

const navLinks = [
  { to: '/rooms', label: 'Tìm phòng' },
];

const footerLinks = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Hà Nội',   to: '/rooms?dest=hanoi' },
      { label: 'Đà Nẵng',  to: '/rooms?dest=danang' },
      { label: 'Hội An',   to: '/rooms?dest=hoian' },
      { label: 'Nha Trang', to: '/rooms?dest=nhatrang' },
      { label: 'Phú Quốc', to: '/rooms?dest=phuquoc' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Trung tâm trợ giúp',    to: '#' },
      { label: 'Chính sách hủy',         to: '#' },
      { label: 'Phương thức thanh toán', to: '#' },
      { label: 'Liên hệ',               to: '#' },
    ],
  },
  {
    title: 'Công ty',
    links: [
      { label: 'Về chúng tôi',    to: '#' },
      { label: 'Blog',             to: '#' },
      { label: 'Tuyển dụng',      to: '#' },
      { label: 'Chính sách bảo mật', to: '#' },
    ],
  },
];

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);

export const PublicLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal]   = useState<{ isOpen: boolean; view: AuthView }>({
    isOpen: false,
    view: 'login',
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const state = location.state as { openAuthModal?: AuthView } | null;
    if (state?.openAuthModal && !isAuthenticated) {
      setAuthModal({ isOpen: true, view: state.openAuthModal });
      // Clear the state so re-renders don't re-open the modal
      window.history.replaceState({}, '');
    }
  }, [location.state, isAuthenticated]);

  const openAuthModal = (view: AuthView) => {
    setMobileOpen(false);
    setAuthModal({ isOpen: true, view });
  };
  const closeAuthModal = () => setAuthModal((prev) => ({ ...prev, isOpen: false }));

  const handleMobileLogout = () => {
    setMobileOpen(false);
    logout();
  };

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText('0922222016');
      showToast('Đã copy số điện thoại!', 'info', 2500);
    } catch {
      showToast('Không thể copy. Số: 0922 222 016', 'info', 3000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {/* ── Navbar ── */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-200',
          scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-neutral-100'
            : 'bg-white border-b border-neutral-100',
        )}
      >
        <div className="container-app flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-200">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-lg font-bold text-neutral-900">
              Kyanon<span className="text-primary-500">Stay</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'group relative px-4 py-2 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'text-primary-600'
                      : 'text-neutral-700 hover:text-primary-500 hover:-translate-y-0.5',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    <span
                      className={cn(
                        'absolute bottom-0.5 left-4 right-4 h-0.5 bg-primary-500 origin-left transition-transform duration-300',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/bookings"
                className={({ isActive }) =>
                  cn(
                    'group relative px-4 py-2 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'text-primary-600'
                      : 'text-neutral-700 hover:text-primary-500 hover:-translate-y-0.5',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    Đặt phòng của tôi
                    <span
                      className={cn(
                        'absolute bottom-0.5 left-4 right-4 h-0.5 bg-primary-500 origin-left transition-transform duration-300',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      )}
                    />
                  </>
                )}
              </NavLink>
            )}
          </nav>

          {/* Right actions — desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Phone — click-to-copy + wiggle on hover */}
            <button
              onClick={() => void copyPhone()}
              className="group flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors duration-200 px-2 py-1.5 rounded-lg hover:bg-primary-50"
              title="Click để copy số điện thoại"
            >
              <span className="group-hover:animate-wiggle">
                <PhoneIcon />
              </span>
              0922 222 016
            </button>

            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                {/* Đăng nhập — ghost style with hover glow */}
                <button
                  onClick={() => openAuthModal('login')}
                  className={cn(
                    'text-sm font-medium text-neutral-600 px-4 py-2 rounded-full transition-all duration-[250ms]',
                    'hover:text-primary-600 hover:bg-primary-50',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                    'cubic-bezier(0.4,0,0.2,1)',
                  )}
                >
                  Đăng nhập
                </button>

                {/* Đăng ký — primary with scale + glow lift on hover */}
                <button
                  onClick={() => openAuthModal('register')}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-full',
                    'bg-primary-500 text-white font-semibold',
                    'py-2 px-5 text-sm',
                    'transition-all duration-[250ms] ease-out',
                    'hover:bg-primary-600 hover:scale-105 hover:-translate-y-0.5',
                    'hover:shadow-lg hover:shadow-primary-500/40',
                    'active:scale-[0.98] active:shadow-sm active:translate-y-0',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  )}
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-1 animate-slide-up">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-neutral-700 hover:bg-neutral-50',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/bookings"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-neutral-700 hover:bg-neutral-50',
                  )
                }
              >
                Đặt phòng của tôi
              </NavLink>
            )}

            {/* Mobile auth section */}
            {isAuthenticated && user ? (
              <div className="pt-2 border-t border-neutral-100 space-y-1">
                <div className="flex items-center gap-3 px-4 py-3">
                  <UserAvatar firstName={user.firstName} lastName={user.lastName} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Hồ sơ cá nhân
                </Link>
                <button
                  onClick={handleMobileLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="btn-outline justify-center py-2.5"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="btn-primary justify-center py-2.5"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-neutral-900 text-neutral-400">
        <div className="container-app py-12 lg:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="white" strokeWidth="2" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">KyanonStay</span>
              </div>
              <p className="text-sm leading-relaxed">
                Nền tảng đặt phòng nghỉ hàng đầu — tìm kiếm và đặt phòng dễ dàng với giá tốt nhất.
              </p>
              <div className="flex gap-3 mt-5">
                {['facebook', 'instagram', 'twitter'].map((s) => (
                  <a
                    key={s}
                    href="#"
                    aria-label={s}
                    className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="text-white text-sm font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-sm hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <p>© 2025 KyanonStay. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="#" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
              <Link to="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialView={authModal.view}
      />
    </div>
  );
};
