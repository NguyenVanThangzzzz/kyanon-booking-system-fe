import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { ApiError } from '@/types/api.types';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token as string);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: unknown) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;

      const buildApiError = (): ApiError => ({
        message:
          error.response?.data?.error?.message ??
          error.response?.data?.message ??
          error.message ??
          'An unexpected error occurred',
        statusCode: status ?? 500,
        errors: error.response?.data?.error?.details ?? error.response?.data?.errors,
      });

      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch((err: unknown) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenStorage.getRefreshToken();

        if (!refreshToken) {
          isRefreshing = false;
          tokenStorage.clearTokens();
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return Promise.reject(buildApiError());
        }

        try {
          const response = await instance.post<{
            data: { accessToken: string; refreshToken: string };
          }>('/api/v1/auth/refresh', { refreshToken });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          tokenStorage.setTokens(accessToken, newRefreshToken);
          processQueue(null, accessToken);

          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          }
          return instance(originalRequest);
        } catch (refreshError: unknown) {
          processQueue(refreshError, null);
          tokenStorage.clearTokens();
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(buildApiError());
    },
  );
};
