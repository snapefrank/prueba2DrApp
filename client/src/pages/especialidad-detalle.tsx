import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  Loader2, 
  Calendar, 
  Award, 
  Clock, 
  MapPin, 
  Star, 
  StarHalf,
  Phone,
  CheckCircle2,
  ClipboardList,
  User,
  Users
} from "lucide-react";

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
  profileImage: string | null;
  rating: number;
  yearsExperience: number;
  consultationCount: number;
  consultationPrice: number;
  location: string;
  availableHours?: string[];
  certifications?: string[];
  isVerified: boolean;
}

export default function EspecialidadDetallePage() {
  const params = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState("doctores");
  
  // Convertir el slug a un nombre más legible
  const specialtyName = params.slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  // Consulta para obtener los doctores de esta especialidad
  const { data: doctors, isLoading, error } = useQuery<Doctor[]>({
    queryKey: [`/api/public/doctors/by-specialty/${params.slug}`],
    // Si no hay API real todavía, esto solo mostrará un estado de carga
  });
  
  // Datos de ejemplo para mostrar mientras no hay conexión real a API
  const sampleDoctors: Doctor[] = [
    {
      id: 1,
      firstName: "Carlos",
      lastName: "Rodríguez",
      title: "Dr.",
      specialty: "Cardiología",
      profileImage: null,
      rating: 4.8,
      yearsExperience: 15,
      consultationCount: 2450,
      consultationPrice: 800,
      location: "CDMX, México",
      availableHours: ["09:00", "10:30", "12:00", "17:00"],
      certifications: ["Universidad Nacional Autónoma de México", "Consejo Mexicano de Cardiología"],
      isVerified: true
    },
    {
      id: 2,
      firstName: "Laura",
      lastName: "Fernández",
      title: "Dra.",
      specialty: "Cardiología",
      profileImage: null,
      rating: 4.9,
      yearsExperience: 12,
      consultationCount: 1890,
      consultationPrice: 750,
      location: "Guadalajara, México",
      availableHours: ["08:30", "11:00", "13:30", "16:00"],
      certifications: ["Universidad de Guadalajara", "American Heart Association"],
      isVerified: true
    },
    {
      id: 3,
      firstName: "Miguel",
      lastName: "González",
      title: "Dr.",
      specialty: "Cardiología",
      profileImage: null,
      rating: 4.7,
      yearsExperience: 8,
      consultationCount: 1200,
      consultationPrice: 650,
      location: "Monterrey, México",
      availableHours: ["10:00", "12:30", "15:00", "18:30"],
      certifications: ["Instituto Tecnológico de Monterrey", "Sociedad Europea de Cardiología"],
      isVerified: true
    }
  ];
  
  // Renderizar estrellas según la calificación
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Estrellas completas
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    // Media estrella si aplica
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    // Estrellas vacías para completar 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="bg-gradient-to-b from-primary/10 to-background py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Link href="/especialidades" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Volver a especialidades
              </Link>
              
              <h1 className="text-3xl font-bold text-gray-900 mt-4 md:text-4xl">
                {specialtyName}
              </h1>
              
              <p className="mt-3 text-lg text-gray-600 max-w-4xl">
                Encuentra a los mejores especialistas en {specialtyName}. Nuestros médicos son profesionales certificados con experiencia comprobada en su campo.
              </p>
            </div>
            
            <Tabs 
              defaultValue="doctores" 
              className="w-full mb-6"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="doctores" className="px-6">
                  <Users className="h-4 w-4 mr-2" />
                  Doctores
                </TabsTrigger>
                <TabsTrigger value="informacion" className="px-6">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Información sobre {specialtyName}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="doctores">
                {isLoading ? (
                  // Esqueletos de carga
                  <div className="space-y-6">
                    {[...Array(3)].map((_, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="md:w-40 flex justify-center">
                              <Skeleton className="h-32 w-32 rounded-full" />
                            </div>
                            <div className="flex-1 space-y-4">
                              <Skeleton className="h-6 w-48" />
                              <div className="flex gap-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                              <div className="flex gap-2">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-8 w-32" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-100 mb-4">
                      <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Error al cargar doctores
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      No pudimos cargar la lista de especialistas. Por favor intenta nuevamente más tarde.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                      Reintentar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(doctors || sampleDoctors).map((doctor) => (
                      <Card key={doctor.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="md:w-40 flex justify-center">
                              <Avatar className="h-32 w-32 border-2 border-primary/10">
                                {doctor.profileImage ? (
                                  <AvatarImage src={doctor.profileImage} alt={`${doctor.title} ${doctor.firstName} ${doctor.lastName}`} />
                                ) : (
                                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                    {doctor.firstName.charAt(0) + doctor.lastName.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                    {doctor.title} {doctor.firstName} {doctor.lastName}
                                    {doctor.isVerified && (
                                      <Badge variant="outline" className="ml-2 text-blue-600 border-blue-200 bg-blue-50 flex items-center">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Verificado
                                      </Badge>
                                    )}
                                  </h3>
                                  <p className="text-gray-500 mb-1">{doctor.specialty}</p>
                                  <div className="flex items-center mb-3">
                                    <div className="flex mr-1">
                                      {renderStars(doctor.rating)}
                                    </div>
                                    <span className="text-sm text-gray-600">({doctor.rating.toFixed(1)})</span>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-primary">${doctor.consultationPrice}</p>
                                  <p className="text-sm text-gray-500">por consulta</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center">
                                  <Award className="h-5 w-5 text-gray-400 mr-2" />
                                  <div>
                                    <p className="text-sm text-gray-500">Experiencia</p>
                                    <p className="font-medium">{doctor.yearsExperience} años</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <User className="h-5 w-5 text-gray-400 mr-2" />
                                  <div>
                                    <p className="text-sm text-gray-500">Consultas</p>
                                    <p className="font-medium">{doctor.consultationCount}+</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                                  <div>
                                    <p className="text-sm text-gray-500">Ubicación</p>
                                    <p className="font-medium">{doctor.location}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-3 items-center justify-between mt-4">
                                <div className="flex flex-wrap gap-2">
                                  {doctor.availableHours?.slice(0, 3).map((hour, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-gray-50">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {hour}
                                    </Badge>
                                  ))}
                                  {doctor.availableHours && doctor.availableHours.length > 3 && (
                                    <Badge variant="outline" className="bg-gray-50">
                                      +{doctor.availableHours.length - 3} más
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex gap-3 ml-auto">
                                  <Button variant="outline" size="sm">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Contactar
                                  </Button>
                                  <Button size="sm">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Agendar cita
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="informacion">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Acerca de {specialtyName}</h2>
                    
                    <div className="prose max-w-none text-gray-600">
                      <p>
                        La {specialtyName.toLowerCase()} es una especialidad médica que se enfoca en el diagnóstico, tratamiento y prevención de enfermedades relacionadas con el sistema cardiovascular.
                      </p>
                      
                      <h3 className="text-xl font-semibold mt-6 mb-3">¿Cuándo consultar a un especialista en {specialtyName.toLowerCase()}?</h3>
                      
                      <p>Deberías considerar consultar a un especialista en {specialtyName.toLowerCase()} si experimentas:</p>
                      
                      <ul className="list-disc pl-6 space-y-2 mt-3">
                        <li>Dolor o molestias en el pecho</li>
                        <li>Dificultad para respirar</li>
                        <li>Latidos cardíacos irregulares o palpitaciones</li>
                        <li>Presión arterial alta persistente</li>
                        <li>Mareos o desmayos frecuentes</li>
                        <li>Hinchazón en las piernas, tobillos o pies</li>
                        <li>Historia familiar de enfermedades cardíacas</li>
                      </ul>
                      
                      <h3 className="text-xl font-semibold mt-6 mb-3">Preparación para tu consulta</h3>
                      
                      <p>Para aprovechar al máximo tu cita con un especialista en {specialtyName.toLowerCase()}, considera:</p>
                      
                      <ul className="list-disc pl-6 space-y-2 mt-3">
                        <li>Llevar una lista de los medicamentos que estás tomando actualmente</li>
                        <li>Recopilar tu historial médico familiar</li>
                        <li>Tener a la mano estudios previos relacionados</li>
                        <li>Preparar una lista de preguntas o inquietudes</li>
                        <li>Describir tus síntomas de manera detallada</li>
                      </ul>
                      
                      <p className="mt-6">
                        En MediConnect, todos nuestros especialistas en {specialtyName.toLowerCase()} están certificados y cuentan con amplia experiencia en el diagnóstico y tratamiento de condiciones relacionadas con su especialidad.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}