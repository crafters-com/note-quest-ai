import apiClient from "./api";

export interface Note {
  id: number;
  notebook: number; // El ID del notebook al que pertenece
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type NoteData = {
  title: string;
  content?: string;
  notebook: number; // El ID del notebook es requerido para asociar la nota
};

// --- Funciones CRUD para las Notas ---

/**
 * Obtiene las notas de un notebook específico.
 * @param notebookId El ID del notebook del que se quieren obtener las notas.
 */
const getNotes = (notebookId: number): Promise<Note[]> => {
  // Enviamos el ID del notebook como un parámetro de consulta en la URL
  return apiClient.get(`/notes/?notebook=${notebookId}`).then((response) => response.data.results);
};

/**
 * Obtiene una sola nota por su ID.
 */
const getNote = (id: number): Promise<Note> => {
  return apiClient.get(`/notes/${id}/`).then((response) => response.data);
};

/**
 * Crea una nueva nota dentro de un notebook.
 */
const createNote = (data: NoteData): Promise<Note> => {
  return apiClient.post("/notes/", data).then((response) => response.data);
};

/**
 * Actualiza una nota existente.
 */
const updateNote = (id: number, data: Partial<NoteData>): Promise<Note> => {
  // Usamos PATCH para actualizaciones parciales, es más flexible.
  return apiClient.patch(`/notes/${id}/`, data).then((response) => response.data);
};

/**
 * Borra una nota.
 */
const deleteNote = (id: number): Promise<void> => {
  return apiClient.delete(`/notes/${id}/`);
};

/**
 * Comparte una nota con un amigo (crea una copia)
 */
const shareNote = (noteId: number, friendId: string, notebookId?: number): Promise<any> => {
  return apiClient.post(`/notes/${noteId}/share/`, {
    friend_id: friendId,
    notebook_id: notebookId
  }).then((response) => response.data);
};

export const noteService = {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
};