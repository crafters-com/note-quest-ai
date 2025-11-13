import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Use env config if provided, fallback to local dev API
// Default to local Django server during development. Override via VITE_API_BASE_URL for staging/production.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://18.215.216.97:8000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a cada solicitud
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Formato para la Autenticación por Token de Django/DRF
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export default apiClient;