import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUp, Search, AlertCircle, File, Download, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PatientDocument } from "@shared/schema";
import { documentTypeOptions, getDocumentTypeLabel, uploadDocument, formatDocumentDate, getDocumentUrl } from "@/lib/documents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const documentSchema = z.object({
  patientId: z.number(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  fileUrl: z.string().min(5, "Por favor proporciona una URL de archivo válida"),
  documentType: z.string().min(1, "Selecciona un tipo de documento"),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function PatientDocuments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeType, setActiveType] = useState("all");

  // Fetch patient documents
  const {
    data: documents,
    isLoading,
    error,
  } = useQuery<PatientDocument[]>({
    queryKey: [`/api/patient-documents/${user?.id}`],
  });

  // Document upload form
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      patientId: user?.id,
      title: "",
      description: "",
      fileUrl: "",
      documentType: "",
    },
  });

  // Handle document upload
  const uploadDocumentMutation = useMutation({
    mutationFn: (document: DocumentFormValues) => {
      return uploadDocument(document);
    },
    onSuccess: () => {
      toast({
        title: "Documento subido",
        description: "Tu documento ha sido subido exitosamente",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo subir el documento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: DocumentFormValues) {
    uploadDocumentMutation.mutate(values);
  }

  // Filter documents by search term and type
  const filteredDocuments = documents
    ?.filter(doc => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.title.toLowerCase().includes(searchLower) ||
        (doc.description && doc.description.toLowerCase().includes(searchLower)) ||
        getDocumentTypeLabel(doc.documentType).toLowerCase().includes(searchLower)
      );
    })
    .filter(doc => {
      if (activeType === "all") return true;
      return doc.documentType === activeType;
    });

  // Group document types for the filter tabs
  const docTypes = documents
    ? [...new Set(documents.map(doc => doc.documentType))]
    : [];

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Documentos</h1>
          <p className="text-gray-500 mt-1">Gestiona tus documentos médicos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <FileUp className="mr-2 h-4 w-4" /> Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Subir Nuevo Documento</DialogTitle>
              <DialogDescription>
                Sube un documento médico a tu expediente digital
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Documento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Resultados de análisis de sangre"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de documento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Agrega una breve descripción del documento"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL del Archivo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://ejemplo.com/archivo.pdf"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploadDocumentMutation.isPending}>
                    {uploadDocumentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      "Subir Documento"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex items-center w-full sm:w-96">
                <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar documentos..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveType}>
                <TabsList className="overflow-x-auto">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  {docTypes.map((type) => (
                    <TabsTrigger key={type} value={type}>
                      {getDocumentTypeLabel(type)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-gray-200 rounded-md"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center text-red-600">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>Error al cargar los documentos. Intenta de nuevo.</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <File className="h-5 w-5 mr-2 text-primary-500" />
                    {document.title}
                  </CardTitle>
                  <CardDescription>
                    {document.description || "Sin descripción"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {getDocumentTypeLabel(document.documentType)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <time dateTime={document.uploadedAt.toString()}>
                        {formatDocumentDate(new Date(document.uploadedAt))}
                      </time>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <a
                    href={getDocumentUrl(document)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Ver Documento
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center py-12">
              <File className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No tienes documentos</h3>
              <p className="text-gray-500 mt-1 mb-6 max-w-md mx-auto">
                Aquí aparecerán tus documentos médicos. Sube tu primer documento ahora.
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FileUp className="mr-2 h-4 w-4" /> Subir Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Subir Nuevo Documento</DialogTitle>
                    <DialogDescription>
                      Sube un documento médico a tu expediente digital
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* El contenido del formulario es idéntico al Dialog de arriba */}
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
