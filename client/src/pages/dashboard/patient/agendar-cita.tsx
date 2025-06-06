import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { format, parseISO, addDays, set } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import PatientLayout from "@/layouts/PatientLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

// Interfaces
interface Doctor {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  specialtyId: number;
  specialtyName: string;
  consultationFee: number;
  profileImage?: string;
}

interface Specialty {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

interface Appointment {
  patientId: number;
  doctorId: number;
  dateTime: string;
  appointmentType: "first_visit" | "follow_up" | "emergency" | "telemedicine";
  reason: string;
  symptoms?: string;
  notes?: string;
}

// Tipos de cita
const appointmentTypes = [
  { id: "first_visit", name: "Primera visita" },
  { id: "follow_up", name: "Seguimiento" },
  { id: "emergency", name: "Urgencia" },
  { id: "telemedicine", name: "Telemedicina" },
];

// Horarios disponibles (simulación)
const availableTimeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "15:00", "15:30", "16:00", 
  "16:30", "17:00", "17:30", "18:00"
];

export default function ScheduleAppointmentPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const preselectedDoctorId = params.get("doctorId") ? parseInt(params.get("doctorId")!) : null;
  
  // Estados para el formulario
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(preselectedDoctorId);
  const [appointmentType, setAppointmentType] = useState<string>("first_visit");
  const [reason, setReason] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  
  // Obtener especialidades
  const { data: specialties, isLoading: loadingSpecialties } = useQuery<Specialty[]>({
    queryKey: ["/api/specialties"],
  });
  
  // Obtener médicos filtrados por especialidad
  const { data: doctors, isLoading: loadingDoctors } = useQuery<Doctor[]>({
    queryKey: [`/api/doctors${selectedSpecialty ? `/specialty/${selectedSpecialty}` : ''}`],
    enabled: !preselectedDoctorId, // No cargar si ya tenemos un doctor preseleccionado
  });
  
  // Obtener datos del doctor preseleccionado si existe
  const { data: preselectedDoctor, isLoading: loadingPreselectedDoctor } = useQuery<Doctor>({
    queryKey: [`/api/doctors/${preselectedDoctorId}`],
    enabled: preselectedDoctorId !== null,
  });
  
  // Cuando se selecciona un doctor preseleccionado, también seleccionamos su especialidad
  useEffect(() => {
    if (preselectedDoctor && !selectedSpecialty) {
      setSelectedSpecialty(preselectedDoctor.specialtyId.toString());
    }
  }, [preselectedDoctor, selectedSpecialty]);
  
  // Mutation para crear una cita
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: Appointment) => {
      const res = await apiRequest("POST", "/api/appointments", appointmentData);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Error ${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      // Mostrar mensaje de éxito
      toast({
        title: "Cita agendada exitosamente",
        description: "Tu cita ha sido programada. Recibirás una notificación con los detalles.",
      });
      
      // Invalidar cache de citas
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      
      // Redireccionar a la página de citas
      setTimeout(() => {
        setLocation("/dashboard/patient/appointments");
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al agendar cita",
        description: error.message || "No se pudo agendar la cita. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
    },
  });
  
  // Handler para enviar el formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !selectedDoctor || !reason) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    
    // Combinar fecha y hora
    const dateTime = set(selectedDate, {
      hours: parseInt(selectedTime.split(":")[0]),
      minutes: parseInt(selectedTime.split(":")[1]),
      seconds: 0,
      milliseconds: 0,
    }).toISOString();
    
    const appointmentData: Appointment = {
      patientId: user!.id,
      doctorId: selectedDoctor,
      dateTime,
      appointmentType: appointmentType as "first_visit" | "follow_up" | "emergency" | "telemedicine",
      reason,
      symptoms: symptoms || undefined,
    };
    
    createAppointmentMutation.mutate(appointmentData);
  };
  
  // Obtener el doctor seleccionado
  const doctorDetails = preselectedDoctor || 
    (selectedDoctor && doctors ? doctors.find(d => d.id === selectedDoctor) : null);
  
  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendar Cita</h1>
            <p className="text-muted-foreground mt-1">
              Programa una consulta con un médico especialista
            </p>
          </div>
          <Link href="/dashboard/patient/appointments">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a mis citas
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna de selección */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Información de la Cita</CardTitle>
              <CardDescription>
                Selecciona el médico, fecha y hora
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!preselectedDoctorId && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Especialidad</label>
                      <Select 
                        value={selectedSpecialty || ""} 
                        onValueChange={(value) => {
                          setSelectedSpecialty(value);
                          setSelectedDoctor(null); // Resetear doctor al cambiar especialidad
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingSpecialties ? (
                            <SelectItem value="loading" disabled>
                              Cargando...
                            </SelectItem>
                          ) : (
                            specialties?.map((specialty) => (
                              <SelectItem key={specialty.id} value={specialty.id.toString()}>
                                {specialty.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Médico</label>
                      <Select 
                        value={selectedDoctor?.toString() || ""} 
                        onValueChange={(value) => setSelectedDoctor(Number(value))}
                        disabled={!selectedSpecialty || loadingDoctors}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar médico" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingDoctors ? (
                            <SelectItem value="loading" disabled>
                              Cargando...
                            </SelectItem>
                          ) : doctors && doctors.length > 0 ? (
                            doctors.map((doctor) => (
                              <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                Dr. {doctor.firstName} {doctor.lastName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No hay médicos disponibles
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo de Consulta</label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Motivo de la Consulta</label>
                  <Textarea
                    placeholder="Describe brevemente el motivo de tu consulta"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Síntomas (opcional)</label>
                  <Textarea
                    placeholder="Describe tus síntomas"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="resize-none"
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={
                      !selectedDate || 
                      !selectedTime || 
                      !selectedDoctor || 
                      !reason ||
                      createAppointmentMutation.isPending
                    }
                  >
                    {createAppointmentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Confirmar Cita"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Columna de fecha y hora */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Selecciona Fecha y Hora</CardTitle>
              <CardDescription>
                Selecciona el día y horario que prefieras para tu cita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="calendar" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calendar">Calendario</TabsTrigger>
                  <TabsTrigger value="info">Detalles</TabsTrigger>
                </TabsList>
                <TabsContent value="calendar" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 lg:col-span-8">
                      <div className="border rounded-lg p-3">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          locale={es}
                          className="w-full"
                          disabled={{ before: new Date() }}
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-5 lg:col-span-4">
                      <div className="border rounded-lg p-4 h-full">
                        <h4 className="font-medium mb-3 text-sm">Horarios Disponibles</h4>
                        {selectedDate ? (
                          <ScrollArea className="h-[270px] pr-3">
                            <div className="grid grid-cols-2 gap-2">
                              {availableTimeSlots.map((time) => (
                                <Button
                                  key={time}
                                  variant={selectedTime === time ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedTime(time)}
                                  className="justify-start h-9"
                                >
                                  <Clock className="mr-2 h-3.5 w-3.5" />
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </ScrollArea>
                        ) : (
                          <div className="flex h-[270px] items-center justify-center text-center text-muted-foreground">
                            <p>Selecciona una fecha para ver los horarios disponibles</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="info">
                  <div className="space-y-6">
                    {/* Información del médico */}
                    {(loadingPreselectedDoctor || (!doctorDetails && selectedDoctor)) ? (
                      <div className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                    ) : doctorDetails ? (
                      <div className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {doctorDetails.profileImage ? (
                            <img
                              src={doctorDetails.profileImage}
                              alt={`Dr. ${doctorDetails.firstName} ${doctorDetails.lastName}`}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {doctorDetails.firstName.charAt(0)}
                                {doctorDetails.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">
                            Dr. {doctorDetails.firstName} {doctorDetails.lastName}
                          </h3>
                          <p className="text-muted-foreground">{doctorDetails.specialtyName}</p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              ${doctorDetails.consultationFee} MXN
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg">
                        <p className="text-muted-foreground">
                          Selecciona un médico para ver su información
                        </p>
                      </div>
                    )}
                    
                    {/* Fecha y hora seleccionada */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Fecha Seleccionada</h4>
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                          <span>
                            {selectedDate 
                              ? format(selectedDate, "EEEE, d 'de' MMMM, yyyy", { locale: es })
                              : "No seleccionada"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Hora Seleccionada</h4>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          <span>{selectedTime || "No seleccionada"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Tipo de Consulta</h4>
                      <p>
                        {appointmentTypes.find(t => t.id === appointmentType)?.name || appointmentType}
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Motivo de Consulta</h4>
                      <p>{reason || "No especificado"}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Al confirmar tu cita, aceptas las políticas de cancelación y reprogramación. Puedes cancelar o 
                reprogramar tu cita con al menos 24 horas de anticipación sin costo adicional.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
}