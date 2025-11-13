// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { authService, type User, streakService } from '@/services/authService';
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
  updateUser: (data: Partial<User>) => Promise<User>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async (username, password) => {},
  logout: () => {},
  updateUser: async (data) => { return data as any; },
  loading: true,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Efecto para configurar el token en apiClient al cargar la app

  useEffect(() => {
    const fetchUserOnLoad = async () => {
      console.log("1. useEffect se está ejecutando al cargar la página.");
      const storedToken = localStorage.getItem('authToken');
      console.log("2. Token encontrado en localStorage:", storedToken);

  if (storedToken) {
        console.log("3. Hay un token, se procederá a verificar.");
        apiClient.defaults.headers.common['Authorization'] = `Token ${storedToken}`;
        try {
          console.log("4. A punto de llamar a /api/auth/user/...");
          const response = await apiClient.get('/auth/user/');
          console.log("5. Usuario obtenido exitosamente:", response.data);
          setUser(response.data);
          // Ping de streak al cargar si hay sesión válida
          try {
            const streak = await streakService.ping();
            setUser((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                stats: {
                  ...(prev.stats ?? { streak_count: 0, best_streak: 0, last_active_date: null }),
                  streak_count: streak.streak_count,
                  best_streak: streak.best_streak,
                  last_active_date: streak.last_active_date,
                },
              };
            });
          } catch (e) {
            console.warn('No se pudo actualizar la racha al cargar:', e);
          }
        } catch (error) {
          console.error("6. ERROR al obtener el usuario:", error);
          // Limpiamos el token inválido
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          delete apiClient.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    fetchUserOnLoad();
  }, []);
  const login = async (username:string, password:string) => {
    try {
      const data = await authService.login(username, password);
      setToken(data.token); // Actualiza el estado de React
      setUser(data.user); // Guarda el usuario
      // Tras login exitoso, actualizar la racha
      try {
        const streak = await streakService.ping();
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            stats: {
              ...(prev.stats ?? { streak_count: 0, best_streak: 0, last_active_date: null }),
              streak_count: streak.streak_count,
              best_streak: streak.best_streak,
              last_active_date: streak.last_active_date,
            },
          };
        });
      } catch (e) {
        console.warn('No se pudo actualizar la racha tras login:', e);
      }
      return data;
    } catch (error) {
      logout();
      throw error;
    }
  };
  
  const updateUser = async (data: Partial<User>) => {
    const updated = await authService.updateUser(data as any);
    setUser(updated);
    return updated;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null); 
  };

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    login,
    logout,
    updateUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};