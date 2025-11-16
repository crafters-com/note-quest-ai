import axios from "axios";

const BASE_URL = "http://34.192.63.231:8000/api";

// Configura headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: token ? `Token ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// Obtener todos los notebooks del usuario autenticado
export const fetchNotebooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/notebooks/`, getAuthHeaders());
    return response.data; // lista de notebooks
  } catch (error) {
    console.error("Error fetching notebooks:", error);
    throw error.response?.data || error;
  }
};

// Obtener las notas de un notebook específico
export const fetchNotesByNotebook = async (notebookId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/notes/?notebook=${notebookId}`,
      getAuthHeaders()
    );
    return response.data; // lista de notas
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error.response?.data || error;
  }
};

// Generar resumen
export const generateSummary = async (noteId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/notes/${noteId}/summarize/`,
      {},
      getAuthHeaders()
    );
    return response.data.summary ? { summary: response.data.summary } : response.data;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error.response?.data || error;
  }
};

// Generar quiz
export const generateQuiz = async (noteId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/notes/${noteId}/quiz/`,
      {},
      getAuthHeaders()
    );
    return response.data.quiz ? { quiz: response.data.quiz } : response.data;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error.response?.data || error;
  }
};
