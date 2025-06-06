import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Search,
  User,
  X,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";

type DocumentType = "license" | "specialty" | "profile_photo" | "curriculum" | "certificates";
type VerificationStatus = "pending" | "approved" | "rejected";

interface VerificationDocument {
  id: number;
  doctorId: number;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  status: VerificationStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DoctorProfile {
  id: number;
  userId: number;
  specialtyId: number;
  bio: string | null;
  education: string | null;
  experience: string | null;
  consultationFee: number | null;
  availableHours: string | null;
  verificationStatus: VerificationStatus;
  verificationComments: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  specialty?: {
    id: number;
    name: string;
  };
}

interface DocumentReviewProps {
  document: VerificationDocument;
  onApprove: (id: number) => void;
  onReject: (id: number, notes: string) => void;
}

const DocumentReview = ({ document, onApprove, onReject }: DocumentReviewProps) => {
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleReject = () => {
    onReject(document.id, rejectNotes);
    setShowRejectForm(false);
    setRejectNotes("");
  };

  const documentTitles: Record<DocumentType, string> = {
    license: "Cédula Profesional",
    specialty: "Constancia de Especialidad",
    profile_photo: "Foto de Perfil",
    curriculum: "Currículum Vitae",
    certificates: "Certificaciones",
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {documentTitles[document.documentType]}
          <Badge
            variant={
              document.status === "approved"
                ? "default"
                : document.status === "rejected"
                ? "destructive"
                : "outline"
            }
          >
            {document.status === "approved"
              ? "Aprobado"
              : document.status === "rejected"
              ? "Rechazado"
              : "Pendiente"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-md border">
          {document.fileUrl.endsWith(".pdf") ? (
            <div className="flex h-48 flex-col items-center justify-center bg-muted p-4">
              <p className="mb-2 text-sm font-medium">Documento PDF</p>
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Eye className="h-4 w-4" /> Ver documento
              </a>
            </div>
          ) : (
            <div className="aspect-square max-h-48 overflow-hidden">
              <img
                src={document.fileUrl}
                alt={documentTitles[document.documentType]}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {document.status === "rejected" && document.notes && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Motivo de rechazo</AlertTitle>
            <AlertDescription>{document.notes}</AlertDescription>
          </Alert>
        )}

        {document.status === "pending" && (
          <div className="flex flex-col space-y-2">
            {showRejectForm ? (
              <>
                <Textarea
                  placeholder="Escribe el motivo del rechazo..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectNotes.trim()}
                    className="flex-1"
                  >
                    Confirmar rechazo
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => onApprove(document.id)}
                  className="flex-1"
                  variant="default"
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Aprobar
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1"
                  variant="outline"
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Rechazar
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DoctorVerificationCardProps {
  doctor: DoctorProfile;
  documents: VerificationDocument[];
  onApproveDoc: (id: number) => void;
  onRejectDoc: (id: number, notes: string) => void;
  onApproveProfile: (doctorId: number) => void;
  onRejectProfile: (doctorId: number, comments: string) => void;
}

const DoctorVerificationCard = ({
  doctor,
  documents,
  onApproveDoc,
  onRejectDoc,
  onApproveProfile,
  onRejectProfile,
}: DoctorVerificationCardProps) => {
  const [rejectComments, setRejectComments] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleRejectProfile = () => {
    onRejectProfile(doctor.id, rejectComments);
    setShowRejectForm(false);
    setRejectComments("");
  };

  // Agrupar documentos por tipo
  const documentsByType = documents.reduce(
    (acc, doc) => {
      acc[doc.documentType] = doc;
      return acc;
    },
    {} as Record<DocumentType, VerificationDocument>
  );

  const pendingDocuments = documents.filter((doc) => doc.status === "pending");
  const hasAllRequiredDocuments =
    documentsByType.license && documentsByType.profile_photo;
  const allDocumentsApproved = documents.every(
    (doc) => doc.status === "approved"
  );
  const hasRejectedDocuments = documents.some(
    (doc) => doc.status === "rejected"
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {doctor.user?.firstName} {doctor.user?.lastName}
          </span>
          <Badge
            variant={
              doctor.verificationStatus === "approved"
                ? "default"
                : doctor.verificationStatus === "rejected"
                ? "destructive"
                : "outline"
            }
          >
            {doctor.verificationStatus === "approved"
              ? "Perfil Aprobado"
              : doctor.verificationStatus === "rejected"
              ? "Perfil Rechazado"
              : "Pendiente"}
          </Badge>
        </CardTitle>
        <CardDescription>
          {doctor.specialty?.name || "Sin especialidad"} -{" "}
          {doctor.user?.email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            {documents.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sin documentos</AlertTitle>
                <AlertDescription>
                  Este médico aún no ha subido ningún documento.
                </AlertDescription>
              </Alert>
            ) : (
              documents.map((doc) => (
                <DocumentReview
                  key={doc.id}
                  document={doc}
                  onApprove={onApproveDoc}
                  onReject={onRejectDoc}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-medium">Bio</h3>
                <p className="text-sm text-muted-foreground">
                  {doctor.bio || "No proporcionada"}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Educación</h3>
                <p className="text-sm text-muted-foreground">
                  {doctor.education || "No proporcionada"}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Experiencia</h3>
                <p className="text-sm text-muted-foreground">
                  {doctor.experience || "No proporcionada"}
                </p>
              </div>

              {doctor.verificationStatus === "rejected" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Motivo de rechazo</AlertTitle>
                  <AlertDescription>
                    {doctor.verificationComments}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        {doctor.verificationStatus === "pending" && (
          <div className="w-full space-y-4">
            {!hasAllRequiredDocuments && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Documentos requeridos pendientes</AlertTitle>
                <AlertDescription>
                  El médico debe proporcionar cédula profesional y foto de perfil
                  antes de poder aprobar su perfil.
                </AlertDescription>
              </Alert>
            )}

            {pendingDocuments.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Documentos pendientes de revisión</AlertTitle>
                <AlertDescription>
                  Hay {pendingDocuments.length} documento(s) pendiente(s) de
                  revisión.
                </AlertDescription>
              </Alert>
            )}

            {showRejectForm ? (
              <>
                <Textarea
                  placeholder="Escribe el motivo del rechazo..."
                  value={rejectComments}
                  onChange={(e) => setRejectComments(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleRejectProfile}
                    disabled={!rejectComments.trim()}
                    className="flex-1"
                  >
                    Confirmar rechazo
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => onApproveProfile(doctor.id)}
                  className="flex-1"
                  variant="default"
                  disabled={
                    !hasAllRequiredDocuments ||
                    pendingDocuments.length > 0 ||
                    hasRejectedDocuments
                  }
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar Perfil
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1"
                  variant="outline"
                >
                  <X className="mr-2 h-4 w-4" />
                  Rechazar Perfil
                </Button>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default function AdminVerification() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"pending" | "all" | "approved" | "rejected">("pending");

  // Consultar perfiles de médicos
  const { data: doctors, isLoading } = useQuery<DoctorProfile[]>({
    queryKey: ["/api/admin/doctor-profiles"],
  });

  // Consultar documentos de verificación
  const { data: allDocuments, isLoading: isLoadingDocs } = useQuery<VerificationDocument[]>({
    queryKey: ["/api/admin/verification-documents"],
  });

  // Aprobar documento
  const approveDocMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest("POST", `/api/admin/verification-documents/${documentId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento aprobado",
        description: "El documento ha sido aprobado correctamente.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/verification-documents"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo aprobar el documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Rechazar documento
  const rejectDocMutation = useMutation({
    mutationFn: async ({ documentId, notes }: { documentId: number; notes: string }) => {
      const response = await apiRequest("POST", `/api/admin/verification-documents/${documentId}/reject`, {
        notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Documento rechazado",
        description: "El documento ha sido rechazado correctamente.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/verification-documents"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo rechazar el documento: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Aprobar perfil
  const approveProfileMutation = useMutation({
    mutationFn: async (doctorId: number) => {
      const response = await apiRequest("POST", `/api/admin/doctor-profiles/${doctorId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil aprobado",
        description: "El perfil del médico ha sido aprobado correctamente.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/doctor-profiles"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo aprobar el perfil: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Rechazar perfil
  const rejectProfileMutation = useMutation({
    mutationFn: async ({ doctorId, comments }: { doctorId: number; comments: string }) => {
      const response = await apiRequest("POST", `/api/admin/doctor-profiles/${doctorId}/reject`, {
        comments,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil rechazado",
        description: "El perfil del médico ha sido rechazado correctamente.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/doctor-profiles"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo rechazar el perfil: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filtrar médicos por búsqueda y estado
  const filteredDoctors = doctors
    ? doctors.filter((doctor) => {
        const matchesSearch =
          searchQuery === "" ||
          `${doctor.user?.firstName} ${doctor.user?.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          doctor.user?.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          selectedTab === "all" ||
          doctor.verificationStatus === selectedTab;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Agrupar documentos por médico
  const docsByDoctor = allDocuments
    ? allDocuments.reduce((acc, doc) => {
        if (!acc[doc.doctorId]) {
          acc[doc.doctorId] = [];
        }
        acc[doc.doctorId].push(doc);
        return acc;
      }, {} as Record<number, VerificationDocument[]>)
    : {};

  const handleApproveDoc = (id: number) => {
    approveDocMutation.mutate(id);
  };

  const handleRejectDoc = (id: number, notes: string) => {
    rejectDocMutation.mutate({ documentId: id, notes });
  };

  const handleApproveProfile = (doctorId: number) => {
    approveProfileMutation.mutate(doctorId);
  };

  const handleRejectProfile = (doctorId: number, comments: string) => {
    rejectProfileMutation.mutate({ doctorId, comments });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Verificación de Médicos</h1>
          <p className="text-lg text-muted-foreground">
            Revisa y verifica los perfiles y documentos de los médicos registrados en la plataforma.
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar médico por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs
            defaultValue="pending"
            value={selectedTab}
            onValueChange={(value) => setSelectedTab(value as any)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pendientes
              </TabsTrigger>
              <TabsTrigger value="approved">
                Aprobados
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rechazados
              </TabsTrigger>
              <TabsTrigger value="all">
                Todos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading || isLoadingDocs ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <User className="mb-2 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No hay médicos para mostrar</h3>
              <p className="text-sm text-muted-foreground">
                No se encontraron médicos que coincidan con los filtros actuales.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDoctors.map((doctor) => (
            <DoctorVerificationCard
              key={doctor.id}
              doctor={doctor}
              documents={docsByDoctor[doctor.id] || []}
              onApproveDoc={handleApproveDoc}
              onRejectDoc={handleRejectDoc}
              onApproveProfile={handleApproveProfile}
              onRejectProfile={handleRejectProfile}
            />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}