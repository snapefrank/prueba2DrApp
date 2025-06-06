import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import DoctorLayout from '@/layouts/DoctorLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Download,
  Edit,
  FileText,
  FilePlus,
  Printer,
  User,
  Clipboard,
  Stethoscope,
  HeartPulse,
  BarChart,
  Pill,
  FileCheck,
  Clock,
  LucideIcon
} from 'lucide-react';

interface VitalSigns {
  temperature?: number;
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number | null;
  personalHistory: string | null;
  familyHistory: string | null;
  surgicalHistory: string | null;
  allergies: string | null;
  medications: string | null;
  physicalExamination: string | null;
  vitalSigns: VitalSigns | null;
  height: number | null;
  weight: number | null;
  bodyMassIndex: number | null;
  labResults: any | null;
  imagingResults: any | null;
  diagnosis: string;
  diagnosticProcedures: string | null;
  differentialDiagnosis: string | null;
  treatment: string | null;
  prescription: string | null;
  medicalIndications: string | null;
  clinicalEvolution: string | null;
  followUpPlan: string | null;
  prognosis: string | null;
  notes: string | null;
  aiAssisted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  userType: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  userType: string;
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
  documentType: string;
  category: string | null;
  uploadedAt: string;
}

// Componente para mostrar pares de clave-valor
const DataItem = ({ 
  label, 
  value, 
  icon: Icon,
  className = ""
}: { 
  label: string; 
  value: string | number | null | undefined; 
  icon?: LucideIcon;
  className?: string;
}) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        {label}
      </div>
      <div className="text-sm whitespace-pre-line">{value}</div>
    </div>
  );
};

export default function ExpedienteDetallePage() {
  const { id } = useParams();
  const recordId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('resumen');

  // Consulta para obtener detalles del expediente médico
  const { data: record, isLoading } = useQuery({
    queryKey: ['/api/medical-records', recordId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/medical-records/${recordId}`);
      return await res.json();
    },
    enabled: !isNaN(recordId),
  });

  // Consulta para obtener información del paciente
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['/api/users', record?.patientId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/users/${record.patientId}`);
      return await res.json();
    },
    enabled: !!record?.patientId,
  });

  // Consulta para obtener información del médico
  const { data: doctor, isLoading: isLoadingDoctor } = useQuery({
    queryKey: ['/api/users', record?.doctorId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/users/${record.doctorId}`);
      return await res.json();
    },
    enabled: !!record?.doctorId,
  });

  // Consulta para obtener documentos asociados al expediente
  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/medical-records/documents', recordId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/medical-records/${recordId}/documents`);
      return await res.json();
    },
    enabled: !isNaN(recordId),
  });

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Manejar impresión
  const handlePrint = () => {
    window.print();
  };

  // Componente de carga
  if (isLoading || isLoadingPatient || isLoadingDoctor) {
    return (
      <DoctorLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <Skeleton className="h-[200px] xl:col-span-1" />
            <Skeleton className="h-[600px] xl:col-span-3" />
          </div>
        </div>
      </DoctorLayout>
    );
  }

  if (!record) {
    return (
      <DoctorLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Expediente no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            El expediente que estás buscando no existe o no tienes permisos para verlo.
          </p>
          <Button onClick={() => navigate('/dashboard/doctor/expedientes')}>
            Volver a expedientes
          </Button>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/doctor/expedientes')}
              className="print:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                Nota médica: {record.diagnosis.split(',')[0]}
              </h1>
              <p className="text-muted-foreground">
                {patient && `${patient.firstName} ${patient.lastName}`} - {formatDate(record.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Función para descargar en PDF */}}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/dashboard/doctor/expedientes/nota-medica?recordId=${record.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Panel lateral con información del paciente */}
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2" />
                Información del paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient && (
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-2 overflow-hidden">
                    {patient.profileImage ? (
                      <img
                        src={patient.profileImage}
                        alt={`${patient.firstName} ${patient.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-medium text-center">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    {patient.email}
                  </p>
                </div>
              )}

              <Separator />

              <h3 className="font-medium">Datos de la nota</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de creación:</span>
                  <span>{formatDate(record.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última actualización:</span>
                  <span>{formatDate(record.updatedAt)}</span>
                </div>
                {doctor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Médico:</span>
                    <span>Dr. {doctor.firstName} {doctor.lastName}</span>
                  </div>
                )}
                {record.appointmentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID de consulta:</span>
                    <span>{record.appointmentId}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium mb-2">Signos vitales</h3>
                {record.vitalSigns && (
                  <div className="space-y-1 text-sm">
                    {record.vitalSigns.temperature && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperatura:</span>
                        <span>{record.vitalSigns.temperature} °C</span>
                      </div>
                    )}
                    {record.vitalSigns.bloodPressure && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Presión arterial:</span>
                        <span>{record.vitalSigns.bloodPressure} mmHg</span>
                      </div>
                    )}
                    {record.vitalSigns.heartRate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">F. cardiaca:</span>
                        <span>{record.vitalSigns.heartRate} lpm</span>
                      </div>
                    )}
                    {record.vitalSigns.respiratoryRate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">F. respiratoria:</span>
                        <span>{record.vitalSigns.respiratoryRate} rpm</span>
                      </div>
                    )}
                    {record.vitalSigns.oxygenSaturation && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sat. O2:</span>
                        <span>{record.vitalSigns.oxygenSaturation}%</span>
                      </div>
                    )}
                  </div>
                )}

                {(record.height || record.weight || record.bodyMassIndex) && (
                  <>
                    <h3 className="font-medium mb-2 mt-4">Somatometría</h3>
                    <div className="space-y-1 text-sm">
                      {record.height && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estatura:</span>
                          <span>{record.height} cm</span>
                        </div>
                      )}
                      {record.weight && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Peso:</span>
                          <span>{record.weight} kg</span>
                        </div>
                      )}
                      {record.bodyMassIndex && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IMC:</span>
                          <span>{record.bodyMassIndex} kg/m²</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contenido principal */}
          <div className="xl:col-span-3 space-y-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="print:hidden">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="resumen">Resumen</TabsTrigger>
                <TabsTrigger value="historial">Historial</TabsTrigger>
                <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              {/* Pestaña de Resumen */}
              <TabsContent value="resumen">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Resumen de la nota médica
                    </CardTitle>
                    <CardDescription>
                      Información general de la consulta y diagnóstico
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-lg bg-muted/50 p-4 border">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Clipboard className="h-4 w-4 mr-2" />
                        Diagnóstico
                      </h3>
                      <p className="whitespace-pre-line">{record.diagnosis}</p>
                    </div>

                    {record.treatment && (
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <Pill className="h-4 w-4 mr-2" />
                          Tratamiento
                        </h3>
                        <p className="whitespace-pre-line">{record.treatment}</p>
                      </div>
                    )}

                    {record.followUpPlan && (
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Plan de seguimiento
                        </h3>
                        <p className="whitespace-pre-line">{record.followUpPlan}</p>
                      </div>
                    )}

                    {record.medicalIndications && (
                      <div>
                        <h3 className="font-medium mb-2 flex items-center">
                          <FileCheck className="h-4 w-4 mr-2" />
                          Indicaciones médicas
                        </h3>
                        <p className="whitespace-pre-line">{record.medicalIndications}</p>
                      </div>
                    )}

                    {record.notes && (
                      <div>
                        <h3 className="font-medium mb-2">Notas adicionales</h3>
                        <p className="whitespace-pre-line">{record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Historial */}
              <TabsContent value="historial">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clipboard className="h-5 w-5 mr-2" />
                      Historial y antecedentes
                    </CardTitle>
                    <CardDescription>
                      Antecedentes médicos y exploración física
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Antecedentes</h3>
                        <DataItem
                          label="Antecedentes personales patológicos"
                          value={record.personalHistory}
                          icon={Clock}
                        />
                        <DataItem
                          label="Antecedentes familiares"
                          value={record.familyHistory}
                          icon={User}
                        />
                        <DataItem
                          label="Antecedentes quirúrgicos"
                          value={record.surgicalHistory}
                        />
                        <DataItem
                          label="Alergias"
                          value={record.allergies}
                          icon={AlertCircle}
                        />
                        <DataItem
                          label="Medicamentos"
                          value={record.medications}
                          icon={Pill}
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Exploración física</h3>
                        <DataItem
                          label="Exploración física"
                          value={record.physicalExamination}
                          icon={Stethoscope}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Diagnóstico */}
              <TabsContent value="diagnostico">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HeartPulse className="h-5 w-5 mr-2" />
                      Diagnóstico y tratamiento
                    </CardTitle>
                    <CardDescription>
                      Diagnóstico, tratamiento y evolución
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Diagnóstico</h3>
                        <DataItem
                          label="Diagnóstico principal"
                          value={record.diagnosis}
                          icon={Clipboard}
                        />
                        <DataItem
                          label="Diagnósticos diferenciales"
                          value={record.differentialDiagnosis}
                        />
                        <DataItem
                          label="Procedimientos diagnósticos"
                          value={record.diagnosticProcedures}
                          icon={Stethoscope}
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Tratamiento y evolución</h3>
                        <DataItem
                          label="Tratamiento"
                          value={record.treatment}
                          icon={Pill}
                        />
                        <DataItem
                          label="Prescripción médica"
                          value={record.prescription}
                          icon={FileText}
                        />
                        <DataItem
                          label="Indicaciones médicas"
                          value={record.medicalIndications}
                          icon={FileCheck}
                        />
                        <DataItem
                          label="Evolución clínica"
                          value={record.clinicalEvolution}
                          icon={BarChart}
                        />
                        <DataItem
                          label="Plan de seguimiento"
                          value={record.followUpPlan}
                          icon={Calendar}
                        />
                        <DataItem
                          label="Pronóstico"
                          value={record.prognosis}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Documentos */}
              <TabsContent value="documentos">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FilePlus className="h-5 w-5 mr-2" />
                      Documentos asociados
                    </CardTitle>
                    <CardDescription>
                      Archivos y estudios relacionados con la nota médica
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDocuments ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : documents && documents.length > 0 ? (
                      <div className="space-y-4">
                        {documents.map((doc: PatientDocument) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                            onClick={() => window.open(doc.fileUrl, '_blank')}
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-6 w-6 text-primary" />
                              <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(doc.uploadedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {doc.documentType}
                              </Badge>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
                        <p className="text-muted-foreground mb-6">
                          No se han subido documentos asociados a esta nota médica.
                        </p>
                        <Button onClick={() => {/* Implementar subida de documentos */}}>
                          <FilePlus className="h-4 w-4 mr-2" />
                          Subir documento
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Versión imprimible */}
            <div className="hidden print:block space-y-8">
              <div className="text-center py-4 border-b">
                <h1 className="text-xl font-bold">NOTA MÉDICA</h1>
                <p className="text-sm">
                  {patient && `${patient.firstName} ${patient.lastName}`} - {formatDate(record.createdAt)}
                </p>
                <p className="text-sm">
                  {doctor && `Dr. ${doctor.firstName} ${doctor.lastName}`}
                </p>
              </div>
              
              <div>
                <h2 className="text-lg font-bold mb-2">1. DIAGNÓSTICO</h2>
                <p className="whitespace-pre-line mb-4">{record.diagnosis}</p>
                
                {record.treatment && (
                  <>
                    <h2 className="text-lg font-bold mb-2">2. TRATAMIENTO</h2>
                    <p className="whitespace-pre-line mb-4">{record.treatment}</p>
                  </>
                )}
                
                {record.medicalIndications && (
                  <>
                    <h2 className="text-lg font-bold mb-2">3. INDICACIONES MÉDICAS</h2>
                    <p className="whitespace-pre-line mb-4">{record.medicalIndications}</p>
                  </>
                )}
                
                {record.followUpPlan && (
                  <>
                    <h2 className="text-lg font-bold mb-2">4. PLAN DE SEGUIMIENTO</h2>
                    <p className="whitespace-pre-line mb-4">{record.followUpPlan}</p>
                  </>
                )}
                
                <h2 className="text-lg font-bold mb-2">5. SIGNOS VITALES</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {record.vitalSigns?.temperature && (
                    <p>Temperatura: {record.vitalSigns.temperature} °C</p>
                  )}
                  {record.vitalSigns?.bloodPressure && (
                    <p>Presión arterial: {record.vitalSigns.bloodPressure} mmHg</p>
                  )}
                  {record.vitalSigns?.heartRate && (
                    <p>Frecuencia cardiaca: {record.vitalSigns.heartRate} lpm</p>
                  )}
                  {record.vitalSigns?.respiratoryRate && (
                    <p>Frecuencia respiratoria: {record.vitalSigns.respiratoryRate} rpm</p>
                  )}
                  {record.vitalSigns?.oxygenSaturation && (
                    <p>Saturación O2: {record.vitalSigns.oxygenSaturation}%</p>
                  )}
                  {record.height && (
                    <p>Estatura: {record.height} cm</p>
                  )}
                  {record.weight && (
                    <p>Peso: {record.weight} kg</p>
                  )}
                  {record.bodyMassIndex && (
                    <p>IMC: {record.bodyMassIndex} kg/m²</p>
                  )}
                </div>
                
                <div className="mt-12 pt-8 border-t text-center">
                  <p className="font-bold">Firma del médico</p>
                  <p>{doctor && `Dr. ${doctor.firstName} ${doctor.lastName}`}</p>
                  <p className="text-sm">Cédula profesional: {doctor?.licenseNumber || "[Cédula profesional]"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}