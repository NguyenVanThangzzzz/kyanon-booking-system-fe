import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { Spinner } from '@/common/components/ui/Spinner';

export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
