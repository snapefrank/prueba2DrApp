import { useEffect } from 'react';
import { usePreferencesStore } from '@/stores/preferences-store';

/**
 * Hook para acceder y manipular las preferencias del usuario.
 * Incluye funcionalidad para aplicar automáticamente las preferencias al DOM.
 */
export function usePreferences() {
  const { 
    preferences,
    setLanguage,
    toggleAccessibilityMode,
    toggleAnimations,
    setFontSize,
    setColorContrast,
    resetPreferences
  } = usePreferencesStore();

  // Efecto para aplicar las configuraciones de accesibilidad al DOM
  useEffect(() => {
    // Aplicar tamaño de fuente
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (preferences.fontSize === 'small') {
      htmlElement.style.fontSize = '14px';
    } else if (preferences.fontSize === 'medium') {
      htmlElement.style.fontSize = '16px';
    } else if (preferences.fontSize === 'large') {
      htmlElement.style.fontSize = '18px';
    }
    
    // Aplicar modo de accesibilidad
    if (preferences.accessibilityMode) {
      bodyElement.classList.add('accessibility-mode');
    } else {
      bodyElement.classList.remove('accessibility-mode');
    }
    
    // Aplicar desactivación de animaciones
    if (preferences.disableAnimations) {
      bodyElement.classList.add('reduce-motion');
    } else {
      bodyElement.classList.remove('reduce-motion');
    }
    
    // Aplicar contraste de color
    if (preferences.colorContrast === 'high') {
      bodyElement.classList.add('high-contrast');
    } else {
      bodyElement.classList.remove('high-contrast');
    }
    
    // Agregar estilos CSS a la página si no existen
    if (!document.getElementById('accessibility-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'accessibility-styles';
      styleEl.textContent = `
        .accessibility-mode :focus {
          outline: 3px solid var(--primary) !important;
          outline-offset: 2px;
        }
        
        .reduce-motion * {
          animation-duration: 0.001ms !important;
          transition-duration: 0.001ms !important;
        }
        
        .high-contrast {
          --background: #ffffff;
          --foreground: #000000;
          --muted: #e0e0e0;
          --muted-foreground: #202020;
          --border: #505050;
          --input: #d0d0d0;
          --ring: #404040;
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    // Establecer el idioma en el elemento HTML
    htmlElement.setAttribute('lang', preferences.language);
    
  }, [preferences]);

  return {
    preferences,
    setLanguage,
    toggleAccessibilityMode,
    toggleAnimations,
    setFontSize,
    setColorContrast,
    resetPreferences
  };
}