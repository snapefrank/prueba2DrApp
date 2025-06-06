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
  Star,
  MessageSquare,
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Componente para mostrar estrellas de calificación
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

interface Doctor {
  id: number;
  name: string;
  profileImage: string | null;
  specialty: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  date: string;
  isAnonymous: boolean;
  isVisible: boolean;
  doctor: {
    id: number;
    name: string;
    profileImage: string | null;
    specialty: string;
  };
}

export const DoctorReviews = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-reviews");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Obtener las reseñas del usuario
  const {
    data: myReviews = [],
    isLoading: isLoadingMyReviews,
    error: myReviewsError,
  } = useQuery({
    queryKey: ["/api/patient/reviews"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/patient/reviews");
      const data = await response.json();
      return data as Review[];
    },
  });

  // Obtener médicos
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

  // Mutation para crear una reseña
  const createReviewMutation = useMutation({
    mutationFn: async (data: {
      doctorId: number;
      rating: number;
      comment: string;
      isAnonymous: boolean;
    }) => {
      const response = await apiRequest(
        "POST",
        `/api/doctors/${data.doctorId}/reviews`,
        {
          rating: data.rating,
          comment: data.comment,
          isAnonymous: data.isAnonymous,
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient/reviews"] });
      setReviewDialogOpen(false);
      setSelectedDoctor("");
      setRating(5);
      setComment("");
      setIsAnonymous(false);
      toast({
        title: "Reseña publicada",
        description: "Tu reseña ha sido publicada exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo publicar la reseña: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation para cambiar la visibilidad de una reseña
  const toggleReviewVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      const response = await apiRequest("PUT", `/api/reviews/${id}/visibility`, {
        isVisible,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patient/reviews"] });
      toast({
        title: "Reseña actualizada",
        description: "La visibilidad de la reseña ha sido actualizada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la reseña: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Manejar el envío del formulario
  const handleSubmitReview = () => {
    if (!selectedDoctor) {
      toast({
        title: "Médico no seleccionado",
        description: "Por favor selecciona un médico para dejar la reseña.",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      doctorId: parseInt(selectedDoctor),
      rating,
      comment: comment.trim(),
      isAnonymous,
    });
  };

  // Manejar cambio en la calificación
  const handleRatingChange = (value: string) => {
    setRating(parseInt(value));
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
        <h2 className="text-3xl font-bold tracking-tight">Reseñas de Médicos</h2>
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Star className="h-4 w-4" />
              Escribir reseña
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Escribir una reseña</DialogTitle>
              <DialogDescription>
                Comparte tu experiencia con un médico para ayudar a otros pacientes.
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
                <Label htmlFor="rating">Calificación</Label>
                <Select
                  value={rating.toString()}
                  onValueChange={handleRatingChange}
                >
                  <SelectTrigger id="rating">
                    <SelectValue
                      placeholder="Selecciona una calificación"
                      className="flex items-center"
                    >
                      <div className="flex items-center gap-2">
                        <RatingStars rating={rating} />
                        <span>{rating} {rating === 1 ? "estrella" : "estrellas"}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((value) => (
                      <SelectItem key={value} value={value.toString()}>
                        <div className="flex items-center gap-2">
                          <RatingStars rating={value} />
                          <span>{value} {value === 1 ? "estrella" : "estrellas"}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="comment">Comentario</Label>
                <Textarea
                  id="comment"
                  placeholder="Describe tu experiencia con este médico..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">Publicar de forma anónima</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleSubmitReview}
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? "Publicando..." : "Publicar reseña"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-reviews">
            Mis reseñas ({myReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-reviews" className="p-0 mt-4">
          {isLoadingMyReviews ? (
            <div className="text-center py-8">Cargando reseñas...</div>
          ) : myReviewsError ? (
            <div className="text-center py-8 text-red-500">
              Error al cargar reseñas
            </div>
          ) : myReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No has escrito reseñas aún. ¡Comparte tu experiencia con los médicos que has consultado!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myReviews.map((review) => (
                <Card key={review.id} className={!review.isVisible ? "opacity-60" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={review.doctor.profileImage || undefined} alt={review.doctor.name} />
                          <AvatarFallback>{getInitials(review.doctor.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{review.doctor.name}</CardTitle>
                          <CardDescription className="flex mt-1">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {review.doctor.specialty}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={review.isVisible 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-gray-50 text-gray-700 border-gray-200"}
                            >
                              {review.isVisible ? "Visible" : "Oculta"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {review.isVisible 
                              ? "Esta reseña es visible públicamente" 
                              : "Esta reseña está oculta y no es visible para otros"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <RatingStars rating={review.rating} />
                      <span className="text-sm text-muted-foreground">
                        • {formatDate(review.date)}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="text-sm line-clamp-3">{review.comment}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No incluiste comentarios en esta reseña.
                      </p>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {review.isAnonymous ? "Publicada anónimamente" : "Publicada con tu nombre"}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toggleReviewVisibilityMutation.mutate({
                        id: review.id,
                        isVisible: !review.isVisible
                      })}
                      disabled={toggleReviewVisibilityMutation.isPending}
                    >
                      {review.isVisible ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Mostrar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(`/doctor/${review.doctor.id}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver perfil
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};