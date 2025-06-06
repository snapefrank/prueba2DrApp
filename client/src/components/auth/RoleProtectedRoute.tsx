import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { UserTypeValues } from '@shared/schema';
import { getCurrentSubdomain, getDefaultSubdomainForUserType, SUBDOMAINS } from '@/lib/subdomain';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserTypeValues[];
}

/**
 * Componente que protege rutas basado en roles de usuario
 * Solo permite acceso si el usuario tiene uno de los roles permitidos
 * También verifica que el subdominio coincida con el rol del usuario
 */
export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const currentSubdomain = getCurrentSubdomain();

  // Efecto para redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    }
  }, [user, isLoading, setLocation]);

  // Durante la carga, mostrar un spinner
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg">Verificando permisos...</p>
      </div>
    );
  }

  // Si no hay usuario, mostrar mensaje mientras se redirecciona
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 p-6">
        <Alert variant="destructive">
          <AlertTitle>Acceso denegado</AlertTitle>
          <AlertDescription>Debes iniciar sesión para acceder a esta página</AlertDescription>
        </Alert>
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  // Verificar si el usuario tiene un rol permitido
  if (!allowedRoles.includes(user.userType as UserTypeValues)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 p-6">
        <Alert variant="destructive">
          <AlertTitle>Acceso denegado</AlertTitle>
          <AlertDescription>
            No tienes permiso para acceder a esta sección. 
            Tu rol actual es {user.userType}, pero se requiere uno de los siguientes roles: {allowedRoles.join(', ')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Verificación de subdominio más flexible para entornos de desarrollo
  const userTypeSubdomain = getDefaultSubdomainForUserType(user.userType as UserTypeValues);
  // En entorno de desarrollo, verificamos también el parámetro de URL
  let effectiveSubdomain = currentSubdomain;
  if (import.meta.env.DEV) {
    const urlParams = new URLSearchParams(window.location.search);
    const paramSubdomain = urlParams.get('subdomain');
    if (paramSubdomain && Object.values(SUBDOMAINS).includes(paramSubdomain)) {
      effectiveSubdomain = paramSubdomain;
    }
  }
  
  // Solo verificamos la coincidencia si no estamos en www y si no hay coincidencia
  // entre el subdominio efectivo y el esperado para el tipo de usuario
  if (effectiveSubdomain !== SUBDOMAINS.WWW && 
      effectiveSubdomain !== userTypeSubdomain && 
      // Si estamos en localhost o IP, no bloqueamos por subdominio
      !window.location.hostname.match(/localhost|\d+\.\d+\.\d+\.\d+/)) {
    console.warn(`Verificación de subdominio fallida: Actual ${effectiveSubdomain}, Esperado ${userTypeSubdomain}`);
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 p-6">
        <Alert variant="destructive">
          <AlertTitle>Subdominio incorrecto</AlertTitle>
          <AlertDescription>
            Estás accediendo desde el subdominio '{effectiveSubdomain}', pero tu rol necesita
            el subdominio '{userTypeSubdomain}'.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Log para verificar que está pasando correctamente
  if (user) {
    console.log(`[RoleProtectedRoute] Acceso permitido para usuario ${user.userType} en subdominio ${effectiveSubdomain}`);
  }

  // Si todo está correcto, renderizar el contenido protegido
  return <>{children}</>;
}
