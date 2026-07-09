import { useAuth } from '@/contexts/auth/useAuth';
import type { UserRole } from '@/contexts/auth/AuthContext';

export interface UsePermissionReturn {
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
}

export const usePermission = (): UsePermissionReturn => {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (roles: UserRole[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return roles.includes(user.role);
  };

  const canAccess = (roles: UserRole[]): boolean => hasRole(roles);

  return {
    hasRole,
    canAccess,
    isAdmin: isAuthenticated && user?.role === 'ADMIN',
    isStaff: isAuthenticated && user?.role === 'STAFF',
    isCustomer: isAuthenticated && user?.role === 'USER',
  };
};
