import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
    Search,
    FilePlus2,
    CalendarPlus,
    Filter,
    Calendar,
    Stethoscope,
    Activity,
    Clock,
    ChevronRight,
    FileText,
    Star,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import DoctorLayout from "@/layouts/DoctorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

// Interfaces
interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    email: string;
    phone: string;
    address?: string;
    profileImage?: string;
    lastVisit?: string;
    totalVisits: number;
    insuranceProvider?: string;
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    status: "active" | "inactive";
}

interface PatientAppointment {
    id: number;
    dateTime: string;
    status: "scheduled" | "completed" | "cancelled" | "no_show";
    appointmentType: string;
    reason: string;
}

export default function PatientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>("all");

    // Cargar pacientes
    const { data: patients, isLoading } = useQuery<Patient[]>({
        queryKey: ["/api/doctor/patients"],
        // Procesamos la respuesta para asegurar que sea un array
        select: data => {
            // Si data no es un array, devolvemos array vacío para prevenir errores
            if (!Array.isArray(data)) {
                console.warn("La API de pacientes no devolvió un array válido");
                return [] as Patient[];
            }
            return data;
        },
    });

    // Filtrar pacientes
    const filteredPatients = patients
        ? patients.filter(patient => {
              // Filtrar por término de búsqueda
              const searchMatch = searchTerm
                  ? `${patient.firstName} ${patient.lastName}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    patient.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  : true;

              // Filtrar por pestaña seleccionada
              let tabMatch = true;
              if (selectedTab === "active") {
                  tabMatch = patient.status === "active";
              } else if (selectedTab === "recent") {
                  // Mostrar pacientes con visitas en los últimos 30 días
                  if (patient.lastVisit) {
                      const lastVisitDate = new Date(patient.lastVisit);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      tabMatch = lastVisitDate >= thirtyDaysAgo;
                  } else {
                      tabMatch = false;
                  }
              }

              return searchMatch && tabMatch;
          })
        : [];

    // Paginación
    const patientsPerPage = 10;
    const totalPages = Math.ceil(
        (filteredPatients?.length || 0) / patientsPerPage
    );
    const startIndex = (currentPage - 1) * patientsPerPage;
    const paginatedPatients = filteredPatients?.slice(
        startIndex,
        startIndex + patientsPerPage
    );

    return (
        // <DoctorLayout>
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Pacientes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestione su lista de pacientes y sus expedientes
                    </p>
                </div>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                <FilePlus2 className="mr-2 h-4 w-4" />
                                Nuevo
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Crear nuevo</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="/dashboard/doctor/expediente/new">
                                <DropdownMenuItem>
                                    <Stethoscope className="mr-2 h-4 w-4" />
                                    <span>Expediente médico</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/dashboard/doctor/citas/new">
                                <DropdownMenuItem>
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    <span>Agendar cita</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/dashboard/doctor/recetas/new">
                                <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Receta médica</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/dashboard/doctor/laboratorio/new">
                                <DropdownMenuItem>
                                    <Activity className="mr-2 h-4 w-4" />
                                    <span>Solicitud de laboratorio</span>
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-auto flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Buscar pacientes..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Filter className="mr-2 h-4 w-4" />
                            {selectedFilter ? selectedFilter : "Filtros"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setSelectedFilter("Todos")}
                        >
                            Todos los pacientes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setSelectedFilter("Con cita hoy")}
                        >
                            Con cita hoy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                setSelectedFilter("Pendientes de atención")
                            }
                        >
                            Pendientes de atención
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                setSelectedFilter("Nuevos pacientes")
                            }
                        >
                            Nuevos pacientes
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Tabs
                defaultValue="all"
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="w-full"
            >
                <TabsList className="grid grid-cols-3 mb-8">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="active">Activos</TabsTrigger>
                    <TabsTrigger value="recent">Recientes</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    {renderPatientList(isLoading, paginatedPatients)}
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                    {renderPatientList(isLoading, paginatedPatients)}
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                    {renderPatientList(isLoading, paginatedPatients)}
                </TabsContent>
            </Tabs>

            {/* Paginación */}
            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    setCurrentPage(prev =>
                                        Math.max(1, prev - 1)
                                    );
                                }}
                            />
                        </PaginationItem>

                        {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                                let pageNum;

                                // Mostrar primeras 3 páginas, última y actual
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    if (i < 3) {
                                        pageNum = i + 1;
                                    } else if (i === 3) {
                                        return (
                                            <PaginationItem key="ellipsis">
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    } else {
                                        pageNum = totalPages;
                                    }
                                } else if (currentPage > totalPages - 3) {
                                    if (i === 0) {
                                        pageNum = 1;
                                    } else if (i === 1) {
                                        return (
                                            <PaginationItem key="ellipsis">
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    } else {
                                        pageNum = totalPages - (4 - i);
                                    }
                                } else {
                                    if (i === 0) {
                                        pageNum = 1;
                                    } else if (i === 1) {
                                        return (
                                            <PaginationItem key="ellipsis-1">
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    } else if (i === 2) {
                                        pageNum = currentPage;
                                    } else if (i === 3) {
                                        return (
                                            <PaginationItem key="ellipsis-2">
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    } else {
                                        pageNum = totalPages;
                                    }
                                }

                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            onClick={e => {
                                                e.preventDefault();
                                                setCurrentPage(pageNum);
                                            }}
                                            isActive={currentPage === pageNum}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            }
                        )}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={e => {
                                    e.preventDefault();
                                    setCurrentPage(prev =>
                                        Math.min(totalPages, prev + 1)
                                    );
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
        // </DoctorLayout>
    );

    function renderPatientList(isLoading: boolean, patients?: Patient[]) {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {Array(5)
                        .fill(0)
                        .map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center p-6">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="ml-4 space-y-2 flex-1">
                                            <Skeleton className="h-5 w-48" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                        <Skeleton className="h-10 w-24" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            );
        }

        if (!patients || patients.length === 0) {
            return (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="mx-auto my-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <Search className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">
                            No se encontraron pacientes
                        </h3>
                        <p className="mb-6 mt-2 text-sm text-muted-foreground">
                            No hay pacientes que coincidan con los criterios de
                            búsqueda.
                        </p>
                        <Button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedFilter(null);
                                setSelectedTab("all");
                            }}
                        >
                            Mostrar todos los pacientes
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                {patients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                ))}
            </div>
        );
    }
}

function PatientCard({ patient }: { patient: Patient }) {
    // Formatear fecha en español
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: es });
    };

    // Calcular edad del paciente
    const calculateAge = (dobStr: string) => {
        const dob = new Date(dobStr);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const isBirthdayPassed =
            now.getMonth() > dob.getMonth() ||
            (now.getMonth() === dob.getMonth() &&
                now.getDate() >= dob.getDate());

        if (!isBirthdayPassed) {
            age--;
        }

        return age;
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    <div className="p-6 flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12 border">
                            {patient.profileImage ? (
                                <AvatarImage
                                    src={patient.profileImage}
                                    alt={patient.firstName}
                                />
                            ) : (
                                <AvatarFallback>
                                    {patient.firstName[0]}
                                    {patient.lastName[0]}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h3 className="font-medium truncate">
                                    {patient.firstName} {patient.lastName}
                                </h3>
                                <Badge
                                    variant="outline"
                                    className={
                                        patient.status === "active"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-gray-50 text-gray-700 border-gray-200"
                                    }
                                >
                                    {patient.status === "active"
                                        ? "Activo"
                                        : "Inactivo"}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                    <span>
                                        {calculateAge(patient.dob)} años (
                                        {patient.gender === "male" ? "M" : "F"})
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                    <span>
                                        Última visita:{" "}
                                        {formatDate(patient.lastVisit)}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <Star className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                    <span>
                                        {patient.totalVisits} consultas totales
                                    </span>
                                </div>
                            </div>

                            {patient.allergies &&
                                patient.allergies.length > 0 && (
                                    <div className="mt-3 flex items-center flex-wrap gap-1">
                                        <span className="text-xs font-medium text-red-600 mr-1">
                                            Alergias:
                                        </span>
                                        {patient.allergies.map(
                                            (allergy, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="bg-red-50 text-red-700 border-red-200 text-xs"
                                                >
                                                    {allergy}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                )}
                        </div>

                        {/* Acciones para dispositivos grandes */}
                        <div className="hidden md:flex items-center space-x-2">
                            <Link
                                href={`/dashboard/doctor/patients/${patient.id}`}
                            >
                                <Button variant="default" size="sm">
                                    Ver expediente
                                </Button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Acciones
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <Link
                                        href={`/dashboard/doctor/patients/${patient.id}/expediente`}
                                    >
                                        <DropdownMenuItem>
                                            <Stethoscope className="mr-2 h-4 w-4" />
                                            <span>Actualizar expediente</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link
                                        href={`/dashboard/doctor/citas/new?patientId=${patient.id}`}
                                    >
                                        <DropdownMenuItem>
                                            <CalendarPlus className="mr-2 h-4 w-4" />
                                            <span>Agendar cita</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link
                                        href={`/dashboard/doctor/recetas/new?patientId=${patient.id}`}
                                    >
                                        <DropdownMenuItem>
                                            <FileText className="mr-2 h-4 w-4" />
                                            <span>Nueva receta</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link
                                        href={`/dashboard/doctor/laboratorio/new?patientId=${patient.id}`}
                                    >
                                        <DropdownMenuItem>
                                            <Activity className="mr-2 h-4 w-4" />
                                            <span>Solicitar estudio</span>
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Acciones para dispositivos móviles */}
                    <div className="sm:hidden p-4 flex items-center justify-between border-t">
                        <Link href={`/dashboard/doctor/patients/${patient.id}`}>
                            <Button variant="default" size="sm">
                                Ver expediente
                            </Button>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Acciones
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <Link
                                    href={`/dashboard/doctor/patients/${patient.id}/expediente`}
                                >
                                    <DropdownMenuItem>
                                        <Stethoscope className="mr-2 h-4 w-4" />
                                        <span>Actualizar expediente</span>
                                    </DropdownMenuItem>
                                </Link>
                                <Link
                                    href={`/dashboard/doctor/citas/new?patientId=${patient.id}`}
                                >
                                    <DropdownMenuItem>
                                        <CalendarPlus className="mr-2 h-4 w-4" />
                                        <span>Agendar cita</span>
                                    </DropdownMenuItem>
                                </Link>
                                <Link
                                    href={`/dashboard/doctor/recetas/new?patientId=${patient.id}`}
                                >
                                    <DropdownMenuItem>
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>Nueva receta</span>
                                    </DropdownMenuItem>
                                </Link>
                                <Link
                                    href={`/dashboard/doctor/laboratorio/new?patientId=${patient.id}`}
                                >
                                    <DropdownMenuItem>
                                        <Activity className="mr-2 h-4 w-4" />
                                        <span>Solicitar estudio</span>
                                    </DropdownMenuItem>
                                </Link>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
