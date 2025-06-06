import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Brain } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Esquema de validación para el formulario
const aiDiagnosisSchema = z.object({
  symptoms: z.string().min(10, {
    message: "Por favor, describa los síntomas con mayor detalle (mínimo 10 caracteres)",
  }),
  patientHistory: z.string().min(10, {
    message: "Por favor, proporcione más información sobre el historial del paciente (mínimo 10 caracteres)",
  }),
  vitals: z.string().optional(),
});

type AIDiagnosisFormValues = z.infer<typeof aiDiagnosisSchema>;

// Props para el componente del formulario
interface AIDiagnosisFormProps {
  patientInfo?: {
    age?: number;
    gender?: string;
    bloodType?: string;
    allergies?: string | null;
    chronicConditions?: string | null;
  };
  isGenerating: boolean;
  onGenerate: (data: any) => void;
}

export function AIDiagnosisForm({ patientInfo, isGenerating, onGenerate }: AIDiagnosisFormProps) {
  const form = useForm<AIDiagnosisFormValues>({
    resolver: zodResolver(aiDiagnosisSchema),
    defaultValues: {
      symptoms: "",
      patientHistory: "",
      vitals: "",
    },
  });

  const onSubmit = (data: AIDiagnosisFormValues) => {
    onGenerate(data);
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Brain className="h-5 w-5 text-blue-700" />
        <AlertTitle className="text-blue-700">Asistente de diagnóstico médico</AlertTitle>
        <AlertDescription>
          Esta herramienta utiliza IA para proporcionar recomendaciones de diagnóstico basadas en la información del paciente. 
          La decisión final siempre debe ser tomada por el médico tratante.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Síntomas actuales *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa los síntomas que presenta el paciente..."
                    className="h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describa detalladamente los síntomas que experimenta el paciente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="patientHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Historia clínica *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Información relevante sobre el historial médico del paciente..."
                    className="h-24"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Incluya información sobre enfermedades previas, cirugías, medicamentos actuales, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vitals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signos vitales (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Temperatura, presión arterial, frecuencia cardíaca, etc..."
                    className="h-16"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Proporcione los signos vitales del paciente si están disponibles.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {patientInfo && (
            <div className="space-y-3">
              <Label>Información del paciente incluida en la consulta:</Label>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {patientInfo.age && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Edad:</span>
                    <span>{patientInfo.age} años</span>
                  </div>
                )}
                {patientInfo.gender && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Género:</span>
                    <span>{patientInfo.gender}</span>
                  </div>
                )}
                {patientInfo.bloodType && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Tipo de sangre:</span>
                    <span>{patientInfo.bloodType}</span>
                  </div>
                )}
              </div>

              {patientInfo.allergies && (
                <div className="space-y-1">
                  <span className="font-medium text-sm">Alergias:</span>
                  <p className="text-sm">{patientInfo.allergies}</p>
                </div>
              )}

              {patientInfo.chronicConditions && (
                <div className="space-y-1">
                  <span className="font-medium text-sm">Condiciones crónicas:</span>
                  <p className="text-sm">{patientInfo.chronicConditions}</p>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando diagnóstico...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generar diagnóstico
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}