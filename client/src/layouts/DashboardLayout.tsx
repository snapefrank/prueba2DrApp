import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { createInternalLink } from "@/lib/subdomain";
import { StaticSidebar } from "@/components/layout/StaticSidebar";
import Navbar from "@/components/layout/Navbar";
import { RouteOutlet } from "@/components/layout/RouteOutlet";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { NotificationIndicator } from "@/components/ui/notification-indicator";
import { AccessibilityPanel } from "@/components/ui/accessibility-panel";
import { Menu, X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
    children: ReactNode;
}

/**
 * Layout específico para el dashboard que implementa la estructura solicitada:
 * - Sidebar (navegación lateral izquierda)
 * - Header con información del usuario
 * - Un área main central que contiene el RouteOutlet (equivalente a Outlet en React Router)
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const [location] = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [mountError, setMountError] = useState<string | null>(null);

    // Cierra el menú móvil cuando cambia la ubicación
    useEffect(() => {
        setIsMobileOpen(false);
        console.log("[DashboardLayout] Ubicación cambiada:", location);
    }, [location]);

    const { toast } = useToast();
    const [, setLocation] = useLocation();

    // Verificar que el componente tenga acceso al usuario autenticado
    useEffect(() => {
        console.log("[DashboardLayout] Estado de autenticación:", {
            user: user
                ? `${user.username} (${user.userType})`
                : "no autenticado",
            location,
        });

        if (!user) {
            setMountError("No hay usuario autenticado en DashboardLayout");
            toast({
                title: "No se detectó sesión iniciada",
                description: "Redirigiendo a la página de autenticación...",
                variant: "destructive",
            });

            // Darle al usuario tiempo para ver el mensaje antes de redirigir
            setTimeout(() => {
                window.location.href = createInternalLink("/auth");
            }, 1500);
        } else {
            setMountError(null);
        }
    }, [user, location, toast, setLocation]);

    const toggleMobileMenu = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    // Dimensiones fijas para el sidebar (siempre visible en desktop)
    const sidebarWidth = "lg:w-64";
    const contentMargin = "lg:ml-64";

    // Si hay un error de montaje, mostrar alerta pero seguir renderizando
    // Esto evita pantallas en blanco y da más información al usuario

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
                    {isMobileOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </Button>
            </div>

            {/* Sidebar móvil */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-30 lg:hidden">
                    <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-75"
                        onClick={toggleMobileMenu}
                    />
                    <StaticSidebar
                        isMobile={true}
                        closeMobileMenu={toggleMobileMenu}
                    />
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar desktop */}
                <div
                    className={`hidden lg:block ${sidebarWidth} flex-shrink-0`}
                >
                    <StaticSidebar isMobile={false} />
                </div>

                {/* Contenido principal */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Barra superior */}
                    <div className="bg-card border-b border-border flex justify-between items-center p-4 h-16 flex-shrink-0">
                        <div>
                            <Navbar />
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationIndicator />
                            <ThemeSelector />
                        </div>
                    </div>

                    {/* Área de contenido principal */}
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
