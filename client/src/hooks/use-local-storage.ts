import { useState } from 'react';

/**
 * Hook personalizado para interactuar con localStorage
 * @param key Clave para almacenar/recuperar el valor
 * @param initialValue Valor inicial si no existe el item en localStorage
 * @returns [storedValue, setValue] par similar a useState
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Obtener del almacenamiento local por clave
      const item = window.localStorage.getItem(key);
      // Analizar el JSON almacenado o si no existe devolver el valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si hay un error, también devolvemos el valor inicial
      console.log(error);
      return initialValue;
    }
  });

  // Función para actualizar el valor en localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que el valor sea una función para tener la misma API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Guardar estado
      setStoredValue(valueToStore);
      // Guardar en localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Un error más sofisticado podría ser manejado aquí
      console.log(error);
    }
  };
  return [storedValue, setValue] as const;
}