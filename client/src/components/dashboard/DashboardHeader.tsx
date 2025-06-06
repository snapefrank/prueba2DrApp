import { useAuth } from "@/hooks/use-auth";
import { UserCircle, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link } from "wouter";

interface DashboardHeaderProps {
  heading?: string;
  description?: string;
}

export default function DashboardHeader({ heading, description }: DashboardHeaderProps = {}) {
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const userType = user?.userType || "patient";
  const dashboardLink = `/dashboard/${userType}`;

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href={dashboardLink} className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="MediConnect"
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/32";
              }}
            />
            <span className="hidden text-xl font-bold text-primary md:inline-block">
              MediConnect
            </span>
          </Link>
        </div>
        
        {heading && (
          <div className="hidden lg:block flex-1 px-8">
            <h1 className="text-xl font-semibold">{heading}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                <span className="hidden md:inline-block">
                  {user?.firstName} {user?.lastName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/perfil">Perfil</Link>
              </DropdownMenuItem>
              {userType === "doctor" && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/doctor/verification">Verificación</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/subscriptions">Suscripciones</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/social">Red Social</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}