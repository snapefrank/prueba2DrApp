import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock, Plus, User } from 'lucide-react';
import { cn } from "@/lib/utils";
import DoctorLayout from "@/layouts/DoctorLayout";

// Tipos de datos
type Cita = {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
};

// Esquema para validación de formulario
const citaSchema = z.object({
  pacienteId: z.string().min(1, { message: "Debe seleccionar un paciente" }),
  fecha: z.date({ required_error: "Debe seleccionar una fecha" }),
  horaInicio: z.string().min(1, { message: "Debe seleccionar una hora de inicio" }),
  horaFin: z.string().min(1, { message: "Debe seleccionar una hora de fin" }),
  motivo: z.string().min(3, { message: "Debe ingresar un motivo" }),
  notas: z.string().optional(),
});

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Preparar calendario con fechas con citas
  const [calendarCitas, setCalendarCitas] = useState<Date[]>([]);
  
  // Formulario
  const form = useForm<z.infer<typeof citaSchema>>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      pacienteId: "",
      fecha: new Date(),
      horaInicio: "09:00",
      horaFin: "09:30",
      motivo: "",
      notas: "",
    },
  });
  
  // Cargar datos de ejemplo (esto se reemplazaría con una llamada a la API)
  useEffect(() => {
    // Datos de muestra - en producción, se obtendrían de una API
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const mockCitas: Cita[] = [
      {
        id: 1,
        pacienteId: 101,
        pacienteNombre: 'Ana García',
        fecha: today.toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '09:30',
        motivo: 'Consulta general',
        estado: 'pendiente'
      },
      {
        id: 2,
        pacienteId: 102,
        pacienteNombre: 'Carlos Ramírez',
        fecha: today.toISOString().split('T')[0],
        horaInicio: '10:00',
        horaFin: '10:30',
        motivo: 'Seguimiento tratamiento',
        estado: 'confirmada'
      },
      {
        id: 3,
        pacienteId: 103,
        pacienteNombre: 'Daniela López',
        fecha: tomorrow.toISOString().split('T')[0],
        horaInicio: '11:00',
        horaFin: '11:30',
        motivo: 'Revisión de resultados',
        estado: 'pendiente'
      },
      {
        id: 4,
        pacienteId: 104,
        pacienteNombre: 'Juan Pérez',
        fecha: nextWeek.toISOString().split('T')[0],
        horaInicio: '15:00',
        horaFin: '15:30',
        motivo: 'Consulta de seguimiento',
        estado: 'pendiente'
      }
    ];
    
    setCitas(mockCitas);
    
    // Preparar fechas para el calendario
    const fechasConCitas = [...new Set(mockCitas.map(cita => cita.fecha))];
    setCalendarCitas(fechasConCitas.map(fecha => new Date(fecha)));
  }, []);
  
  // Filtrar citas por fecha seleccionada
  const citasFiltradas = citas.filter(cita => {
    if (!selectedDate) return false;
    return cita.fecha === selectedDate.toISOString().split('T')[0];
  });
  
  // Obtener color del badge según el estado
  const getEstadoBadgeStyle = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'bg-amber-100 text-amber-800';
      case 'confirmada': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Crear nueva cita
  const onSubmit = (data: z.infer<typeof citaSchema>) => {
    const newCita: Cita = {
      id: Math.max(0, ...citas.map(c => c.id)) + 1,
      pacienteId: parseInt(data.pacienteId),
      pacienteNombre: data.pacienteId === "101" ? "Ana García" : 
                     data.pacienteId === "102" ? "Carlos Ramírez" : 
                     data.pacienteId === "103" ? "Daniela López" : 
                     data.pacienteId === "104" ? "Juan Pérez" : "Paciente",
      fecha: data.fecha.toISOString().split('T')[0],
      horaInicio: data.horaInicio,
      horaFin: data.horaFin,
      motivo: data.motivo,
      estado: 'pendiente',
      notas: data.notas
    };
    
    setCitas([...citas, newCita]);
    
    // Actualizar fechas del calendario
    if (!calendarCitas.some(fecha => fecha.toISOString().split('T')[0] === newCita.fecha)) {
      setCalendarCitas([...calendarCitas, new Date(newCita.fecha)]);
    }
    
    setDialogOpen(false);
    form.reset();
  };
  
  // Cambiar estado de la cita
  const cambiarEstado = (id: number, nuevoEstado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada') => {
    setCitas(citas.map(cita => 
      cita.id === id ? { ...cita, estado: nuevoEstado } : cita
    ));
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agenda médica</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agendar cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agendar nueva cita</DialogTitle>
              <DialogDescription>
                Complete los detalles para agendar una cita con un paciente
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="pacienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar paciente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="101">Ana García</SelectItem>
                          <SelectItem value="102">Carlos Ramírez</SelectItem>
                          <SelectItem value="103">Daniela López</SelectItem>
                          <SelectItem value="104">Juan Pérez</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fecha"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="horaInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora inicio</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="horaFin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora fin</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="motivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Motivo de la consulta" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Notas adicionales"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Guardar cita</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendario</CardTitle>
            <CardDescription>
              Seleccione una fecha para ver las citas agendadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasCita: calendarCitas
              }}
              modifiersClassNames={{
                hasCita: "bg-primary/20 text-primary font-medium"
              }}
            />
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <div className="mr-2 h-3 w-3 rounded-full bg-primary/20"></div>
              <p>Fechas con citas agendadas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Citas del día: {selectedDate && format(selectedDate, "PPP", { locale: es })}
            </CardTitle>
            <CardDescription>
              {citasFiltradas.length} citas programadas para esta fecha
            </CardDescription>
          </CardHeader>
          <CardContent>
            {citasFiltradas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horario</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citasFiltradas.map((cita) => (
                    <TableRow key={cita.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{cita.horaInicio} - {cita.horaFin}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{cita.pacienteNombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>{cita.motivo}</TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadgeStyle(cita.estado)}>
                          {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {cita.estado === 'pendiente' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => cambiarEstado(cita.id, 'confirmada')}
                          >
                            Confirmar
                          </Button>
                        )}
                        {cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                          <Button 
                            size="sm"
                            variant="default"
                            onClick={() => cambiarEstado(cita.id, 'completada')}
                          >
                            Completar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No hay citas programadas para esta fecha
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Próximas citas</CardTitle>
          <CardDescription>
            Vista general de las próximas citas agendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {citas
                .filter(cita => new Date(cita.fecha) >= new Date())
                .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                .slice(0, 5)
                .map((cita) => (
                  <TableRow key={cita.id}>
                    <TableCell>
                      {format(new Date(cita.fecha), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{cita.horaInicio} - {cita.horaFin}</TableCell>
                    <TableCell>{cita.pacienteNombre}</TableCell>
                    <TableCell>{cita.motivo}</TableCell>
                    <TableCell>
                      <Badge className={getEstadoBadgeStyle(cita.estado)}>
                        {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </DoctorLayout>
  );
}