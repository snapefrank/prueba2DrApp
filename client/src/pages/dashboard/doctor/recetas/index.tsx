import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { createInternalLink } from "@/lib/subdomain";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search,
  Plus,
  Download,
  File,
  FileText,
  Pill,
  CalendarClock,
  ChevronRight,
  Clock
} from "lucide-react";

import DoctorLayout from "@/layouts/DoctorLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

// Interfaces
interface Prescription {
  id: number;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  createdAt: string;
  expiresAt: string;
  status: "active" | "expired" | "cancelled";
  medications: Array<{
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  diagnosis: string;
  notes?: string;
}

export default function RecetasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  
  // Cargar recetas
  const { data: prescriptions, isLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/doctor/prescriptions"],
    // Procesamos la respuesta para asegurar que sea un array
    select: (data) => {
      // Si data no es un array, devolvemos array vacío para prevenir errores
      if (!Array.isArray(data)) {
        console.warn('La API de recetas no devolvió un array válido');
        return [] as Prescription[];
      }
      return data;
    }
  });
  
  // Filtrar recetas
  const filteredPrescriptions = prescriptions
    ? prescriptions.filter((prescription) => {
        // Filtrar por término de búsqueda
        const searchMatch = searchTerm
          ? `${prescription.patient.firstName} ${prescription.patient.lastName}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        
        // Filtrar por pestaña seleccionada
        let tabMatch = true;
        if (selectedTab === "active") {
          tabMatch = prescription.status === "active";
        } else if (selectedTab === "expired") {
          tabMatch = prescription.status === "expired";
        }
        
        return searchMatch && tabMatch;
      })
    : [];
  
  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recetas médicas</h1>
            <p className="text-muted-foreground mt-1">
              Gestione las recetas médicas para sus pacientes
            </p>
          </div>
          <Link href={createInternalLink("/dashboard/doctor/recetas/new")}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva receta
            </Button>
          </Link>
        </div>
        
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar recetas por paciente o diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={selectedTab} 
          onValueChange={setSelectedTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="expired">Expiradas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {renderPrescriptionList(isLoading, filteredPrescriptions)}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {renderPrescriptionList(isLoading, filteredPrescriptions)}
          </TabsContent>
          
          <TabsContent value="expired" className="space-y-4">
            {renderPrescriptionList(isLoading, filteredPrescriptions)}
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  );
  
  function renderPrescriptionList(isLoading: boolean, prescriptions?: Prescription[]) {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
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
    
    if (!prescriptions || prescriptions.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto my-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No se encontraron recetas</h3>
            <p className="mb-6 mt-2 text-sm text-muted-foreground">
              No hay recetas que coincidan con los criterios de búsqueda.
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedTab("all");
            }}>
              Mostrar todas las recetas
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <PrescriptionCard key={prescription.id} prescription={prescription} />
        ))}
      </div>
    );
  }
}

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      console.error("Error formateando fecha:", dateStr, error);
      return "Fecha inválida";
    }
  };
  
  // Comprobar si la receta está expirada, con manejo defensivo
  const isExpired = (() => {
    try {
      return new Date(prescription.expiresAt) < new Date();
    } catch (error) {
      console.error("Error comparando fechas:", error);
      return false;
    }
  })();
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="p-6 border-b sm:border-b-0 sm:border-r flex flex-col items-center justify-center bg-blue-50 sm:w-1/5">
            <FileText className="h-8 w-8 text-blue-600 mb-2" />
            <Badge 
              variant="outline" 
              className={
                prescription.status === "active" && !isExpired
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }
            >
              {prescription.status === "active" && !isExpired ? "Activa" : 
               prescription.status === "cancelled" ? "Cancelada" : "Expirada"}
            </Badge>
          </div>
          
          <div className="p-6 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  {prescription.patient.profileImage ? (
                    <AvatarImage 
                      src={prescription.patient.profileImage} 
                      alt={prescription.patient.firstName} 
                    />
                  ) : (
                    <AvatarFallback>
                      {prescription.patient.firstName[0]}{prescription.patient.lastName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="font-medium">
                  {prescription.patient.firstName} {prescription.patient.lastName}
                </h3>
              </div>
              <div className="flex-1" />
              <Link href={createInternalLink(`/dashboard/doctor/recetas/${prescription.id}`)}>
                <Button size="sm" variant="outline">
                  Ver detalles
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4 mb-4 text-sm">
              <div className="flex items-center text-muted-foreground">
                <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Creada: {formatDate(prescription.createdAt)}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Expira: {formatDate(prescription.expiresAt)}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Pill className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{prescription.medications.length} medicamentos</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Diagnóstico:</p>
              <p className="text-sm text-gray-700 line-clamp-2">{prescription.diagnosis}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 p-3 flex justify-end">
        <Button variant="ghost" size="sm" className="text-primary">
          <Download className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
      </CardFooter>
    </Card>
  );
}