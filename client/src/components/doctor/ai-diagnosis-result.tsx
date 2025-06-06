import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Check, Clipboard, ClipboardCheck, Stethoscope, AlertTriangle, Book } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AIDiagnosisResult {
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

interface AIDiagnosisResultProps {
  result: AIDiagnosisResult | null;
  onAcceptDiagnosis?: (diagnosis: string) => void;
  onAcceptTreatment?: (treatment: string) => void;
}

export function AIDiagnosisResult({ 
  result, 
  onAcceptDiagnosis, 
  onAcceptTreatment 
}: AIDiagnosisResultProps) {
  const [activeTab, setActiveTab] = useState("diagnoses");

  if (!result) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>No hay resultados de diagnóstico disponibles</p>
      </div>
    );
  }

  // Formateador del porcentaje de confianza
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-amber-50 border-amber-200 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-600">Asistente de diagnóstico</AlertTitle>
        <AlertDescription className="text-amber-700">
          Este diagnóstico es generado por IA. Siempre debe ser revisado y confirmado por un profesional médico.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="diagnoses" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="diagnoses" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Diagnósticos</span>
          </TabsTrigger>
          <TabsTrigger value="treatments" className="flex items-center space-x-2">
            <Clipboard className="h-4 w-4" />
            <span>Tratamientos</span>
          </TabsTrigger>
          <TabsTrigger value="reasoning" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Razonamiento</span>
          </TabsTrigger>
          <TabsTrigger value="references" className="flex items-center space-x-2">
            <Book className="h-4 w-4" />
            <span>Referencias</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnoses" className="space-y-4">
          <div className="space-y-3">
            <div className="text-lg font-semibold">Posibles diagnósticos</div>
            {result.possibleDiagnoses.map((diagnosis, index) => (
              <Card key={index} className={index === 0 ? "border-2 border-blue-400" : ""}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-base">
                        {diagnosis.name}
                      </CardTitle>
                      {index === 0 && (
                        <Badge className="bg-blue-500">Principal</Badge>
                      )}
                      {diagnosis.icdCode && (
                        <Badge variant="outline" className="text-xs">
                          ICD-10: {diagnosis.icdCode}
                        </Badge>
                      )}
                    </div>
                    {onAcceptDiagnosis && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAcceptDiagnosis(diagnosis.name)}
                        className="h-8"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Aceptar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confianza</span>
                      <span className="font-medium">{formatConfidence(diagnosis.confidence)}</span>
                    </div>
                    <Progress value={diagnosis.confidence * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-lg font-semibold">Diagnóstico diferencial</div>
            <Card>
              <CardContent className="py-4">
                <ul className="list-disc pl-6 space-y-2">
                  {result.differentialDiagnosis.map((diagnosis, index) => (
                    <li key={index}>{diagnosis}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="treatments" className="space-y-4">
          <div className="text-lg font-semibold">Sugerencias de tratamiento</div>
          {result.treatmentSuggestions.map((treatment, index) => (
            <Card key={index}>
              <CardContent className="py-4">
                <div className="flex justify-between items-start gap-4">
                  <p className="flex-1">{treatment}</p>
                  {onAcceptTreatment && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAcceptTreatment(treatment)}
                      className="shrink-0"
                    >
                      <ClipboardCheck className="mr-1 h-3.5 w-3.5" />
                      Aceptar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reasoning" className="space-y-4">
          <div className="text-lg font-semibold">Proceso de razonamiento clínico</div>
          <Card>
            <CardContent className="py-4">
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="whitespace-pre-line">{result.reasoningProcess}</div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Separator />

          <div className="text-lg font-semibold">Aviso médico</div>
          <Card>
            <CardContent className="py-4">
              <p className="text-muted-foreground italic">{result.medicalDisclaimer}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references" className="space-y-4">
          <div className="text-lg font-semibold">Referencias médicas</div>
          <Card>
            <CardContent className="py-4">
              {result.referencesUsed && result.referencesUsed.length > 0 ? (
                <ul className="list-disc pl-6 space-y-2">
                  {result.referencesUsed.map((reference, index) => (
                    <li key={index}>{reference}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No se proporcionaron referencias específicas.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}