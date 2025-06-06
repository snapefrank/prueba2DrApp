import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useToast } from "@/hooks/use-toast";
import SubdomainLoginMenu from "@/components/auth/SubdomainLoginMenu";
import {
    getDefaultSubdomainForUserType,
    buildSubdomainUrl,
    createInternalLink,
} from "@/lib/subdomain";

export default function Navbar() {
    const { user, logoutMutation } = useAuth();
    const { toast } = useToast();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        toast({
            title: "Cerrando sesión",
            description: "Por favor espere...",
        });

        try {
            logoutMutation.mutate();
            setTimeout(() => {
                if (logoutMutation.isPending) {
                    localStorage.removeItem("mediconnect_user");
                    localStorage.removeItem("mediconnect_auth_token");
                    window.location.href = createInternalLink("/");
                }
            }, 2000);
        } catch (error) {
            console.error("Error en handleLogout:", error);
            localStorage.removeItem("mediconnect_user");
            localStorage.removeItem("mediconnect_auth_token");
            window.location.href = createInternalLink("/");
        }
    };

    return (
        <section className="w-full">
            <nav className="bg-white shadow-sm sticky top-0 z-20 w-full">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo y links */}
                        <div className="flex items-center space-x-4">
                            <Link
                                href={createInternalLink("/")}
                                className="text-primary-600 text-xl font-bold"
                            >
                                MediConnect
                            </Link>

                            <div className="hidden sm:flex space-x-4">
                                <Link
                                    href={createInternalLink("/")}
                                    className="text-gray-900 font-medium text-sm hover:text-primary-600"
                                >
                                    Inicio
                                </Link>
                                <Link
                                    href={createInternalLink("/especialidades")}
                                    className="text-gray-500 text-sm hover:text-primary-600"
                                >
                                    Especialidades
                                </Link>
                                <Link
                                    href={createInternalLink("/como-funciona")}
                                    className="text-gray-500 text-sm hover:text-primary-600"
                                >
                                    ¿Cómo funciona?
                                </Link>
                                <Link
                                    href={createInternalLink("/precios")}
                                    className="text-gray-500 text-sm hover:text-primary-600"
                                >
                                    Precios
                                </Link>
                                <Link
                                    href={createInternalLink("/sobre-nosotros")}
                                    className="text-gray-500 text-sm hover:text-primary-600"
                                >
                                    Sobre nosotros
                                </Link>
                                <Link
                                    href={createInternalLink("/contacto")}
                                    className="text-gray-500 text-sm hover:text-primary-600"
                                >
                                    Contáctanos
                                </Link>
                            </div>
                        </div>

                        {/* Acciones y usuario */}
                        <div className="hidden sm:flex items-center space-x-4">
                            <ThemeSelector />
                            <SubdomainLoginMenu />

                            {user ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href={createInternalLink("/dashboard")}
                                    >
                                        <Button
                                            variant="ghost"
                                            className="flex items-center space-x-2"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={
                                                        user.profileImage ||
                                                        undefined
                                                    }
                                                    alt={user.firstName}
                                                />
                                                <AvatarFallback className="bg-primary-100 text-primary-800">
                                                    {user.firstName.charAt(0)}
                                                    {user.lastName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">
                                                {user.firstName} {user.lastName}
                                            </span>
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        disabled={logoutMutation.isPending}
                                        className="text-gray-600"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Salir
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex space-x-2">
                                    <Link href={createInternalLink("/auth")}>
                                        <Button variant="default">
                                            Iniciar Sesión
                                        </Button>
                                    </Link>
                                    <Link
                                        href={createInternalLink(
                                            "/auth?register=true"
                                        )}
                                    >
                                        <Button
                                            variant="outline"
                                            className="border-primary-600 text-primary-600"
                                        >
                                            Registrarse
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Botón del menú móvil */}
                        <div className="sm:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6 text-gray-600" />
                                ) : (
                                    <Menu className="w-6 h-6 text-gray-600" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Menú móvil */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-gray-100 bg-white">
                        <div className="px-4 py-3 space-y-2">
                            {[
                                ["Inicio", "/"],
                                ["Especialidades", "/especialidades"],
                                ["¿Cómo funciona?", "/como-funciona"],
                                ["Precios", "/precios"],
                                ["Sobre nosotros", "/sobre-nosotros"],
                                ["Contáctanos", "/contacto"],
                            ].map(([label, href]) => (
                                <Link
                                    key={label}
                                    href={createInternalLink(href)}
                                    className="block text-gray-700 text-base font-medium hover:text-primary-600"
                                >
                                    {label}
                                </Link>
                            ))}

                            <div className="pt-4 border-t border-gray-200 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700">
                                        Tema
                                    </span>
                                    <ThemeSelector />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700">
                                        Acceso Rápido
                                    </span>
                                    <SubdomainLoginMenu />
                                </div>
                            </div>

                            {user ? (
                                <div className="pt-4 border-t border-gray-200 space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={
                                                    user.profileImage ||
                                                    undefined
                                                }
                                                alt={user.firstName}
                                            />
                                            <AvatarFallback className="bg-primary-100 text-primary-800">
                                                {user.firstName.charAt(0)}
                                                {user.lastName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-base font-medium text-gray-800">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={createInternalLink("/dashboard")}
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
                            ) : null}
                        </div>
                    </div>
                )}
            </nav>
        </section>
    );
}
