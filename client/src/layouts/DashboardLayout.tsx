import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { createInternalLink } from "@/lib/subdomain";
import { StaticSidebar } from "@/components/layout/StaticSidebar";
import Navbar from "@/components/layout/Navbar";
import { RouteOutlet } from "@/components/layout/RouteOutlet";
import { AccessibilityPanel } from "@/components/ui/accessibility-panel";
import { Menu, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Cierra el menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileOpen(false);
    console.log("[DashboardLayout] Ubicación cambiada:", location);
  }, [location]);

  // Verifica autenticación y redirige si no hay usuario
  useEffect(() => {
    console.log("[DashboardLayout] Estado de autenticación:", {
      user: user ? `${user.username} (${user.userType})` : "no autenticado",
      location,
    });

    if (!user) {
      setMountError("No hay usuario autenticado en DashboardLayout");
      toast({
        title: "No se detectó sesión iniciada",
        description: "Redirigiendo a la página de autenticación...",
        variant: "destructive",
      });

      setTimeout(() => {
        window.location.href = createInternalLink("/auth");
      }, 1500);
    } else {
      setMountError(null);
    }
  }, [user, location, toast, setLocation]);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

  const sidebarWidth = "lg:w-64";

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Botón del menú móvil */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="w-10 h-10 rounded-full bg-white shadow-md border-gray-200"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar móvil */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={toggleMobileMenu}
          />
          <StaticSidebar isMobile={true} closeMobileMenu={toggleMobileMenu} />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar desktop */}
        <div className={`hidden lg:block ${sidebarWidth} flex-shrink-0`}>
          <StaticSidebar isMobile={false} />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar superior completo */}
          <div className="h-16 w-full flex-shrink-0">
            <Navbar />
          </div>

          {/* Contenido del dashboard */}
          <main className="flex-1 overflow-y-auto bg-white">
            <div className="h-full p-4 md:p-6">
              {mountError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error de acceso</AlertTitle>
                  <AlertDescription>
                    {mountError} - Redirigiendo al login...
                  </AlertDescription>
                </Alert>
              )}

              <RouteOutlet>{children}</RouteOutlet>
              <AccessibilityPanel />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
