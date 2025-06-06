import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import FileUploader from "@/components/FileUploader";
import { 
  FileText, 
  User, 
  Calendar, 
  Stethoscope, 
  Loader2, 
  Search, 
  Download,
  Eye,
  Clock,
  BookOpen,
  Heart,
  Activity,
  BarChart,
  Clipboard,
  MessageSquare,
  File,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interfaces
interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  specialty: string;
}

interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  doctor: Doctor;
  appointmentId: number | null;
  
  // Antecedentes
  personalHistory: string | null;
  familyHistory: string | null;
  surgicalHistory: string | null;
  allergies: string | null;
  medications: string | null;
  
  // Exploración física
  physicalExamination: string | null;
  vitalSigns: any | null;
  height: number | null;
  weight: number | null;
  bodyMassIndex: number | null;
  
  // Resultados de estudios
  labResults: any | null;
  imagingResults: any | null;
  
  // Diagnósticos
  diagnosis: string;
  diagnosticProcedures: string | null;
  differentialDiagnosis: string | null;
  
  // Tratamiento
  treatment: string | null;
  prescription: string | null;
  medicalIndications: string | null;
  
  // Evolución
  clinicalEvolution: string | null;
  followUpPlan: string | null;
  prognosis: string | null;
  
  // Otros
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PatientDocument {
  id: number;
  patientId: number;
  medicalRecordId: number | null;
  doctorId: number | null;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  documentType: string;
  category: string | null;
  isConfidential: boolean;
  tags: string[];
  uploadedAt: string;
  uploadedBy: number;
}

// Tipos de documentos para el filtro
const documentTypes = [
  { value: "laboratory", label: "Laboratorio" },
  { value: "imaging", label: "Imagenología" },
  { value: "prescription", label: "Recetas" },
  { value: "clinical_note", label: "Notas clínicas" },
  { value: "informed_consent", label: "Consentimientos" },
  { value: "referral", label: "Referencias/Interconsultas" },
  { value: "external_document", label: "Documentos externos" },
  { value: "vaccination", label: "Vacunación" },
  { value: "dental_record", label: "Odontología" },
  { value: "pathology", label: "Patología" },
  { value: "other", label: "Otros" }
];

// Página de historial médico para pacientes
export default function PatientMedicalHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [documentFilter, setDocumentFilter] = useState<string>("all");
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploadDetails, setUploadDetails] = useState({
    title: "",
    description: "",
    documentType: "other",
    isConfidential: false
  });
  const [isUploading, setIsUploading] = useState(false);
  
  // Consulta para obtener expedientes médicos del paciente
  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["/api/patients/medical-records", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest("GET", `/api/patients/${user.id}/medical-records`);
      
      // Obtener información de médicos para cada expediente
      const records = await res.json();
      
      // Enriquecer los registros con información del médico
      const recordsWithDoctors = await Promise.all(
        records.map(async (record: MedicalRecord) => {
          try {
            const doctorRes = await apiRequest("GET", `/api/users/${record.doctorId}`);
            const doctor = await doctorRes.json();
            return { 
              ...record, 
              doctor: {
                id: doctor.id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                profileImage: doctor.profileImage,
                specialty: doctor.specialty || "Médico"
              }
            };
          } catch (error) {
            return { 
              ...record, 
              doctor: {
                id: record.doctorId,
                firstName: "Doctor",
                lastName: "",
                profileImage: null,
                specialty: "Médico"
              }
            };
          }
        })
      );
      
      return recordsWithDoctors;
    },
    enabled: !!user?.id && user?.userType === "patient"
  });
  
  // Consulta para obtener detalles de un expediente específico
  const { data: recordDetails, isLoading: isLoadingRecordDetails } = useQuery({
    queryKey: ["/api/medical-records", selectedRecord],
    queryFn: async () => {
      if (!selectedRecord) return null;
      const res = await apiRequest("GET", `/api/medical-records/${selectedRecord}`);
      const record = await res.json();
      
      // Obtener información del médico
      try {
        const doctorRes = await apiRequest("GET", `/api/users/${record.doctorId}`);
        const doctor = await doctorRes.json();
        return { 
          ...record, 
          doctor: {
            id: doctor.id,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            profileImage: doctor.profileImage,
            specialty: doctor.specialty || "Médico"
          }
        };
      } catch (error) {
        return { 
          ...record, 
          doctor: {
            id: record.doctorId,
            firstName: "Doctor",
            lastName: "",
            profileImage: null,
            specialty: "Médico"
          }
        };
      }
    },
    enabled: !!selectedRecord
  });
  
  // Consulta para obtener documentos de un expediente específico
  const { data: recordDocuments, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["/api/medical-records/documents", selectedRecord],
    queryFn: async () => {
      if (!selectedRecord) return [];
      const res = await apiRequest("GET", `/api/medical-records/${selectedRecord}/documents`);
      return await res.json();
    },
    enabled: !!selectedRecord
  });
  
  // Consulta para obtener todos los documentos del paciente
  const { data: allDocuments, isLoading: isLoadingAllDocuments } = useQuery({
    queryKey: ["/api/patients/documents", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await apiRequest("GET", `/api/patients/${user.id}/documents`);
      return await res.json();
    },
    enabled: !!user?.id && user?.userType === "patient"
  });
  
  // Filtrar documentos por tipo
  const filteredDocuments = (selectedRecord ? recordDocuments : allDocuments)?.filter(
    (doc: PatientDocument) => 
      documentFilter === "all" || doc.documentType === documentFilter
  ) || [];
  
  // Formatear valores vitales
  const formatVitalSigns = (vitalSigns: any) => {
    if (!vitalSigns) return "No disponible";
    
    const parts = [];
    
    if (vitalSigns.temperature) {
      parts.push(`Temperatura: ${vitalSigns.temperature}°C`);
    }
    
    if (vitalSigns.bloodPressure?.systolic && vitalSigns.bloodPressure?.diastolic) {
      parts.push(`Presión arterial: ${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic} mmHg`);
    }
    
    if (vitalSigns.heartRate) {
      parts.push(`Frecuencia cardíaca: ${vitalSigns.heartRate} lpm`);
    }
    
    if (vitalSigns.respiratoryRate) {
      parts.push(`Frecuencia respiratoria: ${vitalSigns.respiratoryRate} rpm`);
    }
    
    if (vitalSigns.oxygenSaturation) {
      parts.push(`Saturación de O₂: ${vitalSigns.oxygenSaturation}%`);
    }
    
    return parts.length > 0 ? parts.join("\n") : "No disponible";
  };
  
  // Manejar la carga de archivos personales
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileUpload) {
      toast({
        title: "Error",
        description: "Por favor seleccione un archivo para subir",
        variant: "destructive"
      });
      return;
    }
    
    // Validar tamaño (máximo 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB en bytes
    if (fileUpload.size > maxSize) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. El tamaño máximo es de 20MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Validar que el título no esté vacío
    if (!uploadDetails.title.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un título para el documento",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("file", fileUpload);
      formData.append("title", uploadDetails.title);
      formData.append("description", uploadDetails.description);
      formData.append("documentType", uploadDetails.documentType);
      formData.append("isConfidential", uploadDetails.isConfidential.toString());
      
      let url = `/api/patients/${user?.id}/documents`;
      if (selectedRecord) {
        url = `/api/medical-records/${selectedRecord}/documents`;
      }
      
      const res = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al subir archivo");
      }
      
      await res.json();
      
      // Limpiar el formulario
      setFileUpload(null);
      setUploadDetails({
        title: "",
        description: "",
        documentType: "other",
        isConfidential: false
      });
      
      toast({
        title: "Documento subido",
        description: "El documento se ha subido correctamente",
        variant: "default"
      });
      
      // Actualizar la lista de documentos
      if (selectedRecord) {
        queryClient.invalidateQueries({ queryKey: ["/api/medical-records/documents", selectedRecord] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/patients/documents", user?.id] });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al subir el documento",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Verificar que el usuario sea un paciente
  if (!user || user.userType !== "patient") {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
        <p className="mb-4">Esta página es solo para pacientes.</p>
        <Button asChild>
          <a href="/dashboard">Volver al Dashboard</a>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Historial Médico</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-semibold">Historial Médico</h1>
        
        <Tabs defaultValue={selectedRecord ? "expediente" : "lista"} className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger 
              value="lista" 
              className="flex-1"
              onClick={() => setSelectedRecord(null)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Lista de Expedientes
            </TabsTrigger>
            <TabsTrigger 
              value="expediente" 
              className="flex-1"
              disabled={!selectedRecord}
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Expediente Detallado
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex-1">
              <File className="h-4 w-4 mr-2" />
              Documentos
            </TabsTrigger>
          </TabsList>
          
          {/* Pestaña de lista de expedientes */}
          <TabsContent value="lista">
            {isLoadingRecords ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : medicalRecords && medicalRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicalRecords.map((record: MedicalRecord) => (
                  <Card 
                    key={record.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      setSelectedRecord(record.id);
                      // Cambiar a la pestaña de expediente
                      const expedienteTab = document.querySelector('[data-value="expediente"]');
                      if (expedienteTab instanceof HTMLElement) {
                        expedienteTab.click();
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium">
                          {record.diagnosis}
                        </CardTitle>
                        <Badge variant="outline" className="bg-primary-50 text-primary-700 text-xs">
                          Diagnóstico
                        </Badge>
                      </div>
                      <CardDescription>
                        Creado el {format(new Date(record.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          {record.doctor?.profileImage ? (
                            <img
                              src={record.doctor.profileImage}
                              alt={`Dr. ${record.doctor.firstName} ${record.doctor.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700">
                              <User size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{record.doctor?.specialty}</p>
                        </div>
                      </div>
                      
                      {record.treatment && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Tratamiento:</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{record.treatment}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedRecord(record.id);
                          // Cambiar a la pestaña de expediente
                          const expedienteTab = document.querySelector('[data-value="expediente"]');
                          if (expedienteTab instanceof HTMLElement) {
                            expedienteTab.click();
                          }
                        }}
                      >
                        Ver detalles
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tienes expedientes clínicos</h3>
                  <p className="text-muted-foreground mb-6">
                    No se encontraron registros médicos en tu historial.
                  </p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Los expedientes clínicos se crean cuando visitas a un médico en nuestra plataforma.
                    Agenda una cita para comenzar a construir tu historial médico.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Pestaña de expediente detallado */}
          <TabsContent value="expediente">
            {isLoadingRecordDetails ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recordDetails ? (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{recordDetails.diagnosis}</CardTitle>
                        <Badge variant="outline" className="bg-primary-50 text-primary-700">
                          Diagnóstico
                        </Badge>
                      </div>
                      <CardDescription>
                        Creado el {format(new Date(recordDetails.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center mt-4 md:mt-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted mr-2">
                        {recordDetails.doctor?.profileImage ? (
                          <img
                            src={recordDetails.doctor.profileImage}
                            alt={`Dr. ${recordDetails.doctor.firstName} ${recordDetails.doctor.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          Dr. {recordDetails.doctor?.firstName} {recordDetails.doctor?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{recordDetails.doctor?.specialty}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" defaultValue={["diagnostico", "exploracion"]} className="w-full">
                    {/* Diagnóstico y tratamiento */}
                    <AccordionItem value="diagnostico">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2 text-lg font-medium">
                          <Stethoscope className="h-5 w-5" />
                          <span>Diagnóstico y tratamiento</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 py-2">
                          <div>
                            <h3 className="text-sm font-medium mb-1">Diagnóstico</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {recordDetails.diagnosis || "No especificado"}
                            </p>
                          </div>
                          
                          {recordDetails.differentialDiagnosis && (
                            <div>
                              <h3 className="text-sm font-medium mb-1">Diagnósticos diferenciales</h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {recordDetails.differentialDiagnosis}
                              </p>
                            </div>
                          )}
                          
                          {recordDetails.treatment && (
                            <div>
                              <h3 className="text-sm font-medium mb-1">Tratamiento</h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {recordDetails.treatment}
                              </p>
                            </div>
                          )}
                          
                          {recordDetails.medicalIndications && (
                            <div>
                              <h3 className="text-sm font-medium mb-1">Indicaciones médicas</h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {recordDetails.medicalIndications}
                              </p>
                            </div>
                          )}
                          
                          {recordDetails.prescription && (
                            <div>
                              <h3 className="text-sm font-medium mb-1">Medicamentos recetados</h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {recordDetails.prescription}
                              </p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Exploración física */}
                    <AccordionItem value="exploracion">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2 text-lg font-medium">
                          <Activity className="h-5 w-5" />
                          <span>Exploración física</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 py-2">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-primary-50 rounded-md p-4">
                              <div className="flex items-center mb-2">
                                <Heart className="h-5 w-5 text-primary-700 mr-2" />
                                <h3 className="text-sm font-medium">Signos vitales</h3>
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {recordDetails.vitalSigns 
                                  ? formatVitalSigns(recordDetails.vitalSigns)
                                  : "No disponible"}
                              </p>
                            </div>
                            
                            {(recordDetails.height || recordDetails.weight) && (
                              <div className="bg-primary-50 rounded-md p-4">
                                <div className="flex items-center mb-2">
                                  <User className="h-5 w-5 text-primary-700 mr-2" />
                                  <h3 className="text-sm font-medium">Medidas</h3>
                                </div>
                                <div className="space-y-1">
                                  {recordDetails.height && (
                                    <p className="text-sm text-muted-foreground">
                                      Estatura: {recordDetails.height} cm
                                    </p>
                                  )}
                                  {recordDetails.weight && (
                                    <p className="text-sm text-muted-foreground">
                                      Peso: {recordDetails.weight} kg
                                    </p>
                                  )}
                                  {recordDetails.bodyMassIndex && (
                                    <p className="text-sm text-muted-foreground">
                                      IMC: {recordDetails.bodyMassIndex}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {recordDetails.physicalExamination && (
                            <div>
                              <h3 className="text-sm font-medium mb-1">Hallazgos de la exploración física</h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {recordDetails.physicalExamination}
                              </p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Antecedentes */}
                    {(recordDetails.personalHistory || recordDetails.familyHistory || 
                      recordDetails.surgicalHistory || recordDetails.allergies || 
                      recordDetails.medications) && (
                      <AccordionItem value="antecedentes">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2 text-lg font-medium">
                            <BookOpen className="h-5 w-5" />
                            <span>Antecedentes</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 py-2">
                            {recordDetails.personalHistory && (
                              <div>
                                <h3 className="text-sm font-medium mb-1">Antecedentes personales patológicos</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {recordDetails.personalHistory}
                                </p>
                              </div>
                            )}
                            
                            {recordDetails.familyHistory && (
                              <div>
                                <h3 className="text-sm font-medium mb-1">Antecedentes familiares</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {recordDetails.familyHistory}
                                </p>
                              </div>
                            )}
                            
                            {recordDetails.surgicalHistory && (
                              <div>
                                <h3 className="text-sm font-medium mb-1">Antecedentes quirúrgicos</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {recordDetails.surgicalHistory}
                                </p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {recordDetails.allergies && (
                                <div>
                                  <h3 className="text-sm font-medium mb-1">Alergias</h3>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {recordDetails.allergies}
                                  </p>
                                </div>
                              )}
                              
                              {recordDetails.medications && (
                                <div>
                                  <h3 className="text-sm font-medium mb-1">Medicamentos actuales</h3>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {recordDetails.medications}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    
                    {/* Evolución y seguimiento */}
                    {(recordDetails.clinicalEvolution || recordDetails.followUpPlan || recordDetails.prognosis) && (
                      <AccordionItem value="evolucion">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2 text-lg font-medium">
                            <BarChart className="h-5 w-5" />
                            <span>Evolución y seguimiento</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 py-2">
                            {recordDetails.clinicalEvolution && (
                              <div>
                                <h3 className="text-sm font-medium mb-1">Evolución clínica</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {recordDetails.clinicalEvolution}
                                </p>
                              </div>
                            )}
                            
                            {recordDetails.followUpPlan && (
                              <div>
                                <h3 className="text-sm font-medium mb-1">Plan de seguimiento</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {recordDetails.followUpPlan}
                                </p>
                              </div>
                            )}
                            
                            {recordDetails.prognosis && (
                              <div>
                                <h3 className="text-sm font-medium mb-1">Pronóstico</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {recordDetails.prognosis}
                                </p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    
                    {/* Notas */}
                    {recordDetails.notes && (
                      <AccordionItem value="notas">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2 text-lg font-medium">
                            <MessageSquare className="h-5 w-5" />
                            <span>Notas adicionales</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 py-2">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {recordDetails.notes}
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </CardContent>
                <CardFooter className="justify-between border-t pt-6">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedRecord(null);
                      const listaTab = document.querySelector('[data-value="lista"]');
                      if (listaTab instanceof HTMLElement) {
                        listaTab.click();
                      }
                    }}
                  >
                    Volver a la lista
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const documentosTab = document.querySelector('[data-value="documentos"]');
                      if (documentosTab instanceof HTMLElement) {
                        documentosTab.click();
                      }
                    }}
                  >
                    Ver documentos
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No se seleccionó ningún expediente</h3>
                  <p className="text-muted-foreground mb-6">
                    Seleccione un expediente clínico de la lista para ver sus detalles.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const listaTab = document.querySelector('[data-value="lista"]');
                      if (listaTab instanceof HTMLElement) {
                        listaTab.click();
                      }
                    }}
                  >
                    Ver lista de expedientes
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Pestaña de documentos */}
          <TabsContent value="documentos">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>Documentos médicos</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select
                      value={documentFilter}
                      onValueChange={setDocumentFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los documentos</SelectItem>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedRecord && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecord(null)}
                      >
                        Ver todos los documentos
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {selectedRecord 
                    ? "Documentos asociados a este expediente clínico" 
                    : "Todos los documentos en su historial médico"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Subir nuevo documento</h3>
                  <form onSubmit={handleFileUpload} className="space-y-4 border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título del documento</Label>
                        <Input
                          id="title"
                          placeholder="Ej: Radiografía de tórax"
                          value={uploadDetails.title}
                          onChange={(e) => setUploadDetails({...uploadDetails, title: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="documentType">Tipo de documento</Label>
                        <Select
                          value={uploadDetails.documentType}
                          onValueChange={(value) => setUploadDetails({...uploadDetails, documentType: value})}
                        >
                          <SelectTrigger id="documentType">
                            <SelectValue placeholder="Seleccione un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción (opcional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Describa brevemente el contenido del documento"
                        value={uploadDetails.description}
                        onChange={(e) => setUploadDetails({...uploadDetails, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <FileUploader
                      onFileChange={setFileUpload}
                      currentFile={fileUpload}
                      id="patientFileUpload"
                      label="Documento"
                      helpText="Formatos aceptados: PDF, imágenes, documentos de Word. Tamaño máximo: 20MB"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                    />
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        type="submit" 
                        disabled={isUploading || !fileUpload}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <File className="h-4 w-4 mr-2" />
                            Subir documento
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Documentos existentes</h3>
                  {(selectedRecord ? isLoadingDocuments : isLoadingAllDocuments) ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredDocuments && filteredDocuments.length > 0 ? (
                  <ScrollArea className="h-[450px] w-full rounded-md border p-2">
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Documento</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDocuments.map((doc: PatientDocument) => (
                            <TableRow key={doc.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4 text-muted-foreground" />
                                  <span>{doc.title}</span>
                                </div>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                                )}
                              </TableCell>
                              <TableCell>
                                {documentTypes.find(t => t.value === doc.documentType)?.label || doc.documentType}
                                {doc.category && (
                                  <span className="text-xs text-muted-foreground block">
                                    {doc.category}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {format(new Date(doc.uploadedAt), "dd/MM/yyyy", { locale: es })}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    asChild
                                  >
                                    <a 
                                      href={doc.fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver
                                    </a>
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    asChild
                                  >
                                    <a 
                                      href={doc.fileUrl} 
                                      download={doc.title}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Descargar
                                    </a>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {selectedRecord 
                        ? "No hay documentos asociados a este expediente" 
                        : "No hay documentos en su historial médico"}
                    </p>
                  </div>
                )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}