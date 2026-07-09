import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { tokenStorage } from '@/lib/axios/interceptors';
import { authService } from '@/features/auth/services/auth.service';

export type UserRole = 'ADMIN' | 'STAFF' | 'USER';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'AUTH_INIT_START' }
  | { type: 'AUTH_INIT_SUCCESS'; payload: AuthUser | null }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_INIT_START':
      return { ...state, isLoading: true };
    case 'AUTH_INIT_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: action.payload !== null,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
      return { user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false };
    default:
      return state;
  }
};

export interface AuthContextValue extends AuthState {
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = 'auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    dispatch({ type: 'AUTH_INIT_START' });
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const accessToken = tokenStorage.getAccessToken();

    if (storedUser && accessToken) {
      try {
        const user = JSON.parse(storedUser) as AuthUser;
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: user });
      } catch {
        tokenStorage.clearTokens();
        localStorage.removeItem(USER_STORAGE_KEY);
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: null });
      }
    } else {
      tokenStorage.clearTokens();
      localStorage.removeItem(USER_STORAGE_KEY);
      dispatch({ type: 'AUTH_INIT_SUCCESS', payload: null });
    }
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      dispatch({ type: 'LOGOUT' });
      localStorage.removeItem(USER_STORAGE_KEY);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback((user: AuthUser, accessToken: string, refreshToken: string) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
  }, []);

  const logout = useCallback(() => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      // fire-and-forget: revoke on BE but don't block local cleanup
      void authService.logout(refreshToken).catch(() => undefined);
    }
    tokenStorage.clearTokens();
    localStorage.removeItem(USER_STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
