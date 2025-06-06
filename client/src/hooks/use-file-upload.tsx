import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseFileUploadOptions {
  endpoint: string;
  onSuccess?: (data: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }) => void;
  onError?: (error: Error) => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<void>;
  uploading: boolean;
  progress: number;
  error: Error | null;
}

/**
 * Hook para gestionar la subida de archivos
 */
export function useFileUpload({
  endpoint,
  onSuccess,
  onError,
  maxSizeMB = 10, // 10MB por defecto
  allowedTypes = [] // Todos los tipos permitidos por defecto
}: UseFileUploadOptions): UseFileUploadReturn {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Función principal para subir archivos
  const uploadFile = async (file: File): Promise<void> => {
    // Validar el tamaño del archivo
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const error = new Error(`El archivo es demasiado grande. El tamaño máximo es ${maxSizeMB}MB.`);
      setError(error);
      onError?.(error);
      toast({
        title: 'Error al subir archivo',
        description: `El archivo excede el tamaño máximo de ${maxSizeMB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    // Validar el tipo de archivo si se especificó una lista
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      const error = new Error(`Tipo de archivo no permitido. Los tipos permitidos son: ${allowedTypes.join(', ')}`);
      setError(error);
      onError?.(error);
      toast({
        title: 'Error al subir archivo',
        description: 'Tipo de archivo no permitido.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Crear FormData para subir el archivo
      const formData = new FormData();
      formData.append('file', file);

      // Crear instancia de XMLHttpRequest para monitorear el progreso
      const xhr = new XMLHttpRequest();
      
      // Configurar el evento de progreso
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress(percentage);
        }
      });

      // Devolver una promesa que se resuelve cuando se completa la subida
      await new Promise<void>((resolve, reject) => {
        xhr.open('POST', endpoint);
        
        // No establecer encabezado Content-Type, FormData lo hace automáticamente
        
        // Manejar la finalización de la solicitud
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              
              // Llamar al callback de éxito
              onSuccess?.({
                fileUrl: response.fileUrl,
                fileName: response.fileName || file.name,
                fileSize: file.size,
                fileType: file.type
              });
              
              resolve();
            } catch (err) {
              const error = new Error('Error al procesar la respuesta del servidor');
              setError(error);
              onError?.(error);
              reject(error);
            }
          } else {
            let errorMessage = 'Error al subir el archivo';
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.message) {
                errorMessage = response.message;
              }
            } catch (e) {
              // Ignorar errores al parsear la respuesta
            }
            
            const error = new Error(errorMessage);
            setError(error);
            onError?.(error);
            reject(error);
            
            toast({
              title: 'Error al subir archivo',
              description: errorMessage,
              variant: 'destructive',
            });
          }
        };
        
        // Manejar errores de red
        xhr.onerror = () => {
          const error = new Error('Error de red al subir el archivo');
          setError(error);
          onError?.(error);
          reject(error);
          
          toast({
            title: 'Error al subir archivo',
            description: 'No se pudo conectar con el servidor',
            variant: 'destructive',
          });
        };
        
        // Enviar la solicitud
        xhr.send(formData);
      });
    } catch (err) {
      // Los errores ya se manejan en la promesa
      console.error('Error al subir el archivo:', err);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
    error
  };
}