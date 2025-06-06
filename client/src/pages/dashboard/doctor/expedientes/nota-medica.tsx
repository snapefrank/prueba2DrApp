import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import DoctorLayout from '@/layouts/DoctorLayout';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
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
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  ArrowLeft, 
  Clipboard, 
  FileText, 
  FilePlus2, 
  Stethoscope, 
  User, 
  BarChart, 
  FileCheck,
  CheckCircle2
} from 'lucide-react';

// Tipo para los registros médicos
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
  vitalSigns: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  } | null;
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

// Tipo para los pacientes
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
}

// Esquema de validación para el formulario
const formSchema = z.object({
  patientId: z.number({
    required_error: "Por favor seleccione un paciente",
  }),
  appointmentId: z.number().optional().nullable(),
  personalHistory: z.string().optional().nullable(),
  familyHistory: z.string().optional().nullable(),
  surgicalHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  physicalExamination: z.string().optional().nullable(),
  temperature: z.string().optional().nullable(),
  bloodPressure: z.string().optional().nullable(),
  heartRate: z.string().optional().nullable(),
  respiratoryRate: z.string().optional().nullable(),
  oxygenSaturation: z.string().optional().nullable(),
  height: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  diagnosis: z.string({
    required_error: "El diagnóstico es obligatorio",
  }),
  diagnosticProcedures: z.string().optional().nullable(),
  differentialDiagnosis: z.string().optional().nullable(),
  treatment: z.string().optional().nullable(),
  prescription: z.string().optional().nullable(),
  medicalIndications: z.string().optional().nullable(),
  clinicalEvolution: z.string().optional().nullable(),
  followUpPlan: z.string().optional().nullable(),
  prognosis: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NotaMedicaPage() {
  const { id: recordId } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('interrogatorio');
  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);
  const [isNew, setIsNew] = useState(true);

  // Consultar información del paciente desde la URL si viene incluida
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const patientIdFromUrl = searchParams.get('patientId') ? Number(searchParams.get('patientId')) : undefined;
  const appointmentIdFromUrl = searchParams.get('appointmentId') ? Number(searchParams.get('appointmentId')) : undefined;

  // Consulta para obtener pacientes del doctor
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/doctor/patients'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/doctor/patients');
      return await res.json();
    },
    enabled: !!user?.id && user.userType === 'doctor',
  });

  // Consulta para obtener detalles del expediente si estamos editando
  const { data: recordDetails, isLoading: isLoadingRecord } = useQuery({
    queryKey: ['/api/medical-records', recordId],
    queryFn: async () => {
      if (!recordId) return null;
      const res = await apiRequest('GET', `/api/medical-records/${recordId}`);
      return await res.json();
    },
    enabled: !!recordId,
    onSuccess: (data) => {
      if (data) {
        setIsNew(false);
      }
    },
  });

  // Formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: patientIdFromUrl || 0,
      appointmentId: appointmentIdFromUrl || null,
      personalHistory: '',
      familyHistory: '',
      surgicalHistory: '',
      allergies: '',
      medications: '',
      physicalExamination: '',
      temperature: '',
      bloodPressure: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      height: '',
      weight: '',
      diagnosis: '',
      diagnosticProcedures: '',
      differentialDiagnosis: '',
      treatment: '',
      prescription: '',
      medicalIndications: '',
      clinicalEvolution: '',
      followUpPlan: '',
      prognosis: '',
      notes: '',
    },
  });

  // Actualizar el formulario cuando se cargan los detalles del expediente
  useEffect(() => {
    if (recordDetails) {
      form.reset({
        patientId: recordDetails.patientId,
        appointmentId: recordDetails.appointmentId,
        personalHistory: recordDetails.personalHistory || '',
        familyHistory: recordDetails.familyHistory || '',
        surgicalHistory: recordDetails.surgicalHistory || '',
        allergies: recordDetails.allergies || '',
        medications: recordDetails.medications || '',
        physicalExamination: recordDetails.physicalExamination || '',
        temperature: recordDetails.vitalSigns?.temperature?.toString() || '',
        bloodPressure: recordDetails.vitalSigns?.bloodPressure || '',
        heartRate: recordDetails.vitalSigns?.heartRate?.toString() || '',
        respiratoryRate: recordDetails.vitalSigns?.respiratoryRate?.toString() || '',
        oxygenSaturation: recordDetails.vitalSigns?.oxygenSaturation?.toString() || '',
        height: recordDetails.height?.toString() || '',
        weight: recordDetails.weight?.toString() || '',
        diagnosis: recordDetails.diagnosis || '',
        diagnosticProcedures: recordDetails.diagnosticProcedures || '',
        differentialDiagnosis: recordDetails.differentialDiagnosis || '',
        treatment: recordDetails.treatment || '',
        prescription: recordDetails.prescription || '',
        medicalIndications: recordDetails.medicalIndications || '',
        clinicalEvolution: recordDetails.clinicalEvolution || '',
        followUpPlan: recordDetails.followUpPlan || '',
        prognosis: recordDetails.prognosis || '',
        notes: recordDetails.notes || '',
      });

      if (recordDetails.bodyMassIndex) {
        setCalculatedBMI(recordDetails.bodyMassIndex);
      }
    }
  }, [recordDetails, form]);

  // Actualizar IMC cuando cambia altura o peso
  useEffect(() => {
    const height = parseFloat(form.watch('height'));
    const weight = parseFloat(form.watch('weight'));

    if (height && weight && height > 0) {
      // Altura en metros (convertir de cm)
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      setCalculatedBMI(parseFloat(bmi.toFixed(2)));
    } else {
      setCalculatedBMI(null);
    }
  }, [form.watch('height'), form.watch('weight')]);

  // Mutación para crear o actualizar expediente
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const endpoint = isNew
        ? '/api/medical-records'
        : `/api/medical-records/${recordId}`;
      
      const method = isNew ? 'POST' : 'PATCH';
      
      // Preparar datos para el envío
      const submitData = {
        ...values,
        doctorId: user?.id,
        vitalSigns: {
          temperature: values.temperature ? parseFloat(values.temperature) : null,
          bloodPressure: values.bloodPressure || null,
          heartRate: values.heartRate ? parseFloat(values.heartRate) : null,
          respiratoryRate: values.respiratoryRate ? parseFloat(values.respiratoryRate) : null,
          oxygenSaturation: values.oxygenSaturation ? parseFloat(values.oxygenSaturation) : null,
        },
        height: values.height ? parseFloat(values.height) : null,
        weight: values.weight ? parseFloat(values.weight) : null,
        bodyMassIndex: calculatedBMI,
      };

      // Eliminar campos individuales de signos vitales
      delete submitData.temperature;
      delete submitData.bloodPressure;
      delete submitData.heartRate;
      delete submitData.respiratoryRate;
      delete submitData.oxygenSaturation;

      const res = await apiRequest(method, endpoint, submitData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: isNew ? 'Nota médica creada' : 'Nota médica actualizada',
        description: 'La información se ha guardado correctamente.',
      });
      
      // Invalidar consultas para actualizar la lista de expedientes
      queryClient.invalidateQueries({ queryKey: ['/api/patients/medical-records'] });
      
      // Redirigir a la página de expedientes
      navigate('/dashboard/doctor/expedientes');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la información.',
        variant: 'destructive',
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const isLoading = isLoadingPatients || isLoadingRecord || mutation.isPending;

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/doctor/expedientes')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isNew ? 'Nueva nota médica' : 'Editar nota médica'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/doctor/expedientes')}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : 'Guardar nota médica'}
            </Button>
          </div>
        </div>

        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Nota médica basada en NOM-004-SSA3-2012</AlertTitle>
          <AlertDescription>
            Complete los campos requeridos según la Norma Oficial Mexicana del Expediente Clínico.
            Solo el campo de diagnóstico es obligatorio.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Selección de paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Información del paciente
                </CardTitle>
                <CardDescription>
                  Seleccione el paciente para esta nota médica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente</FormLabel>
                      <Select
                        disabled={!isNew || isLoading}
                        value={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un paciente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients?.map((patient: Patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.firstName} {patient.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contenido principal organizado en pestañas */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="interrogatorio">Interrogatorio</TabsTrigger>
                <TabsTrigger value="examen-fisico">Examen físico</TabsTrigger>
                <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
                <TabsTrigger value="tratamiento">Tratamiento</TabsTrigger>
              </TabsList>

              {/* Pestaña de Interrogatorio y Antecedentes */}
              <TabsContent value="interrogatorio">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clipboard className="mr-2 h-5 w-5" />
                      Antecedentes médicos
                    </CardTitle>
                    <CardDescription>
                      Registre los antecedentes médicos relevantes del paciente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="personalHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Antecedentes personales patológicos</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enfermedades, cirugías, hospitalizaciones previas..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Incluya enfermedades crónicas, hospitalizaciones previas y tratamientos actuales.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="familyHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Antecedentes familiares</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enfermedades hereditarias, padecimientos en familiares directos..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Registre antecedentes de padecimientos en familiares directos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="surgicalHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Antecedentes quirúrgicos</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Cirugías previas, fechas, complicaciones..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alergias y reacciones adversas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Alergias a medicamentos, alimentos, otras sustancias..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicamentos actuales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Medicamentos, dosis, frecuencia..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Examen Físico */}
              <TabsContent value="examen-fisico">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Stethoscope className="mr-2 h-5 w-5" />
                      Exploración física
                    </CardTitle>
                    <CardDescription>
                      Registre los datos de la exploración física del paciente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="physicalExamination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exploración física completa</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Hallazgos en la exploración física..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Describa aspectos relevantes de la exploración por aparatos y sistemas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-4" />
                    
                    <h3 className="text-md font-medium mb-2 flex items-center">
                      <BarChart className="mr-2 h-4 w-4" />
                      Signos vitales
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperatura (°C)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                placeholder="36.5" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bloodPressure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Presión arterial (mmHg)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="120/80" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="heartRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frecuencia cardiaca (lpm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="80" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="respiratoryRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frecuencia respiratoria (rpm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="16" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="oxygenSaturation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Saturación de oxígeno (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="98" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />
                    
                    <h3 className="text-md font-medium mb-2">Somatometría</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estatura (cm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                placeholder="170" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                placeholder="70" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <FormLabel>IMC (kg/m²)</FormLabel>
                        <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                          {calculatedBMI || '-'}
                        </div>
                        {calculatedBMI && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {calculatedBMI < 18.5
                              ? 'Bajo peso'
                              : calculatedBMI < 25
                              ? 'Peso normal'
                              : calculatedBMI < 30
                              ? 'Sobrepeso'
                              : 'Obesidad'}
                          </p>
                        )}
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
                      <FileText className="mr-2 h-5 w-5" />
                      Diagnóstico
                    </CardTitle>
                    <CardDescription>
                      Registre el diagnóstico y hallazgos clínicos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Diagnóstico(s) <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Diagnóstico principal y secundarios..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Incluya diagnóstico principal y diagnósticos secundarios.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="differentialDiagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnósticos diferenciales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Otros diagnósticos considerados..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="diagnosticProcedures"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Procedimientos diagnósticos realizados</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Procedimientos, análisis, pruebas diagnósticas..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pestaña de Tratamiento */}
              <TabsContent value="tratamiento">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FilePlus2 className="mr-2 h-5 w-5" />
                      Tratamiento y plan
                    </CardTitle>
                    <CardDescription>
                      Registre el tratamiento, indicaciones y recomendaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="treatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tratamiento general</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tratamiento indicado..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Describa el tratamiento general indicado.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prescripción médica</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Medicamentos, dosis, duración..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Detalle los medicamentos prescritos con dosis, vía de administración y duración.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medicalIndications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Indicaciones médicas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Indicaciones adicionales, cuidados, dieta..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Incluya recomendaciones sobre dieta, actividad física, reposo, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clinicalEvolution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evolución clínica</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Registro de evolución..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="followUpPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan de seguimiento</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Próximas revisiones, estudios adicionales..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prognosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pronóstico</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Pronóstico del paciente..."
                              className="min-h-[100px]"
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
                          <FormLabel>Notas adicionales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Información complementaria..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Incluya cualquier observación adicional relevante.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/doctor/expedientes')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Guardar nota médica
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DoctorLayout>
  );
}