import apiClient from './api';

const signup = (userData) => {
  // userData = { username, email, first_name, last_name, password }
  return apiClient.post('/auth/signup/', userData);
};

const login = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/login/', {
      username: username, // Tu backend espera 'username'
      password: password,
    });

    if (response.data.token) {
      const token = response.data.token;
      localStorage.setItem('authToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  // El endpoint de logout requiere autenticación, por lo que el token ya estará en el header
  apiClient.post('/logout/');
  localStorage.removeItem('authToken');
  delete apiClient.defaults.headers.common['Authorization'];
};

export const authService = {
  signup,
  login,
  logout,
};