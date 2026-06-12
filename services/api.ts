import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Permite que o AuthContext seja notificado quando a sessão expira de vez
let onSessionExpired: (() => void) | null = null;

export const setOnSessionExpired = (callback: (() => void) | null) => {
  onSessionExpired = callback;
};

api.interceptors.request.use(
  async (config) => {
    const token = await getItemAsync('jwt');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let pendingQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const flushQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
};

const clearSession = async () => {
  await deleteItemAsync('jwt');
  await deleteItemAsync('refreshToken');
  await deleteItemAsync('usuario');
  onSessionExpired?.();
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRoute
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getItemAsync('refreshToken');

      if (!refreshToken) {
        throw error;
      }

      // axios "puro" para não passar pelos interceptors e evitar loop
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const newToken: string = data.token;

      await setItemAsync('jwt', newToken);
      flushQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      await clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
