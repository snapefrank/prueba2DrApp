import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { createInternalLink } from "@/lib/subdomain";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    ClipboardList,
    Users,
    FlaskRound,
    Settings,
    CreditCard,
    Clipboard,
    LogOut,
    User,
    Home,
    Stethoscope,
    MessageSquare,
    HeartPulse,
    Building,
    Activity,
    Tablets,
    Bell,
    Search,
    BarChart3,
    Receipt,
    Award,
    Microscope,
    ShieldAlert,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserTypeValues, UserType } from "@shared/schema";

// Definimos los tipos de enlaces
type SidebarLink = {
    name: string;
    href: string;
    icon: React.ReactNode;
};

// Props para el sidebar
interface SidebarProps {
    isMobile: boolean;
    closeMobileMenu?: () => void;
}

// Enlaces del menú para doctores/especialistas
const doctorLinks: SidebarLink[] = [
    {
        name: "Panel",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        name: "Pacientes",
        href: "/dashboard/pacientes",
        icon: <Users className="w-5 h-5" />,
    },
    {
        name: "Agenda",
        href: "/dashboard/agenda",
        icon: <Calendar className="w-5 h-5" />,
    },
    {
        name: "Recetas",
        href: "/dashboard/recetas",
        icon: <FileText className="w-5 h-5" />,
    },
    {
        name: "Laboratorio",
        href: "/dashboard/laboratorio",
        icon: <FlaskRound className="w-5 h-5" />,
    },
    {
        name: "Expedientes",
        href: "/dashboard/expedientes",
        icon: <Clipboard className="w-5 h-5" />,
    },
    {
        name: "Consulta",
        href: "/dashboard/consulta",
        icon: <Stethoscope className="w-5 h-5" />,
    },
    {
        name: "Diagnóstico AI",
        href: "/dashboard/diagnostico-ai",
        icon: <Activity className="w-5 h-5" />,
    },
    {
        name: "Tareas",
        href: "/dashboard/tareas",
        icon: <ClipboardList className="w-5 h-5" />,
    },
    {
        name: "Mensajes",
        href: "/dashboard/mensajes",
        icon: <MessageSquare className="w-5 h-5" />,
    },
    {
        name: "Mi Perfil",
        href: "/dashboard/perfil",
        icon: <User className="w-5 h-5" />,
    },
    {
        name: "Configuración",
        href: "/dashboard/configuracion",
        icon: <Settings className="w-5 h-5" />,
    },
    {
        name: "Suscripciones",
        href: "/dashboard/suscripciones",
        icon: <CreditCard className="w-5 h-5" />,
    },
];

// Enlaces del menú para pacientes
const patientLinks: SidebarLink[] = [
    {
        name: "Panel",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        name: "Mis Médicos",
        href: "/dashboard/mis-medicos",
        icon: <Stethoscope className="w-5 h-5" />,
    },
    {
        name: "Citas",
        href: "/dashboard/citas",
        icon: <Calendar className="w-5 h-5" />,
    },
    {
        name: "Historial Médico",
        href: "/dashboard/historial",
        icon: <HeartPulse className="w-5 h-5" />,
    },
    {
        name: "Recetas",
        href: "/dashboard/mis-recetas",
        icon: <FileText className="w-5 h-5" />,
    },
    {
        name: "Resultados Lab",
        href: "/dashboard/resultados-lab",
        icon: <FlaskRound className="w-5 h-5" />,
    },
    {
        name: "Mensajes",
        href: "/dashboard/mensajes",
        icon: <MessageSquare className="w-5 h-5" />,
    },
    {
        name: "Mi Perfil",
        href: "/dashboard/perfil",
        icon: <User className="w-5 h-5" />,
    },
    {
        name: "Configuración",
        href: "/dashboard/configuracion",
        icon: <Settings className="w-5 h-5" />,
    },
    {
        name: "Pagos",
        href: "/dashboard/pagos",
        icon: <CreditCard className="w-5 h-5" />,
    },
];

// Enlaces del menú para administradores
const adminLinks: SidebarLink[] = [
    {
        name: "Panel",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        name: "Usuarios",
        href: "/dashboard/usuarios",
        icon: <Users className="w-5 h-5" />,
    },
    {
        name: "Especialidades",
        href: "/dashboard/especialidades",
        icon: <Building className="w-5 h-5" />,
    },
    {
        name: "Verificaciones",
        href: "/dashboard/verificaciones",
        icon: <ShieldAlert className="w-5 h-5" />,
    },
    {
        name: "Medicamentos",
        href: "/dashboard/medicamentos",
        icon: <Tablets className="w-5 h-5" />,
    },
    {
        name: "Notificaciones",
        href: "/dashboard/notificaciones",
        icon: <Bell className="w-5 h-5" />,
    },
    {
        name: "Reportes",
        href: "/dashboard/reportes",
        icon: <BarChart3 className="w-5 h-5" />,
    },
    {
        name: "Suscripciones",
        href: "/dashboard/suscripciones-admin",
        icon: <CreditCard className="w-5 h-5" />,
    },
    {
        name: "Configuración",
        href: "/dashboard/configuracion",
        icon: <Settings className="w-5 h-5" />,
    },
];

// Enlaces del menú para laboratorios
const laboratoryLinks: SidebarLink[] = [
    {
        name: "Panel",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        name: "Catálogo",
        href: "/dashboard/catalogo",
        icon: <Search className="w-5 h-5" />,
    },
    {
        name: "Peticiones",
        href: "/dashboard/peticiones",
        icon: <ClipboardList className="w-5 h-5" />,
    },
    {
        name: "Resultados",
        href: "/dashboard/resultados",
        icon: <Microscope className="w-5 h-5" />,
    },
    {
        name: "Pacientes",
        href: "/dashboard/pacientes-lab",
        icon: <Users className="w-5 h-5" />,
    },
    {
        name: "Médicos",
        href: "/dashboard/medicos-lab",
        icon: <Stethoscope className="w-5 h-5" />,
    },
    {
        name: "Facturas",
        href: "/dashboard/facturas",
        icon: <Receipt className="w-5 h-5" />,
    },
    {
        name: "Mensajes",
        href: "/dashboard/mensajes",
        icon: <MessageSquare className="w-5 h-5" />,
    },
    {
        name: "Mi Laboratorio",
        href: "/dashboard/perfil-lab",
        icon: <Building className="w-5 h-5" />,
    },
    {
        name: "Certificaciones",
        href: "/dashboard/certificaciones",
        icon: <Award className="w-5 h-5" />,
    },
    {
        name: "Configuración",
        href: "/dashboard/configuracion",
        icon: <Settings className="w-5 h-5" />,
    },
];

// Función para obtener los enlaces adecuados según el tipo de usuario
function getLinksByUserType(userType: UserTypeValues | string): SidebarLink[] {
    switch (userType) {
        case UserType.DOCTOR:
            return doctorLinks;
        case UserType.PATIENT:
            return patientLinks;
        case UserType.ADMIN:
            return adminLinks;
        case UserType.LABORATORY:
            return laboratoryLinks;
        default:
            // Devolver links de paciente por defecto como opción segura
            console.warn(
                `Tipo de usuario desconocido: ${userType}, usando menú de paciente por defecto`
            );
            return patientLinks;
    }
}

export function StaticSidebar({ isMobile, closeMobileMenu }: SidebarProps) {
    const [location] = useLocation();
    const { user, logoutMutation } = useAuth();

    // Obtener los enlaces apropiados según el tipo de usuario
    const userLinks = user ? getLinksByUserType(user.userType) : patientLinks;

    // Generar las iniciales para el avatar del usuario
    const getUserInitials = () => {
        if (!user) return "??";
        const firstInitial = user.firstName?.charAt(0) || "";
        const lastInitial = user.lastName?.charAt(0) || "";
        return (
            (firstInitial + lastInitial).toUpperCase() ||
            user.username.substring(0, 2).toUpperCase()
        );
    };

    // Función para cerrar sesión
    const handleLogout = () => {
        logoutMutation.mutate();
    };

    // Determinar el nombre a mostrar en el menú
    const getUserDisplayName = () => {
        if (!user) return "Usuario";
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user.username;
    };

    // Determinar el subtexto según el tipo de usuario
    const getUserRoleText = () => {
        if (!user) return "";
        switch (user.userType) {
            case UserType.DOCTOR:
                return "Médico";
            case UserType.PATIENT:
                return "Paciente";
            case UserType.ADMIN:
                return "Administrador";
            case UserType.LABORATORY:
                return "Laboratorio";
            default:
                return user.userType;
        }
    };

    // Versión móvil del sidebar
    if (isMobile) {
        return (
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card h-full overflow-y-auto">
                <div className="flex-1 flex flex-col min-h-0 border-r border-border">
                    <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                        {/* <Link href={createInternalLink("/")} className="text-primary text-xl font-bold" onClick={closeMobileMenu}>
              MediConnect
            </Link> */}
                    </div>

                    <div className="flex-shrink-0 flex px-4 py-3 border-b border-border bg-muted">
                        <Button
                            variant="ghost"
                            className="p-0 h-auto flex items-center space-x-3 w-full justify-start"
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/20 text-primary">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left">
                                <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                                    {getUserDisplayName()}
                                </p>
                                <p className="text-xs font-medium text-muted-foreground capitalize">
                                    {getUserRoleText()}
                                </p>
                            </div>
                        </Button>
                    </div>

                    <nav className="mt-6 px-2 space-y-1 flex-grow">
                        {userLinks.map(item => {
                            const isActive =
                                location === item.href ||
                                (item.href !== "/" &&
                                    location.startsWith(item.href));
                            // Crear enlace interno que preserva el subdominio actual
                            const internalLink = createInternalLink(item.href);
                            console.log(
                                `[Sidebar Mobile] Enlace para ${item.name}: ${internalLink}`
                            );

                            return (
                                <Link
                                    href={internalLink}
                                    key={item.name}
                                    className={cn(
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-foreground hover:bg-muted hover:text-foreground",
                                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                                    )}
                                    onClick={closeMobileMenu}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto px-4 py-4 border-t border-border">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-destructive"
                            onClick={handleLogout}
                            disabled={logoutMutation.isPending}
                        >
                            {logoutMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Cerrando sesión...</span>
                                </>
                            ) : (
                                <>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Cerrar sesión</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Versión desktop del sidebar
    return (
        <div className="flex flex-col h-full border-r border-border bg-card">
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                <div className="flex items-center justify-between flex-shrink-0 px-4 h-16 border-b border-border">
                    {/* <Link
                        href={createInternalLink("/")}
                        className="text-primary text-xl font-bold"
                    >
                        MediConnect
                    </Link> */}
                </div>

                <div className="flex-shrink-0 flex px-4 py-3 border-b border-border bg-muted">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="p-0 h-auto flex items-center space-x-3 w-full justify-start"
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/20 text-primary">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-left">
                                    <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                                        {getUserDisplayName()}
                                    </p>
                                    <p className="text-xs font-medium text-muted-foreground capitalize">
                                        {getUserRoleText()}
                                    </p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href={createInternalLink(
                                        "/dashboard/perfil"
                                    )}
                                    className="flex items-center cursor-pointer"
                                >
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Perfil</span>
                                </Link>
                            </DropdownMenuItem>
                            {user?.userType === UserType.DOCTOR && (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={createInternalLink(
                                            "/dashboard/verificacion"
                                        )}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <ShieldAlert className="mr-2 h-4 w-4" />
                                        <span>Verificación</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {user?.userType === UserType.LABORATORY && (
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={createInternalLink(
                                            "/dashboard/certificaciones"
                                        )}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <Award className="mr-2 h-4 w-4" />
                                        <span>Certificaciones</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link
                                    href={createInternalLink(
                                        "/dashboard/configuracion"
                                    )}
                                    className="flex items-center cursor-pointer"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Configuración</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onClick={handleLogout}
                                disabled={logoutMutation.isPending}
                            >
                                {logoutMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Cerrando sesión...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Cerrar sesión</span>
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <nav className="mt-6 px-2 space-y-1 flex-grow">
                    {userLinks.map(item => {
                        const isActive =
                            location === item.href ||
                            (item.href !== "/" &&
                                location.startsWith(item.href));
                        // Crear enlace interno que preserva el subdominio actual
                        const internalLink = createInternalLink(item.href);
                        console.log(
                            `[Sidebar Desktop] Enlace para ${item.name}: ${internalLink}`
                        );

                        return (
                            <Link
                                href={internalLink}
                                key={item.name}
                                className={cn(
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-foreground hover:bg-muted hover:text-foreground",
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                                )}
                            >
                                {item.icon}
                                <span className="ml-3">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
