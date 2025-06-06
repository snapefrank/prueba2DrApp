import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Calendar, MapPin, Phone, Mail, Clock, Star, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Interfaces
interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  specialty: string | null;
  specialtyId: number;
  licenseNumber: string;
  biography: string | null;
  education: string | null;
  experience: string | null;
  address: string | null;
  consultationFee: number;
  verificationStatus: string;
  rating?: number;
  reviewsCount?: number;
  email?: string;
  phone?: string;
  availableDays?: string[];
  availableHours?: { start: string; end: string };
}

interface DoctorPageProps {
  id?: string;
}

const DoctorDetailPage = ({ id: propId }: DoctorPageProps) => {
  const [, params] = useRoute<{ id: string }>("/doctores/:id");
  const doctorId = propId || params?.id || "";

  // Consulta para obtener los detalles del médico
  const { 
    data: doctor, 
    isLoading, 
    error 
  } = useQuery<Doctor>({
    queryKey: ['/api/public/doctors', doctorId],
    enabled: !!doctorId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-lg text-gray-600">Cargando información del médico...</p>
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
        <main className="flex-grow py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <User className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-2">
                Médico no encontrado
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                El médico que estás buscando no existe o ha ocurrido un error al cargar la información.
              </p>
              <Button asChild>
                <Link href="/especialidades">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Explorar especialidades
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
        <div className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Navegación de regreso */}
            {doctor.specialty && (
              <Link 
                href={`/especialidades/${doctor.specialty.toLowerCase().replace(/\s+/g, "-")}`} 
                className="inline-flex items-center text-gray-600 hover:text-primary mb-8"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a {doctor.specialty}
              </Link>
            )}
            
            {/* Perfil del médico */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-10">
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Columna izquierda con foto y datos básicos */}
                <div className="md:col-span-1">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    {doctor.profileImage ? (
                      <img 
                        src={doctor.profileImage} 
                        alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <User className="h-20 w-20 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-2">
                    {doctor.verificationStatus === "VERIFIED" && (
                      <Badge className="bg-green-100 text-green-800 border-0 mr-2">Verificado</Badge>
                    )}
                    {doctor.rating && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-sm font-medium">{doctor.rating.toFixed(1)}</span>
                        {doctor.reviewsCount && (
                          <span className="text-sm text-gray-500 ml-1">
                            ({doctor.reviewsCount} {doctor.reviewsCount === 1 ? 'opinión' : 'opiniones'})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h1>
                  
                  <p className="text-primary font-medium mb-4">
                    {doctor.specialty || "Médico general"}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {doctor.address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <p className="text-gray-600">{doctor.address}</p>
                      </div>
                    )}
                    
                    {doctor.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <p className="text-gray-600">{doctor.phone}</p>
                      </div>
                    )}
                    
                    {doctor.email && (
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <p className="text-gray-600">{doctor.email}</p>
                      </div>
                    )}
                    
                    {doctor.availableDays && (
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <p className="text-gray-600">
                          Disponible: {doctor.availableDays.join(', ')}
                        </p>
                      </div>
                    )}
                    
                    {doctor.availableHours && (
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <p className="text-gray-600">
                          Horario: {doctor.availableHours.start} - {doctor.availableHours.end}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900 mb-1">Tarifa de consulta</p>
                    <p className="text-lg font-bold text-primary">
                      ${doctor.consultationFee.toFixed(2)} MXN
                    </p>
                  </div>
                  
                  <Button className="w-full mb-3">
                    Agendar cita
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Contactar
                  </Button>
                </div>
                
                {/* Columna derecha con información profesional */}
                <div className="md:col-span-2 space-y-8">
                  {doctor.biography && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        Sobre el Dr. {doctor.firstName}
                      </h2>
                      <p className="text-gray-600 whitespace-pre-line">
                        {doctor.biography}
                      </p>
                    </div>
                  )}
                  
                  {doctor.education && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        Formación académica
                      </h2>
                      <p className="text-gray-600 whitespace-pre-line">
                        {doctor.education}
                      </p>
                    </div>
                  )}
                  
                  {doctor.experience && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        Experiencia profesional
                      </h2>
                      <p className="text-gray-600 whitespace-pre-line">
                        {doctor.experience}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Credenciales
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Cédula profesional</p>
                          <p className="font-medium">{doctor.licenseNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Especialidad</p>
                          <p className="font-medium">{doctor.specialty || "Medicina General"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sección de opiniones (placeholder) */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Opiniones de pacientes
              </h2>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-600 mb-4">
                  No hay opiniones disponibles por el momento.
                </p>
                <Button variant="outline">
                  Dejar una opinión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DoctorDetailPage;