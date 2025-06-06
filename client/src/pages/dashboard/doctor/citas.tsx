import React, { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Loader2, Search, Check, X, Calendar as CalendarIcon, User, FileText, 
         Clipboard, CheckCircle, History, ClipboardList, Filter, PlusCircle, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  patientName: string;
  doctorId: number;
  dateTime: string;
  endTime: string;
  status: string;
  type: string;
  reason: string;
  symptoms: string | null;
  notes: string | null;
  isRecurring: boolean;
  recurringId: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function CitasDoctor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [followUpData, setFollowUpData] = useState({
    appointmentId: 0,
    recommendedDate: format(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    reason: "",
    instructions: "",
    status: "pending"
  });
  const [medicalNotes, setMedicalNotes] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Obtener todas las citas del médico
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments/doctor", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest("GET", `/api/appointments/doctor/${user.id}`);
      return await res.json();
    },
    enabled: !!user?.id
  });
  
  // Obtener próximas citas del médico
  const { data: upcomingAppointments, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ["/api/appointments/upcoming/doctor", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest("GET", `/api/appointments/upcoming/doctor/${user.id}`);
      return await res.json();
    },
    enabled: !!user?.id
  });
  
  // Mutación para actualizar estado de cita
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest("PUT", `/api/appointments/${id}`, {
        status
      });
      return { id, status };
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de la cita ha sido actualizado correctamente",
        variant: "default"
      });
      // Invalidar consultas de citas para actualizar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/doctor", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/upcoming/doctor", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado de la cita: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutación para crear seguimiento de cita
  const createFollowUpMutation = useMutation({
    mutationFn: async (followUpData: typeof followUpData) => {
      const res = await apiRequest("POST", "/api/appointment-follow-ups", followUpData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Seguimiento creado",
        description: "El seguimiento ha sido programado correctamente",
        variant: "default"
      });
      setFollowUpData({
        appointmentId: 0,
        recommendedDate: format(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        reason: "",
        instructions: "",
        status: "pending"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el seguimiento: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutación para agregar notas médicas
  const addMedicalNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number, notes: string }) => {
      await apiRequest("PUT", `/api/appointments/${id}`, {
        notes
      });
      return { id, notes };
    },
    onSuccess: () => {
      toast({
        title: "Notas guardadas",
        description: "Las notas médicas han sido guardadas correctamente",
        variant: "default"
      });
      setMedicalNotes("");
      // Invalidar consultas de citas para actualizar los datos
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/doctor", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/upcoming/doctor", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudieron guardar las notas: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Filtrar citas por búsqueda y estado
  const filterAppointments = (appointments: Appointment[] | undefined) => {
    if (!appointments) return [];
    
    let filtered = appointments;
    
    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.patientName.toLowerCase().includes(lowerSearchTerm) ||
        appointment.reason.toLowerCase().includes(lowerSearchTerm) ||
        (appointment.symptoms && appointment.symptoms.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    return filtered;
  };
  
  // Filtrar citas pasadas (completadas, canceladas o fechas pasadas)
  const getPastAppointments = () => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => 
      appointment.status === "completed" ||
      appointment.status === "cancelled" ||
      appointment.status === "no_show" ||
      (new Date(appointment.dateTime) < new Date() && 
       appointment.status !== "cancelled" && 
       appointment.status !== "completed" &&
       appointment.status !== "no_show")
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
  
  // Opciones de estado para filtrar
  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "scheduled", label: "Agendada" },
    { value: "confirmed", label: "Confirmada" },
    { value: "in_progress", label: "En progreso" },
    { value: "completed", label: "Completada" },
    { value: "cancelled", label: "Cancelada" },
    { value: "no_show", label: "No asistió" }
  ];
  
  // Manejar creación de seguimiento
  const handleCreateFollowUp = (appointment: Appointment) => {
    setFollowUpData({
      ...followUpData,
      appointmentId: appointment.id,
      reason: `Seguimiento para: ${appointment.reason}`
    });
    setSelectedAppointment(appointment);
  };
  
  // Manejar guardado de notas médicas
  const handleSaveMedicalNotes = (appointmentId: number) => {
    if (!medicalNotes.trim()) {
      toast({
        title: "Error",
        description: "Las notas médicas no pueden estar vacías",
        variant: "destructive"
      });
      return;
    }
    
    addMedicalNotesMutation.mutate({ id: appointmentId, notes: medicalNotes });
  };
  
  // Manejar envío del formulario de seguimiento
  const handleSubmitFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!followUpData.reason.trim() || !followUpData.recommendedDate) {
      toast({
        title: "Información incompleta",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    createFollowUpMutation.mutate(followUpData);
  };
  
  if (!user) {
    return <div>Debe iniciar sesión para acceder a esta página</div>;
  }
  
  if (user.userType !== "doctor") {
    return <div>Esta página es solo para médicos</div>;
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
            <BreadcrumbPage>Citas Médicas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <h1 className="text-3xl font-semibold">Gestión de Citas</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por paciente, motivo..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Link href="/dashboard/doctor/horarios">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Gestionar horarios
            </Button>
          </Link>
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
          ) : upcomingAppointments && filterAppointments(upcomingAppointments).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterAppointments(upcomingAppointments).map((appointment: Appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <div className={`h-2 ${
                    appointment.status === "confirmed" ? "bg-green-500" :
                    appointment.status === "in_progress" ? "bg-amber-500" :
                    appointment.status === "scheduled" ? "bg-blue-500" :
                    "bg-gray-300"
                  }`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        <div className="flex items-center">
                          <User className="h-5 w-5 mr-2 text-muted-foreground" />
                          {appointment.patientName}
                        </div>
                      </CardTitle>
                      {getAppointmentStatusBadge(appointment.status)}
                    </div>
                    <CardDescription>{appointment.reason}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 space-y-4">
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
                    
                    {appointment.symptoms && (
                      <div className="flex items-start gap-2 text-sm">
                        <Clipboard className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Síntomas: </span>
                          <span className="text-muted-foreground">{appointment.symptoms}</span>
                        </div>
                      </div>
                    )}
                    
                    {appointment.notes && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Notas: </span>
                          <span className="text-muted-foreground">{appointment.notes}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 flex items-center justify-between">
                      {getAppointmentTypeBadge(appointment.type)}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Acciones
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Gestionar cita</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {appointment.status === "scheduled" && (
                            <DropdownMenuItem onClick={() => 
                              updateAppointmentStatusMutation.mutate({ id: appointment.id, status: "confirmed" })
                            }>
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              <span>Confirmar cita</span>
                            </DropdownMenuItem>
                          )}
                          
                          {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                            <DropdownMenuItem onClick={() => 
                              updateAppointmentStatusMutation.mutate({ id: appointment.id, status: "in_progress" })
                            }>
                              <Clock className="mr-2 h-4 w-4 text-amber-500" />
                              <span>Iniciar consulta</span>
                            </DropdownMenuItem>
                          )}
                          
                          {appointment.status === "in_progress" && (
                            <DropdownMenuItem onClick={() => 
                              updateAppointmentStatusMutation.mutate({ id: appointment.id, status: "completed" })
                            }>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              <span>Completar consulta</span>
                            </DropdownMenuItem>
                          )}
                          
                          {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                            <DropdownMenuItem onClick={() => 
                              updateAppointmentStatusMutation.mutate({ id: appointment.id, status: "no_show" })
                            }>
                              <X className="mr-2 h-4 w-4 text-red-500" />
                              <span>Marcar como no asistió</span>
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {/* Agregar notas médicas */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Agregar notas</span>
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Notas médicas</DialogTitle>
                                <DialogDescription>
                                  Agregue notas médicas para esta cita.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <Textarea
                                  placeholder="Escriba sus notas médicas aquí..."
                                  className="min-h-[150px]"
                                  value={medicalNotes}
                                  onChange={(e) => setMedicalNotes(e.target.value)}
                                />
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button onClick={() => handleSaveMedicalNotes(appointment.id)}>
                                  Guardar notas
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {/* Programar seguimiento */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleCreateFollowUp(appointment);
                                }}
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                <span>Programar seguimiento</span>
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Programar seguimiento</DialogTitle>
                                <DialogDescription>
                                  Programe una cita de seguimiento para el paciente.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <form onSubmit={handleSubmitFollowUp} className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label htmlFor="recommendedDate" className="text-sm font-medium">
                                    Fecha recomendada
                                  </label>
                                  <Input
                                    id="recommendedDate"
                                    type="date"
                                    value={followUpData.recommendedDate}
                                    onChange={(e) => setFollowUpData({
                                      ...followUpData,
                                      recommendedDate: e.target.value
                                    })}
                                    required
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label htmlFor="reason" className="text-sm font-medium">
                                    Motivo del seguimiento
                                  </label>
                                  <Input
                                    id="reason"
                                    value={followUpData.reason}
                                    onChange={(e) => setFollowUpData({
                                      ...followUpData,
                                      reason: e.target.value
                                    })}
                                    placeholder="Ej. Control de tratamiento, revisión, etc."
                                    required
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label htmlFor="instructions" className="text-sm font-medium">
                                    Instrucciones para el paciente
                                  </label>
                                  <Textarea
                                    id="instructions"
                                    value={followUpData.instructions}
                                    onChange={(e) => setFollowUpData({
                                      ...followUpData,
                                      instructions: e.target.value
                                    })}
                                    placeholder="Instrucciones o preparación necesaria para la próxima cita"
                                    rows={3}
                                  />
                                </div>
                                
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancelar</Button>
                                  </DialogClose>
                                  <Button type="submit">
                                    Programar seguimiento
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                <Link href="/dashboard/doctor/horarios">
                  <Button>Gestionar horarios</Button>
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
              {filterAppointments(getPastAppointments()).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filterAppointments(getPastAppointments()).map((appointment: Appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <div className={`h-2 ${
                        appointment.status === "completed" ? "bg-green-500" :
                        appointment.status === "cancelled" ? "bg-red-500" :
                        appointment.status === "no_show" ? "bg-gray-500" :
                        "bg-gray-300"
                      }`} />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            <div className="flex items-center">
                              <User className="h-5 w-5 mr-2 text-muted-foreground" />
                              {appointment.patientName}
                            </div>
                          </CardTitle>
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
                          <div className="flex items-start gap-2 text-sm">
                            <Clipboard className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Síntomas: </span>
                              <span className="text-muted-foreground">{appointment.symptoms}</span>
                            </div>
                          </div>
                        )}
                        
                        {appointment.notes && (
                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Notas: </span>
                              <span className="text-muted-foreground">{appointment.notes}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2 flex justify-between items-center">
                          {getAppointmentTypeBadge(appointment.type)}
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Ver detalles
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalles de la consulta</DialogTitle>
                                <DialogDescription>
                                  Información completa de la cita con {appointment.patientName}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Paciente</h4>
                                    <p className="text-sm">{appointment.patientName}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Estado</h4>
                                    <p className="text-sm">{getAppointmentStatusBadge(appointment.status)}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Fecha y hora</h4>
                                    <p className="text-sm">{formatDateTime(appointment.dateTime)}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Tipo de cita</h4>
                                    <p className="text-sm">{getAppointmentTypeBadge(appointment.type)}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Motivo de consulta</h4>
                                  <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                                </div>
                                
                                {appointment.symptoms && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Síntomas</h4>
                                    <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                                  </div>
                                )}
                                
                                {appointment.notes && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Notas médicas</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{appointment.notes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button>Cerrar</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/50">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay historial de citas</h3>
                    <p className="text-muted-foreground">
                      No tiene citas pasadas en su historial.
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