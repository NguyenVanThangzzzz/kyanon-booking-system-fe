import axios from 'axios';
import { env } from '@/config/env';
import { setupInterceptors } from './interceptors';

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

setupInterceptors(axiosInstance);

export default axiosInstance;
