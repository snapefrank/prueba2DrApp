import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Pill,
  FileWarning,
  AlertTriangle,
  Calendar,
  Loader2,
  Info
} from "lucide-react";
import { format, addMonths } from "date-fns";
import { es } from "date-fns/locale";

import DoctorLayout from "@/layouts/DoctorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Interfaces
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dob: string;
  profileImage?: string;
  allergies?: string[];
}

interface Medication {
  id: number;
  name: string;
  activeIngredient: string;
  presentation: string;
  contraindications?: string[];
}

interface DoctorProfile {
  id?: number;
  userId?: number;
  specialty?: string;
  licenseNumber?: string;
  officeAddress?: string;
  biography?: string;
  education?: string;
  experience?: string;
  languages?: string[];
  acceptsNewPatients?: boolean;
  consultationFee?: number;
  profileImage?: string;
}

// Esquema de validación para el formulario
const prescriptionSchema = z.object({
  patientId: z.number().min(1, "Debe seleccionar un paciente"),
  expiresAt: z.date().min(new Date(), "La fecha de expiración debe ser futura"),
  diagnosis: z.string().min(5, "El diagnóstico es obligatorio"),
  notes: z.string().optional(),
  doctorOfficeAddress: z.string().min(1, "La dirección del consultorio es obligatoria"),
  doctorLicense: z.string().min(1, "La cédula profesional es obligatoria"), 
  doctorSpecialty: z.string().min(1, "La especialidad médica es obligatoria"),
  medications: z.array(
    z.object({
      medicationId: z.number().min(1, "Debe seleccionar un medicamento"),
      dosage: z.string().min(1, "La dosis es obligatoria"),
      frequency: z.string().min(1, "La frecuencia es obligatoria"),
      duration: z.string().min(1, "La duración es obligatoria"),
      instructions: z.string().min(1, "Las instrucciones son obligatorias"),
      // Campos adicionales para medicamentos COFEPRIS - hacerlos opcionales por ahora
      genericName: z.string().optional(),
      commercialName: z.string().optional(),
      presentation: z.string().optional(),
      standardDosage: z.string().optional(),
    })
  ).min(1, "Debe agregar al menos un medicamento"),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

export default function NewPrescriptionPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAllergiesWarning, setShowAllergiesWarning] = useState(false);
  const [allergicMedications, setAllergicMedications] = useState<string[]>([]);
  const [showLicenseWarning, setShowLicenseWarning] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  
  // Extraer patientId de la URL si existe
  const urlParams = new URLSearchParams(window.location.search);
  const patientIdFromUrl = urlParams.get("patientId");
  
  // Cargar pacientes
  const { data: patients, isLoading: isLoadingPatients } = useQuery<Patient[]>({
    queryKey: ["/api/doctor/patients"],
    // Procesamos la respuesta para asegurar que sea un array
    select: (data) => {
      // Si data no es un array, devolvemos array vacío para prevenir errores
      if (!Array.isArray(data)) {
        console.warn('La API de pacientes no devolvió un array válido');
        return [] as Patient[];
      }
      return data;
    }
  });
  
  // Cargar medicamentos (limitados a 10 para mejor rendimiento)
  const { data: medications, isLoading: isLoadingMedications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/medications?limit=10', { signal });
      if (!response.ok) {
        throw new Error('Error al cargar medicamentos');
      }
      return response.json();
    },
    // Procesamos la respuesta para asegurar que sea un array
    select: (data) => {
      // Si data no es un array, devolvemos array vacío para prevenir errores
      if (!Array.isArray(data)) {
        console.warn('La API de medicamentos no devolvió un array válido');
        return [] as Medication[];
      }
      return data;
    }
  });
  
  // Cargar información del médico y del usuario actual (para nombre del médico)
  const { data: userData } = useQuery({
    queryKey: ["/api/user"],
  });
  
  // Cargar información del médico
  const { data: doctorProfile, isLoading: isLoadingDoctorProfile, error: doctorProfileError } = useQuery<DoctorProfile>({
    queryKey: ["/api/doctor-profile"],
    select: (data) => {
      return data || {} as DoctorProfile;
    },
    // No fallar si hay un error al cargar el perfil
    retry: 1,
    retryDelay: 1000
  });

  // Form para crear receta
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: patientIdFromUrl ? parseInt(patientIdFromUrl) : 0,
      expiresAt: addMonths(new Date(), 1),
      diagnosis: "",
      notes: "",
      doctorOfficeAddress: "",
      doctorLicense: "",
      doctorSpecialty: "",
      medications: [
        {
          medicationId: 0,
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
          genericName: "",
          commercialName: "",
          presentation: "",
          standardDosage: ""
        },
      ],
    },
  });
  
  // Field array para medicamentos
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });
  
  // Mutation para crear receta
  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: PrescriptionFormValues) => {
      const res = await apiRequest("POST", "/api/doctor/prescriptions", data);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Receta creada",
        description: "La receta ha sido creada exitosamente.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/prescriptions"] });
      // Corregir la ruta para redireccionar correctamente con sidebar visible
      navigate("/dashboard/doctor/recetas");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear receta",
        description: error.message || "No se pudo crear la receta. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });
  
  // Cargar paciente por ID al iniciar
  useEffect(() => {
    if (patientIdFromUrl && patients?.length) {
      const patient = patients.find(p => p.id === parseInt(patientIdFromUrl));
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [patientIdFromUrl, patients]);
  
  // Actualizar campos del formulario cuando se carga el perfil médico y usuario
  useEffect(() => {
    if (doctorProfile) {
      try {
        // Validamos primero que doctorProfile sea un objeto válido con las propiedades que necesitamos
        const profile = doctorProfile as any; // Conversión temporal para evitar errores de tipado
        
        // Solo actualizamos si hay datos válidos
        if (profile.officeAddress || profile.address) {
          form.setValue("doctorOfficeAddress", profile.officeAddress || profile.address || "");
        }
        
        if (profile.licenseNumber) {
          form.setValue("doctorLicense", profile.licenseNumber);
        }
        
        if (profile.specialtyName || profile.specialty) {
          form.setValue("doctorSpecialty", profile.specialtyName || profile.specialty || "");
        }
        
        // Si la licencia no está verificada, mostrar advertencia
        if (profile.licenseVerified === false) {
          setShowLicenseWarning(true);
          toast({
            title: "Cédula profesional no verificada",
            description: "Su cédula profesional aún no ha sido verificada. Las recetas emitidas podrían no ser válidas.",
            variant: "destructive",
          });
        }
        
        // Guardar nombre del médico para la receta
        if (profile.fullName) {
          setDoctorName(profile.fullName);
        } else if (userData && typeof userData === 'object') {
          const user = userData as any; // Conversión temporal para acceder a propiedades
          setDoctorName(`${user.firstName || ''} ${user.lastName || ''}`);
        }
      } catch (error) {
        console.warn('Error al actualizar campos del perfil médico:', error);
      }
    }
  }, [doctorProfile, userData, form, toast]);
  
  // Filtrar pacientes basados en término de búsqueda
  const filteredPatients = patients
    ? patients.filter((patient) =>
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(patientSearchTerm.toLowerCase())
      )
    : [];
  
  // Verificar alergias al cambiar medicamentos
  const checkAllergies = () => {
    if (!selectedPatient?.allergies?.length) return false;
    
    const allergyWarnings: string[] = [];
    
    form.getValues().medications.forEach((med) => {
      if (med.medicationId) {
        const medication = medications?.find(m => m.id === med.medicationId);
        if (medication) {
          selectedPatient.allergies?.forEach(allergy => {
            // Verificar si el medicamento contiene el alérgeno
            if (
              medication.name.toLowerCase().includes(allergy.toLowerCase()) ||
              medication.activeIngredient.toLowerCase().includes(allergy.toLowerCase()) ||
              medication.contraindications?.some(c => 
                c.toLowerCase().includes(allergy.toLowerCase())
              )
            ) {
              allergyWarnings.push(`${medication.name} (${allergy})`);
            }
          });
        }
      }
    });
    
    if (allergyWarnings.length > 0) {
      setAllergicMedications(allergyWarnings);
      setShowAllergiesWarning(true);
      return true;
    }
    
    return false;
  };
  
  // Submit del formulario
  function onSubmit(data: PrescriptionFormValues) {
    // Verificar alergias al enviar
    if (checkAllergies()) {
      return; // No continuar si hay alergias
    }
    
    // Verificar si la licencia está verificada
    const profile = doctorProfile as any; // Conversión temporal para evitar errores de tipado
    if (profile?.licenseVerified === false) {
      setShowLicenseWarning(true);
      return;
    }
    
    // Si todo está bien, crear la receta
    createPrescriptionMutation.mutate(data);
  }
  
  // Seleccionar un paciente
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    form.setValue("patientId", patient.id);
    setShowPatientSearch(false);
  };
  
  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard/doctor/recetas")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Nueva receta médica</h1>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Selección de paciente */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Información del paciente</h2>
                
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Paciente</FormLabel>
                      
                      {selectedPatient ? (
                        <div className="flex items-center space-x-4 border rounded-md p-3">
                          <Avatar>
                            {selectedPatient.profileImage ? (
                              <AvatarImage src={selectedPatient.profileImage} alt={selectedPatient.firstName} />
                            ) : (
                              <AvatarFallback>
                                {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                              {calculateAge(selectedPatient.dob)} años
                            </p>
                          </div>
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setShowPatientSearch(true)}
                          >
                            Cambiar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setShowPatientSearch(true)}
                        >
                          <Search className="mr-2 h-4 w-4" />
                          Buscar paciente
                        </Button>
                      )}
                      
                      <CommandDialog open={showPatientSearch} onOpenChange={setShowPatientSearch}>
                        <div className="p-4">
                          <div className="mb-4">
                            <h2 className="text-lg font-semibold">Seleccionar paciente</h2>
                            <p className="text-sm text-muted-foreground">
                              Busque y seleccione un paciente para la receta
                            </p>
                          </div>
                          <Input
                            placeholder="Buscar por nombre"
                            value={patientSearchTerm}
                            onChange={(e) => setPatientSearchTerm(e.target.value)}
                            className="mb-4"
                          />
                          <ScrollArea className="h-[300px]">
                            {isLoadingPatients ? (
                              <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : filteredPatients.length === 0 ? (
                              <div className="py-6 text-center">
                                <p className="text-muted-foreground">
                                  No se encontraron pacientes
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {filteredPatients.map((patient) => (
                                  <div
                                    key={patient.id}
                                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-accent cursor-pointer"
                                    onClick={() => handleSelectPatient(patient)}
                                  >
                                    <Avatar>
                                      {patient.profileImage ? (
                                        <AvatarImage src={patient.profileImage} alt={patient.firstName} />
                                      ) : (
                                        <AvatarFallback>
                                          {patient.firstName[0]}{patient.lastName[0]}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {calculateAge(patient.dob)} años
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </CommandDialog>
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {selectedPatient?.allergies && selectedPatient.allergies.length > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-center text-orange-700 mb-1">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="font-medium">Alergias conocidas</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      {selectedPatient.allergies.join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Diagnóstico y fecha */}
            {/* Información del médico */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Información del médico</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="doctorLicense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cédula profesional</FormLabel>
                        <FormControl>
                          {isLoadingDoctorProfile ? (
                            <div className="flex items-center h-10 px-4 border rounded-md">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                              <span className="text-muted-foreground text-sm">Cargando...</span>
                            </div>
                          ) : (
                            <Input
                              placeholder="Ingrese su cédula profesional"
                              {...field}
                            />
                          )}
                        </FormControl>
                        <FormDescription>
                          Número de cédula emitida por la DGP
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="doctorSpecialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidad médica</FormLabel>
                        <FormControl>
                          {isLoadingDoctorProfile ? (
                            <div className="flex items-center h-10 px-4 border rounded-md">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                              <span className="text-muted-foreground text-sm">Cargando...</span>
                            </div>
                          ) : (
                            <Input
                              placeholder="Ingrese su especialidad"
                              {...field}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="doctorOfficeAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Dirección del consultorio</FormLabel>
                        <FormControl>
                          {isLoadingDoctorProfile ? (
                            <div className="flex items-center h-20 px-4 border rounded-md">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                              <span className="text-muted-foreground text-sm">Cargando...</span>
                            </div>
                          ) : (
                            <Textarea
                              placeholder="Ingrese la dirección completa de su consultorio"
                              {...field}
                              rows={2}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Información de la receta */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Información de la receta</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnóstico</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ingrese el diagnóstico del paciente" 
                            {...field} 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de expiración</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Seleccione una fecha</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          La receta será válida hasta esta fecha
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Notas adicionales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Instrucciones o notas adicionales (opcional)" 
                            {...field} 
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Medicamentos */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Medicamentos</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      append({
                        medicationId: 0,
                        dosage: "",
                        frequency: "",
                        duration: "",
                        instructions: "",
                        genericName: "",
                        commercialName: "",
                        presentation: "",
                        standardDosage: ""
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar medicamento
                  </Button>
                </div>
                
                {fields.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Agregue medicamentos a la receta</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Medicamento {index + 1}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name={`medications.${index}.medicationId`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Medicamento</FormLabel>
                                <Select
                                  value={field.value ? field.value.toString() : ""}
                                  onValueChange={(value) => {
                                    field.onChange(parseInt(value));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccione un medicamento" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {isLoadingMedications ? (
                                      <div className="flex justify-center p-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      </div>
                                    ) : (
                                      medications?.map((medication) => (
                                        <SelectItem
                                          key={medication.id}
                                          value={medication.id.toString()}
                                        >
                                          {medication.name} - {medication.presentation}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medications.${index}.dosage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dosis</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej: 1 tableta" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medications.${index}.frequency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frecuencia</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej: Cada 8 horas" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medications.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duración</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej: 7 días" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medications.${index}.instructions`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Instrucciones</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Instrucciones específicas para este medicamento"
                                    {...field}
                                    rows={2}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {/* Campos adicionales COFEPRIS */}
                          <div className="md:col-span-2 mt-2 mb-1">
                            <div className="text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded-md mb-2 flex items-center">
                              <Info className="h-4 w-4 mr-2" />
                              Información obligatoria COFEPRIS
                            </div>
                          </div>
                          
                          <FormField
                            control={form.control}
                            name={`medications.${index}.genericName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre genérico</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nombre genérico" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medications.${index}.commercialName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre comercial</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nombre comercial" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medications.${index}.presentation`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Presentación</FormLabel>
                                <FormControl>
                                  <Input placeholder="Presentación" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`medications.${index}.standardDosage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dosis estándar</FormLabel>
                                <FormControl>
                                  <Input placeholder="Dosis estándar" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {form.formState.errors.medications?.root && (
                  <p className="text-sm font-medium text-destructive mt-4">
                    {form.formState.errors.medications.root.message}
                  </p>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/doctor/recetas")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPrescriptionMutation.isPending}
              >
                {createPrescriptionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear receta
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Alerta de alergias */}
        <AlertDialog open={showAllergiesWarning} onOpenChange={setShowAllergiesWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-red-600">
                <FileWarning className="h-5 w-5 mr-2" />
                Advertencia de alergias
              </AlertDialogTitle>
              <AlertDialogDescription>
                Se ha detectado que el paciente podría ser alérgico a los siguientes medicamentos:
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  {allergicMedications.map((med, index) => (
                    <li key={index} className="text-red-600 font-medium">{med}</li>
                  ))}
                </ul>
                <p className="mt-4">
                  ¿Está seguro de que desea continuar con estos medicamentos?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Revisar receta</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  setShowAllergiesWarning(false);
                  createPrescriptionMutation.mutate(form.getValues());
                }}
              >
                Continuar de todos modos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Diálogo para licencia no verificada */}
        <AlertDialog open={showLicenseWarning} onOpenChange={setShowLicenseWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-amber-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Cédula profesional no verificada
              </AlertDialogTitle>
              <AlertDialogDescription>
                <p className="my-2">
                  Su cédula profesional aún no ha sido verificada por el sistema. 
                  Las recetas generadas podrían no ser reconocidas por algunas instituciones.
                </p>
                <p className="my-2">
                  Para verificar su cédula profesional, por favor visite la 
                  sección de <strong>Verificación</strong> en su perfil médico y 
                  complete el proceso de validación.
                </p>
                <p className="mt-4 text-sm font-medium">
                  ¿Desea continuar con la generación de la receta a pesar de esta advertencia?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  setShowLicenseWarning(false);
                  createPrescriptionMutation.mutate(form.getValues());
                }}
              >
                Generar receta de todos modos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DoctorLayout>
  );
}

// Funciones de utilidad
function calculateAge(dobStr: string) {
  const dob = new Date(dobStr);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const isBirthdayPassed = 
    now.getMonth() > dob.getMonth() || 
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
  
  if (!isBirthdayPassed) {
    age--;
  }
  
  return age;
}