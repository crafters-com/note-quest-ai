// src/hooks/useData.ts
import { useState, useEffect } from 'react';

/**
 * @param fetcher Una función que devuelve una promesa con los datos.
 * @param deps El array de dependencias para el useEffect. El hook se volverá a ejecutar si cambian.
 * @returns Un objeto con los datos, el estado de carga y el estado de error.
 */
export function useData<T>(
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Usamos una variable para evitar race conditions si el componente se desmonta
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError("No se pudieron cargar los datos.");
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Función de limpieza que se ejecuta cuando el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, deps); // Vuelve a ejecutar el efecto si las dependencias cambian

  return { data, loading, error, setData };
}