import { useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLaboratory from "@/pages/dashboard/laboratory/index";
import { getCurrentSubdomain, SUBDOMAINS, redirectToUserSubdomain } from "@/lib/subdomain";
import { UserType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

/**
 * Esta página sirve como puente para acceder al dashboard de laboratorio
 * sin depender del sistema de subdominios
 */
const LaboratoryPage = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const currentSubdomain = getCurrentSubdomain();

  useEffect(() => {
    // Si estamos en el subdominio correcto, mostrar el dashboard
    if (currentSubdomain === SUBDOMAINS.LABS) {
      return;
    }
    
    // Si el usuario está loggeado y es tipo laboratory, redirigir al subdominio
    if (user && user.userType === UserType.LABORATORY) {
      redirectToUserSubdomain(UserType.LABORATORY, "/dashboard/laboratory");
      return;
    }
    
    // Si no hay parámetro subdomain, agregar el parámetro
    if (import.meta.env.DEV && !window.location.search.includes("subdomain=")) {
      navigate("/?subdomain=laboratory");
      return;
    }
  }, [currentSubdomain, user, navigate]);
  
  return <DashboardLaboratory />;
};

export default LaboratoryPage;