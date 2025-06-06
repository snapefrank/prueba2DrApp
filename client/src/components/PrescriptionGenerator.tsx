import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Components de shadcn
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Search, Trash } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Esquema de validación para la receta
const prescriptionSchema = z.object({
  patientId: z.number({
    required_error: "Se requiere seleccionar un paciente",
  }),
  diagnosis: z.string().min(1, "El diagnóstico es requerido"),
  instructions: z.string().min(1, "Las instrucciones son requeridas"),
  notes: z.string().optional(),
  medications: z.array(
    z.object({
      medicationId: z.number().optional(),
      name: z.string().min(1, "El nombre del medicamento es requerido"),
      dosage: z.string().min(1, "La dosis es requerida"),
      frequency: z.string().min(1, "La frecuencia es requerida"),
      duration: z.string().min(1, "La duración es requerida"),
    })
  ).min(1, "Debe agregar al menos un medicamento")
});

type Medication = {
  id: number;
  name: string;
  activeIngredient: string;
  concentration: string;
  pharmaceuticalForm: string;
  presentation: string;
  requiresPrescription: boolean;
  isControlled: boolean;
  controlledGroup?: string;
};

type Patient = {
  id: number;
  name: string;
  age?: number;
  gender?: string;
};

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

interface PrescriptionGeneratorProps {
  doctorId: number;
  patients?: Patient[];
  onPrescriptionSaved?: (prescriptionId: number) => void;
  editPrescriptionId?: number;
}

const PrescriptionGenerator = ({
  doctorId,
  patients = [],
  onPrescriptionSaved,
  editPrescriptionId
}: PrescriptionGeneratorProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Medication[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estado para manejar el PDF generado
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Recuperar datos de la receta si estamos en modo edición
  const { data: existingPrescription, isLoading: isLoadingPrescription } = useQuery({
    queryKey: ['/api/prescriptions', editPrescriptionId],
    queryFn: async () => {
      if (!editPrescriptionId) return null;
      const res = await apiRequest('GET', `/api/prescriptions/${editPrescriptionId}`);
      if (!res.ok) throw new Error('No se pudo obtener la receta');
      return await res.json();
    },
    enabled: !!editPrescriptionId,
  });
  
  // Configurar formulario con React Hook Form
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: 0,
      diagnosis: '',
      instructions: '',
      notes: '',
      medications: [
        { name: '', dosage: '', frequency: '', duration: '' }
      ]
    },
  });
  
  // Actualizar los valores del formulario cuando se carga una receta existente
  useEffect(() => {
    if (existingPrescription) {
      form.reset({
        patientId: existingPrescription.patientId,
        diagnosis: existingPrescription.diagnosis,
        instructions: existingPrescription.instructions,
        notes: existingPrescription.notes || '',
        medications: existingPrescription.medications || [
          { name: '', dosage: '', frequency: '', duration: '' }
        ]
      });
    }
  }, [existingPrescription, form]);
  
  // Función para buscar medicamentos
  const searchMedications = async () => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await apiRequest('GET', `/api/medications/search?term=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error('Error al buscar medicamentos');
      
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error buscando medicamentos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron buscar medicamentos',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Manejar la búsqueda cuando cambia el término de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 3) {
        searchMedications();
      }
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
  // Agregar un nuevo medicamento al formulario
  const addMedication = () => {
    const medications = form.getValues('medications');
    form.setValue('medications', [
      ...medications,
      { name: '', dosage: '', frequency: '', duration: '' }
    ]);
  };
  
  // Remover un medicamento del formulario
  const removeMedication = (index: number) => {
    const medications = form.getValues('medications');
    if (medications.length > 1) {
      form.setValue('medications', medications.filter((_, i) => i !== index));
    }
  };
  
  // Seleccionar un medicamento de los resultados de búsqueda
  const selectMedication = (medication: Medication, index: number) => {
    const medications = form.getValues('medications');
    medications[index] = {
      ...medications[index],
      medicationId: medication.id,
      name: medication.name
    };
    form.setValue('medications', medications);
    setSearchResults([]);
    setSearchTerm('');
  };
  
  // Mutación para guardar la receta
  const savePrescriptionMutation = useMutation({
    mutationFn: async (data: PrescriptionFormValues) => {
      const endpoint = editPrescriptionId 
        ? `/api/prescriptions/${editPrescriptionId}` 
        : '/api/prescriptions';
      
      const method = editPrescriptionId ? 'PUT' : 'POST';
      
      const res = await apiRequest(method, endpoint, {
        ...data,
        doctorId,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar la receta');
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Receta guardada',
        description: 'La receta ha sido guardada correctamente',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions'] });
      
      if (onPrescriptionSaved) {
        onPrescriptionSaved(data.id);
      }
      
      // Generar PDF
      generatePdf(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la receta',
        variant: 'destructive',
      });
    }
  });
  
  // Generar PDF de la receta
  const generatePdf = (prescription: any) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Encabezado
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('RECETA MÉDICA', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Datos del médico
      doc.text(`Dr. ${prescription.doctor.name}`, 20, 35);
      doc.text(`Cédula Profesional: ${prescription.doctorProfile?.licenseNumber || 'No disponible'}`, 20, 42);
      doc.text(`Especialidad: ${prescription.doctorProfile?.specialty?.name || 'Médico General'}`, 20, 49);
      
      // Fecha y folio
      const today = new Date().toLocaleDateString('es-MX');
      doc.text(`Fecha: ${today}`, pageWidth - 20, 35, { align: 'right' });
      doc.text(`Folio: ${prescription.id}`, pageWidth - 20, 42, { align: 'right' });
      
      // Línea separadora
      doc.setLineWidth(0.5);
      doc.line(20, 55, pageWidth - 20, 55);
      
      // Datos del paciente
      doc.text(`Paciente: ${prescription.patient.name}`, 20, 65);
      
      // Diagnóstico
      doc.setFont('helvetica', 'bold');
      doc.text('DIAGNÓSTICO:', 20, 80);
      doc.setFont('helvetica', 'normal');
      
      // Usar splitTextToSize para manejar textos largos
      const diagnosisLines = doc.splitTextToSize(prescription.diagnosis, pageWidth - 40);
      doc.text(diagnosisLines, 20, 87);
      
      // Medicamentos
      let yPos = 87 + (diagnosisLines.length * 7);
      
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICAMENTOS:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      
      yPos += 7;
      
      // Lista de medicamentos
      prescription.medications.forEach((med: any, index: number) => {
        const medText = `${index + 1}. ${med.name}`;
        const medLines = doc.splitTextToSize(medText, pageWidth - 40);
        doc.text(medLines, 20, yPos);
        yPos += medLines.length * 7;
        
        // Dosis y forma de administración
        const dosageText = `   Dosis: ${med.dosage}`;
        doc.text(dosageText, 20, yPos);
        yPos += 7;
        
        const freqText = `   Frecuencia: ${med.frequency}`;
        doc.text(freqText, 20, yPos);
        yPos += 7;
        
        const durationText = `   Duración: ${med.duration}`;
        doc.text(durationText, 20, yPos);
        yPos += 10;
      });
      
      // Instrucciones
      doc.setFont('helvetica', 'bold');
      doc.text('INSTRUCCIONES:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      
      yPos += 7;
      
      const instructionsLines = doc.splitTextToSize(prescription.instructions, pageWidth - 40);
      doc.text(instructionsLines, 20, yPos);
      
      yPos += instructionsLines.length * 7 + 10;
      
      // Notas adicionales
      if (prescription.notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('NOTAS:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        
        yPos += 7;
        
        const notesLines = doc.splitTextToSize(prescription.notes, pageWidth - 40);
        doc.text(notesLines, 20, yPos);
        
        yPos += notesLines.length * 7 + 10;
      }
      
      // Firma del médico
      doc.text('_______________________________', pageWidth - 60, yPos);
      doc.text('Firma del médico', pageWidth - 60, yPos + 7);
      
      // Generar URL de datos del PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF',
        variant: 'destructive',
      });
    }
  };
  
  // Función para manejar el envío del formulario
  const onSubmit = (data: PrescriptionFormValues) => {
    savePrescriptionMutation.mutate(data);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{editPrescriptionId ? 'Editar Receta' : 'Nueva Receta'}</CardTitle>
        <CardDescription>
          Complete los campos para generar una receta electrónica que cumpla con los estándares COFEPRIS.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Paciente */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Diagnóstico */}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Medicamentos */}
            <div className="space-y-4">
              <Label>Medicamentos</Label>
              
              {form.getValues('medications').map((_, index) => (
                <div key={index} className="p-4 border rounded-md space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medicamento {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Nombre del medicamento con autocompletado */}
                  <FormField
                    control={form.control}
                    name={`medications.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del medicamento</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <div className="flex">
                              <Input
                                placeholder="Buscar medicamento..."
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setSearchTerm(e.target.value);
                                }}
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                className="ml-2"
                                onClick={() => searchMedications()}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          
                          {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 border rounded-md bg-background shadow-md">
                              <ScrollArea className="h-[200px]">
                                {searchResults.map((medication) => (
                                  <div
                                    key={medication.id}
                                    className="p-2 hover:bg-accent cursor-pointer"
                                    onClick={() => selectMedication(medication, index)}
                                  >
                                    <div className="font-medium">{medication.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {medication.activeIngredient}, {medication.concentration}
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                      <Badge variant="outline">{medication.pharmaceuticalForm}</Badge>
                                      {medication.requiresPrescription && (
                                        <Badge variant="secondary">Requiere receta</Badge>
                                      )}
                                      {medication.isControlled && (
                                        <Badge variant="destructive">Controlado {medication.controlledGroup}</Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Dosis */}
                  <FormField
                    control={form.control}
                    name={`medications.${index}.dosage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosis</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: 1 tableta de 500mg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Frecuencia */}
                  <FormField
                    control={form.control}
                    name={`medications.${index}.frequency`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frecuencia</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Cada 8 horas"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Duración */}
                  <FormField
                    control={form.control}
                    name={`medications.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Durante 7 días"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addMedication}
              >
                Agregar otro medicamento
              </Button>
            </div>
            
            {/* Instrucciones */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese instrucciones para el paciente"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales (opcional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Alerta para medicamentos controlados */}
            {form.getValues('medications').some(med => {
              const foundMed = searchResults.find(m => m.name === med.name);
              return foundMed?.isControlled;
            }) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Medicamento controlado</AlertTitle>
                <AlertDescription>
                  Está recetando un medicamento controlado que requiere registro especial según COFEPRIS.
                  Asegúrese de cumplir con los requisitos legales.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-between">
              <Button type="submit" disabled={savePrescriptionMutation.isPending}>
                {savePrescriptionMutation.isPending ? 'Guardando...' : 'Guardar receta'}
              </Button>
              
              {pdfUrl && (
                <Button type="button" variant="outline" asChild>
                  <a href={pdfUrl} target="_blank" rel="noreferrer">Ver PDF</a>
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PrescriptionGenerator;