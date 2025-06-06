import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  FileText, 
  Video, 
  Plus, 
  Search,
  Trash2,
  X
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import PatientLayout from "@/layouts/PatientLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  doctor: {
    firstName: string;
    lastName: string;
    specialtyName: string;
    profileImage?: string;
  };
  dateTime: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  appointmentType: "first_visit" | "follow_up" | "emergency" | "telemedicine";
  reason: string;
  symptoms?: string;
  notes?: string;
  location?: string;
  meetingUrl?: string;
}

// Mapeo de tipos de cita en español
const appointmentTypeMap = {
  first_visit: "Primera visita",
  follow_up: "Seguimiento",
  emergency: "Urgencia",
  telemedicine: "Telemedicina"
};

// Mapeo de estados de cita en español
const statusMap = {
  scheduled: { label: "Programada", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completada", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
  no_show: { label: "No asistió", color: "bg-orange-100 text-orange-800" }
};

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Cargar citas
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/patient/appointments"],
  });
  
  // Filtrar citas según la pestaña seleccionada
  const filterAppointments = () => {
    if (!appointments) return [];
    
    const now = new Date();
    let filtered = [...appointments];
    
    // Filtrar por pestaña
    if (selectedTab === "upcoming") {
      filtered = filtered.filter(apt => 
        new Date(apt.dateTime) >= now && apt.status === "scheduled"
      );
    } else if (selectedTab === "past") {
      filtered = filtered.filter(apt => 
        new Date(apt.dateTime) < now || apt.status === "completed" || apt.status === "cancelled" || apt.status === "no_show"
      );
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        (apt.doctor.firstName + " " + apt.doctor.lastName).toLowerCase().includes(term) ||
        apt.doctor.specialtyName.toLowerCase().includes(term) ||
        apt.reason.toLowerCase().includes(term)
      );
    }
    
    // Ordenar por fecha
    return filtered.sort((a, b) => {
      if (selectedTab === "upcoming") {
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      } else {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      }
    });
  };
  
  const filteredAppointments = filterAppointments();
  
  // Función para cancelar cita
  const handleCancelAppointment = async (id: number) => {
    try {
      await apiRequest("PATCH", `/api/appointments/${id}/cancel`, {});
      // Recargar la lista de citas
      window.location.reload();
    } catch (error) {
      console.error("Error al cancelar la cita:", error);
    }
  };
  
  // Renderizar esqueleto de carga
  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Citas</h1>
            <p className="text-muted-foreground mt-1">
              Administra tus consultas médicas programadas
            </p>
          </div>
          <Link href="/dashboard/patient/agendar-cita">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agendar nueva cita
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por doctor, especialidad o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Tabs 
          defaultValue="upcoming" 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">Próximas Citas</TabsTrigger>
            <TabsTrigger value="past">Historial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              renderSkeleton()
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onSelect={() => setSelectedAppointment(appointment)}
                    onCancel={() => handleCancelAppointment(appointment.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto my-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No tienes citas programadas</h3>
                  <p className="mb-6 mt-2 text-sm text-muted-foreground">
                    Agenda una cita con un especialista para recibir atención médica
                  </p>
                  <Link href="/dashboard/patient/agendar-cita">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Agendar cita
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            {isLoading ? (
              renderSkeleton()
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment} 
                    onSelect={() => setSelectedAppointment(appointment)}
                    onCancel={() => handleCancelAppointment(appointment.id)}
                    isPast
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto my-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No tienes historial de citas</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tu historial de consultas aparecerá aquí después de tus visitas
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal de detalle de cita */}
      {selectedAppointment && (
        <Dialog 
          open={!!selectedAppointment} 
          onOpenChange={open => !open && setSelectedAppointment(null)}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Detalles de la Cita</DialogTitle>
              <DialogDescription>
                Información completa sobre tu cita médica
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="flex items-start gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  {selectedAppointment.doctor.profileImage ? (
                    <AvatarImage src={selectedAppointment.doctor.profileImage} alt={selectedAppointment.doctor.firstName} />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {selectedAppointment.doctor.firstName[0]}
                      {selectedAppointment.doctor.lastName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">
                    Dr. {selectedAppointment.doctor.firstName} {selectedAppointment.doctor.lastName}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {selectedAppointment.doctor.specialtyName}
                  </p>
                  <div className="mt-2">
                    <Badge 
                      className={statusMap[selectedAppointment.status].color}
                      variant="outline"
                    >
                      {statusMap[selectedAppointment.status].label}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fecha</p>
                    <p>
                      {format(parseISO(selectedAppointment.dateTime), 
                        "EEEE, d 'de' MMMM, yyyy", 
                        { locale: es }
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Hora</p>
                    <p>
                      {format(parseISO(selectedAppointment.dateTime), 
                        "h:mm a", 
                        { locale: es }
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Tipo de consulta</h4>
                  <p>
                    {appointmentTypeMap[selectedAppointment.appointmentType as keyof typeof appointmentTypeMap]}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Motivo de la consulta</h4>
                  <p className="text-sm">{selectedAppointment.reason}</p>
                </div>
                
                {selectedAppointment.symptoms && (
                  <div>
                    <h4 className="font-medium mb-1">Síntomas</h4>
                    <p className="text-sm">{selectedAppointment.symptoms}</p>
                  </div>
                )}
                
                {selectedAppointment.location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium mb-1">Ubicación</h4>
                      <p className="text-sm">{selectedAppointment.location}</p>
                    </div>
                  </div>
                )}
                
                {selectedAppointment.appointmentType === "telemedicine" && (
                  <div className="flex items-start">
                    <Video className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium mb-1">Enlace para videoconsulta</h4>
                      <Button variant="link" className="h-auto p-0 text-sm text-blue-600">
                        Acceder a la videoconsulta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
              {selectedAppointment.status === "scheduled" && (
                <Button
                  variant="destructive"
                  onClick={() => handleCancelAppointment(selectedAppointment.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Cancelar cita
                </Button>
              )}
              <DialogClose asChild>
                <Button variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Cerrar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PatientLayout>
  );
}

// Componente de tarjeta de cita
function AppointmentCard({ 
  appointment, 
  onSelect, 
  onCancel,
  isPast = false
}: { 
  appointment: Appointment; 
  onSelect: () => void;
  onCancel: () => void;
  isPast?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div 
            className={`p-4 md:w-3/12 md:border-r ${
              appointment.status === "scheduled" ? 
                "bg-blue-50 border-blue-100 text-blue-900" : 
                "bg-gray-50 border-gray-100 text-gray-900"
            }`}
          >
            <p className="font-medium">
              {format(parseISO(appointment.dateTime), "EEEE", { locale: es })}
            </p>
            <p className="text-2xl font-bold mt-1">
              {format(parseISO(appointment.dateTime), "d", { locale: es })}
            </p>
            <p>
              {format(parseISO(appointment.dateTime), "MMMM, yyyy", { locale: es })}
            </p>
            <div className="mt-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {format(parseISO(appointment.dateTime), "h:mm a", { locale: es })}
            </div>
          </div>
          
          <div className="p-4 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Avatar>
                  {appointment.doctor.profileImage ? (
                    <AvatarImage src={appointment.doctor.profileImage} alt={appointment.doctor.firstName} />
                  ) : (
                    <AvatarFallback>
                      {appointment.doctor.firstName[0]}
                      {appointment.doctor.lastName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.doctor.specialtyName}
                  </p>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={statusMap[appointment.status].color}
                    >
                      {statusMap[appointment.status].label}
                    </Badge>
                    <Badge className="ml-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200">
                      {appointmentTypeMap[appointment.appointmentType as keyof typeof appointmentTypeMap]}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-1 flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={onSelect}>
                  Ver detalles
                </Button>
                {!isPast && appointment.status === "scheduled" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={e => {
                      e.stopPropagation();
                      onCancel();
                    }}
                    className="text-red-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Motivo</h4>
              <p className="text-sm text-muted-foreground">
                {appointment.reason.length > 100 ? 
                  `${appointment.reason.slice(0, 100)}...` : 
                  appointment.reason
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}