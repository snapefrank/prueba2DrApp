import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

/**
 * Hook para verificar si un conjunto de secretos (API keys) están disponibles en el servidor
 * 
 * @param secretKeys Array de claves de secreto a verificar
 * @returns Un objeto con información sobre el estado de los secretos
 */
export function useCheckSecrets(secretKeys: string[]) {
  const [isChecking, setIsChecking] = useState(false);
  const [exists, setExists] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  async function checkSecrets() {
    if (!secretKeys || secretKeys.length === 0) {
      setExists(false);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/check-secrets", { secretKeys });
      const data = await response.json();
      setExists(data.exists);
      
      if (!data.exists) {
        toast({
          title: "API Keys no configuradas",
          description: `Las siguientes API keys no están configuradas: ${secretKeys.join(", ")}`,
          variant: "destructive",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error al verificar secretos"));
      toast({
        title: "Error",
        description: "Error al verificar API keys",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    checkSecrets();
  }, [JSON.stringify(secretKeys)]);

  return {
    isChecking,
    exists,
    error,
    checkSecrets,
  };
}