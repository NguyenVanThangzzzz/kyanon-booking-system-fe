const getEnv = (key: keyof ImportMetaEnv, fallback?: string): string => {
  const value = import.meta.env[key];
  if (!value && fallback === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? fallback ?? '';
};

export const env = {
  apiBaseUrl: getEnv('VITE_API_BASE_URL'),
  apiTimeout: Number(getEnv('VITE_API_TIMEOUT', '10000')),
  appName: getEnv('VITE_APP_NAME', 'Kyanon Booking System'),
  appVersion: getEnv('VITE_APP_VERSION', '0.1.0'),
  enableMock: getEnv('VITE_ENABLE_MOCK', 'false') === 'true',
} as const;
