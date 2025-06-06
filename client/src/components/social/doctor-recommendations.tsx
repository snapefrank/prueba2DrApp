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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Heart,
  UserCheck,
  UserPlus,
  Check,
  X,
  MessageSquare,
  Eye,
  EyeOff,
  Star,
  Calendar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Contact {
  contactId: number;
  userId: number;
  name: string;
  profileImage: string | null;
  userType: "patient" | "doctor" | "admin";
  status: "accepted" | "pending" | "rejected";
}

interface Doctor {
  id: number;
  name: string;
  profileImage: string | null;
  specialty: string;
}

interface Recommendation {
  id: number;
  doctor: Doctor;
  from: { 
    id?: number; 
    name?: string; 
    profileImage?: string | null;
    anonymous?: boolean;
  };
  message: string | null;
  date: string;
  isRead: boolean;
}

export const DoctorRecommendations = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("received");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  // Estado para el formulario de recomendación
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Obtener recomendaciones recibidas
  const {
    data: receivedRecommendations = [],
    isLoading: isLoadingReceived,
    error: receivedError,
  } = useQuery({
    queryKey: ["/api/recommendations/received"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/recommendations/received");
      const data = await response.json();
      return data as Recommendation[];
    },
  });

  // Obtener contactos para recomendar
  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
  } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/contacts");
      const data = await response.json();
      // Filtramos solo contactos aceptados
      return data.filter((c: Contact) => c.status === "accepted") as Contact[];
    },
  });

  // Obtener médicos para recomendar
  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
  } = useQuery({
    queryKey: ["/api/doctors"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/doctors");
      const data = await response.json();
      return data as Doctor[];
    },
  });

  // Marcar recomendación como leída
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/recommendations/${id}/read`);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations/received"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo marcar como leída: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Enviar una recomendación
  const sendRecommendationMutation = useMutation({
    mutationFn: async (data: {
      toUserId: number;
      doctorId: number;
      message: string;
      isAnonymous: boolean;
    }) => {
      const response = await apiRequest("POST", "/api/recommendations", data);
      return response.json();
    },
    onSuccess: () => {
      setSendDialogOpen(false);
      setSelectedDoctor("");
      setSelectedContact("");
      setMessage("");
      setIsAnonymous(false);
      toast({
        title: "Recomendación enviada",
        description: "Tu recomendación ha sido enviada exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo enviar la recomendación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejar el envío del formulario
  const handleSendRecommendation = () => {
    if (!selectedDoctor || !selectedContact) {
      toast({
        title: "Campos incompletos",
        description: "Por favor selecciona un médico y un contacto.",
        variant: "destructive",
      });
      return;
    }

    sendRecommendationMutation.mutate({
      toUserId: parseInt(selectedContact),
      doctorId: parseInt(selectedDoctor),
      message: message.trim() || "",
      isAnonymous,
    });
  };

  // Obtener iniciales para fallback de avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Marcar como leída al abrir los detalles
  const handleOpenRecommendation = (recommendation: Recommendation) => {
    if (!recommendation.isRead) {
      markAsReadMutation.mutate(recommendation.id);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Recomendaciones de Médicos</h2>
        <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Heart className="h-4 w-4" />
              Recomendar médico
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Recomendar un médico</DialogTitle>
              <DialogDescription>
                Comparte una recomendación de un médico con tus contactos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="doctor">Selecciona un médico</Label>
                <Select
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Selecciona un médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDoctors ? (
                      <SelectItem value="loading" disabled>
                        Cargando médicos...
                      </SelectItem>
                    ) : doctors.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No hay médicos disponibles
                      </SelectItem>
                    ) : (
                      doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contact">Selecciona un contacto</Label>
                <Select
                  value={selectedContact}
                  onValueChange={setSelectedContact}
                >
                  <SelectTrigger id="contact">
                    <SelectValue placeholder="Selecciona un contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingContacts ? (
                      <SelectItem value="loading" disabled>
                        Cargando contactos...
                      </SelectItem>
                    ) : contacts.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No tienes contactos
                      </SelectItem>
                    ) : (
                      contacts.map((contact) => (
                        <SelectItem key={contact.userId} value={contact.userId.toString()}>
                          {contact.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Mensaje (opcional)</Label>
                <Textarea
                  id="message"
                  placeholder="¿Por qué recomiendas a este médico?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">Recomendar de forma anónima</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSendRecommendation}
                disabled={sendRecommendationMutation.isPending}
              >
                {sendRecommendationMutation.isPending ? "Enviando..." : "Enviar recomendación"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="received" className="relative">
            Recomendaciones recibidas
            {receivedRecommendations.filter(r => !r.isRead).length > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {receivedRecommendations.filter(r => !r.isRead).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="p-0 mt-4">
          {isLoadingReceived ? (
            <div className="text-center py-8">Cargando recomendaciones...</div>
          ) : receivedError ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar recomendaciones
            </div>
          ) : receivedRecommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No has recibido recomendaciones de médicos aún.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receivedRecommendations.map((rec) => (
                <Dialog key={rec.id} onOpenChange={() => handleOpenRecommendation(rec)}>
                  <DialogTrigger asChild>
                    <Card className={rec.isRead ? "" : "border-primary"}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={rec.doctor.profileImage || undefined} alt={rec.doctor.name} />
                              <AvatarFallback>{getInitials(rec.doctor.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{rec.doctor.name}</CardTitle>
                              <CardDescription className="flex mt-1">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {rec.doctor.specialty}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                          {!rec.isRead && (
                            <Badge className="bg-primary">Nueva</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>
                            Recomendado por{" "}
                            {rec.from.anonymous ? (
                              <span className="font-medium">contacto anónimo</span>
                            ) : (
                              <span className="font-medium">{rec.from.name}</span>
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(rec.date)}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Calendar className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button>
                      </CardFooter>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Recomendación de {rec.doctor.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={rec.doctor.profileImage || undefined} alt={rec.doctor.name} />
                          <AvatarFallback className="text-lg">{getInitials(rec.doctor.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-bold">{rec.doctor.name}</h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
                            {rec.doctor.specialty}
                          </Badge>
                        </div>
                      </div>

                      <div className="border rounded-md p-4 bg-muted/30">
                        <div className="flex items-center gap-2 mb-3">
                          {rec.from.anonymous ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-gray-300">AN</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">Contacto anónimo</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={rec.from.profileImage || undefined} alt={rec.from.name} />
                                <AvatarFallback className="text-xs">{getInitials(rec.from.name || "")}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{rec.from.name}</span>
                            </div>
                          )}
                          <span className="text-sm text-muted-foreground">
                            • {formatDate(rec.date)}
                          </span>
                        </div>
                        {rec.message ? (
                          <p className="text-sm">{rec.message}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No se incluyó un mensaje con esta recomendación.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Button className="w-full" variant="default">
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar cita
                        </Button>
                        <Button className="w-full" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contactar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};