import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import  DashboardLayout from "@/components/layout/DashboardLayout";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Check, Loader2, UserRound, Building, Microscope } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Esquema de formulario para la orden de laboratorio
const labOrderSchema = z.object({
  patientId: z.number(),
  laboratoryId: z.number(),
  serviceName: z.string().min(3, "Nombre del servicio debe tener al menos 3 caracteres"),
  testType: z.string().optional(),
  description: z.string().optional(),
  amount: z.string().min(1, "Monto requerido"),
  notes: z.string().optional(),
  urgency: z.enum(["normal", "urgent", "immediate"]).default("normal"),
});

type LabOrderFormValues = z.infer<typeof labOrderSchema>;

export default function NuevaOrdenLaboratorio() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const patientId = parseInt(id);

  // Obtener datos del paciente
  const {
    data: patient,
    isLoading: patientLoading,
    error: patientError,
  } = useQuery({
    queryKey: ["/api/patients", patientId],
  });

  // Obtener lista de laboratorios disponibles
  const {
    data: laboratories,
    isLoading: laboratoriesLoading,
    error: laboratoriesError,
  } = useQuery({
    queryKey: ["/api/laboratories"],
  });

  // Formulario para la orden de laboratorio
  const form = useForm<LabOrderFormValues>({
    resolver: zodResolver(labOrderSchema),
    defaultValues: {
      patientId: patientId,
      laboratoryId: undefined,
      serviceName: "",
      testType: "",
      description: "",
      amount: "",
      notes: "",
      urgency: "normal",
    },
  });

  // Mutación para crear la orden de laboratorio
  const createOrderMutation = useMutation({
    mutationFn: async (data: LabOrderFormValues) => {
      const response = await apiRequest("POST", "/api/lab-commissions", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la orden de laboratorio");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Orden creada con éxito",
        description: "La orden de laboratorio ha sido creada y enviada al laboratorio",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lab-commissions"] });
      navigate("/dashboard/doctor/laboratorio");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear la orden",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manejar errores de carga
  useEffect(() => {
    if (patientError) {
      toast({
        title: "Error al cargar datos del paciente",
        description: "No se pudo obtener la información del paciente",
        variant: "destructive",
      });
    }

    if (laboratoriesError) {
      toast({
        title: "Error al cargar laboratorios",
        description: "No se pudo obtener la lista de laboratorios disponibles",
        variant: "destructive",
      });
    }
  }, [patientError, laboratoriesError, toast]);

  // Manejar el envío del formulario
  const onSubmit = (data: LabOrderFormValues) => {
    createOrderMutation.mutate(data);
  };

  // Manejar navegación hacia atrás
  const handleBack = () => {
    navigate("/dashboard/doctor/laboratorio");
  };

  if (isNaN(patientId)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h2 className="text-2xl font-bold mb-4">Paciente no válido</h2>
          <p className="text-muted-foreground mb-6">El ID del paciente no es válido.</p>
          <Button onClick={handleBack}>Volver a Laboratorio</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Cabecera con botón para volver */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Nueva Orden de Laboratorio
              </h2>
              {!patientLoading && patient && (
                <p className="text-muted-foreground">
                  {patient.firstName} {patient.lastName}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna de información del paciente */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserRound className="h-5 w-5" />
                  <span>Información del Paciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                    <Skeleton className="h-3 w-full max-w-[200px]" />
                    <Skeleton className="h-3 w-full max-w-[150px]" />
                  </div>
                ) : patient ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 text-primary-800 rounded-full h-12 w-12 flex items-center justify-center text-lg font-medium">
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{patient.firstName} {patient.lastName}</h3>
                        <p className="text-sm text-gray-500">{patient.email}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">ID</p>
                        <p>{patient.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Tipo de Usuario</p>
                        <p className="capitalize">{patient.userType}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No se encontró información del paciente</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Microscope className="h-5 w-5" />
                  <span>Tipos de Estudios Disponibles</span>
                </CardTitle>
                <CardDescription>
                  Estudios de laboratorio comunes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer" 
                    onClick={() => form.setValue("serviceName", "Biometría Hemática")}>
                    <p className="font-medium">Biometría Hemática</p>
                    <p className="text-gray-500">Análisis completo de sangre</p>
                  </div>
                  <div className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => form.setValue("serviceName", "Química Sanguínea")}>
                    <p className="font-medium">Química Sanguínea</p>
                    <p className="text-gray-500">Glucosa, colesterol, triglicéridos, etc.</p>
                  </div>
                  <div className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => form.setValue("serviceName", "Pruebas de Coagulación")}>
                    <p className="font-medium">Pruebas de Coagulación</p>
                    <p className="text-gray-500">Tiempos de coagulación y factores</p>
                  </div>
                  <div className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => form.setValue("serviceName", "Perfil Tiroideo")}>
                    <p className="font-medium">Perfil Tiroideo</p>
                    <p className="text-gray-500">Evaluación de la función tiroidea</p>
                  </div>
                  <div className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => form.setValue("serviceName", "Perfil Hepático")}>
                    <p className="font-medium">Perfil Hepático</p>
                    <p className="text-gray-500">Evaluación de la función del hígado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Columna del formulario de orden */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center">
                  <Microscope className="mr-2 h-5 w-5" />
                  Detalles de la Orden
                </CardTitle>
                <CardDescription>
                  Completa la información de la orden de laboratorio para el paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="laboratoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Laboratorio</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar laboratorio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {laboratoriesLoading ? (
                                <div className="p-2">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                </div>
                              ) : laboratories && laboratories.length > 0 ? (
                                laboratories.map((lab) => (
                                  <SelectItem key={lab.id} value={lab.id.toString()}>
                                    {lab.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-center text-sm text-gray-500">
                                  No hay laboratorios disponibles
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Selecciona el laboratorio donde se realizará el estudio
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="serviceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del Servicio</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: Biometría Hemática, Química Sanguínea" />
                            </FormControl>
                            <FormDescription>
                              Nombre del estudio o servicio solicitado
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="testType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Prueba</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: Sanguínea, Orina, Imagen" />
                            </FormControl>
                            <FormDescription>
                              Tipo de prueba o categoría (opcional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Detalle del estudio a realizar..." 
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Descripción detallada del servicio solicitado (opcional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monto</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Ej: 1500.00" 
                                type="text"
                                inputMode="decimal"
                              />
                            </FormControl>
                            <FormDescription>
                              Costo estimado del servicio
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="urgency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Urgencia</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar nivel de urgencia" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                                <SelectItem value="immediate">Inmediata</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Nivel de urgencia requerido
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas Adicionales</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Notas o instrucciones especiales para el laboratorio..." 
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Instrucciones especiales o información relevante (opcional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-4 pt-2">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createOrderMutation.isPending}
                      >
                        {createOrderMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar y Enviar
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Información de Laboratorios Afiliados</span>
                </CardTitle>
                <CardDescription>
                  Laboratorios que tienen convenio con nuestra plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {laboratoriesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : laboratories && laboratories.length > 0 ? (
                  <div className="space-y-4">
                    {laboratories.map((lab) => (
                      <div key={lab.id} className="flex items-start space-x-4 p-3 border rounded-md hover:bg-gray-50 transition cursor-pointer" onClick={() => form.setValue("laboratoryId", lab.id)}>
                        <div className="bg-primary-100 text-primary-800 rounded-md h-10 w-10 flex items-center justify-center">
                          <Microscope className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium">{lab.name}</h4>
                          <p className="text-sm text-gray-500">{lab.address || "Dirección no disponible"}</p>
                          {lab.discount && (
                            <div className="mt-1 inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                              <Check className="mr-1 h-3 w-3" />
                              Descuento: {lab.discount}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No hay laboratorios afiliados disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}