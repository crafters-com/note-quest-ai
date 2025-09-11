import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Asegúrate que el puerto sea el de tu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor actualizado para usar "Token" en lugar de "Bearer"
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); 
    if (token) {
      // Formato para la Autenticación por Token de Django
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;