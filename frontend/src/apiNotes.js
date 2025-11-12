import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/') + 'notes/';

// Get all notes
export const getNotes = async (token) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// Create a new note
export const createNote = async (note, token) => {
  const response = await axios.post(API_URL, note, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// Get a single note by ID
export const getNoteById = async (id, token) => {
  const response = await axios.get(`${API_URL}${id}/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// Update a note by ID
export const updateNote = async (id, note, token) => {
  const response = await axios.put(`${API_URL}${id}/`, note, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};

// Delete a note by ID
export const deleteNote = async (id, token) => {
  const response = await axios.delete(`${API_URL}${id}/`, {
    headers: { Authorization: `Token ${token}` }
  });
  return response.data;
};