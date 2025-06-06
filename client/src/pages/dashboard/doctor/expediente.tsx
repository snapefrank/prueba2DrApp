import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import FileUploader from "@/components/FileUploader";
import PrescriptionGenerator from "@/components/PrescriptionGenerator";
import LabRequestForm from "@/components/LabRequestForm";
import { 
  FileText, 
  User, 
  Calendar, 
  Stethoscope, 
  MoreVertical, 
  Plus, 
  Loader2, 
  Search, 
  Upload,
  FileUp,
  Download,
  Eye,
  AlertTriangle,
  Clock,
  BookOpen,
  Heart,
  Activity,
  BarChart,
  Clipboard,
  MessageSquare,
  FilePlus,
  File,
  Check,
  Beaker,
  TestTube,
  Folder
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Interfaces
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  email: string;
}

interface PatientProfile {
  id: number;
  userId: number;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  phone: string;
  address: string;
}

interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
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

// Página principal de expediente clínico para médicos
export default function ExpedienteClinico() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploadDetails, setUploadDetails] = useState({
    title: "",
    description: "",
    documentType: "clinical_note",
    category: "",
    isConfidential: false,
    tags: [] as string[]
  });
  const [documentFilter, setDocumentFilter] = useState<string>("all");
  
  // Estado para nuevo expediente o edición
  const [recordForm, setRecordForm] = useState<Partial<MedicalRecord>>({
    diagnosis: "",
    physicalExamination: "",
    treatment: "",
    vitalSigns: {
      temperature: "",
      bloodPressure: {
        systolic: "",
        diastolic: ""
      },
      heartRate: "",
      respiratoryRate: "",
      oxygenSaturation: ""
    }
  });
  
  // Consulta para obtener pacientes del médico
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/doctor/patients", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      // Obtener pacientes que han tenido citas con este médico
      const res = await apiRequest("GET", `/api/patients?doctorId=${user.id}`);
      return await res.json();
    },
    enabled: !!user?.id && user?.userType === "doctor"
  });
  
  // Consulta para obtener expedientes del paciente seleccionado
  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["/api/patients/medical-records", selectedPatient],
    queryFn: async () => {
      if (!selectedPatient) return [];
      const res = await apiRequest("GET", `/api/patients/${selectedPatient}/medical-records`);
      return await res.json();
    },
    enabled: !!selectedPatient
  });
  
  // Consulta para obtener detalles de un expediente específico
  const { data: recordDetails, isLoading: isLoadingRecordDetails } = useQuery({
    queryKey: ["/api/medical-records", selectedRecord],
    queryFn: async () => {
      if (!selectedRecord) return null;
      const res = await apiRequest("GET", `/api/medical-records/${selectedRecord}`);
      return await res.json();
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
  
  // Consulta para obtener las recetas del paciente seleccionado
  const { data: patientPrescriptions, isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ["/api/prescriptions/patient", selectedPatient],
    queryFn: async () => {
      if (!selectedPatient) return [];
      const res = await apiRequest("GET", `/api/prescriptions?patientId=${selectedPatient}`);
      return await res.json();
    },
    enabled: !!selectedPatient
  });
  
  // Consulta para obtener el catálogo de estudios de laboratorio
  const { data: labTests, isLoading: isLoadingLabTests } = useQuery({
    queryKey: ["/api/lab-tests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/lab-tests");
      return await res.json();
    }
  });
  
  // Consulta para obtener laboratorios disponibles
  const { data: laboratories, isLoading: isLoadingLaboratories } = useQuery({
    queryKey: ["/api/laboratories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/laboratories?isActive=true");
      return await res.json();
    }
  });
  
  // Consulta para obtener solicitudes de laboratorio del paciente seleccionado
  const { data: patientLabCommissions, isLoading: isLoadingLabCommissions } = useQuery({
    queryKey: ["/api/lab-commissions/patient", selectedPatient],
    queryFn: async () => {
      if (!selectedPatient) return [];
      const res = await apiRequest("GET", `/api/patients/${selectedPatient}/lab-commissions`);
      return await res.json();
    },
    enabled: !!selectedPatient
  });
  
  // Mutación para crear solicitud de laboratorio
  const createLabCommissionMutation = useMutation({
    mutationFn: async (commissionData: any) => {
      const res = await apiRequest("POST", "/api/lab-commissions", commissionData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitud enviada",
        description: "La solicitud de estudios de laboratorio ha sido enviada correctamente",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lab-commissions/patient", selectedPatient] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo enviar la solicitud: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Consulta para obtener detalles del paciente seleccionado
  const { data: patientDetails, isLoading: isLoadingPatientDetails } = useQuery({
    queryKey: ["/api/patients/details", selectedPatient],
    queryFn: async () => {
      if (!selectedPatient) return null;
      const res = await apiRequest("GET", `/api/users/${selectedPatient}`);
      return await res.json();
    },
    enabled: !!selectedPatient
  });
  
  // Consulta para obtener perfil del paciente seleccionado
  const { data: patientProfile, isLoading: isLoadingPatientProfile } = useQuery({
    queryKey: ["/api/patients/profile", selectedPatient],
    queryFn: async () => {
      if (!selectedPatient) return null;
      const res = await apiRequest("GET", `/api/patients/${selectedPatient}/profile`);
      return await res.json();
    },
    enabled: !!selectedPatient
  });
  
  // Mutación para crear un nuevo expediente
  const createMedicalRecordMutation = useMutation({
    mutationFn: async (recordData: any) => {
      const res = await apiRequest("POST", "/api/medical-records", recordData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Expediente creado",
        description: "El expediente clínico se ha creado correctamente",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients/medical-records", selectedPatient] });
      setSelectedRecord(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el expediente: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutación para actualizar un expediente
  const updateMedicalRecordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PUT", `/api/medical-records/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Expediente actualizado",
        description: "El expediente clínico se ha actualizado correctamente",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records", selectedRecord] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el expediente: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutación para subir documentos
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ recordId, formData }: { recordId: number, formData: FormData }) => {
      const res = await fetch(`/api/medical-records/${recordId}/documents`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al subir archivo");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento subido",
        description: "El documento se ha agregado al expediente correctamente",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records/documents", selectedRecord] });
      setFileUpload(null);
      setUploadDetails({
        title: "",
        description: "",
        documentType: "clinical_note",
        category: "",
        isConfidential: false,
        tags: []
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo subir el documento: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Efecto para actualizar el formulario cuando cambia el expediente seleccionado
  useEffect(() => {
    if (recordDetails) {
      setRecordForm({
        ...recordDetails
      });
    } else {
      setRecordForm({
        diagnosis: "",
        physicalExamination: "",
        treatment: "",
        vitalSigns: {
          temperature: "",
          bloodPressure: {
            systolic: "",
            diastolic: ""
          },
          heartRate: "",
          respiratoryRate: "",
          oxygenSaturation: ""
        }
      });
    }
  }, [recordDetails]);
  
  // Filtrar pacientes por término de búsqueda
  const filteredPatients = patients?.filter(
    (patient: Patient) => 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Filtrar documentos por tipo seleccionado
  const filteredDocuments = recordDocuments?.filter(
    (doc: PatientDocument) => 
      documentFilter === "all" || doc.documentType === documentFilter
  ) || [];
  
  // Función para crear nuevo expediente
  const handleCreateMedicalRecord = () => {
    if (!selectedPatient || !user?.id) return;
    
    const newRecord = {
      patientId: selectedPatient,
      doctorId: user.id,
      diagnosis: recordForm.diagnosis || "Evaluación inicial",
      physicalExamination: recordForm.physicalExamination || "",
      vitalSigns: recordForm.vitalSigns || null,
      treatment: recordForm.treatment || "",
      appointmentId: null
    };
    
    createMedicalRecordMutation.mutate(newRecord);
  };
  
  // Función para actualizar un expediente
  const handleUpdateMedicalRecord = () => {
    if (!selectedRecord) return;
    
    updateMedicalRecordMutation.mutate({
      id: selectedRecord,
      data: recordForm
    });
  };
  
  // Función para manejar la subida de documentos
  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileUpload || !selectedRecord) return;
    
    const formData = new FormData();
    formData.append("file", fileUpload);
    formData.append("title", uploadDetails.title || fileUpload.name);
    formData.append("description", uploadDetails.description || "");
    formData.append("documentType", uploadDetails.documentType);
    formData.append("category", uploadDetails.category || "");
    formData.append("isConfidential", uploadDetails.isConfidential.toString());
    
    if (uploadDetails.tags.length > 0) {
      formData.append("tags", JSON.stringify(uploadDetails.tags));
    }
    
    uploadDocumentMutation.mutate({
      recordId: selectedRecord,
      formData
    });
  };
  
  // Función para cambiar la selección de paciente
  const handlePatientSelect = (patientId: number) => {
    setSelectedPatient(patientId);
    setSelectedRecord(null);
  };
  
  // Verificar que el usuario sea un médico
  if (!user || user.userType !== "doctor") {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
        <p className="mb-4">Esta página es solo para médicos.</p>
        <Button asChild>
          <Link href="/dashboard">Volver al Dashboard</Link>
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
            <BreadcrumbPage>Expediente Clínico</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel lateral de pacientes */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Mis Pacientes
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar paciente..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100vh-300px)] overflow-auto">
              {isLoadingPatients ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredPatients.length > 0 ? (
                <div className="space-y-2">
                  {filteredPatients.map((patient: Patient) => (
                    <div
                      key={patient.id}
                      className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-colors ${
                        selectedPatient === patient.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => handlePatientSelect(patient.id)}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
                        {patient.profileImage ? (
                          <img
                            src={patient.profileImage}
                            alt={`${patient.firstName} ${patient.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{patient.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No se encontraron pacientes</p>
                  <p className="text-sm">Atienda a pacientes para poder ver sus expedientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Contenido principal */}
        <div className="lg:col-span-9 space-y-6">
          {selectedPatient ? (
            <>
              {/* Información básica del paciente */}
              <Card>
                <CardContent className="p-6">
                  {isLoadingPatientDetails || isLoadingPatientProfile ? (
                    <div className="flex justify-center items-center h-20">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : patientDetails ? (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-muted mr-4">
                          {patientDetails.profileImage ? (
                            <img
                              src={patientDetails.profileImage}
                              alt={`${patientDetails.firstName} ${patientDetails.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                              <User size={32} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold">
                            {patientDetails.firstName} {patientDetails.lastName}
                          </h2>
                          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm text-muted-foreground">
                            {patientProfile?.gender && (
                              <p>{patientProfile.gender === "male" ? "Masculino" : "Femenino"}</p>
                            )}
                            {patientProfile?.dateOfBirth && (
                              <p>
                                {format(new Date(patientProfile.dateOfBirth), "dd/MM/yyyy")} • 
                                {" "}
                                {Math.floor(
                                  (new Date().getTime() - new Date(patientProfile.dateOfBirth).getTime()) /
                                    (1000 * 60 * 60 * 24 * 365.25)
                                )}{" "}
                                años
                              </p>
                            )}
                            {patientProfile?.bloodType && <p>Tipo de sangre: {patientProfile.bloodType}</p>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Nuevo expediente</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Crear nuevo expediente</DialogTitle>
                              <DialogDescription>
                                Cree un nuevo expediente clínico para {patientDetails.firstName} {patientDetails.lastName}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="diagnosis">Diagnóstico</Label>
                                <Input
                                  id="diagnosis"
                                  value={recordForm.diagnosis || ""}
                                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                                  placeholder="Diagnóstico inicial"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="physicalExamination">Exploración física</Label>
                                <Textarea
                                  id="physicalExamination"
                                  value={recordForm.physicalExamination || ""}
                                  onChange={(e) => setRecordForm({ ...recordForm, physicalExamination: e.target.value })}
                                  placeholder="Observaciones de la exploración física"
                                  rows={4}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="treatment">Tratamiento</Label>
                                <Textarea
                                  id="treatment"
                                  value={recordForm.treatment || ""}
                                  onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                                  placeholder="Descripción del tratamiento"
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                onClick={handleCreateMedicalRecord}
                                disabled={createMedicalRecordMutation.isPending}
                              >
                                {createMedicalRecordMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                  </>
                                ) : (
                                  "Crear expediente"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button asChild variant="secondary">
                          <Link href={`/dashboard/doctor/citas?patientId=${selectedPatient}`}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Ver historial de citas
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No se pudo cargar la información del paciente</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Lista de expedientes y contenido del expediente */}
              <Tabs defaultValue="expedientes" className="w-full">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="expedientes" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Expedientes Clínicos
                  </TabsTrigger>
                  <TabsTrigger value="recetas" className="flex-1">
                    <Clipboard className="h-4 w-4 mr-2" />
                    Recetas Electrónicas
                  </TabsTrigger>
                  <TabsTrigger value="documentos" className="flex-1">
                    <File className="h-4 w-4 mr-2" />
                    Documentos
                  </TabsTrigger>
                  <TabsTrigger value="laboratorio" className="flex-1">
                    <TestTube className="h-4 w-4 mr-2" />
                    Laboratorio
                  </TabsTrigger>
                </TabsList>
                
                {/* Pestaña de recetas electrónicas */}
                <TabsContent value="recetas">
                  {!selectedPatient ? (
                    <div className="flex flex-col items-center justify-center h-60 text-center">
                      <Clipboard className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Seleccione un paciente</h3>
                      <p className="text-muted-foreground">
                        Para generar recetas electrónicas, primero seleccione un paciente de la lista.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {/* Consulta para obtener recetas del paciente */}
                      <div className="space-y-6">
                        {/* Historial de recetas */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-primary" />
                              Historial de recetas
                            </CardTitle>
                            <CardDescription>
                              Recetas anteriores de {patientDetails?.firstName} {patientDetails?.lastName}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {isLoadingPrescriptions ? (
                              <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : patientPrescriptions && patientPrescriptions.length > 0 ? (
                              <div className="space-y-4">
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Diagnóstico</TableHead>
                                        <TableHead>Medicamentos</TableHead>
                                        <TableHead>Acciones</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {patientPrescriptions.map((prescription: any) => (
                                        <TableRow key={prescription.id}>
                                          <TableCell>
                                            {prescription.createdAt ? 
                                              format(new Date(prescription.createdAt), "d 'de' MMMM, yyyy", { locale: es }) : 
                                              "Fecha no disponible"
                                            }
                                          </TableCell>
                                          <TableCell>
                                            <div className="font-medium">
                                              {prescription.diagnosis || "Sin diagnóstico"}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div>
                                              {prescription.medications && prescription.medications.length > 0 ? (
                                                <ul className="list-disc list-inside text-sm">
                                                  {prescription.medications.slice(0, 2).map((med: any, idx: number) => (
                                                    <li key={idx}>
                                                      {med.name} - {med.dosage}
                                                    </li>
                                                  ))}
                                                  {prescription.medications.length > 2 && (
                                                    <li>Y {prescription.medications.length - 2} más...</li>
                                                  )}
                                                </ul>
                                              ) : (
                                                <span className="text-muted-foreground">
                                                  Sin medicamentos registrados
                                                </span>
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex space-x-2">
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                      <Eye className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>Ver PDF</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                              
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                      <Clipboard className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>Editar receta</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Clipboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="mb-2">No hay recetas anteriores</p>
                                <p className="text-sm">Cree una nueva receta para este paciente</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Generador de recetas */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <Clipboard className="h-5 w-5 mr-2 text-primary" />
                              Generar nueva receta
                            </CardTitle>
                            <CardDescription>
                              Cree una receta electrónica para {patientDetails?.firstName} {patientDetails?.lastName}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {user?.id && patientDetails && (
                              <PrescriptionGenerator 
                                doctorId={user.id} 
                                patients={[{
                                  id: patientDetails.id,
                                  name: `${patientDetails.firstName} ${patientDetails.lastName}`,
                                  age: patientProfile?.dateOfBirth ? 
                                    Math.floor((new Date().getTime() - new Date(patientProfile.dateOfBirth).getTime()) / 3.15576e+10) 
                                    : undefined,
                                  gender: patientProfile?.gender
                                }]}
                                onPrescriptionSaved={(prescriptionId) => {
                                  // Refrescar la lista de recetas
                                  queryClient.invalidateQueries({ queryKey: ['/api/prescriptions/patient', selectedPatient] });
                                }}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                {/* Pestaña de expedientes */}
                <TabsContent value="expedientes">
                  {isLoadingRecords ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : medicalRecords && medicalRecords.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {/* Si hay un expediente seleccionado, mostrar detalles */}
                      {selectedRecord ? (
                        <Card>
                          <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <div>
                              <CardTitle>Expediente clínico</CardTitle>
                              <CardDescription>
                                {recordDetails?.createdAt && (
                                  <span>
                                    Creado el {format(new Date(recordDetails.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                                  </span>
                                )}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRecord(null)}
                              >
                                Volver a la lista
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Subir documento
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl">
                                  <DialogHeader>
                                    <DialogTitle>Subir documento al expediente</DialogTitle>
                                    <DialogDescription>
                                      Agregue documentos relevantes al expediente clínico del paciente
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <form onSubmit={handleFileUpload} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="fileUpload">Documento</Label>
                                      <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary/50">
                                        <input
                                          type="file"
                                          id="fileUpload"
                                          className="hidden"
                                          onChange={(e) => {
                                            const files = e.target.files;
                                            if (files && files.length > 0) {
                                              setFileUpload(files[0]);
                                            } else {
                                              setFileUpload(null);
                                            }
                                          }}
                                          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                                        />
                                        <label htmlFor="fileUpload" className="cursor-pointer block">
                                          {fileUpload ? (
                                            <div className="flex flex-col items-center">
                                              <Check className="h-8 w-8 text-green-500 mb-2" />
                                              <span className="font-medium">{fileUpload.name}</span>
                                              <span className="text-sm text-muted-foreground">
                                                {(fileUpload.size / 1024 / 1024).toFixed(2)} MB
                                              </span>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  setFileUpload(null);
                                                }}
                                              >
                                                Cambiar archivo
                                              </Button>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col items-center">
                                              <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                                              <span className="font-medium">
                                                Haga clic para seleccionar un archivo
                                              </span>
                                              <span className="text-sm text-muted-foreground">
                                                O arrastre y suelte aquí
                                              </span>
                                            </div>
                                          )}
                                        </label>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Formatos aceptados: PDF, imágenes, documentos de Word. Tamaño máximo: 20MB
                                      </p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="title">Título</Label>
                                      <Input
                                        id="title"
                                        value={uploadDetails.title}
                                        onChange={(e) => setUploadDetails({ ...uploadDetails, title: e.target.value })}
                                        placeholder="Título del documento"
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="description">Descripción</Label>
                                      <Textarea
                                        id="description"
                                        value={uploadDetails.description}
                                        onChange={(e) => setUploadDetails({ ...uploadDetails, description: e.target.value })}
                                        placeholder="Descripción del documento"
                                        rows={2}
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="documentType">Tipo de documento</Label>
                                        <Select
                                          value={uploadDetails.documentType}
                                          onValueChange={(value) => setUploadDetails({ ...uploadDetails, documentType: value })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo" />
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
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="category">Categoría (opcional)</Label>
                                        <Input
                                          id="category"
                                          value={uploadDetails.category}
                                          onChange={(e) => setUploadDetails({ ...uploadDetails, category: e.target.value })}
                                          placeholder="Ej. Biometría, Ultrasonido"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id="isConfidential"
                                        checked={uploadDetails.isConfidential}
                                        onChange={(e) => setUploadDetails({ ...uploadDetails, isConfidential: e.target.checked })}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <Label
                                        htmlFor="isConfidential"
                                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                      >
                                        Documento confidencial
                                      </Label>
                                    </div>
                                    
                                    <DialogFooter>
                                      <Button
                                        type="submit"
                                        disabled={!fileUpload || uploadDocumentMutation.isPending}
                                      >
                                        {uploadDocumentMutation.isPending ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Subiendo...
                                          </>
                                        ) : (
                                          "Subir documento"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {isLoadingRecordDetails ? (
                              <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                            ) : recordDetails ? (
                              <div className="space-y-6">
                                <Accordion type="multiple" defaultValue={["diagnostico", "exploracion"]}>
                                  {/* Diagnóstico */}
                                  <AccordionItem value="diagnostico">
                                    <AccordionTrigger className="hover:no-underline">
                                      <div className="flex items-center gap-2 text-lg font-medium">
                                        <Stethoscope className="h-5 w-5" />
                                        <span>Diagnóstico y tratamiento</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                          <Label htmlFor="diagnosis">Diagnóstico</Label>
                                          <Textarea
                                            id="diagnosis"
                                            value={recordForm.diagnosis || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                                            placeholder="Diagnóstico"
                                            rows={3}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="treatment">Tratamiento</Label>
                                          <Textarea
                                            id="treatment"
                                            value={recordForm.treatment || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                                            placeholder="Tratamiento indicado"
                                            rows={3}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="medicalIndications">Indicaciones médicas</Label>
                                          <Textarea
                                            id="medicalIndications"
                                            value={recordForm.medicalIndications || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, medicalIndications: e.target.value })}
                                            placeholder="Indicaciones y recomendaciones"
                                            rows={2}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="prescription">Medicamentos recetados</Label>
                                          <Textarea
                                            id="prescription"
                                            value={recordForm.prescription || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
                                            placeholder="Medicamentos prescritos y posología"
                                            rows={2}
                                          />
                                        </div>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="temperature">Temperatura (°C)</Label>
                                            <Input
                                              id="temperature"
                                              type="number"
                                              step="0.1"
                                              value={recordForm.vitalSigns?.temperature || ""}
                                              onChange={(e) => setRecordForm({
                                                ...recordForm,
                                                vitalSigns: {
                                                  ...recordForm.vitalSigns,
                                                  temperature: e.target.value
                                                }
                                              })}
                                              placeholder="36.5"
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor="height">Estatura (cm)</Label>
                                            <Input
                                              id="height"
                                              type="number"
                                              value={recordForm.height || ""}
                                              onChange={(e) => setRecordForm({
                                                ...recordForm,
                                                height: e.target.value ? parseFloat(e.target.value) : null
                                              })}
                                              placeholder="170"
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor="weight">Peso (kg)</Label>
                                            <Input
                                              id="weight"
                                              type="number"
                                              step="0.1"
                                              value={recordForm.weight || ""}
                                              onChange={(e) => setRecordForm({
                                                ...recordForm,
                                                weight: e.target.value ? parseFloat(e.target.value) : null
                                              })}
                                              placeholder="70"
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor="systolic">Presión arterial (sistólica)</Label>
                                            <Input
                                              id="systolic"
                                              type="number"
                                              value={recordForm.vitalSigns?.bloodPressure?.systolic || ""}
                                              onChange={(e) => setRecordForm({
                                                ...recordForm,
                                                vitalSigns: {
                                                  ...recordForm.vitalSigns,
                                                  bloodPressure: {
                                                    ...recordForm.vitalSigns?.bloodPressure,
                                                    systolic: e.target.value
                                                  }
                                                }
                                              })}
                                              placeholder="120"
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor="diastolic">Presión arterial (diastólica)</Label>
                                            <Input
                                              id="diastolic"
                                              type="number"
                                              value={recordForm.vitalSigns?.bloodPressure?.diastolic || ""}
                                              onChange={(e) => setRecordForm({
                                                ...recordForm,
                                                vitalSigns: {
                                                  ...recordForm.vitalSigns,
                                                  bloodPressure: {
                                                    ...recordForm.vitalSigns?.bloodPressure,
                                                    diastolic: e.target.value
                                                  }
                                                }
                                              })}
                                              placeholder="80"
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor="heartRate">Frecuencia cardíaca</Label>
                                            <Input
                                              id="heartRate"
                                              type="number"
                                              value={recordForm.vitalSigns?.heartRate || ""}
                                              onChange={(e) => setRecordForm({
                                                ...recordForm,
                                                vitalSigns: {
                                                  ...recordForm.vitalSigns,
                                                  heartRate: e.target.value
                                                }
                                              })}
                                              placeholder="70"
                                            />
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="physicalExamination">Hallazgos de la exploración física</Label>
                                          <Textarea
                                            id="physicalExamination"
                                            value={recordForm.physicalExamination || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, physicalExamination: e.target.value })}
                                            placeholder="Describa los hallazgos de la exploración física"
                                            rows={4}
                                          />
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                  
                                  {/* Antecedentes */}
                                  <AccordionItem value="antecedentes">
                                    <AccordionTrigger className="hover:no-underline">
                                      <div className="flex items-center gap-2 text-lg font-medium">
                                        <BookOpen className="h-5 w-5" />
                                        <span>Antecedentes</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                          <Label htmlFor="personalHistory">Antecedentes personales patológicos</Label>
                                          <Textarea
                                            id="personalHistory"
                                            value={recordForm.personalHistory || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, personalHistory: e.target.value })}
                                            placeholder="Enfermedades previas, padecimientos crónicos, etc."
                                            rows={3}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="familyHistory">Antecedentes familiares</Label>
                                          <Textarea
                                            id="familyHistory"
                                            value={recordForm.familyHistory || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, familyHistory: e.target.value })}
                                            placeholder="Historial médico familiar relevante"
                                            rows={3}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="surgicalHistory">Antecedentes quirúrgicos</Label>
                                          <Textarea
                                            id="surgicalHistory"
                                            value={recordForm.surgicalHistory || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, surgicalHistory: e.target.value })}
                                            placeholder="Cirugías previas"
                                            rows={2}
                                          />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="allergies">Alergias</Label>
                                            <Textarea
                                              id="allergies"
                                              value={recordForm.allergies || ""}
                                              onChange={(e) => setRecordForm({ ...recordForm, allergies: e.target.value })}
                                              placeholder="Medicamentos, alimentos, sustancias, etc."
                                              rows={2}
                                            />
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label htmlFor="medications">Medicamentos actuales</Label>
                                            <Textarea
                                              id="medications"
                                              value={recordForm.medications || ""}
                                              onChange={(e) => setRecordForm({ ...recordForm, medications: e.target.value })}
                                              placeholder="Medicamentos que toma actualmente"
                                              rows={2}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                  
                                  {/* Evolución y pronóstico */}
                                  <AccordionItem value="evolucion">
                                    <AccordionTrigger className="hover:no-underline">
                                      <div className="flex items-center gap-2 text-lg font-medium">
                                        <BarChart className="h-5 w-5" />
                                        <span>Evolución y seguimiento</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                          <Label htmlFor="clinicalEvolution">Evolución clínica</Label>
                                          <Textarea
                                            id="clinicalEvolution"
                                            value={recordForm.clinicalEvolution || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, clinicalEvolution: e.target.value })}
                                            placeholder="Evolución del cuadro clínico"
                                            rows={3}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="followUpPlan">Plan de seguimiento</Label>
                                          <Textarea
                                            id="followUpPlan"
                                            value={recordForm.followUpPlan || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, followUpPlan: e.target.value })}
                                            placeholder="Plan de seguimiento y próximos pasos"
                                            rows={2}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="prognosis">Pronóstico</Label>
                                          <Textarea
                                            id="prognosis"
                                            value={recordForm.prognosis || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, prognosis: e.target.value })}
                                            placeholder="Pronóstico del paciente"
                                            rows={2}
                                          />
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                  
                                  {/* Notas */}
                                  <AccordionItem value="notas">
                                    <AccordionTrigger className="hover:no-underline">
                                      <div className="flex items-center gap-2 text-lg font-medium">
                                        <MessageSquare className="h-5 w-5" />
                                        <span>Notas adicionales</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                          <Label htmlFor="notes">Notas generales</Label>
                                          <Textarea
                                            id="notes"
                                            value={recordForm.notes || ""}
                                            onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                                            placeholder="Notas adicionales, observaciones y cualquier otra información relevante"
                                            rows={4}
                                          />
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                                
                                <div className="flex justify-end pt-4">
                                  <Button
                                    onClick={handleUpdateMedicalRecord}
                                    disabled={updateMedicalRecordMutation.isPending}
                                  >
                                    {updateMedicalRecordMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                      </>
                                    ) : (
                                      "Guardar cambios"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <p>No se pudo cargar el expediente.</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {medicalRecords.map((record: MedicalRecord) => (
                              <Card 
                                key={record.id} 
                                className="cursor-pointer hover:border-primary transition-colors"
                                onClick={() => setSelectedRecord(record.id)}
                              >
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base font-medium">
                                    Expediente: {record.diagnosis}
                                  </CardTitle>
                                  <CardDescription>
                                    {format(new Date(record.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-sm text-muted-foreground line-clamp-3">
                                    {record.treatment || "Sin tratamiento específico registrado"}
                                  </div>
                                </CardContent>
                                <CardFooter className="pt-0 flex justify-between">
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(record.id)}>
                                    Ver detalles
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                          
                          {medicalRecords.length === 0 && (
                            <Card className="bg-muted/50">
                              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No hay expedientes clínicos</h3>
                                <p className="text-muted-foreground mb-6">
                                  Este paciente no tiene expedientes clínicos creados.
                                </p>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button>Crear expediente</Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Crear expediente clínico</DialogTitle>
                                      <DialogDescription>
                                        Cree un nuevo expediente para el paciente: {patientDetails?.firstName} {patientDetails?.lastName}
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="diagnosis">Diagnóstico</Label>
                                        <Input
                                          id="diagnosis"
                                          value={recordForm.diagnosis || ""}
                                          onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                                          placeholder="Diagnóstico inicial"
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="physicalExamination">Exploración física</Label>
                                        <Textarea
                                          id="physicalExamination"
                                          value={recordForm.physicalExamination || ""}
                                          onChange={(e) => setRecordForm({ ...recordForm, physicalExamination: e.target.value })}
                                          placeholder="Observaciones de la exploración física"
                                          rows={4}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor="treatment">Tratamiento</Label>
                                        <Textarea
                                          id="treatment"
                                          value={recordForm.treatment || ""}
                                          onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                                          placeholder="Descripción del tratamiento"
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                    
                                    <DialogFooter>
                                      <Button 
                                        onClick={handleCreateMedicalRecord}
                                        disabled={createMedicalRecordMutation.isPending}
                                      >
                                        {createMedicalRecordMutation.isPending ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creando...
                                          </>
                                        ) : (
                                          "Crear expediente"
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <Card className="bg-muted/50">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay expedientes clínicos</h3>
                        <p className="text-muted-foreground mb-6">
                          Este paciente no tiene expedientes clínicos creados.
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button>Crear expediente</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Crear expediente clínico</DialogTitle>
                              <DialogDescription>
                                Cree un nuevo expediente para {patientDetails?.firstName} {patientDetails?.lastName}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="diagnosis">Diagnóstico</Label>
                                <Input
                                  id="diagnosis"
                                  value={recordForm.diagnosis || ""}
                                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                                  placeholder="Diagnóstico inicial"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="physicalExamination">Exploración física</Label>
                                <Textarea
                                  id="physicalExamination"
                                  value={recordForm.physicalExamination || ""}
                                  onChange={(e) => setRecordForm({ ...recordForm, physicalExamination: e.target.value })}
                                  placeholder="Observaciones de la exploración física"
                                  rows={4}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="treatment">Tratamiento</Label>
                                <Textarea
                                  id="treatment"
                                  value={recordForm.treatment || ""}
                                  onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                                  placeholder="Descripción del tratamiento"
                                  rows={3}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                onClick={handleCreateMedicalRecord}
                                disabled={createMedicalRecordMutation.isPending}
                              >
                                {createMedicalRecordMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                  </>
                                ) : (
                                  "Crear expediente"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                {/* Pestaña de documentos */}
                <TabsContent value="documentos">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle>Documentos médicos</CardTitle>
                        <div className="flex gap-2">
                          <Select
                            value={documentFilter}
                            onValueChange={setDocumentFilter}
                          >
                            <SelectTrigger className="w-[180px]">
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Subir documento
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Subir documento</DialogTitle>
                                  <DialogDescription>
                                    Agregue un nuevo documento al expediente clínico del paciente
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <form onSubmit={handleFileUpload} className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="fileUpload">Documento</Label>
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary/50">
                                      <input
                                        type="file"
                                        id="fileUpload"
                                        className="hidden"
                                        onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
                                      />
                                      <label htmlFor="fileUpload" className="cursor-pointer block">
                                        {fileUpload ? (
                                          <div className="flex flex-col items-center">
                                            <Check className="h-8 w-8 text-green-500 mb-2" />
                                            <span className="font-medium">{fileUpload.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                              {(fileUpload.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center">
                                            <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                                            <span className="font-medium">
                                              Haga clic para seleccionar un archivo
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                              O arrastre y suelte aquí
                                            </span>
                                          </div>
                                        )}
                                      </label>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input
                                      id="title"
                                      value={uploadDetails.title}
                                      onChange={(e) => setUploadDetails({ ...uploadDetails, title: e.target.value })}
                                      placeholder="Título del documento"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                      id="description"
                                      value={uploadDetails.description}
                                      onChange={(e) => setUploadDetails({ ...uploadDetails, description: e.target.value })}
                                      placeholder="Descripción del documento"
                                      rows={2}
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="documentType">Tipo de documento</Label>
                                      <Select
                                        value={uploadDetails.documentType}
                                        onValueChange={(value) => setUploadDetails({ ...uploadDetails, documentType: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccionar tipo" />
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
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="category">Categoría (opcional)</Label>
                                      <Input
                                        id="category"
                                        value={uploadDetails.category}
                                        onChange={(e) => setUploadDetails({ ...uploadDetails, category: e.target.value })}
                                        placeholder="Ej. Biometría, Ultrasonido"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="isConfidential"
                                      checked={uploadDetails.isConfidential}
                                      onChange={(e) => setUploadDetails({ ...uploadDetails, isConfidential: e.target.checked })}
                                      className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label
                                      htmlFor="isConfidential"
                                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Documento confidencial
                                    </Label>
                                  </div>
                                  
                                  <DialogFooter>
                                    <Button
                                      type="submit"
                                      disabled={!fileUpload || uploadDocumentMutation.isPending}
                                    >
                                      {uploadDocumentMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Subiendo...
                                        </>
                                      ) : (
                                        "Subir documento"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDocuments ? (
                        <div className="flex justify-center items-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : filteredDocuments && filteredDocuments.length > 0 ? (
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
                                      {doc.isConfidential && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <span className="inline-flex items-center justify-center w-4 h-4 bg-amber-100 text-amber-800 rounded-full">
                                                !
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Documento confidencial</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
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
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">
                            {selectedRecord ? "No hay documentos para este expediente." : "Seleccione un expediente para ver sus documentos."}
                          </p>
                          {selectedRecord && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="mt-4">
                                  <FilePlus className="h-4 w-4 mr-2" />
                                  Subir primer documento
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Subir documento</DialogTitle>
                                  <DialogDescription>
                                    Agregue un nuevo documento al expediente clínico del paciente
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <form onSubmit={handleFileUpload} className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="fileUpload">Documento</Label>
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary/50">
                                      <input
                                        type="file"
                                        id="fileUpload"
                                        className="hidden"
                                        onChange={(e) => setFileUpload(e.target.files?.[0] || null)}
                                      />
                                      <label htmlFor="fileUpload" className="cursor-pointer block">
                                        {fileUpload ? (
                                          <div className="flex flex-col items-center">
                                            <Check className="h-8 w-8 text-green-500 mb-2" />
                                            <span className="font-medium">{fileUpload.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                              {(fileUpload.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center">
                                            <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                                            <span className="font-medium">
                                              Haga clic para seleccionar un archivo
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                              O arrastre y suelte aquí
                                            </span>
                                          </div>
                                        )}
                                      </label>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input
                                      id="title"
                                      value={uploadDetails.title}
                                      onChange={(e) => setUploadDetails({ ...uploadDetails, title: e.target.value })}
                                      placeholder="Título del documento"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                      id="description"
                                      value={uploadDetails.description}
                                      onChange={(e) => setUploadDetails({ ...uploadDetails, description: e.target.value })}
                                      placeholder="Descripción del documento"
                                      rows={2}
                                    />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="documentType">Tipo de documento</Label>
                                      <Select
                                        value={uploadDetails.documentType}
                                        onValueChange={(value) => setUploadDetails({ ...uploadDetails, documentType: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccionar tipo" />
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
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="category">Categoría (opcional)</Label>
                                      <Input
                                        id="category"
                                        value={uploadDetails.category}
                                        onChange={(e) => setUploadDetails({ ...uploadDetails, category: e.target.value })}
                                        placeholder="Ej. Biometría, Ultrasonido"
                                      />
                                    </div>
                                  </div>
                                  
                                  <DialogFooter>
                                    <Button
                                      type="submit"
                                      disabled={!fileUpload || uploadDocumentMutation.isPending}
                                    >
                                      {uploadDocumentMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Subiendo...
                                        </>
                                      ) : (
                                        "Subir documento"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Pestaña de laboratorio */}
                <TabsContent value="laboratorio">
                  {!selectedPatient ? (
                    <div className="flex flex-col items-center justify-center h-60 text-center">
                      <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Seleccione un paciente</h3>
                      <p className="text-muted-foreground">
                        Para solicitar estudios de laboratorio, primero seleccione un paciente de la lista.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {/* Solicitar nuevos estudios */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <TestTube className="h-5 w-5 mr-2 text-primary" />
                            Solicitar estudios de laboratorio
                          </CardTitle>
                          <CardDescription>
                            Generar solicitud para {patientDetails?.firstName} {patientDetails?.lastName}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {user?.id && patientDetails && (
                            <LabRequestForm
                              doctorId={user.id}
                              patientId={patientDetails.id}
                              patientName={`${patientDetails.firstName} ${patientDetails.lastName}`}
                              labTests={labTests || []}
                              laboratories={laboratories || []}
                              onLabRequestSaved={() => {
                                // Refrescar la lista de solicitudes
                                queryClient.invalidateQueries({ queryKey: ['/api/lab-commissions/patient', selectedPatient] });
                              }}
                              onSubmit={(data) => {
                                if (user?.id && selectedPatient) {
                                  const labCommission = {
                                    doctorId: user.id,
                                    patientId: selectedPatient,
                                    laboratoryId: data.laboratoryId,
                                    testIds: data.testIds,
                                    notes: data.notes,
                                    priority: data.priority || "normal",
                                    dueDate: data.dueDate ? new Date(data.dueDate) : undefined
                                  };
                                  
                                  createLabCommissionMutation.mutate(labCommission);
                                }
                              }}
                            />
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* Historial de solicitudes */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Folder className="h-5 w-5 mr-2 text-primary" />
                            Solicitudes anteriores
                          </CardTitle>
                          <CardDescription>
                            Historial de solicitudes de laboratorio para {patientDetails?.firstName} {patientDetails?.lastName}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isLoadingLabCommissions ? (
                            <div className="flex justify-center items-center h-40">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : patientLabCommissions && patientLabCommissions.length > 0 ? (
                            <div className="space-y-4">
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Fecha</TableHead>
                                      <TableHead>Laboratorio</TableHead>
                                      <TableHead>Estudios</TableHead>
                                      <TableHead>Estado</TableHead>
                                      <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {patientLabCommissions.map((commission: any) => (
                                      <TableRow key={commission.id}>
                                        <TableCell>
                                          {commission.createdAt ? 
                                            format(new Date(commission.createdAt), "d 'de' MMMM, yyyy", { locale: es }) : 
                                            "Fecha no disponible"
                                          }
                                        </TableCell>
                                        <TableCell>
                                          <div className="font-medium">
                                            {commission.laboratory?.name || "Laboratorio no especificado"}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div>
                                            {commission.tests && commission.tests.length > 0 ? (
                                              <ul className="list-disc list-inside text-sm">
                                                {commission.tests.slice(0, 2).map((test: any, idx: number) => (
                                                  <li key={idx}>
                                                    {test.name}
                                                  </li>
                                                ))}
                                                {commission.tests.length > 2 && (
                                                  <li>Y {commission.tests.length - 2} más...</li>
                                                )}
                                              </ul>
                                            ) : (
                                              <span className="text-muted-foreground">
                                                Sin estudios registrados
                                              </span>
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            commission.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            commission.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {commission.status === 'completed' ? 'Completado' :
                                             commission.status === 'pending' ? 'Pendiente' :
                                             commission.status === 'cancelled' ? 'Cancelado' :
                                             commission.status}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end space-x-2">
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Button size="icon" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>Ver detalles</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                            
                                            {commission.status === 'completed' && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                      <FileText className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>Ver resultados</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            
                                            {commission.status === 'pending' && (
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                  <DropdownMenuItem>
                                                    Editar solicitud
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem className="text-destructive">
                                                    Cancelar solicitud
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                              <p className="mb-2">No hay solicitudes de laboratorio</p>
                              <p className="text-sm">Genere una nueva solicitud para este paciente</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Seleccione un paciente</h3>
                <p className="text-muted-foreground max-w-md">
                  Seleccione un paciente del panel izquierdo para ver o crear su expediente clínico.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}