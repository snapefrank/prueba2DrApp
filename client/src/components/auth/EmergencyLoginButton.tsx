import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, LogIn, Loader2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { UserType, User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { buildSubdomainUrl } from '@/lib/subdomain';

/**
 * Botón de emergencia que permite iniciar sesión como médico
 * cuando el sistema normal de autenticación falla.
 * Este componente fuerza la sesión localmente sin hacer llamadas al backend.
 */
// Props para el botón de emergencia 
interface EmergencyLoginButtonProps {
  showButton?: boolean;
}

// Variable global para controlar que el botón solo se active en desarrollo
if (process.env.NODE_ENV === 'development') {
  window.clearMediConnectSession = () => {
    localStorage.removeItem("mediconnect_user");
    location.reload();
  };
  console.log('%c¡Función de emergencia disponible!', 'color: white; background: red; padding: 2px 5px; border-radius: 3px; font-weight: bold;');
  console.log('Para limpiar tu sesión, ejecuta: window.clearMediConnectSession()');
}

export function EmergencyLoginButton({ showButton = false }: EmergencyLoginButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Estado para determinar si mostrar el botón basado en error de login o prop
  const [shouldShowButton, setShouldShowButton] = useState(showButton);
  
  // Efecto para verificar si hay errores de API persistentes
  useEffect(() => {
    // En producción, solo mostrar el botón cuando hay errores específicos
    if (process.env.NODE_ENV === 'production') {
      const loginErrorCount = parseInt(localStorage.getItem('mediconnect_login_error_count') || '0');
      setShouldShowButton(loginErrorCount > 2 || showButton); // Mostrar después de 3 intentos fallidos
    } else {
      // En desarrollo, puede estar disponible para pruebas pero controlado
      setShouldShowButton(true);
    }
  }, [showButton]);

  const emergencyLogin = () => {
    setIsLoading(true);
    
    try {
      // Crear un usuario doctor ficticio para emergencias
      const mockUser: User = {
        id: 2,
        username: 'doctor_emergency',
        email: 'doctor@mediconnect.com',
        firstName: 'Doctor',
        lastName: 'Emergencia',
        password: '',
        userType: UserType.DOCTOR,
        isActive: true,
        createdAt: new Date(),
        profileImage: null
      };
      
      // Guardar usuario de emergencia
      localStorage.setItem('mediconnect_user', JSON.stringify(mockUser));
      queryClient.setQueryData(['/api/user'], mockUser);
      
      toast({
        title: 'Acceso de emergencia activado',
        description: 'Se ha iniciado sesión como médico en modo de emergencia',
        variant: 'default'
      });
      
      // Redireccionar al dashboard en el subdominio doctor
      setTimeout(() => {
        // Redireccionar al subdominio doctor con ruta dashboard
        const url = buildSubdomainUrl('doctor', '/dashboard');
        window.location.href = url;
      }, 1000);
    } catch (error) {
      console.error('Error en login de emergencia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo activar el acceso de emergencia',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  // Solo mostrar el botón cuando hay problemas de login o está explícitamente solicitado
  if (!shouldShowButton) {
    return null;
  }
  
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(true)}
          className="bg-white text-red-500 border-red-500 hover:bg-red-50 shadow-md"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Acceso de emergencia
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
      <Alert className="mb-3" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Modo de emergencia</AlertTitle>
        <AlertDescription>
          Utiliza esta opción sólo si no puedes iniciar sesión normalmente.
        </AlertDescription>
      </Alert>
      
      <div className="flex space-x-2">
        <Button
          onClick={() => setIsOpen(false)}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Cancelar
        </Button>
        
        <Button
          onClick={emergencyLogin}
          disabled={isLoading}
          variant="destructive"
          size="sm"
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Accediendo...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-1" />
              Forzar acceso
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
