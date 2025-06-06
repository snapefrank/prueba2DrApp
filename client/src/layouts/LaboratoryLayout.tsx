import { ReactNode } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/use-auth";

interface LaboratoryLayoutProps {
  children: ReactNode;
  isContentRouteOutlet?: boolean;
}

const LaboratoryLayout = ({ children, isContentRouteOutlet = false }: LaboratoryLayoutProps) => {
  const { user } = useAuth();
  
  return (
    <MainLayout isContentRouteOutlet={isContentRouteOutlet}>
      {children}
    </MainLayout>
  );
};

export default LaboratoryLayout;