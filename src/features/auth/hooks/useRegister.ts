import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { authService } from '../services/auth.service';
import type { RegisterRequest } from '../types/auth.types';
import type { ApiError } from '@/types/api.types';
import type { AuthUser } from '@/contexts/auth/AuthContext';

interface UseRegisterOptions {
  onSuccess?: (user: AuthUser) => void;
}

interface UseRegisterReturn {
  register: (data: RegisterRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useRegister = (options?: UseRegisterOptions): UseRegisterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const register = async (data: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.register(data);
      authLogin(result.user, result.tokens.accessToken, result.tokens.refreshToken);
      if (options?.onSuccess) {
        options.onSuccess(result.user);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};
