import { useEffect } from 'react';
import { useThemeStore, applyTheme } from '@/stores/theme-store';

export function useTheme() {
  const { theme, setTheme } = useThemeStore();

  // Sincronizar tema con DOM cuando cambia
  useEffect(() => {
    applyTheme(theme);
    
    // Establecer observer para cambios en preferencia del sistema
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return { theme, setTheme };
}