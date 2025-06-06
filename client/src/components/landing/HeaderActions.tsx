import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ContactForm } from "@/components/ui/contact-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut, ChevronDown } from "lucide-react";

export function HeaderActions() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="flex space-x-3 items-center">
      <ContactForm 
        trigger={
          <Button variant="outline" className="hidden md:flex">
            Contactar ventas
          </Button>
        }
        title="Contactar con nuestro equipo de ventas"
        description="Completa el formulario y un asesor se pondrá en contacto contigo para ayudarte a elegir la mejor solución para tu negocio."
      />
      
      {!user ? (
        <>
          <Link href="/auth">
            <Button variant="outline">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/auth?register=true">
            <Button>
              Regístrate gratis
            </Button>
          </Link>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <UserCircle className="h-4 w-4" />
              {user.firstName || user.username}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link 
                href={user.userType === "patient" ? "/dashboard/patient" : user.userType === "doctor" ? "/dashboard/doctor" : "/dashboard/admin"}
                className="w-full cursor-pointer"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Mi dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => logoutMutation.mutate()}
              className="text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}