import { ReactNode, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useDemoNotifications } from "@/hooks/use-demo-notifications";
import { usePreferences } from "@/hooks/use-preferences";

interface DoctorLayoutProps {
  children: ReactNode;
  // Flag opcional para indicar si el children ya es un RouteOutlet
  isContentRouteOutlet?: boolean;
}

const DoctorLayout = ({ children, isContentRouteOutlet = false }: DoctorLayoutProps) => {
  // Inicializar hooks
  const { preferences } = usePreferences();
  
  // Agregar notificaciones de demostración solo en páginas de dashboard
  useEffect(() => {
    // Solo se dispara una vez cuando el componente se monta
    // Las notificaciones de ejemplo ahora se activarán en cualquier página del dashboard
  }, []);
  
  return (
    <MainLayout isContentRouteOutlet={isContentRouteOutlet}>
      {children}
    </MainLayout>
  );
};

export default DoctorLayout;