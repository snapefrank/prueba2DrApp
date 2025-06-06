import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import LaboratoryLayout from "@/layouts/LaboratoryLayout";
import { createInternalLink } from "@/lib/subdomain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Download, 
  Share2, 
  FileText,
  FileCheck,
  UserRound,
  Calendar,
  UploadCloud
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipo para los resultados de laboratorio
interface LabResult {
  id: number;
  patientName: string;
  doctorName: string;
  testName: string;
  testType: string;
  status: "pending" | "draft" | "completed" | "delivered";
  testDate: string;
  resultDate?: string;
  fileUrl?: string;
  abnormalValues: boolean;
}

const ResultadosLaboratorio = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [, navigate] = useLocation();

  // Obtener los resultados
  const { data: results, isLoading } = useQuery<LabResult[]>({
    queryKey: ["/api/laboratory/results"],
    queryFn: async () => {
      // En una implementación futura, esto debería obtener datos reales de la API
      return [
        {
          id: 5001,
          patientName: "María López",
          doctorName: "Dr. Roberto Sánchez",
          testName: "Química sanguínea",
          testType: "Sangre",
          status: "completed",
          testDate: "2023-04-20T09:15:00",
          resultDate: "2023-04-21T14:30:00",
          fileUrl: "/uploads/results/qsa_5001.pdf",
          abnormalValues: false
        },
        {
          id: 5002,
          patientName: "Jorge Ramírez",
          doctorName: "Dra. Laura Guzmán",
          testName: "Perfil tiroideo",
          testType: "Hormonas",
          status: "completed",
          testDate: "2023-04-21T10:30:00",
          resultDate: "2023-04-22T16:45:00",
          fileUrl: "/uploads/results/tir_5002.pdf",
          abnormalValues: true
        },
        {
          id: 5003,
          patientName: "Ana González",
          doctorName: "Dr. Miguel Torres",
          testName: "Biometría hemática",
          testType: "Sangre",
          status: "draft",
          testDate: "2023-04-23T11:00:00",
          abnormalValues: false
        },
        {
          id: 5004,
          patientName: "Pedro Vázquez",
          doctorName: "Dra. Laura Guzmán",
          testName: "Examen general de orina",
          testType: "Orina",
          status: "pending",
          testDate: "2023-04-24T08:45:00",
          abnormalValues: false
        },
        {
          id: 5005,
          patientName: "Sofía Martínez",
          doctorName: "Dr. Roberto Sánchez",
          testName: "Prueba COVID-19 PCR",
          testType: "Infecciosas",
          status: "completed",
          testDate: "2023-04-24T14:30:00",
          resultDate: "2023-04-25T09:15:00",
          fileUrl: "/uploads/results/covid_5005.pdf",
          abnormalValues: true
        }
      ];
    },
  });

  // Filtrar resultados
  const filteredResults = results?.filter(result => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por estado
    const matchesStatus = statusFilter === "all" || result.status === statusFilter;
    
    // Filtrar por fecha (en una implementación real, esto usaría lógica de fecha adecuada)
    const matchesDate = dateFilter === "all";
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Navegar a editar resultado
  const handleEditResult = (resultId: number) => {
    navigate(createInternalLink(`/dashboard/laboratory/resultados/editar/${resultId}`));
  };

  // Navegar a ver resultado
  const handleViewResult = (resultId: number) => {
    navigate(createInternalLink(`/dashboard/laboratory/resultados/ver/${resultId}`));
  };

  // Descargar resultado
  const handleDownloadResult = (result: LabResult) => {
    if (result.fileUrl) {
      // En una implementación real, esto iniciaría una descarga
      toast({
        title: "Descarga iniciada",
        description: `Descargando resultado de ${result.testName} para ${result.patientName}`,
      });
    } else {
      toast({
        title: "Error",
        description: "No hay archivo disponible para descargar",
        variant: "destructive",
      });
    }
  };

  // Enviar resultado
  const handleShareResult = (result: LabResult) => {
    if (result.status === "completed") {
      toast({
        title: "Resultado compartido",
        description: `El resultado ha sido enviado al paciente y al médico por correo electrónico`,
      });
    } else {
      toast({
        title: "Error",
        description: "Solo se pueden compartir resultados completados",
        variant: "destructive",
      });
    }
  };

  // Renderizar estado con estilo apropiado
  const renderStatus = (status: LabResult["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-700">
            <Calendar className="h-3 w-3" />
            Pendiente
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-700">
            <FileText className="h-3 w-3" />
            Borrador
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-700">
            <FileCheck className="h-3 w-3" />
            Completado
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-purple-500 text-purple-700">
            <Share2 className="h-3 w-3" />
            Entregado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  return (
    <LaboratoryLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resultados de laboratorio</h1>
          <p className="text-gray-500">
            Gestiona los resultados de estudios realizados
          </p>
        </div>
        <div>
          <Button className="flex items-center">
            <UploadCloud className="mr-2 h-4 w-4" />
            Subir nuevo resultado
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
            Todos
          </TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="draft" onClick={() => setStatusFilter("draft")}>
            Borradores
          </TabsTrigger>
          <TabsTrigger value="completed" onClick={() => setStatusFilter("completed")}>
            Completados
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sección de filtrado */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por paciente o estudio..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select 
                value={dateFilter}
                onValueChange={setDateFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-grow"></div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="hidden md:flex">
                <Filter className="mr-2 h-4 w-4" />
                Más filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de resultados */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Estudio</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha estudio</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando resultados...
                  </TableCell>
                </TableRow>
              ) : filteredResults?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron resultados que coincidan con los filtros
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults?.map((result) => (
                  <TableRow key={result.id} className={result.abnormalValues ? "bg-amber-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {result.abnormalValues && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                        {result.id}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-gray-500" />
                        {result.patientName}
                      </div>
                    </TableCell>
                    <TableCell>{result.testName}</TableCell>
                    <TableCell>{result.doctorName}</TableCell>
                    <TableCell>{renderStatus(result.status)}</TableCell>
                    <TableCell>{new Date(result.testDate).toLocaleString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        {(result.status === "completed" || result.status === "delivered") && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewResult(result.id)}
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadResult(result)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleShareResult(result)}
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {(result.status === "pending" || result.status === "draft") && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleEditResult(result.id)}
                          >
                            {result.status === "pending" ? "Capturar" : "Editar"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </LaboratoryLayout>
  );
};

export default ResultadosLaboratorio;