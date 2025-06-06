import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeSelector } from "@/components/ui/theme-selector";
import SubdomainLoginMenu from "@/components/auth/SubdomainLoginMenu";
import { Menu, X, LogOut } from "lucide-react";
import { buildSubdomainUrl, createInternalLink } from "@/lib/subdomain";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const handleLogout = () => {
    toast({
      title: "Cerrando sesión",
      description: "Por favor espere...",
    });
    logoutMutation.mutate();
  };

  useEffect(() => {
    if (logoutMutation.isSuccess) {
      localStorage.removeItem("mediconnect_user");
      localStorage.removeItem("mediconnect_auth_token");
      window.location.href = createInternalLink("/");
    }
  }, [logoutMutation.isSuccess]);

  const links = useMemo(() => [
    ["Inicio", "/"],
    ["Especialidades", "/especialidades"],
    ["¿Cómo funciona?", "/como-funciona"],
    ["Precios", "/precios"],
    ["Sobre nosotros", "/sobre-nosotros"],
    ["Contáctanos", "/contacto"],
  ], []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="w-full flex justify-between items-center h-16">

          {/* Logo + Links */}
          <div className="flex items-center gap-6 w-full">
            <Link href={createInternalLink("/")} className="text-xl font-bold text-primary-600">
              Medicfy
            </Link>
            <nav className="hidden sm:flex gap-4">
              {links.map(([label, href]) => (
                <Link
                  key={label}
                  href={createInternalLink(href)}
                  aria-current={location === href ? "page" : undefined}
                  className={`text-sm font-medium transition-colors ${
                    location === href
                      ? "text-primary-600"
                      : "text-gray-600 hover:text-primary-600"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-4">
            <SubdomainLoginMenu />
            <ThemeSelector />
            {user ? (
              <div className="flex items-center gap-3">
                <Link href={createInternalLink("/dashboard")}>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage || undefined} alt={user.firstName} />
                      <AvatarFallback className="bg-primary-100 text-primary-800">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </div>
            ) : (
              <>
                <Link href={createInternalLink("/auth")}>
                  <Button className="font-semibold">Iniciar Sesión</Button>
                </Link>
                <Link href={createInternalLink("/auth?register=true")}>
                  <Button
                    variant="outline"
                    className="border-primary-600 text-primary-600 hover:bg-primary-50"
                  >
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white animate-fade-in-down">
          <div className="px-4 py-4 space-y-4">
            {links.map(([label, href]) => (
              <Link
                key={label}
                href={createInternalLink(href)}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-medium ${
                  location === href
                    ? "text-primary-600"
                    : "text-gray-700 hover:text-primary-600"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Tema</span>
                <ThemeSelector />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Acceso rápido</span>
                <SubdomainLoginMenu />
              </div>
            </div>

            {user && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImage || undefined} alt={user.firstName} />
                    <AvatarFallback className="bg-primary-100 text-primary-800">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-base font-medium text-gray-800">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>

                <Link
                  href={createInternalLink("/dashboard")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-gray-700 hover:text-primary-600"
                >
                  Panel de Control
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full text-left text-base font-medium text-red-600 hover:text-red-800"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
