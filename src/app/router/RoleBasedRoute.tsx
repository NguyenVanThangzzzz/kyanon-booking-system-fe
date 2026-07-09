import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import type { UserRole } from '@/contexts/auth/AuthContext';
import { Spinner } from '@/common/components/ui/Spinner';

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
}

export const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        state={{ from: location, openAuthModal: 'login' }}
        replace
      />
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
