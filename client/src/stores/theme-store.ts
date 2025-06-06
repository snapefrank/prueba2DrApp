import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Store con persistencia en localStorage - modificado para siempre usar tema claro
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light', // Valor por defecto forzado a light
      setTheme: (theme: Theme) => set({ theme: 'light' }), // Siempre establece 'light' sin importar el parámetro
    }),
    {
      name: 'mediconnect-theme', // Nombre para localStorage
    }
  )
);

// Función helper para aplicar el tema al DOM - modificada para forzar tema claro
export const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  
  // Remover clases existentes
  root.classList.remove('light', 'dark');
  
  // Siempre aplicar tema claro independientemente del parámetro
  root.classList.add('light');
};