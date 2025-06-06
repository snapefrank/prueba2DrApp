import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Upload, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/layout/DashboardLayout";

type DocumentType = "license" | "specialty" | "profile_photo" | "curriculum" | "certificates";

interface VerificationDocument {
  id: number;
  doctorId: number;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  status: "pending" | "approved" | "rejected";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentProps {
  title: string;
  description: string;
  documentType: DocumentType;
  isRequired: boolean;
  verificationStatus?: "pending" | "approved" | "rejected";
  notes?: string | null;
  onChange: (file: File, type: DocumentType) => void;
  onRemove: (type: DocumentType) => void;
  filePreview: string | null;
}

const DocumentUploader = ({
  title,
  description,
  documentType,
  isRequired,
  verificationStatus,
  notes,
  onChange,
  onRemove,
  filePreview,
}: DocumentProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0], documentType);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title} {isRequired && <span className="text-red-500">*</span>}
          {verificationStatus === "approved" && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {verificationStatus === "rejected" && (
            <X className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {verificationStatus === "rejected" && notes && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Rechazo de documento</AlertTitle>
            <AlertDescription>{notes}</AlertDescription>
          </Alert>
        )}

        {filePreview ? (
          <div className="relative">
            <div className="relative overflow-hidden rounded-md border border-muted bg-muted">
              {filePreview.endsWith(".pdf") ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="font-medium">PDF subido correctamente</span>
                </div>
              ) : (
                <img
                  src={filePreview}
                  alt={title}
                  className="h-32 w-full object-contain"
                />
              )}
            </div>
            <Button
              size="icon"
              variant="destructive"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
              onClick={() => onRemove(documentType)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/50 p-4">
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              Arrastra o haz clic para subir
            </p>
            <Label
              htmlFor={`file-upload-${documentType}`}
              className="cursor-pointer text-sm font-medium text-primary"
            >
              Seleccionar archivo
              <Input
                id={`file-upload-${documentType}`}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function DoctorVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [documents, setDocuments] = useState<Record<DocumentType, File | null>>({
    license: null,
    specialty: null,
    profile_photo: null,
    curriculum: null,
    certificates: null,
  });
  const [previews, setPreviews] = useState<Record<DocumentType, string | null>>({
    license: null,
    specialty: null,
    profile_photo: null,
    curriculum: null,
    certificates: null,
  });

  interface DoctorProfile {
    id: number;
    userId: number;
    specialtyId: number;
    bio: string | null;
    education: string | null;
    experience: string | null;
    consultationFee: number | null;
    availableHours: string | null;
    verificationStatus: "pending" | "approved" | "rejected";
    verificationComments: string | null;
    createdAt: string;
    updatedAt: string;
  }

  // Fetch doctor profile and verification status
  const { data: doctorProfile } = useQuery<DoctorProfile>({
    queryKey: ["/api/doctor/profile"],
    enabled: !!user && user.userType === "doctor",
  });

  // Fetch existing documents
  const { data: verificationDocuments, isLoading: isLoadingDocuments } = useQuery<VerificationDocument[]>({
    queryKey: ["/api/doctor/verification/documents"],
    enabled: !!user && user.userType === "doctor",
  });

  // Update previews from existing documents
  useEffect(() => {
    if (verificationDocuments && verificationDocuments.length > 0) {
      const newPreviews = { ...previews };
      
      verificationDocuments.forEach((doc) => {
        newPreviews[doc.documentType] = doc.fileUrl;
      });
      
      setPreviews(newPreviews);
    }
  }, [verificationDocuments, previews]);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/doctor/verification/documents", null, formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documentos enviados",
        description: "Tus documentos han sido subidos correctamente y están pendientes de revisión.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/verification/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudieron subir los documentos: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (file: File, type: DocumentType) => {
    setDocuments({ ...documents, [type]: file });
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews({
        ...previews,
        [type]: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (type: DocumentType) => {
    setDocuments({ ...documents, [type]: null });
    setPreviews({ ...previews, [type]: null });
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    let hasRequiredFiles = true;
    
    // Check if required files are present
    if (!documents.license && !previews.license) {
      toast({
        title: "Error",
        description: "La cédula profesional es obligatoria",
        variant: "destructive",
      });
      hasRequiredFiles = false;
    }
    
    if (!documents.profile_photo && !previews.profile_photo) {
      toast({
        title: "Error",
        description: "La foto de perfil es obligatoria",
        variant: "destructive",
      });
      hasRequiredFiles = false;
    }
    
    if (!hasRequiredFiles) return;
    
    // Add files to FormData
    Object.entries(documents).forEach(([type, file]) => {
      if (file) {
        formData.append(type, file);
      }
    });
    
    uploadMutation.mutate(formData);
  };

  const isPending = doctorProfile?.verificationStatus === "pending";
  const isRejected = doctorProfile?.verificationStatus === "rejected";
  
  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-5xl py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Verificación de Perfil Médico</h1>
          <p className="text-lg text-muted-foreground">
            Sube los documentos necesarios para verificar tu cuenta como médico en la plataforma.
          </p>
        </div>

        {isPending && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verificación en proceso</AlertTitle>
            <AlertDescription>
              Tu perfil está pendiente de validación por el equipo de MediConnect. Recibirás una notificación al ser aprobado.
            </AlertDescription>
          </Alert>
        )}

        {isRejected && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verificación rechazada</AlertTitle>
            <AlertDescription>
              Tu verificación ha sido rechazada. Por favor revisa los comentarios en cada documento y vuelve a subir los necesarios.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DocumentUploader
            title="Cédula Profesional"
            description="Sube una imagen o PDF de tu cédula profesional emitida por la SEP"
            documentType="license"
            isRequired={true}
            onChange={handleFileChange}
            onRemove={handleRemoveFile}
            filePreview={previews.license}
            verificationStatus={verificationDocuments?.find(d => d.documentType === "license")?.status}
            notes={verificationDocuments?.find(d => d.documentType === "license")?.notes ?? null}
          />
          
          <DocumentUploader
            title="Constancia de Especialidad"
            description="Si eres especialista, sube el documento que avala tu especialidad"
            documentType="specialty"
            isRequired={false}
            onChange={handleFileChange}
            onRemove={handleRemoveFile}
            filePreview={previews.specialty}
            verificationStatus={verificationDocuments?.find(d => d.documentType === "specialty")?.status}
            notes={verificationDocuments?.find(d => d.documentType === "specialty")?.notes ?? null}
          />
          
          <DocumentUploader
            title="Foto de Perfil Profesional"
            description="Sube una fotografía profesional para tu perfil"
            documentType="profile_photo"
            isRequired={true}
            onChange={handleFileChange}
            onRemove={handleRemoveFile}
            filePreview={previews.profile_photo}
            verificationStatus={verificationDocuments?.find(d => d.documentType === "profile_photo")?.status}
            notes={verificationDocuments?.find(d => d.documentType === "profile_photo")?.notes ?? null}
          />
          
          <DocumentUploader
            title="Currículum Vitae"
            description="Opcional: Sube tu CV en formato PDF"
            documentType="curriculum"
            isRequired={false}
            onChange={handleFileChange}
            onRemove={handleRemoveFile}
            filePreview={previews.curriculum}
            verificationStatus={verificationDocuments?.find(d => d.documentType === "curriculum")?.status}
            notes={verificationDocuments?.find(d => d.documentType === "curriculum")?.notes ?? null}
          />
          
          <DocumentUploader
            title="Diplomados y Certificaciones"
            description="Opcional: Sube certificaciones o diplomados relevantes"
            documentType="certificates"
            isRequired={false}
            onChange={handleFileChange}
            onRemove={handleRemoveFile}
            filePreview={previews.certificates}
            verificationStatus={verificationDocuments?.find(d => d.documentType === "certificates")?.status}
            notes={verificationDocuments?.find(d => d.documentType === "certificates")?.notes ?? null}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={uploadMutation.isPending}
            className="px-6"
          >
            {uploadMutation.isPending ? "Subiendo..." : "Enviar para verificación"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}