import type { AuthUser } from '@/contexts/auth/AuthContext';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
