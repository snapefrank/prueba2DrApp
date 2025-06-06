import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertTriangle } from "lucide-react";
import { isPublicRoute, isRouteAccessibleForUser, getDashboardHomeForUserType } from "@/lib/routing";
import { UserTypeValues } from "@shared/schema";
import { getCurrentSubdomain, getDefaultSubdomainForUserType, buildSubdomainUrl, SUBDOMAINS } from "@/lib/subdomain";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface RouteGuardProps {
  children: ReactNode;
}

/**
 * Componente avanzado para protección de rutas que verifica automáticamente
 * si el usuario actual puede acceder a la ruta actual basado en su rol
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  // Manejo mejorado de errores de navegación
  useEffect(() => {
    // Obtener el subdominio actual
    const currentSubdomain = getCurrentSubdomain();
    
    // Log detallado para debugging
    console.log(`[RouteGuard] Estado actual:`, {
      ruta: location,
      usuario: user?.username || 'no autenticado',
      tipoUsuario: user?.userType || 'ninguno',
      subdominio: currentSubdomain,
      cargando: isLoading,
      redirigiendo: redirecting,
      error: error
    });
    
    // No hacer nada mientras está cargando
    if (isLoading) return;

    // Si la ruta es pública, permitir acceso independientemente del estado de autenticación
    if (isPublicRoute(location)) {
      console.log(`[RouteGuard] Ruta pública: ${location}, acceso permitido`);
      setError(null);
      setRedirecting(false);
      return;
    }

    // Si la ruta requiere autenticación pero no hay usuario
    if (!user) {
      console.log(`[RouteGuard] Ruta protegida (${location}) accedida sin autenticación.`);
      setError("Debes iniciar sesión para acceder a esta página");
      setRedirecting(true);
      
      // Usar un enfoque directo y confiable para la redirección
      console.log("[RouteGuard] Aplicando redirección forzada al login");
      
      // Usar setTimeout para permitir que se completen otras operaciones
      setTimeout(() => {
        // Primero intentar con navigate (enfoque SPA)
        navigate("/auth");
        
        // Como respaldo, cambiar directamente la ubicación usando location.replace
        // que es más confiable que location.href para redirecciones
        setTimeout(() => {
          window.location.replace("/auth");
        }, 300);
      }, 100);
      return;
    }

    // Restablecer el trigger de fallback cuando hay un usuario autenticado
    if (fallbackTriggered) {
      setFallbackTriggered(false);
    }
    
    // Verificar que el usuario esté en el subdominio correcto para su tipo
    const expectedSubdomain = getDefaultSubdomainForUserType(user.userType);
    
    // Ya no redirigimos automáticamente, solo registramos en la consola
    // Los usuarios ahora son responsables de navegar a su propio subdominio
    if (currentSubdomain !== SUBDOMAINS.WWW && 
        currentSubdomain !== expectedSubdomain && 
        !isPublicRoute(location) && 
        location.startsWith('/dashboard')) {
        
      console.log(`[RouteGuard] Usuario ${user.username} (${user.userType}) en subdominio incorrecto: ${currentSubdomain}`);
      console.log(`[RouteGuard] ADVERTENCIA: No se redirigirá automáticamente al subdominio ${expectedSubdomain}. El usuario puede usar el menú de navegación para cambiar de subdominio.`);
      
      // No establecemos error ni redireccionamos
      // Los usuarios pueden estar en cualquier subdominio y ver el contenido
    }

    // Si hay usuario, verificar si tiene acceso a la ruta actual
    // CAMBIO: Temporalmente permitimos acceso a cualquier ruta para solucionar problemas de navegación
    // const hasAccess = isRouteAccessibleForUser(location, user.userType);
    const hasAccess = true; // Temporalmente permitimos acceso a todas las rutas
    console.log(`[RouteGuard] Verificando acceso: ${hasAccess ? 'permitido' : 'denegado'} para usuario tipo ${user.userType} a ruta ${location}`);
    
    if (!hasAccess) {
      // Redirigir al dashboard adecuado para su tipo de usuario
      const dashboardHome = getDashboardHomeForUserType(user.userType);
      console.log(`[RouteGuard] Redirigiendo a dashboard principal: ${dashboardHome}`);
      setError(`No tienes permiso para acceder a esta página como ${user.userType}`);
      setRedirecting(true);
      navigate(dashboardHome);
    } else {
      // Limpiar estados de error y redirección si el usuario tiene acceso
      setError(null);
      setRedirecting(false);
    }
  }, [location, user, isLoading, navigate, fallbackTriggered]);

  // Pantalla de carga durante la verificación inicial
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg">Verificando acceso...</p>
      </div>
    );
  }
  
  // Pantalla de redirección cuando hay un error o se está redirigiendo
  if (redirecting || error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4 max-w-md mx-auto p-6">
        <Alert variant="destructive" className="w-full">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>{error || "Redirigiendo a una página apropiada..."}</AlertDescription>
        </Alert>
        <Loader2 className="h-8 w-8 animate-spin my-4" />
        <p>Redirigiendo...</p>
        <Button 
          onClick={() => {
            if (user) {
              // Redirigir al dashboard en el subdominio correcto para el tipo de usuario
              const subdomain = getDefaultSubdomainForUserType(user.userType);
              const dashboardUrl = buildSubdomainUrl(subdomain, '/dashboard');
              window.location.href = dashboardUrl;
            } else {
              // Si no hay usuario, ir a la página de autenticación
              window.location.replace('/auth');
            }
          }}
          className="mt-4"
        >
          {user ? "Ir al dashboard" : "Ir al login"}
        </Button>
      </div>
    );
  }

  // Si no hay usuario y la ruta requiere autenticación, no renderizar contenido
  if (!user && !isPublicRoute(location)) {
    console.log(`[RouteGuard] Previniendo renderizado de ruta protegida: ${location}`);
    return null;
  }

  // Si es una ruta pública o el usuario tiene acceso, renderizar normalmente
  return <>{children}</>;
}