import apiClient from "./api";
import type { AxiosResponse } from "axios";

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date?: string | null;
  bio?: string | null;
  created_at?: string | null;

  university?: string | null;
  location?: string | null;
  career?: string | null;
  academic_year?: string | null;
  stats?: {
    streak_count: number;
    best_streak: number;
    last_active_date: string | null;
  } | null;
}

interface SignUpData {
  first_name: string; 
  last_name: string;
  username: string;
  email: string;
  password: string;
  birth_date?: string;
}

interface LoginResponse {
  token: string;
  user: User; // <-- Esperamos recibir el objeto de usuario aquí
}

// --- El servicio de autenticación con tipos ---

const signup = (userData: SignUpData): Promise<AxiosResponse<any>> => {
  return apiClient.post("/auth/signup/", userData);
};

const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>("/auth/login/", {
      username: username,
      password: password,
    });

    if (response.data.token) {
      const token = response.data.token;
      localStorage.setItem("authToken", token);
      apiClient.defaults.headers.common["Authorization"] = `Token ${token}`;
    }
    return response.data;
  } catch (error) {
    // Es una buena práctica limpiar el estado si el login falla
    localStorage.removeItem("authToken");
    delete apiClient.defaults.headers.common["Authorization"];
    throw error;
  }
};

const logout = (): void => {
  // El endpoint de logout puede o no requerir autenticación
  // apiClient.post('/auth/logout/'); // Descomenta si tienes un endpoint de logout
  
  localStorage.removeItem("authToken");
  delete apiClient.defaults.headers.common["Authorization"];
};

interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  university?: string | null;
  location?: string | null;
  career?: string | null;
  academic_year?: string | null;
  bio?: string | null;
}

const updateUser = async (data: UpdateUserData) => {
  const response = await apiClient.patch('/auth/user/', data);
  return response.data;
};

export const authService = {
  signup,
  login,
  logout,
  updateUser,
};

// --- Streak service ---
export interface StreakResponse {
  streak_count: number;
  best_streak: number;
  last_active_date: string | null;
  today: string;
}

export const streakService = {
  ping: async (): Promise<StreakResponse> => {
    const res = await apiClient.post<StreakResponse>("/auth/streak/ping/");
    return res.data;
  },
};