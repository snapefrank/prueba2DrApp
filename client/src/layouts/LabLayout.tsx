import React, { ReactNode } from 'react';
import { Link, useLocation } from "wouter";
import { 
  Settings, TestTube, Clipboard, 
  StethoscopeIcon, FileCheck, LogOut 
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface LabLayoutProps {
  children: ReactNode;
}

const LabLayout: React.FC<LabLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard/laboratory', icon: <TestTube className="w-5 h-5" /> },
    { name: 'Catálogo de Pruebas', href: '/dashboard/laboratory/catalog', icon: <Clipboard className="w-5 h-5" /> },
    { name: 'Solicitudes Médicas', href: '/dashboard/laboratory/order', icon: <StethoscopeIcon className="w-5 h-5" /> },
    { name: 'Resultados', href: '/dashboard/laboratory/results', icon: <FileCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-emerald-600 to-teal-700 text-white">
        {/* Logo */}
        <div className="p-4 border-b border-emerald-500">
          <Link href="/dashboard/laboratory">
            <h1 className="text-xl font-bold cursor-pointer">MediConnect</h1>
            <p className="text-sm opacity-70">Portal Laboratorio</p>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-grow overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  location === item.href 
                    ? "bg-emerald-500 text-white" 
                    : "text-white/70 hover:bg-emerald-500/50 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
        
        {/* User profile & settings */}
        <div className="p-4 border-t border-emerald-500">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 h-10 w-10">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Foto de perfil"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-emerald-300 flex items-center justify-center">
                  <span className="text-emerald-800 font-semibold">
                    {user?.firstName?.charAt(0) || ""}
                    {user?.lastName?.charAt(0) || ""}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-white/70">
                Laboratorio
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              href="/dashboard/settings"
              className="flex items-center px-4 py-2 text-sm rounded-md text-white/70 hover:bg-emerald-500/50 hover:text-white"
            >
              <Settings className="h-5 w-5 mr-3" />
              Configuración
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm rounded-md text-white/70 hover:bg-emerald-500/50 hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden bg-emerald-600 text-white w-full fixed top-0 left-0 z-10 shadow-md">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard/laboratory">
            <h1 className="font-bold text-lg">MediConnect Lab</h1>
          </Link>
          {/* Implementar menú hamburguesa aquí si se necesita */}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 md:p-8 pt-20 md:pt-8">
        {children}
      </main>
    </div>
  );
};

export default LabLayout;