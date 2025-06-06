import React, { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Loader2, Search, Plus, XCircle, Check, AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Interfaces
interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  doctorName: string;
  dateTime: string;
  endTime: string;
  status: string;
  type: string;
  reason: string;
  symptoms: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CitasPaciente() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Obtener todas las citas del paciente
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments/patient", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest("GET", `/api/appointments/patient/${user.id}`);
      return await res.json();
    },
    enabled: !!user?.id
  });
  
  // Obtener próximas citas del paciente
  const { data: upcomingAppointments, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ["/api/appointments/upcoming/patient", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest("GET", `/api/appointments/upcoming/patient/${user.id}`);
      return await res.json();
    },
    enabled: !!user?.id
  });
  
  // Mutación para cancelar cita
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      await apiRequest("PUT", `/api/appointments/${appointmentId}`, {
        status: "cancelled"
      });
      return appointmentId;
    },
    onSuccess: () => {
      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada correctamente",
        variant: "default"
      });
      // Invalidar consultas de citas para actualizar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/patient", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/upcoming/patient", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo cancelar la cita: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Filtrar citas por búsqueda
  const filterAppointments = (appointments: Appointment[] | undefined) => {
    if (!appointments) return [];
    
    if (!searchTerm) return appointments;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return appointments.filter(appointment => 
      appointment.doctorName.toLowerCase().includes(lowerSearchTerm) ||
      appointment.reason.toLowerCase().includes(lowerSearchTerm) ||
      (appointment.symptoms && appointment.symptoms.toLowerCase().includes(lowerSearchTerm))
    );
  };
  
  // Filtrar citas por estado
  const getPastAppointments = () => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => 
      appointment.status === "completed" ||
      (appointment.status === "cancelled") ||
      (new Date(appointment.dateTime) < new Date() && appointment.status !== "cancelled")
    );
  };
  
  // Formatear fecha para mostrar
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy 'a las' h:mm a", { locale: es });
  };
  
  // Estado de la cita
  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Agendada</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmada</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En progreso</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
      case "no_show":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">No asistió</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Tipo de cita
  const getAppointmentTypeBadge = (type: string) => {
    switch (type) {
      case "first_visit":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Primera visita</Badge>;
      case "follow_up":
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Seguimiento</Badge>;
      case "routine":
        return <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">Rutinaria</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Urgente</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  if (!user) {
    return <div>Debe iniciar sesión para acceder a esta página</div>;
  }
  
  if (user.userType !== "patient") {
    return <div>Esta página es solo para pacientes</div>;
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Mis Citas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Mis Citas Médicas</h1>
        
        <Link href="/dashboard/patient/agendar-cita">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Agendar nueva cita</span>
          </Button>
        </Link>
      </div>
      
      <div className="w-full max-w-sm">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar citas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Próximas citas</TabsTrigger>
          <TabsTrigger value="past">Historial de citas</TabsTrigger>
        </TabsList>
        
        {/* Próximas citas */}
        <TabsContent value="upcoming">
          {isLoadingUpcoming ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterAppointments(upcomingAppointments).map((appointment: Appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <div className={`h-2 ${
                    appointment.status === "confirmed" ? "bg-green-500" :
                    appointment.status === "scheduled" ? "bg-blue-500" :
                    "bg-gray-300"
                  }`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Cita con {appointment.doctorName}</CardTitle>
                      {getAppointmentStatusBadge(appointment.status)}
                    </div>
                    <CardDescription>{appointment.reason}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDateTime(appointment.dateTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duración: {
                        Math.round(
                          (new Date(appointment.endTime).getTime() - new Date(appointment.dateTime).getTime()) 
                          / (1000 * 60)
                        )
                      } minutos</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      {getAppointmentTypeBadge(appointment.type)}
                      
                      {appointment.status !== "cancelled" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Está seguro de cancelar esta cita?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. La cita será cancelada y liberará el horario para otros pacientes.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>No cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                                className="bg-red-500 text-white hover:bg-red-600"
                              >
                                Sí, cancelar cita
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tiene citas programadas</h3>
                <p className="text-muted-foreground mb-6">
                  Actualmente no tiene ninguna cita médica agendada.
                </p>
                <Link href="/dashboard/patient/agendar-cita">
                  <Button>Agendar una cita</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Historial de citas */}
        <TabsContent value="past">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div>
              {getPastAppointments().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filterAppointments(getPastAppointments()).map((appointment: Appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <div className={`h-2 ${
                        appointment.status === "completed" ? "bg-green-500" :
                        appointment.status === "cancelled" ? "bg-red-500" :
                        "bg-gray-300"
                      }`} />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">Cita con {appointment.doctorName}</CardTitle>
                          {getAppointmentStatusBadge(appointment.status)}
                        </div>
                        <CardDescription>{appointment.reason}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDateTime(appointment.dateTime)}</span>
                        </div>
                        
                        {appointment.symptoms && (
                          <div className="text-sm">
                            <span className="font-medium">Síntomas: </span>
                            <span className="text-muted-foreground">{appointment.symptoms}</span>
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div className="text-sm">
                            <span className="font-medium">Notas: </span>
                            <span className="text-muted-foreground">{appointment.notes}</span>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          {getAppointmentTypeBadge(appointment.type)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay historial de citas</h3>
                    <p className="text-muted-foreground">
                      No tiene citas pasadas o canceladas en su historial.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}