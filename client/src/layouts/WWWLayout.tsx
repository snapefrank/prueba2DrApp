import React, { ReactNode, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { buildSubdomainUrl } from "@/lib/subdomain";
import Footer from "@/components/layout/Footer";
import logo from "@/assets/medicfylogo.jpeg";

interface WWWLayoutProps {
  children: ReactNode;
}

const WWWLayout: React.FC<WWWLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [especialidadesMenuOpen, setEspecialidadesMenuOpen] = React.useState(false);
  const especialidadesRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const toggleEspecialidadesMenu = () => setEspecialidadesMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = buildSubdomainUrl("www", "/");
      },
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        especialidadesRef.current &&
        !especialidadesRef.current.contains(event.target as Node)
      ) {
        setEspecialidadesMenuOpen(false);
      }
    };

    if (especialidadesMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [especialidadesMenuOpen]);

  const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Cómo Funciona", href: "/como-funciona" },
    { name: "Especialidades", href: "/especialidades", hasSubmenu: true },
    { name: "Precios", href: "/precios" },
    { name: "Catálogo Laboratorio", href: "/catalogo-laboratorio" },
    { name: "Sobre Nosotros", href: "/sobre-nosotros" },
    { name: "Contáctanos", href: "/contacto" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo y nombre a la izquierda */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <img className="h-10 w-auto" src={logo} alt="Medicfy Logo" />
                <span className="text-2xl font-bold text-gray-900 hidden sm:block">Medicfy</span>
              </Link>
            </div>

            {/* NAV DESKTOP - Elementos a la derecha */}
            <nav className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-6">
                {navItems.map(item => (
                  <div
                    key={item.name}
                    className="relative group"
                    ref={item.hasSubmenu ? especialidadesRef : undefined}
                  >
                    {item.hasSubmenu ? (
                      <button
                        onClick={toggleEspecialidadesMenu}
                        className={`flex items-center text-sm ${
                          location.startsWith(item.href)
                            ? "text-blue-600 font-semibold"
                            : "text-gray-600 hover:text-blue-600"
                        } font-medium transition-colors`}
                        aria-haspopup="true"
                        aria-expanded={especialidadesMenuOpen}
                      >
                        {item.name}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`text-sm ${
                          location === item.href
                            ? "text-blue-600 font-semibold"
                            : "text-gray-600 hover:text-blue-600"
                        } font-medium transition-colors`}
                      >
                        {item.name}
                      </Link>
                    )}

                    {/* SUBMENU */}
                    {item.hasSubmenu && especialidadesMenuOpen && (
                      <div
                        role="menu"
                        className="absolute left-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50"
                      >
                        {[
                          { name: "Medicina General", href: "/especialidades/medicina-general" },
                          { name: "Cardiología", href: "/especialidades/cardiologia" },
                          { name: "Pediatría", href: "/especialidades/pediatria" },
                          { name: "Ver todas las especialidades", href: "/especialidades", highlight: true },
                        ].map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`block px-4 py-2 text-sm ${
                              link.highlight
                                ? "text-blue-600 font-medium"
                                : "text-gray-700"
                            } hover:bg-gray-100`}
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Auth buttons */}
              <div className="flex items-center ml-6 space-x-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Mi Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth"
                      className="text-sm text-gray-600 hover:text-blue-600 font-medium"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/auth?register=true"
                      className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Regístrate Gratis
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* NAV MOBILE TOGGLE */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              >
                <span className="sr-only">Abrir menú</span>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === item.href
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                  onClick={closeMobileMenu}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* MOBILE MENU AUTH */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <div className="flex flex-col px-4 space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {user.profileImage ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.profileImage}
                          alt="Foto de perfil"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <a
                      href={buildSubdomainUrl(user.userType.toLowerCase(), "/")}
                      className="py-2 flex-1 text-center px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Mi Dashboard
                    </a>
                    <button
                      onClick={handleLogout}
                      className="py-2 px-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 flex flex-col space-y-2">
                  <Link
                    href="/auth"
                    className="block py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-md px-3"
                    onClick={closeMobileMenu}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/auth?register=true"
                    className="block py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                    onClick={closeMobileMenu}
                  >
                    Regístrate Gratis
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">{children}</main>

      <Footer />
    </div>
  );
};

export default WWWLayout;