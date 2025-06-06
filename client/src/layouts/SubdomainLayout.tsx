import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getCurrentSubdomain, SUBDOMAINS } from '@/lib/subdomain';
import DoctorLayout from '@/layouts/DoctorLayout';
import PatientLayout from '@/layouts/PatientLayout';
import AdminLayout from '@/layouts/AdminLayout';
import LabLayout from '@/layouts/LabLayout';
import WWWLayout from '@/layouts/WWWLayout';

interface SubdomainLayoutProps {
  children: ReactNode;
  forceSubdomain?: string;
}

const SubdomainLayout: React.FC<SubdomainLayoutProps> = ({ 
  children, 
  forceSubdomain 
}) => {
  // Determinar el subdominio actual o usar el forzado si se especifica
  const currentSubdomain = forceSubdomain || getCurrentSubdomain();
  
  // Elegir el layout apropiado basado en el subdominio
  // Imprimir información de depuración
  console.log(`Rendering SubdomainLayout for subdomain: ${currentSubdomain}`);
  console.log(`Available subdomains:`, SUBDOMAINS);
  
  switch (currentSubdomain) {
    case SUBDOMAINS.MEDICOS:
      console.log(`Using DoctorLayout for subdomain ${currentSubdomain}`);
      return <DoctorLayout>{children}</DoctorLayout>;
      
    case SUBDOMAINS.PACIENTES:
      console.log(`Using PatientLayout for subdomain ${currentSubdomain}`);
      return <PatientLayout>{children}</PatientLayout>;
      
    case SUBDOMAINS.ADMIN:
      console.log(`Using AdminLayout for subdomain ${currentSubdomain}`);
      return <AdminLayout>{children}</AdminLayout>;
      
    case SUBDOMAINS.LABS:
      console.log(`Using LabLayout for subdomain ${currentSubdomain}`);
      return <LabLayout>{children}</LabLayout>;
      
    case SUBDOMAINS.WWW:
      console.log(`Using WWWLayout for subdomain ${currentSubdomain}`);
      return <WWWLayout>{children}</WWWLayout>;
      
    default:
      console.log(`Using default WWWLayout for unrecognized subdomain ${currentSubdomain}`);
      return <WWWLayout>{children}</WWWLayout>;
  }
};

export default SubdomainLayout;