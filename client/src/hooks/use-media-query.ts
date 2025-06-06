import { useState, useEffect } from 'react';

/**
 * Hook para detectar si una media query coincide con el viewport actual
 * @param query Media query a evaluar (ej: '(min-width: 768px)')
 * @returns Boolean indicando si la media query coincide
 */
export function useMediaQuery(query: string): boolean {
  // Estado inicial (false para evitar problemas con SSR)
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Crear media query
    const mediaQuery = window.matchMedia(query);
    
    // Establecer el valor inicial
    setMatches(mediaQuery.matches);
    
    // Función para actualizar el estado cuando cambia la media query
    const handleResize = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Registrar el listener
    if (typeof mediaQuery.addEventListener === 'function') {
      // API moderna
      mediaQuery.addEventListener('change', handleResize);
      
      // Limpiar listener
      return () => {
        mediaQuery.removeEventListener('change', handleResize);
      };
    } else {
      // API antigua (compatibilidad con navegadores antiguos)
      mediaQuery.addListener(handleResize);
      
      // Limpiar listener
      return () => {
        mediaQuery.removeListener(handleResize);
      };
    }
  }, [query]);
  
  return matches;
}