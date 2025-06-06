import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import PatientLayout from "@/layouts/PatientLayout";
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
  Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Interfaz para los datos del doctor
interface Doctor {
  id: number;
  userId: number;
  specialtyId: number;
  specialtyName: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  consultationFee: number;
  biography: string;
  education: string;
  experience: number;
  address: string | null;
  phone: string | null;
  profileImage: string | null;
  licenseVerified: boolean;
  verificationStatus: string;
}

export default function DoctorDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const doctorId = params.id ? parseInt(params.id) : null;
  
  // Estado para seguimiento de imágenes cargadas
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Consulta para obtener datos del doctor
  const { 
    data: doctor, 
    isLoading,
    error 
  } = useQuery<Doctor>({
    queryKey: [`/api/doctors/${doctorId}`],
    enabled: doctorId !== null,
  });
  
  if (isLoading) {
    return (
      <PatientLayout>
        <div className="mb-8">
          <Button 
            variant="outline" 
            className="mb-8"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Volver</span>
          </Button>
              
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
      </PatientLayout>
    );
  }
  
  if (error || !doctor) {
    return (
      <PatientLayout>
        <div className="text-center py-12">
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
            <Link href="/dashboard/patient/doctor-list">
              Ver todos los médicos
            </Link>
          </Button>
        </div>
      </PatientLayout>
    );
  }
  
  // Función para agendar cita
  const handleScheduleAppointment = () => {
    // Navegar a la página de agendar cita con el ID del médico
    window.location.href = `/dashboard/patient/agendar-cita?doctorId=${doctor.id}`;
  };
  
  return (
    <PatientLayout>
      <div className="mb-8">
        {/* Navegación */}
        <Link href="/dashboard/patient/doctor-list">
          <Button 
            variant="outline" 
            className="mb-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Volver a la lista de médicos</span>
          </Button>
        </Link>
        
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
                    
                    {doctor.licenseVerified && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <BadgeCheck className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h1>
                  
                  <div className="text-gray-600 mb-4 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    <span>{doctor.specialtyName || "Especialista médico"}</span>
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <FileText className="h-4 w-4 mr-1 text-gray-600" />
                    <span className="text-sm text-gray-600">Cédula: {doctor.licenseNumber}</span>
                  </div>
                  
                  <div className="w-full space-y-3 mt-2">
                    <Button onClick={handleScheduleAppointment} className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar cita
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar mensaje
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
                <CardTitle>Acerca del doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">
                  {doctor.biography || `El Dr. ${doctor.firstName} ${doctor.lastName} es un profesional de la salud especializado en ${doctor.specialtyName || "medicina"} con amplia experiencia en el diagnóstico y tratamiento de pacientes.`}
                </p>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle className="text-lg">Formación académica</CardTitle>
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
                    <CardTitle className="text-lg">Experiencia profesional</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {doctor.experience > 0 
                      ? `${doctor.experience} años de experiencia en el campo de ${doctor.specialtyName || "la medicina"}.` 
                      : "Información de experiencia no disponible."}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Opciones de acción */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Agendar consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Si deseas consultar con el Dr. {doctor.firstName} {doctor.lastName}, puedes agendar una cita desde tu dashboard.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button onClick={handleScheduleAppointment} className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar cita ahora
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Contactar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}