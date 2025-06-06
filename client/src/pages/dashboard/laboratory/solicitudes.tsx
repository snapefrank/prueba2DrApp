import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import LaboratoryLayout from "@/layouts/LaboratoryLayout";
import { createInternalLink } from "@/lib/subdomain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  FileText,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "@/lib/queryClient";
import { postRequest, putRequest, getRequest } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

// Tipos para las solicitudes de laboratorio
interface LabRequest {
  id: number;
  patientName: string;
  doctorName: string;
  testName: string;
  status: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "normal" | "urgent";
  requestDate: string;
  scheduledDate?: string;
  notes?: string;
}

const SolicitudesLaboratorio = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [, navigate] = useLocation();

  // Obtener las solicitudes pendientes
  const { data: requests, isLoading } = useQuery<LabRequest[]>({
    queryKey: ["/api/laboratory/requests"],
    queryFn: async () => {
      // En una implementación futura, esto debería obtener datos reales de la API
      // Para la demostración, usamos datos simulados
      return [
        {
          id: 1001,
          patientName: "Ana Martínez",
          doctorName: "Dr. Roberto Sánchez",
          testName: "Perfil tiroideo",
          status: "pending",
          priority: "normal",
          requestDate: "2023-04-25T10:30:00",
          notes: "Paciente con síntomas de hipotiroidismo"
        },
        {
          id: 1002,
          patientName: "Carlos Rodríguez",
          doctorName: "Dra. Laura Guzmán",
          testName: "Química sanguínea",
          status: "scheduled",
          priority: "normal",
          requestDate: "2023-04-25T11:15:00",
          scheduledDate: "2023-04-27T09:00:00"
        },
        {
          id: 1003,
          patientName: "José Domínguez",
          doctorName: "Dr. Miguel Torres",
          testName: "Prueba COVID-19 PCR",
          status: "pending",
          priority: "urgent",
          requestDate: "2023-04-25T16:45:00",
          notes: "Paciente con síntomas respiratorios graves"
        },
        {
          id: 1004,
          patientName: "Luisa Fernández",
          doctorName: "Dra. Laura Guzmán",
          testName: "Biometría hemática",
          status: "in_progress",
          priority: "normal",
          requestDate: "2023-04-25T14:20:00",
          scheduledDate: "2023-04-26T10:30:00"
        },
        {
          id: 1005,
          patientName: "Ricardo Morales",
          doctorName: "Dr. Roberto Sánchez",
          testName: "Examen general de orina",
          status: "pending",
          priority: "urgent",
          requestDate: "2023-04-25T17:10:00"
        }
      ];
    },
  });

  // Aplicar filtros a las solicitudes
  const filteredRequests = requests?.filter(request => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por estado
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    // Filtrar por prioridad
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Función para procesar una solicitud
  const handleProcessRequest = (requestId: number) => {
    navigate(createInternalLink(`/dashboard/laboratory/solicitudes/procesar/${requestId}`));
  };

  // Función para programar una cita
  const handleScheduleAppointment = (requestId: number) => {
    navigate(createInternalLink(`/dashboard/laboratory/solicitudes/agendar/${requestId}`));
  };

  // Renderizar estado con estilo apropiado
  const renderStatus = (status: LabRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-amber-500 text-amber-700">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-700">
            <Calendar className="h-3 w-3" />
            Agendado
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-purple-500 text-purple-700">
            <FileText className="h-3 w-3" />
            En proceso
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Completado
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

  // Renderizar el componente
  return (
    <LaboratoryLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes de estudios</h1>
          <p className="text-gray-500">
            Gestiona las solicitudes de estudios de laboratorio
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full mb-6">
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
            Todas
          </TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
            Pendientes
          </TabsTrigger>
          <TabsTrigger value="scheduled" onClick={() => setStatusFilter("scheduled")}>
            Agendadas
          </TabsTrigger>
          <TabsTrigger value="in_progress" onClick={() => setStatusFilter("in_progress")}>
            En proceso
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
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="urgent">Urgentes</SelectItem>
                  <SelectItem value="normal">Normales</SelectItem>
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

      {/* Tabla de solicitudes */}
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
                <TableHead>Fecha solicitud</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando solicitudes...
                  </TableCell>
                </TableRow>
              ) : filteredRequests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron solicitudes que coincidan con los filtros
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests?.map((request) => (
                  <TableRow key={request.id} className={request.priority === "urgent" ? "bg-red-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {request.priority === "urgent" && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {request.id}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{request.patientName}</TableCell>
                    <TableCell>{request.testName}</TableCell>
                    <TableCell>{request.doctorName}</TableCell>
                    <TableCell>{renderStatus(request.status)}</TableCell>
                    <TableCell>{new Date(request.requestDate).toLocaleString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleProcessRequest(request.id)}>
                          <Eye className="mr-1 h-3 w-3" />
                          Ver
                        </Button>
                        
                        {request.status === "pending" && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleScheduleAppointment(request.id)}
                          >
                            <Calendar className="mr-1 h-3 w-3" />
                            Agendar
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

export default SolicitudesLaboratorio;