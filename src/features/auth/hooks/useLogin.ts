import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { authService } from '../services/auth.service';
import type { LoginRequest } from '../types/auth.types';
import type { ApiError } from '@/types/api.types';
import type { AuthUser } from '@/contexts/auth/AuthContext';

interface UseLoginOptions {
  onSuccess?: (user: AuthUser) => void;
}

interface UseLoginReturn {
  login: (data: LoginRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useLogin = (options?: UseLoginOptions): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const login = async (data: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(data);
      authLogin(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      if (options?.onSuccess) {
        options.onSuccess(result.user);
      } else {
        // Standalone login page: role-based redirect
        const role = result.user.role;
        if (role === 'ADMIN' || role === 'STAFF') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      if (apiError.statusCode === 401) {
        setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
      } else {
        setError(apiError.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
