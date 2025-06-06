import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CalendarIcon, ClipboardList, FilePlus, UserRound, FileText, ClipboardCheck, PlusCircle, Save, Brain } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAIDiagnosis } from "@/hooks/use-ai-diagnosis";
import { AIDiagnosisForm } from "@/components/doctor/ai-diagnosis-form";
import { AIDiagnosisResult } from "@/components/doctor/ai-diagnosis-result";

// Interfaces para los datos del expediente
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  createdAt: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
}

interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  doctorName?: string;
  diagnosis: string;
  prescription: string | null;
  notes: string | null;
  aiAssisted?: boolean;
  aiDiagnosisData?: {
    possibleDiagnoses: {
      name: string;
      confidence: number;
      icdCode?: string;
    }[];
    treatmentSuggestions: string[];
    differentialDiagnosis: string[];
    reasoningProcess: string;
    medicalDisclaimer: string;
    referencesUsed?: string[];
  } | null;
  createdAt: string;
}

// Esquema para validar el formulario de notas médicas
const medicalRecordSchema = z.object({
  diagnosis: z.string().min(5, { message: "El diagnóstico debe tener al menos 5 caracteres" }),
  prescription: z.string().optional(),
  notes: z.string().optional(),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

export default function ExpedienteClinicoDetalle() {
  const params = useParams<{ id: string }>();
  const patientId = parseInt(params.id, 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openNewRecordDialog, setOpenNewRecordDialog] = useState(false);
  const [openAIDiagnosisDialog, setOpenAIDiagnosisDialog] = useState(false);
  const { 
    generateDiagnosis, 
    isGenerating, 
    aiDiagnosisResult, 
    setAiDiagnosisResult,
    reset: resetAiDiagnosis
  } = useAIDiagnosis();
  
  // Consulta para obtener datos del paciente
  const { data: patient, isLoading: patientLoading, error: patientError } = useQuery<Patient>({
    queryKey: ["/api/expediente", patientId],
    queryFn: async () => {
      const response = await fetch(`/api/expediente/${patientId}`);
      if (!response.ok) {
        throw new Error("Error al cargar expediente");
      }
      return response.json();
    }
  });
  
  // Manejar errores de la consulta del paciente
  if (patientError) {
    toast({
      title: "Error",
      description: `No se pudo cargar el expediente: ${patientError}`,
      variant: "destructive",
    });
  }
  
  // Consulta para obtener registros médicos del paciente
  const { 
    data: medicalRecords, 
    isLoading: recordsLoading, 
    error: recordsError 
  } = useQuery<MedicalRecord[]>({
    queryKey: ["/api/medical-records", patientId],
    queryFn: async () => {
      const response = await fetch(`/api/medical-records/${patientId}`);
      if (!response.ok) {
        throw new Error("Error al cargar registros médicos");
      }
      return response.json();
    }
  });
  
  // Manejar errores de la consulta de registros médicos
  if (recordsError) {
    toast({
      title: "Error",
      description: `No se pudieron cargar los registros médicos: ${recordsError}`,
      variant: "destructive",
    });
  }
  
  // Mutación para crear un nuevo registro médico
  const createMedicalRecordMutation = useMutation({
    mutationFn: async (data: MedicalRecordFormValues) => {
      const response = await fetch("/api/medical-records", {
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
        throw new Error(errorData.message || "Error al crear registro médico");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records", patientId] });
      toast({
        title: "Éxito",
        description: "Registro médico creado correctamente",
      });
      setOpenNewRecordDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el registro médico: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Configuración del formulario
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      diagnosis: "",
      prescription: "",
      notes: "",
    },
  });
  
  // Función para volver a la página anterior
  const handleBack = () => {
    setLocation("/dashboard/doctor/expediente");
  };
  
  // Función para manejar el diagnóstico asistido por IA
  const handleAIDiagnosis = (data: any) => {
    // Añadir información del paciente
    const patientInfo = patient ? {
      age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : undefined,
      gender: patient.gender,
      bloodType: patient.bloodType,
      allergies: patient.allergies,
      chronicConditions: patient.chronicConditions
    } : undefined;
    
    generateDiagnosis({
      ...data,
      patientInfo
    });
  };
  
  // Función para aceptar un diagnóstico de la IA
  const handleAcceptDiagnosis = (diagnosis: string) => {
    form.setValue('diagnosis', diagnosis);
    toast({
      title: "Diagnóstico aceptado",
      description: "El diagnóstico ha sido agregado al formulario.",
    });
  };
  
  // Función para aceptar un tratamiento de la IA
  const handleAcceptTreatment = (treatment: string) => {
    const currentPrescription = form.getValues('prescription') || '';
    form.setValue('prescription', currentPrescription ? `${currentPrescription}\n${treatment}` : treatment);
    toast({
      title: "Tratamiento aceptado",
      description: "El tratamiento ha sido agregado al formulario.",
    });
  };
  
  // Función para crear un nuevo registro con asistencia de IA
  const handleCreateWithAI = () => {
    if (!aiDiagnosisResult) {
      toast({
        title: "Error",
        description: "No hay resultados de diagnóstico asistido disponibles.",
        variant: "destructive",
      });
      return;
    }
    
    // Preparar los datos para el registro con información de IA
    const data = form.getValues();
    createMedicalRecordMutation.mutate({
      ...data,
      aiAssisted: true,
      aiDiagnosisData: aiDiagnosisResult
    });
    
    // Limpiar los resultados de IA después de crear el registro
    setAiDiagnosisResult(null);
    setOpenAIDiagnosisDialog(false);
  };
  
  // Función para enviar el formulario
  const onSubmit = (data: MedicalRecordFormValues) => {
    createMedicalRecordMutation.mutate(data);
  };
  
  // Función para calcular la edad
  const calculateAge = (birthDateString: string) => {
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  };
  
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
                Expediente Clínico
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
        
        {/* Contenido del expediente */}
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
                      <div>
                        <label className="text-sm font-medium">Tipo de Sangre</label>
                        <p>{patient.bloodType || "No especificado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Fecha de Registro</label>
                        <p>{formatDate(patient.createdAt)}</p>
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
          </div>
          
          {/* Columna de historial médico */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <ClipboardList className="h-5 w-5" />
                    <span>Historial Médico</span>
                  </CardTitle>
                  <CardDescription>
                    Registros médicos y seguimiento del paciente
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Dialog open={openAIDiagnosisDialog} onOpenChange={setOpenAIDiagnosisDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Brain className="mr-2 h-4 w-4" />
                        Diagnóstico IA
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Diagnóstico Asistido por IA</DialogTitle>
                        <DialogDescription>
                          Utilice la asistencia de IA para generar diagnósticos con base en síntomas y datos clínicos.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {!aiDiagnosisResult ? (
                        <AIDiagnosisForm 
                          patientInfo={patient ? {
                            age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : undefined,
                            gender: patient.gender,
                            bloodType: patient.bloodType || undefined,
                            allergies: patient.allergies,
                            chronicConditions: patient.chronicConditions
                          } : undefined}
                          isGenerating={isGenerating}
                          onGenerate={handleAIDiagnosis}
                        />
                      ) : (
                        <>
                          <AIDiagnosisResult 
                            result={aiDiagnosisResult}
                            onAcceptDiagnosis={handleAcceptDiagnosis}
                            onAcceptTreatment={handleAcceptTreatment}
                          />
                          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                resetAiDiagnosis();
                                setOpenAIDiagnosisDialog(false);
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={resetAiDiagnosis}
                            >
                              Nuevo diagnóstico
                            </Button>
                            <Button
                              onClick={handleCreateWithAI}
                              disabled={createMedicalRecordMutation.isPending}
                            >
                              {createMedicalRecordMutation.isPending && (
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                              )}
                              Guardar en expediente
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                
                  <Dialog open={openNewRecordDialog} onOpenChange={setOpenNewRecordDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nueva Nota Médica
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Agregar Nueva Nota Médica</DialogTitle>
                      <DialogDescription>
                        Registre la información de la consulta actual. Una vez guardada, no podrá ser modificada.
                      </DialogDescription>
                    </DialogHeader>
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
                                  placeholder="Diagnóstico detallado del paciente"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="prescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prescripción</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Medicamentos, dosis y duración del tratamiento"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
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
                                  placeholder="Observaciones, recomendaciones o indicaciones adicionales"
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpenNewRecordDialog(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={createMedicalRecordMutation.isPending}
                          >
                            {createMedicalRecordMutation.isPending && (
                              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                            )}
                            Guardar
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex flex-col space-y-2 p-4 border rounded-md">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[300px]" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ))}
                  </div>
                ) : medicalRecords && medicalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {medicalRecords.map((record) => (
                      <Card key={record.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                              <CardTitle className="text-base">
                                Diagnóstico: {record.diagnosis}
                              </CardTitle>
                              {record.aiAssisted && (
                                <Badge variant="secondary" className="ml-2 gap-1">
                                  <Brain className="h-3 w-3" />
                                  IA Asistida
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline">
                              {formatDate(record.createdAt)}
                            </Badge>
                          </div>
                          <CardDescription>
                            Médico: {record.doctorName || "No especificado"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3">
                          {record.prescription && (
                            <div className="space-y-1 mb-3">
                              <Label>Prescripción:</Label>
                              <p className="text-sm whitespace-pre-line">
                                {record.prescription}
                              </p>
                            </div>
                          )}
                          {record.notes && (
                            <div className="space-y-1">
                              <Label>Notas:</Label>
                              <p className="text-sm whitespace-pre-line">
                                {record.notes}
                              </p>
                            </div>
                          )}
                          {record.aiAssisted && record.aiDiagnosisData && (
                            <div className="mt-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                                    <Brain className="h-3.5 w-3.5" />
                                    Ver datos de diagnóstico IA
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Detalles del Diagnóstico Asistido por IA</DialogTitle>
                                    <DialogDescription>
                                      Información detallada del proceso de diagnóstico asistido por IA.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <AIDiagnosisResult 
                                    result={record.aiDiagnosisData}
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center border rounded-md">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <h3 className="font-medium text-lg">No hay registros médicos</h3>
                    <p className="text-muted-foreground">
                      Este paciente aún no tiene notas médicas registradas.
                    </p>
                    <Button
                      onClick={() => setOpenNewRecordDialog(true)}
                      className="mt-2"
                    >
                      <FilePlus className="mr-2 h-4 w-4" />
                      Crear Primera Nota
                    </Button>
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