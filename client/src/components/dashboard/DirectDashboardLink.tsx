import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { getDefaultSubdomainForUserType, SUBDOMAINS } from '@/lib/subdomain';
import { Link } from 'wouter';

interface DirectDashboardLinkProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Componente que crea un enlace directo al dashboard
 * Preserva el parámetro de subdominio en entornos de desarrollo
 */
export function DirectDashboardLink({ 
  children, 
  className = '',
  variant = 'default'
}: DirectDashboardLinkProps) {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }
  
  // Obtener el subdominio apropiado para el tipo de usuario
  const subdomain = getDefaultSubdomainForUserType(user.userType);
  
  // En desarrollo, usamos el parámetro URL para simular subdominios
  const dashboardLink = import.meta.env.DEV
    ? `/dashboard?subdomain=${subdomain}`
    : `/dashboard`;
  
  console.log(`[DirectDashboardLink] Usando ruta: ${dashboardLink} para rol ${user.userType}`);
  
  return (
    <Link href={dashboardLink}>
      <Button
        variant={variant}
        className={className}
      >
        {children}
      </Button>
    </Link>
  );
}
