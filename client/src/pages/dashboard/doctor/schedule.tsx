import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X,
  Save,
  Trash,
  Filter,
  Users,
  CalendarDays,
  Loader2,
  CheckCircle2,
  ChevronDown,
  FileText
} from "lucide-react";


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Interfaces
interface Appointment {
  id: number;
  patientId: number;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  dateTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  appointmentType: "first_visit" | "follow_up" | "emergency" | "telemedicine";
  reason: string;
}

interface TimeSlot {
  id: number;
  doctorId: number;
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, etc.
  startTime: string; // HH:MM formato 24h
  endTime: string;   // HH:MM formato 24h
  isRecurring: boolean;
  date?: string;     // Fecha específica para slots no recurrentes
  status: "available" | "booked" | "blocked";
}

export default function SchedulePage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedView, setSelectedView] = useState<"week" | "day">("week");
  const [showAddSlotDialog, setShowAddSlotDialog] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Estado para nuevo horario
  const [newSlot, setNewSlot] = useState<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    date?: string;
    duration: number;
  }>({
    dayOfWeek: selectedDate.getDay(),
    startTime: "09:00",
    endTime: "09:30",
    isRecurring: true,
    duration: 30
  });
  
  // Cargar citas
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/doctor/appointments"],
    // Procesamos la respuesta para asegurar que sea un array
    select: (data) => {
      // Si data no es un array, devolvemos array vacío para prevenir errores
      if (!Array.isArray(data)) {
        console.warn('La API de citas no devolvió un array válido');
        return [] as Appointment[];
      }
      return data;
    }
  });
  
  // Cargar horarios disponibles
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = useQuery<TimeSlot[]>({
    queryKey: ["/api/doctor/schedule"],
    // Procesamos la respuesta para asegurar que sea un array
    select: (data) => {
      // Si data no es un array, devolvemos array vacío para prevenir errores
      if (!Array.isArray(data)) {
        console.warn('La API de horarios no devolvió un array válido');
        return [] as TimeSlot[];
      }
      return data;
    }
  });
  
  // Calcular días de la semana
  const weekDates = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 })
  });
  
  // Mutation para crear slot de horario
  const createTimeSlotMutation = useMutation({
    mutationFn: async (slotData: Omit<TimeSlot, "id" | "doctorId" | "status">) => {
      const res = await apiRequest(
        "POST", 
        "/api/doctor/schedule", 
        slotData
      );
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Horario creado",
        description: "El horario ha sido creado exitosamente.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/schedule"] });
      setShowAddSlotDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear horario",
        description: error.message || "No se pudo crear el horario. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation para eliminar slot de horario
  const deleteTimeSlotMutation = useMutation({
    mutationFn: async (slotId: number) => {
      const res = await apiRequest(
        "DELETE", 
        `/api/doctor/schedule/${slotId}`, 
        {}
      );
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Horario eliminado",
        description: "El horario ha sido eliminado exitosamente.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/schedule"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar horario",
        description: error.message || "No se pudo eliminar el horario. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });
  
  // Handler para añadir nuevo slot
  const handleAddTimeSlot = () => {
    // Validar horarios
    const startHour = parseInt(newSlot.startTime.split(":")[0]);
    const startMinute = parseInt(newSlot.startTime.split(":")[1]);
    const endHour = parseInt(newSlot.endTime.split(":")[0]);
    const endMinute = parseInt(newSlot.endTime.split(":")[1]);
    
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    
    if (endTotal <= startTotal) {
      toast({
        title: "Error en horario",
        description: "La hora de fin debe ser posterior a la hora de inicio.",
        variant: "destructive",
      });
      return;
    }
    
    // Si es recurrente, usamos el día de la semana, si no, usamos la fecha específica
    const slotData = {
      dayOfWeek: newSlot.dayOfWeek,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      isRecurring: newSlot.isRecurring,
      date: !newSlot.isRecurring ? format(selectedDate, "yyyy-MM-dd") : undefined
    };
    
    createTimeSlotMutation.mutate(slotData);
  };
  
  // Agrupar citas por fecha/hora
  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateTime);
      return isSameDay(appointmentDate, date);
    }).sort((a, b) => {
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });
  };
  
  // Función para generar horarios del día basados en TimeSlots
  const getDailySchedule = (date: Date) => {
    if (!timeSlots) return [];
    
    const dayOfWeek = date.getDay();
    const dateString = format(date, "yyyy-MM-dd");
    
    // Obtener slots recurrentes para este día de la semana
    const recurringSlots = timeSlots.filter(
      slot => slot.isRecurring && slot.dayOfWeek === dayOfWeek
    );
    
    // Obtener slots específicos para esta fecha
    const specificSlots = timeSlots.filter(
      slot => !slot.isRecurring && slot.date === dateString
    );
    
    return [...recurringSlots, ...specificSlots].sort((a, b) => {
      const timeA = a.startTime.split(":").map(Number);
      const timeB = b.startTime.split(":").map(Number);
      
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      
      return timeA[1] - timeB[1];
    });
  };
  
  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground mt-1">
              Gestione su disponibilidad y citas con pacientes
            </p>
          </div>
          <div className="flex gap-3">
            <Dialog open={showAddSlotDialog} onOpenChange={setShowAddSlotDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir disponibilidad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir horario disponible</DialogTitle>
                  <DialogDescription>
                    Configure los horarios en los que estará disponible para citas
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Fecha
                    </Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            disabled={newSlot.isRecurring}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, "PPP", { locale: es })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => setSelectedDate(date || new Date())}
                            disabled={{ before: new Date() }}
                            initialFocus
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="recurring" className="text-right">
                      Recurrente
                    </Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="recurring"
                        checked={newSlot.isRecurring}
                        onCheckedChange={(checked) => {
                          setNewSlot({
                            ...newSlot,
                            isRecurring: checked,
                            dayOfWeek: selectedDate.getDay()
                          });
                        }}
                      />
                      <Label htmlFor="recurring">
                        Repetir cada semana
                      </Label>
                    </div>
                  </div>
                  
                  {newSlot.isRecurring && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dayOfWeek" className="text-right">
                        Día
                      </Label>
                      <Select
                        value={newSlot.dayOfWeek.toString()}
                        onValueChange={(value) => {
                          setNewSlot({
                            ...newSlot,
                            dayOfWeek: parseInt(value)
                          });
                        }}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccione un día" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Lunes</SelectItem>
                          <SelectItem value="2">Martes</SelectItem>
                          <SelectItem value="3">Miércoles</SelectItem>
                          <SelectItem value="4">Jueves</SelectItem>
                          <SelectItem value="5">Viernes</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                          <SelectItem value="0">Domingo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startTime" className="text-right">
                      Hora inicio
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => {
                        setNewSlot({
                          ...newSlot,
                          startTime: e.target.value
                        });
                      }}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endTime" className="text-right">
                      Hora fin
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => {
                        setNewSlot({
                          ...newSlot,
                          endTime: e.target.value
                        });
                      }}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duración (min)
                    </Label>
                    <Select
                      value={newSlot.duration.toString()}
                      onValueChange={(value) => {
                        setNewSlot({
                          ...newSlot,
                          duration: parseInt(value)
                        });
                      }}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Duración de la cita" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddSlotDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddTimeSlot}
                    disabled={createTimeSlotMutation.isPending}
                  >
                    {createTimeSlotMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Filtrar</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar citas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>Todas las citas</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Nuevos pacientes</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>Citas recurrentes</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as "week" | "day")}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(subWeeks(weekStart, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(addWeeks(weekStart, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
                  setSelectedDate(new Date());
                }}
              >
                Hoy
              </Button>
            </div>
            
            <TabsList>
              <TabsTrigger value="week">Vista semanal</TabsTrigger>
              <TabsTrigger value="day">Vista diaria</TabsTrigger>
            </TabsList>
          </div>
          
          <h3 className="text-lg font-medium my-4">
            {selectedView === "week" ? (
              <span>
                {format(weekStart, "d MMMM", { locale: es })} - {format(weekDates[weekDates.length - 1], "d MMMM yyyy", { locale: es })}
              </span>
            ) : (
              <span>
                {format(selectedDate, "EEEE, d 'de' MMMM, yyyy", { locale: es })}
              </span>
            )}
          </h3>
          
          <TabsContent value="week" className="mt-0">
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b">
                  {weekDates.map((date, i) => (
                    <div 
                      key={i} 
                      className={`p-3 text-center border-r last:border-r-0 ${
                        isSameDay(date, new Date()) ? "bg-primary/5" : ""
                      }`}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedView("day");
                      }}
                    >
                      <p className="text-sm font-medium">{format(date, "EEEE", { locale: es })}</p>
                      <p className={`text-2xl mt-1 ${
                        isSameDay(date, new Date()) ? "font-bold text-primary" : ""
                      }`}>
                        {format(date, "d", { locale: es })}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 divide-x min-h-[500px]">
                  {weekDates.map((date, dateIndex) => {
                    const dayAppointments = getAppointmentsForDate(date);
                    const dailySchedule = getDailySchedule(date);
                    
                    return (
                      <div key={dateIndex} className={`${
                        isSameDay(date, new Date()) ? "bg-primary/5" : ""
                      }`}>
                        {isLoadingAppointments || isLoadingTimeSlots ? (
                          <div className="p-4 space-y-4">
                            {Array(3).fill(0).map((_, i) => (
                              <Skeleton key={i} className="h-20 w-full" />
                            ))}
                          </div>
                        ) : dayAppointments.length === 0 && dailySchedule.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No hay citas o horarios
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setSelectedDate(date);
                                setShowAddSlotDialog(true);
                              }}
                            >
                              Añadir disponibilidad
                            </Button>
                          </div>
                        ) : (
                          <div className="p-2 space-y-2">
                            {/* Mostrar citas del día */}
                            {dayAppointments.map((appointment) => (
                              <Card 
                                key={appointment.id} 
                                className="hover:shadow-md transition-shadow cursor-pointer" 
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentDetails(true);
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-start gap-2 mb-2">
                                    <p className="text-sm font-medium">
                                      {format(new Date(appointment.dateTime), "HH:mm", { locale: es })}
                                    </p>
                                    <Badge variant="outline" className="h-5 px-1.5 text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {appointment.appointmentType === "first_visit" ? "Primera visita" : 
                                        appointment.appointmentType === "follow_up" ? "Seguimiento" : 
                                        appointment.appointmentType === "emergency" ? "Urgencia" : "Telemedicina"}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                      {appointment.patient.profileImage ? (
                                        <AvatarImage 
                                          src={appointment.patient.profileImage} 
                                          alt={appointment.patient.firstName} 
                                        />
                                      ) : (
                                        <AvatarFallback className="text-xs">
                                          {appointment.patient.firstName[0]}{appointment.patient.lastName[0]}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <span className="text-sm truncate">
                                      {appointment.patient.firstName} {appointment.patient.lastName}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            
                            {/* Mostrar slots disponibles */}
                            {dailySchedule
                              .filter(slot => slot.status === "available")
                              .map((slot) => (
                                <Card key={slot.id} className="border-dashed border-green-200">
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="text-sm font-medium text-green-700">
                                          {slot.startTime} - {slot.endTime}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {slot.isRecurring ? "Recurrente" : "Único"}
                                        </p>
                                      </div>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => deleteTimeSlotMutation.mutate(slot.id)}
                                      >
                                        <Trash className="h-3 w-3 mr-1" />
                                        Eliminar
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="day" className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Agenda del día</CardTitle>
                    <CardDescription>
                      {format(selectedDate, "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddSlotDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir horario
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments || isLoadingTimeSlots ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <DailyScheduleView 
                    date={selectedDate}
                    appointments={getAppointmentsForDate(selectedDate)}
                    timeSlots={getDailySchedule(selectedDate)}
                    onSelectAppointment={(appointment) => {
                      setSelectedAppointment(appointment);
                      setShowAppointmentDetails(true);
                    }}
                    onDeleteTimeSlot={(slotId) => deleteTimeSlotMutation.mutate(slotId)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Modal de detalles de cita */}
        {selectedAppointment && (
          <Dialog 
            open={showAppointmentDetails} 
            onOpenChange={setShowAppointmentDetails}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Detalles de la Cita</DialogTitle>
                <DialogDescription>
                  Información de la cita con el paciente
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-3">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    {selectedAppointment.patient.profileImage ? (
                      <AvatarImage 
                        src={selectedAppointment.patient.profileImage} 
                        alt={selectedAppointment.patient.firstName} 
                      />
                    ) : (
                      <AvatarFallback>
                        {selectedAppointment.patient.firstName[0]}
                        {selectedAppointment.patient.lastName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div>
                    <h3 className="font-medium">
                      {selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.patient.email}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {format(new Date(selectedAppointment.dateTime), "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Hora</p>
                    <p className="font-medium">
                      {format(new Date(selectedAppointment.dateTime), "h:mm a", { locale: es })} - 
                      {format(new Date(selectedAppointment.endTime), "h:mm a", { locale: es })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Tipo de cita</p>
                    <p className="font-medium">
                      {selectedAppointment.appointmentType === "first_visit" ? "Primera visita" : 
                        selectedAppointment.appointmentType === "follow_up" ? "Seguimiento" : 
                        selectedAppointment.appointmentType === "emergency" ? "Urgencia" : "Telemedicina"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Estado</p>
                    <Badge variant="outline" className={
                      selectedAppointment.status === "scheduled" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      selectedAppointment.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                      selectedAppointment.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-orange-50 text-orange-700 border-orange-200"
                    }>
                      {selectedAppointment.status === "scheduled" ? "Programada" :
                        selectedAppointment.status === "completed" ? "Completada" :
                        selectedAppointment.status === "cancelled" ? "Cancelada" : "No asistió"}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-muted-foreground mb-1 text-sm">Motivo de la consulta</p>
                  <p className="text-sm">{selectedAppointment.reason}</p>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Link href={`/dashboard/doctor/patients/${selectedAppointment.patientId}`}>
                    <Button variant="outline" size="sm">
                      Ver expediente
                    </Button>
                  </Link>
                  <Link href={`/dashboard/doctor/recetas/new?patientId=${selectedAppointment.patientId}`}>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Crear receta
                    </Button>
                  </Link>
                </div>
                <DialogClose asChild>
                  <Button variant="ghost">
                    <X className="h-4 w-4 mr-2" />
                    Cerrar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
  );
}

interface DailyScheduleViewProps {
  date: Date;
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  onSelectAppointment: (appointment: Appointment) => void;
  onDeleteTimeSlot: (slotId: number) => void;
}

function DailyScheduleView({ 
  date, 
  appointments, 
  timeSlots,
  onSelectAppointment,
  onDeleteTimeSlot
}: DailyScheduleViewProps) {
  // Si no hay citas ni slots disponibles
  if (appointments.length === 0 && timeSlots.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay citas programadas</h3>
        <p className="text-muted-foreground mb-6">
          No tiene citas ni horarios disponibles para esta fecha.
        </p>
      </div>
    );
  }
  
  // Combinar citas y slots disponibles
  const combinedSchedule = [
    ...appointments.map(app => ({
      id: `app-${app.id}`,
      time: format(new Date(app.dateTime), "HH:mm", { locale: es }),
      endTime: format(new Date(app.endTime), "HH:mm", { locale: es }),
      type: "appointment" as const,
      data: app
    })),
    ...timeSlots.map(slot => ({
      id: `slot-${slot.id}`,
      time: slot.startTime,
      endTime: slot.endTime,
      type: "slot" as const,
      data: slot
    }))
  ].sort((a, b) => {
    // Ordenar por hora
    const [aHour, aMinute] = a.time.split(":").map(Number);
    const [bHour, bMinute] = b.time.split(":").map(Number);
    
    if (aHour !== bHour) {
      return aHour - bHour;
    }
    
    return aMinute - bMinute;
  });
  
  return (
    <div className="space-y-3">
      {combinedSchedule.map((item) => (
        <div key={item.id}>
          {item.type === "appointment" ? (
            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-blue-200"
              onClick={() => onSelectAppointment(item.data)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md text-center min-w-[4.5rem]">
                      <p className="font-semibold">{item.time}</p>
                      <p className="text-xs text-blue-500">{item.endTime}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">
                          {item.data.patient.firstName} {item.data.patient.lastName}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {item.data.appointmentType === "first_visit" ? "Primera visita" : 
                            item.data.appointmentType === "follow_up" ? "Seguimiento" : 
                            item.data.appointmentType === "emergency" ? "Urgencia" : "Telemedicina"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {item.data.reason}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-md text-center min-w-[4.5rem]">
                      <p className="font-semibold">{item.time}</p>
                      <p className="text-xs text-green-500">{item.endTime}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-green-700">Horario disponible</h3>
                        <Badge 
                          variant="outline" 
                          className="ml-2 bg-green-50 text-green-700 border-green-200"
                        >
                          {item.data.isRecurring ? "Recurrente" : "Único"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Disponible para programar citas
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDeleteTimeSlot(item.data.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}