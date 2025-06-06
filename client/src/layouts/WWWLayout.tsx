import React, { ReactNode, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { buildSubdomainUrl } from "@/lib/subdomain";
import Footer from "@/components/layout/Footer";
import logo from '@/assets/medicfy.png';


interface WWWLayoutProps {
    children: ReactNode;
}

const WWWLayout: React.FC<WWWLayoutProps> = ({ children }) => {
    const [location] = useLocation();
    const { user, logoutMutation } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [especialidadesMenuOpen, setEspecialidadesMenuOpen] =
        React.useState(false);
    const especialidadesRef = useRef<HTMLDivElement>(null);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const toggleEspecialidadesMenu = () =>
        setEspecialidadesMenuOpen(!especialidadesMenuOpen);
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
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
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
                    <div className="flex justify-between h-16">
                        <div className="flex-shrink-0 flex items-center gap-4 pr-6">
                            <img
                                className="h-20 w-auto"
                                src={logo}
                                alt="Medicfy Logo"
                            />
                            <p className="text-3xl font-bold">Medicfy</p>
                        </div>


                        <nav className="hidden md:flex space-x-6 items-center">
                            {navItems.map(item => (
                                <div
                                    key={item.name}
                                    className="relative group"
                                    ref={
                                        item.hasSubmenu
                                            ? especialidadesRef
                                            : undefined
                                    }
                                >
                                    {item.hasSubmenu ? (
                                        <button
                                            onClick={toggleEspecialidadesMenu}
                                            className="flex items-center text-gray-700 hover:text-blue-600 font-medium"
                                        >
                                            <span>{item.name}</span>
                                            <ChevronDown className="ml-1 h-4 w-4" />
                                        </button>
                                    ) : (
                                        <Link
                                            to={item.href}
                                            className={`${location === item.href
                                                ? "text-blue-600 font-semibold"
                                                : "text-gray-700 hover:text-blue-600"
                                                } font-medium`}
                                        >
                                            {item.name}
                                        </Link>
                                    )}

                                    {item.hasSubmenu &&
                                        especialidadesMenuOpen && (
                                            <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                <Link
                                                    href="/especialidades/medicina-general"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Medicina General
                                                </Link>
                                                <Link
                                                    href="/especialidades/cardiologia"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Cardiología
                                                </Link>
                                                <Link
                                                    href="/especialidades/pediatria"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Pediatría
                                                </Link>
                                                <Link
                                                    href="/especialidades"
                                                    className="block px-4 py-2 text-sm text-blue-600 font-medium hover:bg-gray-100"
                                                >
                                                    Ver todas las especialidades
                                                </Link>
                                            </div>
                                        )}
                                </div>
                            ))}

                            {user ? (
                                <div className="ml-4">
                                    <Link
                                        to="/dashboard"
                                        className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Mi Dashboard
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4 ml-6">
                                    <Link
                                        href="/auth"
                                        className="text-gray-700 hover:text-blue-600 font-medium"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href="/auth?register=true"
                                        className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Regístrate Gratis
                                    </Link>
                                </div>
                            )}
                        </nav>

                        <div className="md:hidden flex items-center">
                            <button
                                onClick={toggleMobileMenu}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                            >
                                <span className="sr-only">Abrir menú</span>
                                {mobileMenuOpen ? (
                                    <X className="block h-6 w-6" />
                                ) : (
                                    <Menu className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navItems.map(item => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`${location === item.href
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                        } block px-3 py-2 rounded-md text-base font-medium`}
                                    onClick={closeMobileMenu}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
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
                                            <div className="text-sm font-medium text-gray-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <a
                                            href={buildSubdomainUrl(
                                                user.userType.toLowerCase(),
                                                "/"
                                            )}
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

            {/* Importar componente Footer */}
            <Footer />

            {/* <footer className="bg-gray-800 text-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                MediConnect
                            </h3>
                            <p className="text-gray-300 text-sm">
                                La plataforma que conecta médicos y pacientes
                                para brindar una experiencia médica integral y
                                personalizada.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Enlaces Rápidos
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/como-funciona"
                                        className="text-gray-300 hover:text-white text-sm"
                                    >
                                        Cómo Funciona
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/especialidades"
                                        className="text-gray-300 hover:text-white text-sm"
                                    >
                                        Especialidades
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/precios"
                                        className="text-gray-300 hover:text-white text-sm"
                                    >
                                        Precios
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/sobre-nosotros"
                                        className="text-gray-300 hover:text-white text-sm"
                                    >
                                        Sobre Nosotros
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Legal
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/legal/terminos"
                                        className="text-gray-300 hover:text-white text-sm"
                                    >
                                        Términos y Condiciones
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/legal/privacidad"
                                        className="text-gray-300 hover:text-white text-sm"
                                    >
                                        Política de Privacidad
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/legal/politicas"
                                        className="text-gray-300 hover:text-white text-sm"
                                    >
                                        Políticas de Uso
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Contacto
                            </h3>
                            <p className="text-gray-300 text-sm mb-2">
                                contacto@mediconnect.com
                            </p>
                            <p className="text-gray-300 text-sm">
                                +52 (55) 1234-5678
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
                        <p>
                            &copy; {new Date().getFullYear()} MediConnect. Todos
                            los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer> */}
        </div>
    );
};

export default WWWLayout;
