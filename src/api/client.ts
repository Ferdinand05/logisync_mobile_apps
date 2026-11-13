import axios from 'axios';

import { clearAuth, getToken } from '@/utils/storage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-logisync.3.25.191.99.nip.io/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuth();
      // Imported lazily to avoid a circular dependency (router -> views -> api).
      const { default: router } = await import('@/router');
      if (router.currentRoute.value.name !== 'login') {
        await router.replace({ name: 'login' });
      }
    }
    return Promise.reject(error);
  },
);

export default client;
