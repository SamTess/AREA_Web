import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from './api';
import { clearSecureToken } from '../utils/secureStorage';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, success: boolean = false) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(success);
    }
  });
  failedQueue = [];
};

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_CONFIG.baseURL;

axios.interceptors.request.use(
  (config) => {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}`);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig;

    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
      console.error(`❌ ${error.response?.status} ${originalRequest?.url}`, error.response?.data);
    }

    if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/login') ||
          originalRequest.url?.includes('/register') ||
          originalRequest.url?.includes('/refresh') ||
          originalRequest.url?.includes('/forgot-password')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(API_CONFIG.endpoints.auth.refresh);
        processQueue(null, true);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, false);
        console.warn('Token refresh failed');
        await clearSecureToken();
        if (typeof window !== 'undefined' &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    if (!error.response) {
      console.error('Network error or server unavailable');
      if (typeof window !== 'undefined') {
        // Exemple: toast.error('Server unavailable. Please try again later.');
      }
    }

    return Promise.reject(error);
  }
);

export default axios;