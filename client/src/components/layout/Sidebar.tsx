import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  ClipboardList,
  Users,
  FlaskRound,
  BarChart,
  Settings,
  DollarSign,
  Menu,
  X,
  CreditCard,
  Clipboard,
  StarIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Bell,
  Home,
  Stethoscope,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type SidebarLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

interface SidebarProps {
  isMobile: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  closeMobileMenu: () => void;
}

export default function Sidebar({
  isMobile,
  isCollapsed,
  toggleCollapse,
  closeMobileMenu
}: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Obtener perfil de usuario para la imagen solo si hay usuario
  const { data: userProfile } = useQuery({
    queryKey: [(user && (user?.userType === "doctor" || user?.userType === "specialist")) ? 
      "/api/doctor-profile" : "/api/patient-profile"],
    // Importante: Deshabilitar la consulta si no hay usuario para evitar errores
    enabled: !!user?.id,
  });
  
  // Actualizar la imagen de perfil cuando se carga el perfil, solo si hay datos válidos
  useEffect(() => {
    if (userProfile && typeof userProfile === 'object' && 'profileImage' in userProfile) {
      setProfileImage(userProfile.profileImage);
      console.log("Profile image set:", userProfile.profileImage);
    }
  }, [userProfile]);

  // En lugar de no renderizar nada cuando no hay usuario, mostrar un sidebar básico
  if (!user) {
    // Mostrar sidebar mínimo con enlaces a la página principal
    return (
      <div className="relative flex-1 flex flex-col h-full bg-white border-r border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-primary-600 text-xl font-bold">MediConnect</span>
        </div>
        <div className="mt-6 px-4 flex-grow">
          <div className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600">
            Cargando...
          </div>
        </div>
      </div>
    );
  }

  let links: SidebarLink[] = [
    // Link para la página principal siempre presente
    { name: "Página Principal", href: "/", icon: <Home className="w-5 h-5" /> },
  ];

  // Define links based on user type
  if (user.userType === "patient") {
    links = [
      ...links,
      { name: "Panel", href: "/dashboard/patient", icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: "Mis Citas", href: "/dashboard/patient/citas", icon: <Calendar className="w-5 h-5" /> },
      { name: "Agendar Cita", href: "/dashboard/patient/agendar-cita", icon: <Calendar className="w-5 h-5" /> },
      { name: "Documentos", href: "/dashboard/patient/documents", icon: <FileText className="w-5 h-5" /> },
      { name: "Historial", href: "/dashboard/patient/medical-history", icon: <ClipboardList className="w-5 h-5" /> },
      { name: "Catálogo Lab", href: "/dashboard/laboratory/catalog", icon: <FlaskRound className="w-5 h-5" /> },
      { name: "Resultados Lab", href: "/dashboard/laboratory/results", icon: <FileText className="w-5 h-5" /> },
      { name: "Suscripciones", href: "/dashboard/subscriptions", icon: <CreditCard className="w-5 h-5" /> },
    ];
  } else if (user.userType === "doctor" || user.userType === "specialist") {
    // Los especialistas usan el mismo menú que los doctores
    links = [
      ...links,
      { name: "Panel", href: "/dashboard/doctor", icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: "Pacientes", href: "/dashboard/pacientes", icon: <Users className="w-5 h-5" /> },
      { name: "Agenda", href: "/dashboard/agenda", icon: <Calendar className="w-5 h-5" /> },
      { name: "Recetas", href: "/dashboard/recetas", icon: <FileText className="w-5 h-5" /> },
      { name: "Laboratorio", href: "/dashboard/laboratorio", icon: <FlaskRound className="w-5 h-5" /> },
      { name: "Expedientes", href: "/dashboard/expedientes", icon: <Clipboard className="w-5 h-5" /> },
      { name: "Consulta", href: "/dashboard/consulta", icon: <Stethoscope className="w-5 h-5" /> },
      { name: "Tareas", href: "/dashboard/tareas", icon: <ClipboardList className="w-5 h-5" /> },
      { name: "Mensajes", href: "/dashboard/mensajes", icon: <MessageSquare className="w-5 h-5" /> },
      { name: "Suscripciones", href: "/dashboard/subscriptions", icon: <CreditCard className="w-5 h-5" /> },
    ];
  } else if (user.userType === "admin") {
    links = [
      ...links,
      { name: "Panel", href: "/dashboard/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: "Usuarios", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" /> },
      { name: "Laboratorios", href: "/dashboard/admin/labs", icon: <FlaskRound className="w-5 h-5" /> },
      { name: "Catálogo Lab", href: "/dashboard/laboratory/catalog", icon: <FlaskRound className="w-5 h-5" /> },
      { name: "Especialidades", href: "/dashboard/admin/specialties", icon: <StarIcon className="w-5 h-5" /> },
      { name: "Estadísticas", href: "/dashboard/admin/statistics", icon: <BarChart className="w-5 h-5" /> },
      { name: "Suscripciones", href: "/dashboard/admin/subscription-plans", icon: <CreditCard className="w-5 h-5" /> },
    ];
  }

  // Agregar enlaces comunes a todos los usuarios
  links.push(
    { name: "Chat", href: "/dashboard/chat", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Mi Perfil", href: "/dashboard/perfil", icon: <User className="w-5 h-5" /> },
    { name: "Configuración", href: "/dashboard/configuracion", icon: <Settings className="w-5 h-5" /> }
  );

  const handleLogout = () => {
    logoutMutation.mutate();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  // Si es el sidebar móvil
  if (isMobile) {
    return (
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white h-full overflow-y-auto">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/" className="text-primary-600 text-xl font-bold" onClick={closeMobileMenu}>
              MediConnect
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={closeMobileMenu}
              className="h-10 w-10"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex-shrink-0 flex px-4 py-3 border-b border-gray-200 bg-gray-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto flex items-center space-x-3 w-full justify-start">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profileImage || undefined} alt={user.firstName} />
                    <AvatarFallback className="bg-primary-100 text-primary-800">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs font-medium text-gray-500 capitalize">{user.userType}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil" className="flex items-center cursor-pointer" onClick={closeMobileMenu}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                {(user.userType === "doctor" || user.userType === "specialist") && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/doctor/verification" className="flex items-center cursor-pointer" onClick={closeMobileMenu}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Verificación</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/subscriptions" className="flex items-center cursor-pointer" onClick={closeMobileMenu}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Suscripciones</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/configuracion" className="flex items-center cursor-pointer" onClick={closeMobileMenu}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <nav className="mt-6 px-2 space-y-1 flex-grow">
            {links.map((item) => {
              const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
              return (
                <Link 
                  href={item.href} 
                  key={item.name}
                  className={cn(
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
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
          
          {/* Opciones adicionales en la versión móvil */}
          <div className="mt-auto px-4 py-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si es el sidebar desktop
  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="flex items-center justify-between flex-shrink-0 px-4 h-16 border-b border-gray-200">
          {/* Siempre mostrar el logo, eliminar botón de colapsar */}
          <Link href="/" className="text-primary-600 text-xl font-bold">
            MediConnect
          </Link>
        </div>
        
        <div className="flex-shrink-0 flex px-4 py-3 border-b border-gray-200 bg-gray-50">
          {/* Versión simplificada - siempre mostrar perfil completo, nunca colapsado */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto flex items-center space-x-3 w-full justify-start">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profileImage || undefined} alt={user.firstName} />
                  <AvatarFallback className="bg-primary-100 text-primary-800">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs font-medium text-gray-500 capitalize">{user.userType}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/perfil" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              {(user.userType === "doctor" || user.userType === "specialist") && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/doctor/verification" className="flex items-center cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Verificación</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/subscriptions" className="flex items-center cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Suscripciones</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/configuracion" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <nav className="mt-6 px-2 space-y-1 flex-grow">
          {links.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            return (
              <Link 
                href={item.href} 
                key={item.name}
                className={cn(
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
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