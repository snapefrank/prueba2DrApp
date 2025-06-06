import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Download, FileText, ClipboardList } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Función para formatear fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function LaboratoryResultsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedCommission, setSelectedCommission] = useState<any>(null);
  
  // Consultar comisiones de laboratorio
  const { data: commissions, isLoading } = useQuery<any[]>({
    queryKey: ["/api/lab-commissions"],
    queryFn: async () => {
      const response = await fetch("/api/lab-commissions");
      if (!response.ok) throw new Error("Error al cargar órdenes de laboratorio");
      return response.json();
    }
  });
  
  // Filtrar comisiones por término de búsqueda y estado
  const filteredCommissions = commissions?.filter(commission => {
    const matchesSearch = 
      (commission.laboratory?.name && commission.laboratory.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (commission.patient?.name && commission.patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (commission.serviceName && commission.serviceName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "" || commission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Estado para la visualización de detalles
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Función para obtener color de insignia según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };
  
  // Función para traducir estados
  const translateStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };
  
  // Función para mostrar detalles de una comisión
  const showDetails = (commission: any) => {
    setSelectedCommission(commission);
    setDetailsOpen(true);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Resultados de Laboratorio</h1>
        <p className="text-muted-foreground">
          Consulte y descargue los resultados de sus órdenes de laboratorio
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle>Historial de Órdenes</CardTitle>
              <CardDescription>
                Órdenes de laboratorio y sus resultados
              </CardDescription>
            </div>
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por laboratorio, paciente..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="ml-3 text-muted-foreground">Cargando órdenes...</p>
            </div>
          ) : filteredCommissions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Laboratorio</TableHead>
                    <TableHead>Estudio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {formatDate(commission.createdAt)}
                      </TableCell>
                      <TableCell>{commission.patient?.name || 'N/A'}</TableCell>
                      <TableCell>{commission.laboratory?.name || 'N/A'}</TableCell>
                      <TableCell>{commission.serviceName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(commission.status)} variant="outline">
                          {translateStatus(commission.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => showDetails(commission)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No se encontraron órdenes de laboratorio
              </p>
              {searchTerm || statusFilter ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Intente modificar los filtros de búsqueda
                </p>
              ) : null}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Total de órdenes: {filteredCommissions.length}
          </div>
        </CardFooter>
      </Card>
      
      {/* Dialog para mostrar detalles de la orden */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden</DialogTitle>
            <DialogDescription>
              Información completa de la orden de laboratorio
            </DialogDescription>
          </DialogHeader>
          
          {selectedCommission && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Fecha:</p>
                    <p>{formatDate(selectedCommission.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Estado:</p>
                    <Badge className={getStatusColor(selectedCommission.status)} variant="outline">
                      {translateStatus(selectedCommission.status)}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium text-muted-foreground">Paciente:</p>
                    <p>{selectedCommission.patient?.name || 'No disponible'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium text-muted-foreground">Médico:</p>
                    <p>{selectedCommission.doctor?.name || 'No disponible'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium text-muted-foreground">Laboratorio:</p>
                    <p>{selectedCommission.laboratory?.name || 'No disponible'}</p>
                    {selectedCommission.laboratory?.address && (
                      <p className="text-xs text-muted-foreground">{selectedCommission.laboratory.address}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium text-muted-foreground">Servicio:</p>
                    <p>{selectedCommission.serviceName || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Tipo de Estudio:</p>
                    <p>{selectedCommission.testType || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Urgencia:</p>
                    <p>
                      {selectedCommission.urgency === 'normal' ? 'Normal' : 
                        selectedCommission.urgency === 'urgent' ? 'Urgente' : 
                        selectedCommission.urgency === 'immediate' ? 'Inmediata' : 
                        selectedCommission.urgency || 'No especificada'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium text-muted-foreground">Monto:</p>
                    <p>$ {selectedCommission.amount || '0.00'} MXN</p>
                  </div>
                  {selectedCommission.description && (
                    <div className="col-span-2">
                      <p className="font-medium text-muted-foreground">Descripción:</p>
                      <p>{selectedCommission.description}</p>
                    </div>
                  )}
                  {selectedCommission.notes && (
                    <div className="col-span-2">
                      <p className="font-medium text-muted-foreground">Notas:</p>
                      <p>{selectedCommission.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Resultado</h4>
                <div className="rounded-lg bg-muted/40 p-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    Los resultados de esta orden aún no están disponibles. Se enviarán al correo electrónico registrado cuando estén listos.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="justify-between">
            <Button 
              variant="outline" 
              onClick={() => setDetailsOpen(false)}
            >
              Cerrar
            </Button>
            <Button 
              variant="outline" 
              className="text-purple-600 hover:bg-purple-50 hover:text-purple-700" 
              onClick={() => {
                toast({
                  title: "Próximamente",
                  description: "La descarga de resultados estará disponible pronto",
                });
              }}
              disabled
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar resultado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}