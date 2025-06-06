import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, Stethoscope, User, Building2, FlaskConical } from 'lucide-react';
import { SUBDOMAINS } from '@/lib/subdomain';
import { buildSubdomainUrl } from '@/lib/subdomain';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { UserType } from '@shared/schema';

interface SubdomainLoginMenuProps {
  className?: string;
}

const SubdomainLoginMenu: React.FC<SubdomainLoginMenuProps> = ({ className }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Función para redireccionar a un subdominio
  const handleSubdomainRedirect = (subdomain: string, label: string) => {
    // Muestra un toast para informar al usuario
    toast({
      title: `Accediendo al ${label}`,
      description: 'Redirigiendo...',
    });
    
    // Construir la URL del subdominio y redirigir
    const url = buildSubdomainUrl(subdomain, '/dashboard');
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  };

  // Verificar si el usuario puede acceder a un portal específico
  const canAccessPortal = (subdomain: string): boolean => {
    // Si no hay usuario logueado, restringir acceso a portales protegidos
    if (!user) {
      return subdomain === SUBDOMAINS.WWW; // Solo acceso a portal público
    }
    
    // Lógica de permiso por tipo de usuario
    switch (user.userType) {
      case 'doctor':
        // Los médicos pueden acceder a su portal y al público
        return subdomain === SUBDOMAINS.MEDICOS || subdomain === SUBDOMAINS.WWW;
      case 'patient':
        // Los pacientes pueden acceder a su portal y al público
        return subdomain === SUBDOMAINS.PACIENTES || subdomain === SUBDOMAINS.WWW;
      case 'admin':
        // Los administradores pueden acceder a cualquier portal
        return true;
      case 'laboratory':
        // Los laboratorios pueden acceder a su portal y al público
        return subdomain === SUBDOMAINS.LABS || subdomain === SUBDOMAINS.WWW;
      default:
        // Por defecto, solo acceso al portal público
        return subdomain === SUBDOMAINS.WWW;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center px-3 py-2 ${className}`}>
          <LogIn className="h-4 w-4 mr-2" />
          <span>Acceso Rápido</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Acceso por Portal</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Portal Médico - Solo mostrar si el usuario tiene acceso */}
        {canAccessPortal(SUBDOMAINS.MEDICOS) && (
          <DropdownMenuItem onClick={() => handleSubdomainRedirect(SUBDOMAINS.MEDICOS, 'Portal Médico')}>
            <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
            Portal Médico
          </DropdownMenuItem>
        )}
        
        {/* Portal Paciente - Solo mostrar si el usuario tiene acceso */}
        {canAccessPortal(SUBDOMAINS.PACIENTES) && (
          <DropdownMenuItem onClick={() => handleSubdomainRedirect(SUBDOMAINS.PACIENTES, 'Portal Paciente')}>
            <User className="h-4 w-4 mr-2 text-green-600" />
            Portal Paciente
          </DropdownMenuItem>
        )}
        
        {/* Portal Administrativo - Solo visible para administradores */}
        {canAccessPortal(SUBDOMAINS.ADMIN) && (
          <DropdownMenuItem onClick={() => handleSubdomainRedirect(SUBDOMAINS.ADMIN, 'Portal Administrativo')}>
            <Building2 className="h-4 w-4 mr-2 text-purple-600" />
            Portal Administrativo
          </DropdownMenuItem>
        )}
        
        {/* Portal Laboratorio - Solo visible para laboratorios y administradores */}
        {canAccessPortal(SUBDOMAINS.LABS) && (
          <DropdownMenuItem onClick={() => handleSubdomainRedirect(SUBDOMAINS.LABS, 'Portal Laboratorio')}>
            <FlaskConical className="h-4 w-4 mr-2 text-amber-600" />
            Portal Laboratorio
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SubdomainLoginMenu;