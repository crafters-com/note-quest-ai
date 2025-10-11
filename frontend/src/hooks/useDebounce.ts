import { useState, useEffect } from 'react';

/**
 * Un custom hook que retrasa la actualización de un valor.
 * @param value El valor a "debouncear".
 * @param delay El tiempo de espera en milisegundos.
 * @returns El valor "debounceado".
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crea un temporizador que actualizará el valor después del 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el temporizador si el valor cambia (ej. sigues escribiendo)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se re-ejecuta si el valor o el delay cambian

  return debouncedValue;
}