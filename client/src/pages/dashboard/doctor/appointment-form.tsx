import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useLocation } from 'wouter';
import { createInternalLink } from "@/lib/subdomain";
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ArrowLeft, Loader2, Search } from 'lucide-react';

// Esquema de validación para el formulario
const appointmentFormSchema = z.object({
  patientId: z.string().min(1, { message: 'Debes seleccionar un paciente' }),
  date: z.string().min(1, { message: 'La fecha es requerida' }),
  time: z.string().min(1, { message: 'La hora es requerida' }),
  duration: z.string().min(1, { message: 'La duración es requerida' }),
  appointmentType: z.enum(['primera_vez', 'seguimiento', 'revision', 'emergencia', 'laboratorio', 'otro']),
  notes: z.string().optional(),
  status: z.enum(['programada', 'confirmada', 'cancelada', 'realizada', 'no_asistio']).default('programada'),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export default function AppointmentForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para el buscador de pacientes
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
    // En un entorno real, podrías usar un endpoint para buscar pacientes por nombre
  });
  
  const filteredPatients = patients?.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  }) || [];
  
  const defaultValues: AppointmentFormValues = {
    patientId: '',
    date: new Date().toISOString().split('T')[0], // Fecha actual como valor por defecto
    time: '09:00',
    duration: '30',
    appointmentType: 'primera_vez',
    notes: '',
    status: 'programada',
  };

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const response = await apiRequest('POST', '/api/appointments', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Cita creada',
        description: 'La cita se ha programado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setLocation(createInternalLink('/dashboard/agenda'));
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear la cita',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: AppointmentFormValues) => {
    createAppointmentMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          className="mr-4" 
          onClick={() => setLocation(createInternalLink('/dashboard/agenda'))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Programar nueva cita</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la cita</CardTitle>
          <CardDescription>
            Introduce los datos para programar una nueva cita. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Buscar paciente *</FormLabel>
                  <div className="flex relative">
                    <div className="relative w-full">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o apellido"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  {searchQuery && (
                    <div className="border rounded-md max-h-60 overflow-y-auto mt-1">
                      {isLoadingPatients ? (
                        <div className="p-2 flex justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className="p-2 hover:bg-muted cursor-pointer border-b"
                            onClick={() => {
                              form.setValue('patientId', patient.id);
                              setSearchQuery(`${patient.firstName} ${patient.lastName}`);
                            }}
                          >
                            <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                            {patient.phone && <div className="text-xs text-muted-foreground">Tel: {patient.phone}</div>}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-center text-muted-foreground">
                          No se encontraron pacientes
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración (minutos) *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar duración" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="45">45 minutos</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="90">1 hora 30 minutos</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="appointmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de cita *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primera_vez">Primera vez</SelectItem>
                            <SelectItem value="seguimiento">Seguimiento</SelectItem>
                            <SelectItem value="revision">Revisión</SelectItem>
                            <SelectItem value="emergencia">Emergencia</SelectItem>
                            <SelectItem value="laboratorio">Laboratorio</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="programada">Programada</SelectItem>
                            <SelectItem value="confirmada">Confirmada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                            <SelectItem value="realizada">Realizada</SelectItem>
                            <SelectItem value="no_asistio">No asistió</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Motivo de la consulta o notas adicionales" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <CardFooter className="px-0 border-t pt-6 flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setLocation(createInternalLink('/dashboard/agenda'))}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAppointmentMutation.isPending}
                >
                  {createAppointmentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : 'Programar cita'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}