import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useCheckSecrets } from "@/hooks/use-check-secrets";
import { useToast } from "@/hooks/use-toast";

export interface AIPatientInfo {
  age?: number;
  gender?: string;
  bloodType?: string;
  allergies?: string | null;
  chronicConditions?: string | null;
}

export interface AIDiagnosisResult {
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
}

interface DiagnosisInput {
  symptoms: string;
  patientHistory: string;
  vitals?: string;
  patientInfo?: AIPatientInfo;
}

/**
 * Hook para generar diagnósticos médicos asistidos por IA.
 * Verifica automáticamente que la API key de OpenAI esté configurada.
 */
export function useAIDiagnosis() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AIDiagnosisResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Verificar que la API key de OpenAI esté configurada
  const { exists: apiKeyExists, isChecking: isCheckingApiKey } = useCheckSecrets(["OPENAI_API_KEY"]);
  
  const { toast } = useToast();

  const generateDiagnosis = async (data: DiagnosisInput) => {
    // No continuar si la API key no está configurada
    if (!apiKeyExists) {
      toast({
        title: "API Key faltante",
        description: "No se puede generar el diagnóstico porque la API key de OpenAI no está configurada.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/ai/diagnosis", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar el diagnóstico");
      }
      
      const diagnosisResult = await response.json();
      setResult(diagnosisResult);
      
      toast({
        title: "Diagnóstico generado",
        description: "Diagnóstico asistido por IA generado correctamente",
      });
    } catch (err) {
      console.error("Error en diagnóstico AI:", err);
      setError(err instanceof Error ? err : new Error("Error al generar el diagnóstico"));
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al generar el diagnóstico",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateDiagnosis,
    isGenerating,
    isCheckingApiKey,
    apiKeyExists,
    result,
    error,
  };
}