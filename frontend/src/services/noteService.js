import apiClient from './api';

// Corresponde a NoteListCreateView (GET)
export const getAllNotes = () => {
  return apiClient.get('api/notes/');
};

// Corresponde a NoteListCreateView (POST)
export const createNote = (noteData) => {
  // noteData debería ser un objeto como { title: "Mi nota", content: "...", notebook: 1 }
  return apiClient.post('api/notes/', noteData);
};

// Corresponde a NoteDetailView (GET by ID)
export const getNoteById = (id) => {
  return apiClient.get(`api/notes/${id}/`);
};

// Corresponde a NoteDetailView (PUT)
export const updateNote = (id, noteData) => {
  return apiClient.put(`api/notes/${id}/`, noteData);
};

// Corresponde a NoteDetailView (DELETE)
export const deleteNote = (id) => {
  return apiClient.delete(`api/notes/${id}/`);
};