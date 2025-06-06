import React, { useEffect } from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { HelmetProvider } from 'react-helmet-async';
import { ChatProvider } from '@/hooks/use-chat-websocket';
import { Toaster } from "@/components/ui/toaster";
import { useThemeStore, applyTheme } from '@/stores/theme-store';
import { EmergencyLoginButton } from "@/components/auth/EmergencyLoginButton";

// Función para limpiar sesión accesible globalmente
declare global {
  interface Window {
    clearMediConnectSession: () => void;
  }
}

// Componente para inicializar el tema y funciones de emergencia
function ThemeInitializer() {
  const { theme } = useThemeStore();
  
  useEffect(() => {
    // Aplicar el tema al cargar la aplicación
    applyTheme(theme);
    
    // Configurar listener para cambios en la preferencia del sistema
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        applyTheme('system');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Inicializar funciones de emergencia global
  useEffect(() => {
    // Exponer la función de limpieza de sesión en el objeto window
    window.clearMediConnectSession = () => {
      try {
        console.log('Limpiando sesión...');
        // Limpiar localStorage
        localStorage.removeItem('mediconnect_user');
        localStorage.removeItem('mediconnect_auth_token');
        
        // Limpiar React Query
        queryClient.setQueryData(['/api/user'], null);
        // Usar la sintaxis correcta para TanStack Query v5
        queryClient.invalidateQueries();
        console.log('Cache de React Query invalidado');
        
        console.log('Sesión limpiada correctamente.');
        console.log('Recargando página...');
        
        // Recargar la página
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
      } catch (error) {
        console.error('Error al limpiar sesión:', error);
      }
    };
    
    // Log para informar al usuario
    console.log('%c¡Función de emergencia disponible!', 'color: white; background: red; padding: 2px 5px; border-radius: 3px; font-weight: bold;');
    console.log('Para limpiar tu sesión, ejecuta: window.clearMediConnectSession()');
    
  }, []);
  
  return null;
}

createRoot(document.getElementById("root")!).render(
  // StrictMode puede causar problemas con navegación por subdominios al hacer doble renderizado
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <ThemeInitializer />
          <App />
          <EmergencyLoginButton showButton={false} />
          <Toaster />
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
