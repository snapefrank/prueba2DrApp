import React, { ReactNode } from 'react';
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from '@/hooks/use-auth';

interface PatientLayoutProps {
  children: ReactNode;
  isContentRouteOutlet?: boolean;
}

const PatientLayout: React.FC<PatientLayoutProps> = ({ children, isContentRouteOutlet = false }) => {
  const { user } = useAuth();
  
  return (
    <MainLayout isContentRouteOutlet={isContentRouteOutlet}>
      {children}
    </MainLayout>
  );
};

export default PatientLayout;