import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import LaboratoryLayout from "@/layouts/LaboratoryLayout";
import { createInternalLink } from "@/lib/subdomain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserRound,
  TestTube,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfDay, endOfDay, isToday, isTomorrow, isThisWeek } from "date-fns";
import { es } from "date-fns/locale";

// Tipo para las citas programadas
interface ScheduledTest {
  id: number;
  patientName: string;
  patientId: number;
  testName: string;
  testId: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  scheduledDate: string; // ISO date string
  duration: number; // minutos
  requestId?: number;
  notes?: string;
  patientPhone?: string;
  patientEmail?: string;
  confirmationSent: boolean;
  reminderSent: boolean;
}

const EstudiosProgramados = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [, navigate] = useLocation();

  // Obtener citas programadas
  const { data: appointments, isLoading } = useQuery<ScheduledTest[]>({
    queryKey: ["/api/laboratory/appointments", format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      // En una implementación futura, esto debería obtener datos reales de la API
      // Para la demostración, usamos datos simulados
      const today = new Date();
      const tomorrow = addDays(today, 1);
      const dayAfter = addDays(today, 2);
      
      return [
        {
          id: 2001,
          patientName: "Juan Pérez",
          patientId: 101,
          testName: "Química sanguínea",
          testId: 1,
          status: "scheduled",
          scheduledDate: format(addDays(today, 0), "yyyy-MM-dd'T'09:00:00"),
          duration: 30,
          requestId: 1001,
          patientPhone: "+52 55 1234 5678",
          patientEmail: "juan.perez@example.com",
          confirmationSent: true,
          reminderSent: false
        },
        {
          id: 2002,
          patientName: "Ana Gómez",
          patientId: 102,
          testName: "Biometría hemática",
          testId: 2,
          status: "scheduled",
          scheduledDate: format(addDays(today, 0), "yyyy-MM-dd'T'10:30:00"),
          duration: 15,
          requestId: 1002,
          notes: "Paciente con anemia previa",
          patientPhone: "+52 55 8765 4321",
          patientEmail: "ana.gomez@example.com",
          confirmationSent: true,
          reminderSent: true
        },
        {
          id: 2003,
          patientName: "Roberto Sánchez",
          patientId: 103,
          testName: "Perfil tiroideo",
          testId: 3,
          status: "scheduled",
          scheduledDate: format(addDays(today, 1), "yyyy-MM-dd'T'08:00:00"),
          duration: 20,
          requestId: 1003,
          patientPhone: "+52 55 2345 6789",
          patientEmail: "roberto.sanchez@example.com",
          confirmationSent: true,
          reminderSent: false
        },
        {
          id: 2004,
          patientName: "Carmen Vázquez",
          patientId: 104,
          testName: "Examen general de orina",
          testId: 4,
          status: "scheduled",
          scheduledDate: format(addDays(today, 1), "yyyy-MM-dd'T'11:45:00"),
          duration: 15,
          requestId: 1004,
          notes: "Paciente embarazada",
          patientPhone: "+52 55 3456 7890",
          patientEmail: "carmen.vazquez@example.com",
          confirmationSent: false,
          reminderSent: false
        },
        {
          id: 2005,
          patientName: "Luis Torres",
          patientId: 105,
          testName: "Prueba COVID-19 PCR",
          testId: 5,
          status: "scheduled",
          scheduledDate: format(addDays(today, 2), "yyyy-MM-dd'T'14:15:00"),
          duration: 10,
          requestId: 1005,
          patientPhone: "+52 55 4567 8901",
          patientEmail: "luis.torres@example.com",
          confirmationSent: false,
          reminderSent: false
        }
      ];
    },
  });

  // Navegar al día anterior
  const goToPrevDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, -1));
  };

  // Navegar al día siguiente
  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  // Ir a hoy
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Filtrar citas por fecha seleccionada y término de búsqueda
  const filteredAppointments = appointments?.filter(appointment => {
    // Filtrar por fecha
    const appointmentDate = new Date(appointment.scheduledDate);
    const isSameDay = appointmentDate.getDate() === selectedDate.getDate() &&
                       appointmentDate.getMonth() === selectedDate.getMonth() &&
                       appointmentDate.getFullYear() === selectedDate.getFullYear();
    
    if (!isSameDay) return false;
    
    // Filtrar por estado
    if (statusFilter !== "all" && appointment.status !== statusFilter) return false;
    
    // Filtrar por término de búsqueda
    return appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           appointment.testName.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    // Ordenar por hora
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });

  // Iniciar un estudio
  const handleStartTest = (appointmentId: number) => {
    // En una implementación real, esto cambiaría el estado y redirigirá
    toast({
      title: "Estudio iniciado",
      description: "El paciente ha sido registrado y el estudio ha comenzado",
    });
    
    // Simular actualizando el estado
    // En una implementación real, esto invalidaría la consulta
    // queryClient.invalidateQueries({ queryKey: ["/api/laboratory/appointments"] });
  };

  // Cancelar una cita
  const handleCancelAppointment = (appointmentId: number) => {
    toast({
      title: "Cita cancelada",
      description: "La cita ha sido cancelada correctamente",
    });
    
    // En una implementación real, esto invalidaría la consulta
    // queryClient.invalidateQueries({ queryKey: ["/api/laboratory/appointments"] });
  };

  // Enviar recordatorio
  const handleSendReminder = (appointment: ScheduledTest) => {
    toast({
      title: "Recordatorio enviado",
      description: `Se ha enviado un recordatorio a ${appointment.patientEmail}`,
    });
    
    // En una implementación real, esto invalidaría la consulta
    // queryClient.invalidateQueries({ queryKey: ["/api/laboratory/appointments"] });
  };

  // Formatear el estado para mostrar
  const renderStatus = (status: ScheduledTest["status"]) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-700">
            <Calendar className="h-3 w-3" />
            Agendado
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-purple-500 text-purple-700">
            <TestTube className="h-3 w-3" />
            En proceso
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-700">
            <Check className="h-3 w-3" />
            Completado
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-red-500 text-red-700">
            <X className="h-3 w-3" />
            Cancelado
          </Badge>
        );
      case "no_show":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-gray-500 text-gray-700">
            <X className="h-3 w-3" />
            No asistió
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  // Formatear fecha seleccionada
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  
  // Determinar clase para fecha seleccionada
  const dateClass = isToday(selectedDate) 
    ? "text-blue-600 font-bold" 
    : isTomorrow(selectedDate) 
      ? "text-green-600" 
      : "";

  return (
    <LaboratoryLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estudios programados</h1>
          <p className="text-gray-500">
            Agenda de citas para estudios de laboratorio
          </p>
        </div>
        <div>
          <Button variant="outline" className="hidden md:flex" onClick={goToToday}>
            Hoy
          </Button>
        </div>
      </div>

      {/* Navegador de fecha */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h2 className={`text-xl font-semibold capitalize ${dateClass}`}>
                {formattedDate}
              </h2>
              {isToday(selectedDate) && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Hoy
                </span>
              )}
              {isTomorrow(selectedDate) && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Mañana
                </span>
              )}
            </div>
            
            <Button variant="ghost" size="icon" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sección de filtrado */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por paciente o estudio..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select 
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="scheduled">Agendados</SelectItem>
                  <SelectItem value="in_progress">En proceso</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-grow"></div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de citas */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Estudio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando citas...
                  </TableCell>
                </TableRow>
              ) : filteredAppointments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No hay citas programadas para este día
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments?.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {format(new Date(appointment.scheduledDate), "HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-gray-500" />
                        {appointment.patientName}
                        <div className="text-xs text-gray-500">
                          {appointment.patientPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TestTube className="h-4 w-4 text-indigo-600" />
                        {appointment.testName}
                      </div>
                    </TableCell>
                    <TableCell>{renderStatus(appointment.status)}</TableCell>
                    <TableCell>{appointment.duration} min</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        {appointment.status === "scheduled" && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleStartTest(appointment.id)}
                            >
                              Iniciar
                            </Button>
                            {!appointment.reminderSent && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSendReminder(appointment)}
                              >
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                            )}
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {appointment.status === "in_progress" && (
                          <Button 
                            variant="default" 
                            size="sm"
                          >
                            Finalizar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </LaboratoryLayout>
  );
};

export default EstudiosProgramados;