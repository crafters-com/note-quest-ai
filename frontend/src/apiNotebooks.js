import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://34.192.63.231:8000/api/') + 'notebooks/';

// Get all notebooks
export const getNotebooks = async (token) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// Create a new notebook
export const createNotebook = async (notebook, token) => {
  const response = await axios.post(API_URL, notebook, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// Get a single notebook by ID
export const getNotebookById = async (id, token) => {
  const response = await axios.get(`${API_URL}${id}/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// Update a notebook by ID
export const updateNotebook = async (id, notebook, token) => {
  const response = await axios.put(`${API_URL}${id}/`, notebook, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// Delete a notebook by ID
export const deleteNotebook = async (id, token) => {
  const response = await axios.delete(`${API_URL}${id}/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};