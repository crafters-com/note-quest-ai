import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://18.215.216.97:8000/api/';

// Register new user
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}auth/signup/`, userData);
  return response.data;
};

// Login user and get token
export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}auth/login/`, { username, password });
  return response.data;
};

// Get user profile (requires token)
export const getUserProfile = async (token) => {
  const response = await axios.get(`${API_URL}users/profile/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// Logout user (invalidate token)
export const logout = async (token) => {
  const response = await axios.post(`${API_URL}auth/logout/`, {}, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};