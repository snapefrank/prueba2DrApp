import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Calendar, 
  Users, 
  Clock, 
  PieChart, 
  FileText, 
  Plus, 
  Activity, 
  Bell,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock8 
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";
import { es } from "date-fns/locale";

import DoctorLayout from "@/layouts/DoctorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useDemoNotifications } from "@/hooks/use-demo-notifications";

// Interfaces
interface Appointment {
  id: number;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  dateTime: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  appointmentType: "first_visit" | "follow_up" | "emergency" | "telemedicine";
  reason: string;
}

interface DoctorStats {
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  newPatients: number;
  totalPatients: number;
  availableSlots: number;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  
  // Activar las notificaciones de demostración
  useDemoNotifications();
  
  // Cargar citas
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/doctor/appointments"],
    // Datos por defecto para prevenir errores
    select: (data) => {
      // Si data no es un array, devolvemos array vacío para prevenir errores
      if (!Array.isArray(data)) {
        console.warn('La API de citas no devolvió un array válido');
        return [] as Appointment[];
      }
      return data;
    }
  });
  
  // Cargar estadísticas
  const { data: stats, isLoading: isLoadingStats } = useQuery<DoctorStats>({
    queryKey: ["/api/doctor/stats"],
    // Datos por defecto para prevenir errores
    select: (data) => {
      // Si data no es un objeto, devolvemos valores predeterminados seguros
      if (!data || typeof data !== 'object') {
        console.warn('La API de estadísticas no devolvió un objeto válido');
        return {
          totalAppointments: 0,
          completedAppointments: 0,
          upcomingAppointments: 0,
          cancelledAppointments: 0,
          todayAppointments: 0,
          newPatients: 0,
          totalPatients: 0,
          availableSlots: 0
        } as DoctorStats;
      }
      return data;
    }
  });
  
  // Ya no necesitamos esta verificación adicional ya que el select en la consulta
  // garantiza que appointments siempre sea un array
  const upcomingAppointments = appointments
    ? appointments
        .filter(app => app.status === "scheduled")
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
        .slice(0, 5)
    : [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido, Dr. {user?.firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Administre su agenda, pacientes y documentos médicos
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 gap-3">
          <Link href="/agenda">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Mi Agenda
            </Button>
          </Link>
          <Link href="/pacientes">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Pacientes
            </Button>
          </Link>
        </div>
      </div>
        
        {/* Resumen de estadísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Pacientes" 
            value={isLoadingStats ? "-" : stats?.totalPatients.toString() || "0"} 
            description={`${isLoadingStats ? "-" : stats?.newPatients || "0"} nuevos este mes`}
            icon={<Users className="h-4 w-4" />}
            loading={isLoadingStats}
          />
          
          <StatsCard 
            title="Citas hoy" 
            value={isLoadingStats ? "-" : stats?.todayAppointments.toString() || "0"} 
            description="Programadas para hoy"
            icon={<Clock className="h-4 w-4" />}
            loading={isLoadingStats}
          />
          
          <StatsCard 
            title="Citas totales" 
            value={isLoadingStats ? "-" : stats?.totalAppointments.toString() || "0"} 
            description={`${isLoadingStats ? "-" : stats?.completedAppointments || "0"} completadas`}
            icon={<CheckCircle2 className="h-4 w-4" />}
            loading={isLoadingStats}
          />
          
          <StatsCard 
            title="Horarios disponibles" 
            value={isLoadingStats ? "-" : stats?.availableSlots.toString() || "0"} 
            description="Slots abiertos para citas"
            icon={<Calendar className="h-4 w-4" />}
            loading={isLoadingStats}
          />
        </div>
        
        {/* Contenido principal */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Lista de próximas citas */}
          <Card className="md:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Próximas citas</CardTitle>
                <CardDescription>
                  Pacientes agendados recientemente
                </CardDescription>
              </div>
              <Link href="/agenda">
                <Button variant="ghost" className="text-primary">
                  Ver todas
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[160px]" />
                      </div>
                      <Skeleton className="h-10 w-[100px]" />
                    </div>
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-6">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentItem key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No hay citas programadas</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    Su agenda está vacía por el momento
                  </p>
                  <Link href="/agenda/horarios">
                    <Button>Gestionar horarios</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Accesos rápidos */}
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 space-y-4">
                <Link href="/agenda/horarios">
                  <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                    <Clock className="mr-3 h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Configurar horarios disponibles</span>
                  </div>
                </Link>
                <Link href="/recetas/nueva">
                  <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                    <FileText className="mr-3 h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Crear nueva receta médica</span>
                  </div>
                </Link>
                <Link href="/laboratorio/solicitar">
                  <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                    <Activity className="mr-3 h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Solicitar estudios de laboratorio</span>
                  </div>
                </Link>
                <Link href="/mensajes">
                  <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                    <Bell className="mr-3 h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Ver mensajes de pacientes</span>
                  </div>
                </Link>
              </CardContent>
            </Card>
            
            {/* Resumen diario */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de hoy</CardTitle>
                <CardDescription>
                  {format(new Date(), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center bg-primary/10 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completadas</p>
                    <p className="text-2xl font-bold">{isLoadingStats ? "-" : stats?.completedAppointments || "0"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center bg-yellow-100 p-2 rounded-full">
                    <Clock8 className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pendientes hoy</p>
                    <p className="text-2xl font-bold">{isLoadingStats ? "-" : stats?.todayAppointments || "0"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center bg-red-100 p-2 rounded-full">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Canceladas</p>
                    <p className="text-2xl font-bold">{isLoadingStats ? "-" : stats?.cancelledAppointments || "0"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function StatsCard({ title, value, description, icon, loading = false }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {loading ? (
          <>
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
              <span className="bg-primary/10 text-primary p-1.5 rounded-full">{icon}</span>
            </div>
            <div className="text-3xl font-bold mt-2 mb-1">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AppointmentItem({ appointment }: { appointment: Appointment }) {
  // Formatear fecha para mostrar "Hoy", "Mañana" o la fecha completa
  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return `Hoy, ${format(date, "h:mm a", { locale: es })}`;
    } else if (isTomorrow(date)) {
      return `Mañana, ${format(date, "h:mm a", { locale: es })}`;
    } else {
      return format(date, "EEEE d 'de' MMMM, h:mm a", { locale: es });
    }
  };
  
  // Mapear tipos de cita a español
  const appointmentTypeMap: Record<string, string> = {
    first_visit: "Primera visita",
    follow_up: "Seguimiento",
    emergency: "Urgencia",
    telemedicine: "Telemedicina"
  };
  
  // Colores para los estados
  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    completed: "bg-green-100 text-green-800 hover:bg-green-200",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
    no_show: "bg-orange-100 text-orange-800 hover:bg-orange-200"
  };
  
  // Texto para los estados
  const statusText: Record<string, string> = {
    scheduled: "Programada",
    completed: "Completada",
    cancelled: "Cancelada",
    no_show: "No asistió"
  };
  
  return (
    <div className="flex items-start space-x-4">
      <Avatar className="h-10 w-10">
        {appointment.patient.profileImage ? (
          <AvatarImage src={appointment.patient.profileImage} alt={appointment.patient.firstName} />
        ) : (
          <AvatarFallback>
            {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center">
          <p className="font-medium">
            {appointment.patient.firstName} {appointment.patient.lastName}
          </p>
          <Badge 
            variant="outline" 
            className={`ml-2 text-xs ${statusColors[appointment.status]}`}
          >
            {statusText[appointment.status]}
          </Badge>
        </div>
        <div className="flex text-sm text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span>{formatAppointmentDate(appointment.dateTime)}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {appointmentTypeMap[appointment.appointmentType]} - {appointment.reason}
        </p>
      </div>
      
      <Link href={`/agenda/cita/${appointment.id}`}>
        <Button variant="outline" size="sm">
          Ver detalles
        </Button>
      </Link>
    </div>
  );
}