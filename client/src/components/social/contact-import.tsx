import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Mail,
  Phone,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/hooks/use-user";

// Tipo para importaciones
interface ImportHistory {
  id: number;
  userId: number;
  source: string;
  status: string;
  createdAt: string;
  processedContacts: number;
  totalContacts: number;
}

// Tipo para contactos encontrados
interface MatchedContact {
  id: number;
  name: string;
  userType: string;
  status: string;
}

export const ContactImport = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("email");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Estado para los datos de importación
  const [emailData, setEmailData] = useState("");
  const [phoneData, setPhoneData] = useState("");
  
  // Estado para los resultados de la importación
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    importId?: number;
    matchedUsers: MatchedContact[];
  } | null>(null);

  // Obtener historial de importaciones
  const {
    data: importHistory = [],
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: ["/api/contacts/import/history"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contacts/import/history");
      const data = await response.json();
      return data as ImportHistory[];
    },
  });

  // Mutación para importar contactos
  const importContactsMutation = useMutation({
    mutationFn: async (data: { source: string; contactsData: any[] }) => {
      const response = await apiRequest("POST", "/api/contacts/import", data);
      return response.json();
    },
    onSuccess: (data) => {
      setIsImporting(false);
      setImportResults({
        importId: data.import?.id,
        matchedUsers: data.matchedUsers || [],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts/import/history"] });
      toast({
        title: "Importación completada",
        description: `Se encontraron ${data.matchedUsers?.length || 0} contactos en la plataforma.`,
      });
    },
    onError: (error: Error) => {
      setIsImporting(false);
      toast({
        title: "Error en la importación",
        description: `No se pudieron importar los contactos: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Parsear datos de correo electrónico
  const parseEmailData = (text: string) => {
    // Expresión regular para encontrar correos electrónicos
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
    const matches = text.match(emailRegex) || [];
    
    // Eliminar duplicados
    const uniqueEmails = [...new Set(matches)];
    
    // Convertir a formato de datos para la API
    return uniqueEmails.map(email => ({ email }));
  };

  // Parsear datos de teléfono
  const parsePhoneData = (text: string) => {
    // Expresión regular para encontrar números de teléfono (formato básico)
    const phoneRegex = /(\+?[0-9]{1,4}[-.\s]?)?(\([0-9]{1,4}\)[-.\s]?)?[0-9]{6,14}/g;
    const matches = text.match(phoneRegex) || [];
    
    // Eliminar duplicados
    const uniquePhones = [...new Set(matches)];
    
    // Convertir a formato de datos para la API
    return uniquePhones.map(phone => ({ phone }));
  };

  // Manejar la importación de contactos
  const handleImport = () => {
    let contactsData: any[] = [];
    let source = "";

    if (activeTab === "email") {
      if (!emailData.trim()) {
        toast({
          title: "No hay datos para importar",
          description: "Por favor ingresa al menos un correo electrónico.",
          variant: "destructive",
        });
        return;
      }
      contactsData = parseEmailData(emailData);
      source = "email";
    } else if (activeTab === "phone") {
      if (!phoneData.trim()) {
        toast({
          title: "No hay datos para importar",
          description: "Por favor ingresa al menos un número de teléfono.",
          variant: "destructive",
        });
        return;
      }
      contactsData = parsePhoneData(phoneData);
      source = "phone";
    }

    if (contactsData.length === 0) {
      toast({
        title: "No se encontraron datos válidos",
        description: `No se detectaron ${activeTab === "email" ? "correos electrónicos" : "números de teléfono"} válidos en el texto proporcionado.`,
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    importContactsMutation.mutate({ source, contactsData });
  };

  // Obtener el estado formateado de una importación
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Upload className="h-3 w-3 mr-1" />
            Procesando
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completado
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Fallido
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener icono para la fuente de importación
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "social_media":
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Obtener texto para la fuente de importación
  const getSourceText = (source: string) => {
    switch (source) {
      case "email":
        return "Correo electrónico";
      case "phone":
        return "Teléfono";
      case "social_media":
        return "Redes sociales";
      default:
        return source;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Importar Contactos</h2>
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Importar contactos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Importar contactos</DialogTitle>
              <DialogDescription>
                Encuentra contactos que ya usan MediConnect e invítalos a conectar.
              </DialogDescription>
            </DialogHeader>
            
            {importResults ? (
              <div className="py-4">
                <div className="mb-4">
                  <Alert className={importResults.matchedUsers.length > 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                    <CheckCircle className={`h-4 w-4 ${importResults.matchedUsers.length > 0 ? "text-green-500" : "text-yellow-500"}`} />
                    <AlertTitle>Importación completada</AlertTitle>
                    <AlertDescription>
                      {importResults.matchedUsers.length > 0 
                        ? `Se encontraron ${importResults.matchedUsers.length} contactos en la plataforma.`
                        : "No se encontraron contactos registrados en la plataforma."}
                    </AlertDescription>
                  </Alert>
                </div>
                
                {importResults.matchedUsers.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Contactos encontrados:</h3>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importResults.matchedUsers.map((contact) => (
                            <TableRow key={contact.id}>
                              <TableCell className="font-medium">{contact.name}</TableCell>
                              <TableCell>
                                {contact.userType === "doctor" ? "Médico" : 
                                 contact.userType === "patient" ? "Paciente" : 
                                 contact.userType}
                              </TableCell>
                              <TableCell>
                                {contact.status === "pending" ? (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    Solicitud enviada
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Conectado
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="mb-1">No se encontraron contactos registrados</p>
                    <p className="text-sm">Puedes invitar a tus contactos a unirse a MediConnect</p>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      setImportResults(null);
                      setEmailData("");
                      setPhoneData("");
                      setImportDialogOpen(false);
                    }}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="py-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="email" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Correo electrónico
                    </TabsTrigger>
                    <TabsTrigger value="phone" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Teléfono
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email" className="mt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email-data">Lista de correos electrónicos</Label>
                        <Textarea
                          id="email-data"
                          placeholder="Pega aquí correos electrónicos separados por comas, espacios o saltos de línea..."
                          value={emailData}
                          onChange={(e) => setEmailData(e.target.value)}
                          rows={8}
                        />
                        <p className="text-xs text-muted-foreground">
                          Puedes pegar múltiples correos electrónicos en cualquier formato. El sistema extraerá automáticamente las direcciones de correo válidas.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="phone" className="mt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="phone-data">Lista de números de teléfono</Label>
                        <Textarea
                          id="phone-data"
                          placeholder="Pega aquí números de teléfono separados por comas, espacios o saltos de línea..."
                          value={phoneData}
                          onChange={(e) => setPhoneData(e.target.value)}
                          rows={8}
                        />
                        <p className="text-xs text-muted-foreground">
                          Puedes pegar múltiples números de teléfono en cualquier formato. El sistema extraerá automáticamente los números válidos.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setImportDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleImport}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar contactos
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Historial de importaciones</h3>
          
          {isLoadingHistory ? (
            <div className="text-center py-8">Cargando historial...</div>
          ) : historyError ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar historial
            </div>
          ) : importHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No has realizado importaciones de contactos aún.
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Contactos</TableHead>
                    <TableHead>Progreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importHistory.map((importItem) => (
                    <TableRow key={importItem.id}>
                      <TableCell>{formatDate(importItem.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSourceIcon(importItem.source)}
                          <span>{getSourceText(importItem.source)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(importItem.status)}</TableCell>
                      <TableCell>
                        {importItem.processedContacts}/{importItem.totalContacts}
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.round((importItem.processedContacts / Math.max(1, importItem.totalContacts)) * 100)}
                            className="h-2"
                          />
                          <span className="text-xs w-[30px]">
                            {Math.round((importItem.processedContacts / Math.max(1, importItem.totalContacts)) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};