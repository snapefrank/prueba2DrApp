import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { 
  BadgeCheck, 
  Calendar, 
  MapPin, 
  Phone, 
  Star, 
  Stethoscope,
  GraduationCap,
  Award,
  FileText,
  ChevronLeft,
  Loader2,
  UserRound,
  Clock,
  MessageCircle,
  Mail
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Interfaz para los datos del doctor
interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  specialty: string | null;
  licenseNumber: string;
  biography: string;
  education: string;
  experience: number;
  address: string | null;
  phone: string | null;
  consultationFee: number;
}

// Interfaz para especialidad
interface Specialty {
  id: number;
  name: string;
  description: string | null;
}

const DoctorProfilePage = () => {
  const params = useParams();
  const [, setLocation] = useLocation();
  const doctorId = params.id ? parseInt(params.id) : null;
  
  // Consulta para obtener datos del doctor
  const { 
    data: doctor, 
    isLoading,
    error 
  } = useQuery<Doctor>({
    queryKey: [`/api/public/doctors/${doctorId}`],
    enabled: doctorId !== null,
  });
  
  // Estado para seguimiento de imágenes cargadas
  const [imageLoaded, setImageLoaded] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <Skeleton className="h-6 w-32 mb-8" />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna izquierda - Foto y datos básicos */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <Skeleton className="h-64 w-64 rounded-full mb-6" />
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-5 w-32 mb-4" />
                        
                        <div className="w-full space-y-4 mt-4">
                          <Skeleton className="h-9 w-full rounded-md" />
                          <Skeleton className="h-9 w-full rounded-md" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Columna derecha - Información detallada */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-7 w-48 mb-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-7 w-36" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-3/4" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <Skeleton className="h-7 w-36" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-3/4" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (error || !doctor) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <Stethoscope className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                No pudimos encontrar al médico
              </h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Lo sentimos, el perfil que estás buscando no existe o no está disponible en este momento.
              </p>
              <Button asChild>
                <Link href="/especialidades">
                  <a>Ver especialidades</a>
                </Link>
              </Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Navegación */}
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Volver</span>
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Foto y datos básicos */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="w-64 h-64 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {doctor.profileImage ? (
                          <img 
                            src={doctor.profileImage} 
                            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                            className={`w-full h-full object-cover ${imageLoaded ? 'block' : 'hidden'}`}
                            onLoad={() => setImageLoaded(true)}
                          />
                        ) : (
                          <UserRound className="h-32 w-32 text-gray-400" />
                        )}
                        {doctor.profileImage && !imageLoaded && (
                          <Loader2 className="h-10 w-10 text-gray-400 animate-spin absolute inset-0 m-auto" />
                        )}
                      </div>
                      
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <BadgeCheck className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h1>
                    
                    <div className="text-gray-600 mb-4 flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 mr-1" />
                      <span>{doctor.specialty || "Especialista médico"}</span>
                    </div>
                    
                    <div className="flex items-center justify-center mb-4">
                      <FileText className="h-4 w-4 mr-1 text-gray-600" />
                      <span className="text-sm text-gray-600">Cédula: {doctor.licenseNumber}</span>
                    </div>
                    
                    <div className="w-full space-y-3 mt-2">
                      <Button asChild className="w-full">
                        <Link href={`/auth?register=true&type=patient&doctor=${doctor.id}`}>
                          <a className="flex items-center justify-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar cita
                          </a>
                        </Link>
                      </Button>
                      
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/auth?register=true&type=patient&doctor=${doctor.id}&chat=true`}>
                          <a className="flex items-center justify-center">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Enviar mensaje
                          </a>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Información de contacto</h3>
                  
                  {doctor.address && (
                    <div className="flex items-start mb-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Dirección</h4>
                        <p className="text-gray-600">{doctor.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {doctor.phone && (
                    <div className="flex items-start mb-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Teléfono</h4>
                        <p className="text-gray-600">{doctor.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start mb-3">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Tarifa de consulta</h4>
                      <p className="text-gray-600">${doctor.consultationFee.toFixed(2)} MXN</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Columna derecha - Información detallada */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Acerca del doctor</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {doctor.biography || `El Dr. ${doctor.firstName} ${doctor.lastName} es un profesional de la salud especializado en ${doctor.specialty || "medicina"} con amplia experiencia en el diagnóstico y tratamiento de pacientes.`}
                  </p>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-lg font-semibold">Formación académica</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-700 whitespace-pre-line">
                          {doctor.education || "Información no disponible"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="text-lg font-semibold">Experiencia profesional</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      {doctor.experience > 0 
                        ? `${doctor.experience} años de experiencia en el campo de ${doctor.specialty || "la medicina"}.` 
                        : "Información de experiencia no disponible."}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Información adicional */}
              <Card className="mt-6">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Información adicional</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Número de cédula profesional</h4>
                      <p className="text-gray-600">{doctor.licenseNumber}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Especialidad</h4>
                      <p className="text-gray-600">{doctor.specialty || "No especificado"}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctor.address && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Ubicación</h4>
                        <p className="text-gray-600">{doctor.address}</p>
                      </div>
                    )}
                    
                    {doctor.phone && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Contacto</h4>
                        <p className="text-gray-600">{doctor.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Reseñas (mock por ahora) */}
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Opiniones de pacientes</h3>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1 fill-current" />
                      <span className="font-semibold">5.0</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Todavía no hay opiniones para este médico.
                    </p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href={`/auth?register=true&type=patient&doctor=${doctor.id}`}>
                        <a>Sé el primero en dejar una opinión</a>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DoctorProfilePage;