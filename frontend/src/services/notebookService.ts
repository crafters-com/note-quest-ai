import apiClient from "./api";

export interface Notebook {
  id: number;
  user: number; // ID del usuario propietario
  name: string;
  description: string | null;
  subject: string;
  created_at: string;
  updated_at: string;
}

export type NotebookData = {
  name: string;
  subject: string;
  description?: string;
};

//CRUD Operations

const getNotebooks = (): Promise<Notebook[]> => {
  return apiClient
  .get("/notebooks/")
  .then((response) => response.data.results);
};

const getNotebook = (id: number): Promise<Notebook> => {
  return apiClient.get(`/notebooks/${id}/`).then((response) => response.data);
};

const createNotebook = (data: NotebookData): Promise<Notebook> => {
  return apiClient.post("/notebooks/", data).then((response) => response.data);
};

const updateNotebook = (id: number, data: NotebookData): Promise<Notebook> => {
  return apiClient.put(`/notebooks/${id}/`, data).then((response) => response.data);
};

const deleteNotebook = (id: number): Promise<void> => {
  return apiClient.delete(`/notebooks/${id}/`);
};


export const notebookService = {
  getNotebooks,
  getNotebook,
  createNotebook,
  updateNotebook,
  deleteNotebook,
};