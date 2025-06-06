import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose 
} from "@/components/ui/sheet";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeaderActions } from "@/components/landing/HeaderActions";
import { ContactForm } from "@/components/ui/contact-form";
import { useAuth } from "@/hooks/use-auth";

const Navbar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location === path;
    return location.startsWith(path);
  };

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive(path) ? "text-primary" : "text-gray-600"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between w-full max-w-screen-2xl mx-auto">
          
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">MediConnect</span>
          </Link>

          {/* Navegación escritorio */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className={linkClass("/")}>Inicio</Link>
            <Link href="/especialidades" className={linkClass("/especialidades")}>Especialidades</Link>

            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center ${linkClass("/como-funciona")} focus:outline-none`}>
                <span>Información</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/como-funciona" className="w-full">Cómo funciona</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sobre-nosotros" className="w-full">Sobre nosotros</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/catalogo-laboratorio" className="w-full">Catálogo de laboratorio</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/precios" className={linkClass("/precios")}>Precios</Link>
          </nav>

          {/* Acciones / Sesión */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            <HeaderActions />
          </div>

          {/* Menú móvil */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[385px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="text-xl font-bold text-primary">MediConnect</span>
                    </Link>
                    <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Cerrar</span>
                    </SheetClose>
                  </div>

                  <nav className="flex flex-col space-y-5">
                    <SheetClose asChild>
                      <Link href="/" className={`${linkClass("/")} text-base`}>Inicio</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/especialidades" className={`${linkClass("/especialidades")} text-base`}>Especialidades</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/como-funciona" className={`${linkClass("/como-funciona")} text-base`}>Cómo funciona</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/sobre-nosotros" className={`${linkClass("/sobre-nosotros")} text-base`}>Sobre nosotros</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/catalogo-laboratorio" className={`${linkClass("/catalogo-laboratorio")} text-base`}>Catálogo de laboratorio</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/precios" className={`${linkClass("/precios")} text-base`}>Precios</Link>
                    </SheetClose>
                  </nav>

                  <div className="mt-auto space-y-4">
                    <SheetClose asChild>
                      <ContactForm 
                        trigger={
                          <Button variant="outline" className="w-full">Contactar ventas</Button>
                        }
                        title="Contactar con nuestro equipo de ventas"
                        description="Completa el formulario y un asesor se pondrá en contacto contigo para ayudarte a elegir la mejor solución para tu negocio."
                      />
                    </SheetClose>

                    {!user ? (
                      <div className="grid gap-3 grid-cols-2">
                        <SheetClose asChild>
                          <Link href="/auth">
                            <Button variant="outline" className="w-full">Iniciar sesión</Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/auth?register=true">
                            <Button className="w-full">Regístrate</Button>
                          </Link>
                        </SheetClose>
                      </div>
                    ) : (
                      <div className="grid gap-3 grid-cols-1">
                        <SheetClose asChild>
                          <Link href={user.userType === "patient" ? "/dashboard/patient" : user.userType === "doctor" ? "/dashboard/doctor" : "/dashboard/admin"}>
                            <Button variant="outline" className="w-full">Ir al dashboard</Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button className="w-full" onClick={() => logoutMutation.mutate()}>
                            Cerrar sesión
                          </Button>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
