import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation, Link } from "wouter";
import { useEffect } from "react";
import { 
  getCurrentSubdomain, 
  hasAccessToSubdomain, 
  getDefaultSubdomainForUserType,
  buildSubdomainUrl,
  SUBDOMAINS
} from "./subdomain";

export function ProtectedRoute({
  path,
  component: Component,
  userTypes,
}: {
  path: string;
  component: () => React.JSX.Element;
  userTypes?: string[];
}) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const currentSubdomain = getCurrentSubdomain();

  // Efecto para verificar el acceso al subdominio actual basado en el tipo de usuario
  useEffect(() => {
    if (user && !isLoading) {
      const userSubdomain = getDefaultSubdomainForUserType(user.userType);
      
      // Si estamos en un subdominio específico (no www) y el usuario no tiene acceso a este subdominio
      if (currentSubdomain !== SUBDOMAINS.WWW && 
          !hasAccessToSubdomain(user.userType, currentSubdomain)) {
        // Redirigir al subdominio apropiado para su tipo de usuario
        window.location.href = buildSubdomainUrl(userSubdomain, location);
      }
    }
  }, [user, isLoading, currentSubdomain]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Si userTypes está especificado, verificar si el usuario tiene el tipo requerido
  if (userTypes && !userTypes.includes(user.userType)) {
    // Construir una URL para redirigir al dashboard apropiado de su tipo de usuario
    // Asegurar que la ruta comienza con una sola barra
    const userDashboardPath = `/dashboard/${user.userType.toLowerCase()}`.replace(/\/\//g, '/');
    
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permiso para acceder a esta página.
          </p>
          <Link
            href={userDashboardPath}
            className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-md hover:bg-primary-700 transition-colors"
          >
            Ir a tu dashboard
          </Link>
        </div>
      </Route>
    );
  }

  return <Route path={path}><Component /></Route>;
}
