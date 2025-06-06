import { ReactNode, useState, useEffect } from "react";
import { StaticSidebar } from "@/components/layout/StaticSidebar";
import Navbar from "@/components/layout/Navbar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { NotificationIndicator } from "@/components/ui/notification-indicator";
import { AccessibilityPanel } from "@/components/ui/accessibility-panel";
import { RouteOutlet } from "@/components/layout/RouteOutlet";

type MainLayoutProps = {
  children: ReactNode;
  showNavbar?: boolean;
  // Este flag determina si el children ya es un RouteOutlet o necesita ser envuelto
  isContentRouteOutlet?: boolean;
};

export default function MainLayout({ 
  children, 
  showNavbar = false,
  isContentRouteOutlet = false 
}: MainLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [location] = useLocation();
  
  // Cierra el menú móvil cuando cambia la ubicación
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  
  // Dimensiones fijas para el sidebar (siempre visible)
  const sidebarWidth = "lg:w-64"; 
  const contentMargin = "lg:ml-64";
  
  // Si el contenido no es un RouteOutlet, lo envolvemos para simular Outlet de React Router
  const content = isContentRouteOutlet 
    ? children 
    : <RouteOutlet>{children}</RouteOutlet>;
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Botón del menú móvil - Solo para móviles */}
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
      
      {/* Sidebar para dispositivos móviles */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu} />
          <StaticSidebar 
            isMobile={true} 
            closeMobileMenu={toggleMobileMenu} 
          />
        </div>
      )}
      
      {/* Sidebar para desktop - SIEMPRE VISIBLE sin opción de colapsar */}
      <div className={`hidden lg:flex lg:static ${sidebarWidth} flex-shrink-0`}>
        <StaticSidebar isMobile={false} />
      </div>
      
      {/* Contenido principal con margen para acomodar el sidebar */}
      <div className={`flex flex-col w-full flex-1 overflow-hidden ${contentMargin}`}>
        {/* Barra superior con Navbar (opcional), notificaciones y selector de tema */}
        <div className="bg-card border-b border-border flex justify-between items-center p-4">
          <div>
            {showNavbar && <Navbar />}
          </div>
          <div className="flex items-center gap-2">
            <NotificationIndicator />
            <ThemeSelector />
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Aquí es donde renderizamos el contenido o un RouteOutlet similar a Outlet de React Router */}
              {content}
              
              {/* Panel de accesibilidad - siempre disponible en la esquina inferior derecha */}
              <AccessibilityPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}