// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { authService, type User } from '@/services/authService';
import apiClient from '@/services/api'; // Importa tu apiClient

// El valor inicial puede ser lo que necesites, aquí usamos un objeto por claridad
interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<any>; // Parámetros tipados
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async (username, password) => {},
  logout: () => {},
  loading: true,
});

// 2. Creamos el Componente Proveedor
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Efecto para configurar el token en apiClient al cargar la app
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      apiClient.defaults.headers.common['Authorization'] = `Token ${storedToken}`;
      setToken(storedToken);
    }
    setLoading(false); // Terminamos de cargar el estado inicial
  }, []);

  const login = async (username:string, password:string) => {
    try {
      const data = await authService.login(username, password);
      setToken(data.token); // Actualiza el estado de React
      setUser(data.user); // Guarda el usuario
      return data;
    } catch (error) {
      // Limpiamos el estado en caso de error
      logout();
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null); 
  };

  // El valor que proveeremos a los componentes hijos
  const value = {
    isAuthenticated: !!token,
    user,
    token,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Creamos un Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};