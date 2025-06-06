import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Componente que protege rutas para usuarios autenticados
 * Si el usuario no está autenticado, redirige a la página de login
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = "/auth-page" 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Si ya terminó de cargar y no hay usuario, redirigir al login
    if (!isLoading && !user) {
      console.log("[ProtectedRoute] Usuario no autenticado. Redirigiendo a:", redirectTo);
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  // Mientras está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (la redirección ocurre en el useEffect)
  if (!user) {
    return null;
  }

  // Si hay usuario, renderizar el contenido protegido
  return <>{children}</>;
}