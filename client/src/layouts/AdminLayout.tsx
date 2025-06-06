import React, { ReactNode } from 'react';
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from '@/hooks/use-auth';

interface AdminLayoutProps {
  children: ReactNode;
  isContentRouteOutlet?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, isContentRouteOutlet = false }) => {
  const { user } = useAuth();
  
  return (
    <MainLayout isContentRouteOutlet={isContentRouteOutlet}>
      {children}
    </MainLayout>
  );
};

export default AdminLayout;