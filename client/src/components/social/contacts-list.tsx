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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Check,
  X,
  MessageSquare,
  Calendar,
  FileText,
  EyeOff,
  Eye,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/hooks/use-user";

interface Contact {
  id: number;
  userId: number;
  contactId: number;
  name: string;
  userType: "patient" | "doctor" | "admin";
  profileImage: string | null;
  email: string;
  status: "pending" | "accepted" | "rejected" | "blocked";
  sharedMedicalInfo: boolean;
  isHidden: boolean;
  mutualConnectionsCount: number;
}

export const ContactsList = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Obtener todos los contactos
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    error: contactsError,
  } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contacts");
      const data = await response.json();
      return data as Contact[];
    },
  });

  // Obtener solicitudes de contacto pendientes
  const {
    data: pendingRequests = [],
    isLoading: isLoadingRequests,
    error: requestsError,
  } = useQuery({
    queryKey: ["/api/contacts/requests"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contacts/requests");
      const data = await response.json();
      return data as Contact[];
    },
  });

  // Aceptar solicitud de contacto
  const acceptRequestMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await apiRequest(
        "PUT",
        `/api/contacts/${contactId}/accept`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts/requests"] });
      toast({
        title: "Solicitud aceptada",
        description: "Has aceptado la solicitud de contacto.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo aceptar la solicitud: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Rechazar solicitud de contacto
  const rejectRequestMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await apiRequest(
        "PUT",
        `/api/contacts/${contactId}/reject`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts/requests"] });
      toast({
        title: "Solicitud rechazada",
        description: "Has rechazado la solicitud de contacto.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo rechazar la solicitud: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Ocultar contacto
  const toggleHideMutation = useMutation({
    mutationFn: async ({ id, isHidden }: { id: number; isHidden: boolean }) => {
      const response = await apiRequest("PUT", `/api/contacts/${id}/hide`, {
        isHidden,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Contacto actualizado",
        description: "La visibilidad del contacto ha sido actualizada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el contacto: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle compartir información médica
  const toggleShareMedicalInfoMutation = useMutation({
    mutationFn: async ({ id, share }: { id: number; share: boolean }) => {
      const response = await apiRequest(
        "PUT",
        `/api/contacts/${id}/share-medical-info`,
        { share }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Información médica actualizada",
        description: "La configuración de compartir información médica ha sido actualizada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la configuración: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Enviar solicitud de contacto
  const addContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await apiRequest("POST", "/api/contacts", {
        contactId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-search"] });
      toast({
        title: "Solicitud enviada",
        description: "La solicitud de contacto ha sido enviada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo enviar la solicitud: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Buscar usuarios
  const {
    data: searchResults = [],
    isLoading: isSearching,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["/api/user-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 3) return [];
      const response = await apiRequest(
        "GET",
        `/api/users/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      return data as {
        id: number;
        name: string;
        userType: string;
        profileImage: string | null;
        isContact: boolean;
        status?: string;
      }[];
    },
    enabled: searchQuery.length >= 3,
  });

  // Filtrar contactos según la pestaña activa
  const filteredContacts = (() => {
    let filteredList = [...contacts];

    if (activeTab === "doctors") {
      filteredList = filteredList.filter(
        (contact) => contact.userType === "doctor" && contact.status === "accepted"
      );
    } else if (activeTab === "patients") {
      filteredList = filteredList.filter(
        (contact) => contact.userType === "patient" && contact.status === "accepted"
      );
    } else if (activeTab === "all") {
      filteredList = filteredList.filter(
        (contact) => contact.status === "accepted"
      );
    }

    return filteredList;
  })();

  // Obtener iniciales para fallback de avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Renderizar cada contacto
  const renderContact = (contact: Contact) => (
    <Card key={contact.id} className={contact.isHidden ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={contact.profileImage || undefined} alt={contact.name} />
            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{contact.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Badge
                variant="outline"
                className={
                  contact.userType === "doctor"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }
              >
                {contact.userType === "doctor" ? "Médico" : "Paciente"}
              </Badge>
              {contact.mutualConnectionsCount > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  {contact.mutualConnectionsCount} conexiones en común
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          {contact.email}
        </div>
        <div className="flex items-center mt-2 text-sm">
          <Badge
            variant="outline"
            className={
              contact.sharedMedicalInfo
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }
          >
            {contact.sharedMedicalInfo 
              ? "Información médica compartida" 
              : "Información médica no compartida"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2 grid grid-cols-2 gap-2">
        {contact.userType === "doctor" ? (
          <>
            <Button variant="outline" size="sm" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Cita
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Historial
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-muted-foreground"
          onClick={() =>
            toggleShareMedicalInfoMutation.mutate({
              id: contact.id,
              share: !contact.sharedMedicalInfo,
            })
          }
        >
          {contact.sharedMedicalInfo ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              No compartir
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Compartir info
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-muted-foreground"
          onClick={() =>
            toggleHideMutation.mutate({
              id: contact.id,
              isHidden: !contact.isHidden,
            })
          }
        >
          {contact.isHidden ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Mostrar
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Ocultar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Mis Contactos</h2>
        <div className="flex gap-2">
          <div className="relative w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar nuevos contactos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {searchQuery.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de búsqueda</CardTitle>
            <CardDescription>
              Mostrando resultados para "{searchQuery}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <div className="text-center py-4">Buscando...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No se encontraron resultados para esta búsqueda
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={result.profileImage || undefined}
                            alt={result.name}
                          />
                          <AvatarFallback>{getInitials(result.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{result.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            result.userType === "doctor"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {result.userType === "doctor" ? "Médico" : "Paciente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {result.isContact ? (
                          <Badge
                            variant={
                              result.status === "pending"
                                ? "outline"
                                : result.status === "accepted"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              result.status === "pending"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : ""
                            }
                          >
                            {result.status === "pending"
                              ? "Pendiente"
                              : result.status === "accepted"
                              ? "Conectado"
                              : "Rechazado"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No conectado
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!result.isContact ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addContactMutation.mutate(result.id)}
                            disabled={addContactMutation.isPending}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Agregar
                          </Button>
                        ) : result.status === "pending" ? (
                          <span className="text-muted-foreground text-sm">
                            Solicitud enviada
                          </span>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Conectado
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Solicitudes pendientes
              <Badge className="ml-2 bg-yellow-500">{pendingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={request.profileImage || undefined}
                          alt={request.name}
                        />
                        <AvatarFallback>{getInitials(request.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{request.name}</div>
                        <div className="text-xs text-muted-foreground">{request.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          request.userType === "doctor"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }
                      >
                        {request.userType === "doctor" ? "Médico" : "Paciente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => acceptRequestMutation.mutate(request.id)}
                          disabled={acceptRequestMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectRequestMutation.mutate(request.id)}
                          disabled={rejectRequestMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Todos ({contacts.filter((c) => c.status === "accepted").length})
          </TabsTrigger>
          <TabsTrigger value="doctors">
            Médicos (
            {
              contacts.filter(
                (c) => c.userType === "doctor" && c.status === "accepted"
              ).length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="patients">
            Pacientes (
            {
              contacts.filter(
                (c) => c.userType === "patient" && c.status === "accepted"
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="p-0 mt-4">
          {isLoadingContacts ? (
            <div className="text-center py-8">Cargando contactos...</div>
          ) : contactsError ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar contactos
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tienes contactos aún. ¡Busca y agrega contactos para comenzar!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map(renderContact)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="doctors" className="p-0 mt-4">
          {isLoadingContacts ? (
            <div className="text-center py-8">Cargando contactos...</div>
          ) : contactsError ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar contactos
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tienes contactos médicos aún.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map(renderContact)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="patients" className="p-0 mt-4">
          {isLoadingContacts ? (
            <div className="text-center py-8">Cargando contactos...</div>
          ) : contactsError ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar contactos
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tienes contactos pacientes aún.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map(renderContact)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};