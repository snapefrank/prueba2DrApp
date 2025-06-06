import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Heart,
  Brain,
  Baby,
  Eye,
  Bone,
  Stethoscope,
  SquarePen,
  Pill,
  Microscope,
  HeartPulse,
  Ear,
  Syringe,
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  User,
  Star,
  Filter,
  ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interfaces
interface Specialty {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  isPopular?: boolean;
  category?: string;
  displayOrder?: number;
}

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
}

// Mapa de iconos por nombre de especialidad (en minúsculas)
const specialtyIcons: Record<string, React.ReactNode> = {
  'cardiología': <Heart className="h-6 w-6" />,
  'neurología': <Brain className="h-6 w-6" />,
  'pediatría': <Baby className="h-6 w-6" />,
  'oftalmología': <Eye className="h-6 w-6" />,
  'traumatología': <Bone className="h-6 w-6" />,
  'medicina interna': <Stethoscope className="h-6 w-6" />,
  'medicina general': <Stethoscope className="h-6 w-6" />,
  'dermatología': <SquarePen className="h-6 w-6" />,
  'endocrinología': <Pill className="h-6 w-6" />,
  'oncología': <Microscope className="h-6 w-6" />,
  'ginecología': <HeartPulse className="h-6 w-6" />,
  'ginecología y obstetricia': <HeartPulse className="h-6 w-6" />,
  'otorrinolaringología': <Ear className="h-6 w-6" />,
  'inmunología': <Syringe className="h-6 w-6" />
};

// Función para convertir slug a nombre
const slugToName = (slug: string): string => {
  return slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// Función para convertir nombre a slug
const getSpecialtySlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

// Función para renderizar el icono correcto
const renderIcon = (specialty: Specialty) => {
  const name = specialty.name.toLowerCase();
  
  if (specialty.icon) {
    // Si la especialidad tiene un icono personalizado, usarlo
    try {
      return <span dangerouslySetInnerHTML={{ __html: specialty.icon }} />;
    } catch (e) {
      console.error("Error al renderizar icono:", e);
    }
  }
  
  // Buscar en el mapa de iconos
  return specialtyIcons[name] || <Stethoscope className="h-6 w-6" />;
};

interface EspecialidadDetallePageProps {
  slug?: string;
}

const EspecialidadDetallePage = ({ slug: propSlug }: EspecialidadDetallePageProps) => {
  const [, params] = useRoute<{ slug: string }>("/especialidades/:slug");
  const slug = propSlug || params?.slug || "";
  const [sortOption, setSortOption] = useState<string>("rating");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);

  // Consulta para obtener todas las especialidades
  const { 
    data: specialties, 
    isLoading: loadingSpecialties,
    error: specialtiesError
  } = useQuery<Specialty[]>({
    queryKey: ['/api/public/specialties'],
  });

  // Encontrar la especialidad basada en el slug
  const specialty = specialties?.find(s => 
    getSpecialtySlug(s.name) === slug
  );

  // Consulta para obtener los médicos de esta especialidad
  const {
    data: doctors,
    isLoading: loadingDoctors,
    error: doctorsError
  } = useQuery<Doctor[]>({
    queryKey: ['/api/public/doctors/specialty', specialty?.id],
    enabled: !!specialty?.id,
  });

  // Filtrar y ordenar los médicos
  const filteredDoctors = doctors?.filter(doctor => {
    if (!locationFilter) return true;
    return doctor.address?.toLowerCase().includes(locationFilter.toLowerCase());
  }).sort((a, b) => {
    if (sortOption === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    } else if (sortOption === "price_low") {
      return a.consultationFee - b.consultationFee;
    } else if (sortOption === "price_high") {
      return b.consultationFee - a.consultationFee;
    }
    return 0;
  });

  // Extraer ubicaciones únicas para el filtro
  const locations = doctors?.reduce<string[]>((acc, doctor) => {
    if (doctor.address && !acc.includes(doctor.address)) {
      acc.push(doctor.address);
    }
    return acc;
  }, []) || [];

  // Si está cargando las especialidades o hay error, mostrar estado apropiado
  if (loadingSpecialties) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-lg text-gray-600">Cargando especialidad...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (specialtiesError || !specialty) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-2">
                Especialidad no encontrada
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                La especialidad que estás buscando no existe o ha ocurrido un error al cargar la información.
              </p>
              <Button asChild>
                <Link href="/especialidades">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a especialidades
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
            {/* Encabezado */}
            <div className="mb-8">
              <Link href="/especialidades" className="inline-flex items-center text-gray-600 hover:text-primary mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a todas las especialidades
              </Link>
              
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mr-4 text-primary">
                    {renderIcon(specialty)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {specialty.name}
                    </h1>
                    <p className="text-gray-600">
                      Especialistas en {specialty.name.toLowerCase()}
                    </p>
                  </div>
                </div>
                
                <div className="ml-auto flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                  <Select
                    value={sortOption}
                    onValueChange={setSortOption}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Ordenar por</SelectLabel>
                        <SelectItem value="rating">Mejor valorados</SelectItem>
                        <SelectItem value="price_low">Precio: menor a mayor</SelectItem>
                        <SelectItem value="price_high">Precio: mayor a menor</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  
                  {locations.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 sm:flex-none">
                          <MapPin className="h-4 w-4 mr-2" />
                          {locationFilter || "Todas las ubicaciones"}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Ubicación</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => setLocationFilter(null)}>
                            Todas las ubicaciones
                          </DropdownMenuItem>
                          {locations.map((location) => (
                            <DropdownMenuItem 
                              key={location} 
                              onClick={() => setLocationFilter(location)}
                            >
                              {location}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
            
            {/* Descripción */}
            {specialty.description && (
              <div className="bg-white p-6 rounded-lg shadow-sm mb-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Acerca de {specialty.name}
                </h2>
                <p className="text-gray-600">
                  {specialty.description}
                </p>
              </div>
            )}
            
            {/* Lista de médicos */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Médicos especialistas
                {doctors && (
                  <Badge className="ml-2 bg-primary/20 hover:bg-primary/30 text-primary border-0">
                    {filteredDoctors?.length || 0}
                  </Badge>
                )}
              </h2>
              
              {loadingDoctors ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="h-40 bg-gray-100">
                          <Skeleton className="h-full w-full" />
                        </div>
                        <div className="p-6">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-4" />
                          <Skeleton className="h-20 w-full mb-4" />
                          <div className="flex justify-between mb-4">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/3" />
                          </div>
                          <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : doctorsError || !doctors || doctors.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No se encontraron médicos
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Por el momento no hay médicos disponibles en esta especialidad. Por favor, consulta más tarde.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors?.map((doctor) => (
                    <Link 
                      key={doctor.id} 
                      href={`/doctores/${doctor.id}`}
                      className="block h-full"
                    >
                      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                        <CardContent className="p-0">
                          <div className="h-40 bg-gray-100 relative">
                            {doctor.profileImage ? (
                              <img 
                                src={doctor.profileImage} 
                                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <User className="h-16 w-16 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="font-semibold text-xl text-gray-900 mb-1">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h3>
                            <p className="text-primary font-medium mb-3">
                              {doctor.specialty || specialty.name}
                            </p>
                            <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                              {doctor.biography || `Médico especialista en ${doctor.specialty || specialty.name}.`}
                            </p>
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-600 line-clamp-1">
                                  {doctor.address || "Consulta en línea"}
                                </span>
                              </div>
                              <div className="flex items-center">
                                {doctor.rating && (
                                  <>
                                    <Star className="h-4 w-4 text-amber-500 mr-1" />
                                    <span className="text-sm text-gray-600">
                                      {doctor.rating.toFixed(1)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold text-gray-900">
                                ${doctor.consultationFee.toLocaleString('es-MX')}
                              </span>
                              <Button>Ver perfil</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* No resultados con filtros */}
              {doctors && doctors.length > 0 && filteredDoctors?.length === 0 && (
                <div className="text-center py-16 bg-gray-50 rounded-lg mt-6">
                  <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Filter className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No hay resultados para tu búsqueda
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    No se encontraron médicos con los filtros seleccionados. Intenta con otros criterios.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setLocationFilter(null);
                      setSortOption("rating");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
            
            {/* CTA */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Necesitas consultar a un especialista en {specialty.name.toLowerCase()}?
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto mb-6">
                En MediConnect contamos con los mejores especialistas en {specialty.name.toLowerCase()}. Regístrate hoy y agenda tu cita con el médico que mejor se adapte a tus necesidades.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/auth">
                    Regístrate gratis
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/como-funciona">
                    Cómo funciona
                  </Link>
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

export default EspecialidadDetallePage;