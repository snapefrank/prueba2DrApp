import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Stethoscope, Search, ArrowRight, Star, MapPin, CreditCard, BadgeCheck, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import PatientLayout from "@/layouts/PatientLayout";

// Interfaces
interface Doctor {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  specialtyId: number;
  specialtyName: string;
  licenseNumber: string;
  consultationFee: number;
  biography: string;
  experience: number;
  phone?: string;
  address?: string;
  profileImage?: string;
  verificationStatus: "pending" | "approved" | "rejected";
  licenseVerified: boolean;
}

interface Specialty {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export default function DoctorListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

  // Obtener la lista de doctores
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  // Obtener la lista de especialidades para el filtro
  const { data: specialties, isLoading: isLoadingSpecialties } = useQuery<Specialty[]>({
    queryKey: ["/api/specialties"],
  });

  // Filtrar doctores basados en búsqueda y especialidad
  const filteredDoctors = doctors?.filter((doctor) => {
    const nameMatch = `${doctor.firstName} ${doctor.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const specialtyMatch = !selectedSpecialty || doctor.specialtyId.toString() === selectedSpecialty;
    
    return nameMatch && specialtyMatch;
  });

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Médicos Disponibles</h1>
            <p className="text-muted-foreground mt-1">
              Encuentra al profesional médico que necesitas
            </p>
          </div>
          <Link href="/dashboard/patient/agendar-cita">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Agendar cita
            </Button>
          </Link>
        </div>

        {/* Filtros y búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="md:col-span-4">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las especialidades</SelectItem>
                {isLoadingSpecialties ? (
                  <SelectItem value="loading" disabled>
                    Cargando...
                  </SelectItem>
                ) : (
                  specialties?.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.id.toString()}>
                      {specialty.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de doctores */}
        <div className="grid gap-6">
          {isLoadingDoctors ? (
            // Skeleton loaders
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4 bg-muted flex items-center justify-center p-6">
                      <Skeleton className="h-36 w-36 rounded-full" />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <Skeleton className="h-8 w-48 mb-2" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-32 mt-2 md:mt-0" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredDoctors && filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4 bg-blue-50 flex items-center justify-center p-6">
                      {doctor.profileImage ? (
                        <img
                          src={doctor.profileImage}
                          alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                          className="h-36 w-36 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-36 w-36 rounded-full bg-primary/10 flex items-center justify-center">
                          <Stethoscope className="h-12 w-12 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <div className="flex items-center">
                            <h2 className="text-xl font-bold">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h2>
                            {doctor.licenseVerified && (
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
                                <BadgeCheck className="h-3 w-3 mr-1" /> Verificado
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">{doctor.specialtyName}</p>
                        </div>
                        <Link href={`/dashboard/patient/doctor/${doctor.id}`}>
                          <Button className="mt-2 md:mt-0">
                            Ver perfil <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <p className="line-clamp-3 text-sm text-gray-700 mb-4">
                        {doctor.biography}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 md:gap-x-4 mt-auto text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Star className="h-4 w-4 mr-2 text-yellow-500" />
                          <span>{doctor.experience} años de experiencia</span>
                        </div>
                        {doctor.address && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2 text-primary" />
                            <span className="truncate">{doctor.address}</span>
                          </div>
                        )}
                        <div className="flex items-center text-muted-foreground">
                          <CreditCard className="h-4 w-4 mr-2 text-primary" />
                          <span>${doctor.consultationFee} MXN por consulta</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron médicos</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                No hay médicos que coincidan con los criterios de búsqueda.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("");
              }}>
                Mostrar todos los médicos
              </Button>
            </div>
          )}
        </div>
      </div>
    </PatientLayout>
  );
}