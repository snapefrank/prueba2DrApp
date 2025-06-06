import { useAuth } from "@/hooks/use-auth";
import {
  Calendar,
  FileText,
  Users,
  Home,
  User,
  Activity,
  Settings,
  Stethoscope,
  BarChart,
  FileCheck,
  Pill,
  FlaskConical,
  CreditCard,
  Server,
  UsersRound,
  Share2,
  Network
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function SidebarLink({ href, icon, label, isActive }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        {icon}
        {label}
      </a>
    </Link>
  );
}

export default function DashboardSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const userType = user?.userType || "patient";

  const isActive = (path: string) => location === path;

  // Links based on user type
  const patientLinks = [
    {
      href: "/dashboard/patient",
      icon: <Home className="h-4 w-4" />,
      label: "Inicio",
    },
    {
      href: "/dashboard/patient/appointments",
      icon: <Calendar className="h-4 w-4" />,
      label: "Citas",
    },
    {
      href: "/dashboard/patient/documents",
      icon: <FileText className="h-4 w-4" />,
      label: "Documentos",
    },
    {
      href: "/dashboard/patient/medical-history",
      icon: <Activity className="h-4 w-4" />,
      label: "Historial Médico",
    },
  ];

  const doctorLinks = [
    {
      href: "/dashboard/doctor",
      icon: <Home className="h-4 w-4" />,
      label: "Inicio",
    },
    {
      href: "/dashboard/doctor/schedule",
      icon: <Calendar className="h-4 w-4" />,
      label: "Agenda",
    },
    {
      href: "/dashboard/doctor/patients",
      icon: <Users className="h-4 w-4" />,
      label: "Pacientes",
    },
    {
      href: "/dashboard/doctor/expediente",
      icon: <FileCheck className="h-4 w-4" />,
      label: "Expediente Clínico",
    },
    {
      href: "/dashboard/doctor/recetas",
      icon: <Pill className="h-4 w-4" />,
      label: "Recetas",
    },
    {
      href: "/dashboard/doctor/laboratorio",
      icon: <FlaskConical className="h-4 w-4" />,
      label: "Laboratorio",
    },
    {
      href: "/dashboard/doctor/commissions",
      icon: <CreditCard className="h-4 w-4" />,
      label: "Comisiones",
    },
    // Verificación se añadirá dinámicamente en la posición correcta
  ];

  const adminLinks = [
    {
      href: "/dashboard/admin",
      icon: <Home className="h-4 w-4" />,
      label: "Inicio",
    },
    {
      href: "/dashboard/admin/users",
      icon: <Users className="h-4 w-4" />,
      label: "Usuarios",
    },
    {
      href: "/dashboard/admin/specialties",
      icon: <Stethoscope className="h-4 w-4" />,
      label: "Especialidades",
    },
    {
      href: "/dashboard/admin/labs",
      icon: <FlaskConical className="h-4 w-4" />,
      label: "Laboratorios",
    },
    {
      href: "/dashboard/admin/statistics",
      icon: <BarChart className="h-4 w-4" />,
      label: "Estadísticas",
    },
    {
      href: "/dashboard/admin/subscription-plans",
      icon: <CreditCard className="h-4 w-4" />,
      label: "Planes",
    },
    {
      href: "/dashboard/admin/verification",
      icon: <FileText className="h-4 w-4" />,
      label: "Verificación Médicos",
    },
  ];

  // Ensure verification link is prominently displayed for doctors
  if (userType === "doctor") {
    // Add verification link at the top for better visibility
    doctorLinks.splice(1, 0, {
      href: "/dashboard/doctor/verification",
      icon: <FileCheck className="h-4 w-4" />,
      label: "Verificación de Perfil",
    });
  }

  // Select the appropriate links based on user type
  const links = {
    patient: patientLinks,
    doctor: doctorLinks,
    admin: adminLinks,
  }[userType as "patient" | "doctor" | "admin"] || [];

  // Common links for all users
  const commonLinks = [
    {
      href: "/dashboard/social",
      icon: <Network className="h-4 w-4" />,
      label: "Red Social",
    },
    {
      href: "/dashboard/subscriptions",
      icon: <Server className="h-4 w-4" />,
      label: "Suscripciones",
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
      label: "Configuración",
    },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
      <div className="flex flex-col gap-1">
        {links.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            isActive={isActive(link.href)}
          />
        ))}
        <div className="my-2 h-px bg-border" />
        {commonLinks.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            isActive={isActive(link.href)}
          />
        ))}
      </div>
    </aside>
  );
}