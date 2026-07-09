import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { Button } from '@/common/components/ui/Button';
import { cn } from '@/common/utils/cn';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/bookings', label: 'Bookings' },
];

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="sticky top-0 z-40 border-b border-secondary-200 bg-white shadow-sm">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-primary-600">Kyanon Booking</span>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900',
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-secondary-600 md:block">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container-app py-8">
        <Outlet />
      </main>
    </div>
  );
};
