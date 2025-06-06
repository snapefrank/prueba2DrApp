import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  UserRound, 
  FilePlus2,
  Printer,
  Download,
  Clock
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Interfaces
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  dateOfBirth?: string;
  gender?: string;
  allergies?: string | null;
  chronicConditions?: string | null;
}

// Esquema para validar el formulario de receta
const prescriptionSchema = z.object({
  diagnosis: z.string().min(5, { message: "El diagnóstico es obligatorio y debe tener al menos 5 caracteres" }),
  treatment: z.string().min(5, { message: "El tratamiento es obligatorio y debe tener al menos 5 caracteres" }),
  medicationDosage: z.string().min(5, { message: "La dosificación es obligatoria y debe tener al menos 5 caracteres" }),
  instructions: z.string().optional(),
  notes: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

export default function NuevaReceta() {
  const params = useParams<{ id: string }>();
  const patientId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewMode, setPreviewMode] = useState(false);

  // Formulario para la receta
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      diagnosis: "",
      treatment: "",
      medicationDosage: "",
      instructions: "",
      notes: "",
    },
  });

  // Consulta para obtener datos del paciente
  const { data: patient, isLoading: patientLoading, error: patientError } = useQuery<Patient>({
    queryKey: ["/api/expediente", patientId],
    queryFn: async () => {
      const response = await fetch(`/api/expediente/${patientId}`);
      if (!response.ok) {
        throw new Error("Error al cargar datos del paciente");
      }
      return response.json();
    }
  });
  
  // Manejar errores de la consulta del paciente
  if (patientError) {
    toast({
      title: "Error",
      description: `No se pudieron cargar los datos del paciente: ${patientError}`,
      variant: "destructive",
    });
  }

  // Mutación para crear una nueva receta médica
  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: PrescriptionFormValues) => {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          patientId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la receta médica");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Receta médica creada correctamente",
      });
      
      // Redireccionar a la página de recetas
      setTimeout(() => {
        setLocation("/dashboard/doctor/recetas");
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la receta médica: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Función para volver a la página anterior
  const handleBack = () => {
    setLocation("/dashboard/doctor/recetas");
  };

  // Función para enviar el formulario
  const onSubmit = (data: PrescriptionFormValues) => {
    if (previewMode) {
      // Si estamos en modo vista previa, enviar el formulario
      createPrescriptionMutation.mutate(data);
    } else {
      // Si no estamos en modo vista previa, mostrar vista previa
      setPreviewMode(true);
    }
  };

  // Función para cancelar la vista previa
  const handleCancelPreview = () => {
    setPreviewMode(false);
  };

  // Función para calcular la edad
  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return "N/A";
    
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Función para formatear la fecha
  const formatDate = (date = new Date()) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  // Si está en modo vista previa, mostrar la vista previa de la receta
  if (previewMode) {
    const formData = form.getValues();
    
    return (
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          {/* Cabecera con botón para volver */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={handleCancelPreview}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Vista Previa de Receta
                </h2>
                {!patientLoading && patient && (
                  <p className="text-muted-foreground">
                    {patient.firstName} {patient.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancelPreview}>
                Editar
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={createPrescriptionMutation.isPending}
              >
                {createPrescriptionMutation.isPending && (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                )}
                Guardar y Emitir
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Vista previa de la receta */}
          <Card className="border-2 overflow-hidden">
            <CardHeader className="bg-primary-50 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl text-primary-700">Receta Médica</CardTitle>
                  <CardDescription>MediConnect - Plataforma Médica</CardDescription>
                </div>
                <div className="text-right">
                  <p className="font-medium">Dr. Manuel Pérez García</p>
                  <p className="text-sm text-muted-foreground">Cédula Profesional: 12345678</p>
                  <p className="text-sm text-muted-foreground">Especialidad: Medicina General</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-6 space-y-6">
              {/* Información del paciente */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="font-medium text-lg">Paciente</h3>
                  <p>{patient?.firstName} {patient?.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    Edad: {calculateAge(patient?.dateOfBirth)} años - 
                    Género: {patient?.gender || "No especificado"}
                  </p>
                  
                  {patient?.allergies && (
                    <p className="text-sm text-red-600 mt-1">
                      <strong>Alergias:</strong> {patient.allergies}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Fecha: {formatDate()}
                  </p>
                </div>
              </div>
              
              {/* Contenido de la receta */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Diagnóstico</h3>
                  <p className="mt-1">{formData.diagnosis}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Tratamiento</h3>
                  <p className="mt-1 whitespace-pre-line">{formData.treatment}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Dosificación</h3>
                  <p className="mt-1 whitespace-pre-line">{formData.medicationDosage}</p>
                </div>
                
                {formData.instructions && (
                  <div>
                    <h3 className="font-medium">Instrucciones</h3>
                    <p className="mt-1 whitespace-pre-line">{formData.instructions}</p>
                  </div>
                )}
                
                {formData.notes && (
                  <div>
                    <h3 className="font-medium">Notas Adicionales</h3>
                    <p className="mt-1 whitespace-pre-line">{formData.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t flex justify-between">
              <p className="text-sm text-muted-foreground">
                Receta generada a través de MediConnect
              </p>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </div>
            </CardFooter>
          </Card>
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
                Nueva Receta Médica
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
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                ) : patient ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={patient.profileImage || ""} alt={`${patient.firstName} ${patient.lastName}`} />
                        <AvatarFallback>
                          {patient.firstName.charAt(0)}
                          {patient.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Edad</label>
                        <p>
                          {patient.dateOfBirth
                            ? `${calculateAge(patient.dateOfBirth)} años`
                            : "No disponible"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Género</label>
                        <p>{patient.gender || "No especificado"}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <label className="text-sm font-medium">Alergias</label>
                      <p className="mt-1">{patient.allergies || "Ninguna registrada"}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Condiciones Crónicas</label>
                      <p className="mt-1">{patient.chronicConditions || "Ninguna registrada"}</p>
                    </div>
                  </div>
                ) : (
                  <p>No se encontró información del paciente</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Fecha y Datos de Emisión</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Fecha de Emisión</label>
                    <p>{formatDate()}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Médico</label>
                    <p>Dr. Manuel Pérez García</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Cédula Profesional</label>
                    <p>12345678</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Especialidad</label>
                    <p>Medicina General</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Columna del formulario de receta */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center">
                  <FilePlus2 className="mr-2 h-5 w-5" />
                  Crear Receta Médica
                </CardTitle>
                <CardDescription>
                  Completa la información de la receta médica para el paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnóstico</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ingrese el diagnóstico del paciente"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Describa la condición o diagnóstico del paciente.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="treatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tratamiento</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ingrese el tratamiento indicado"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Especifique el tratamiento completo que debe seguir el paciente.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="medicationDosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosificación de Medicamentos</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detalle la dosificación de cada medicamento"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Indique dosis, frecuencia y duración para cada medicamento.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instrucciones Especiales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Instrucciones adicionales para el paciente (opcional)"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Instrucciones sobre dieta, actividad física, cuidados especiales, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas Adicionales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Notas para el expediente (opcional)"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Estas notas se incluirán en el expediente y en la receta.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" type="button" onClick={handleBack}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Vista Previa
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}