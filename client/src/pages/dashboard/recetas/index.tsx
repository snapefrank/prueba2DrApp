import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

/**
 * Esta página es un redireccionador para mantener compatibilidad con
 * la estructura de rutas anterior. Redirige automáticamente a la ruta
 * correcta en la estructura doctor/recetas/
 */
export default function RecetasRedirect() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Redirigir a la ubicación correcta de manera inmediata
    navigate("/dashboard/doctor/recetas");
  }, [navigate]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Redireccionando...</p>
      </div>
    </div>
  );
}