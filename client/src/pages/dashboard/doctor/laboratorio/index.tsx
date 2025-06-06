import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DoctorLayout from '@/layouts/DoctorLayout';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, FileUp, FlaskRound, Plus, Search, Upload, User } from 'lucide-react';

// Tipos de datos
type OrdenLaboratorio = {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  fechaSolicitud: string;
  fechaResultados?: string;
  estado: 'pendiente' | 'en_proceso' | 'completado';
  estudiosTipo: string[];
  laboratorio: string;
  tieneResultados: boolean;
};

export default function LaboratorioPage() {
  const [ordenes, setOrdenes] = useState<OrdenLaboratorio[]>([]);
  const [activeTab, setActiveTab] = useState('pendiente');
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, navigate] = useLocation();

  // Cargar datos de ejemplo
  useEffect(() => {
    // Datos de muestra - en producción, se obtendrían de una API
    const mockOrdenes: OrdenLaboratorio[] = [
      {
        id: 1,
        pacienteId: 101,
        pacienteNombre: 'Ana García',
        fechaSolicitud: '2025-04-20',
        estado: 'pendiente',
        estudiosTipo: ['Hemograma completo', 'Glucosa'],
        laboratorio: 'Laboratorio Central',
        tieneResultados: false
      },
      {
        id: 2,
        pacienteId: 102,
        pacienteNombre: 'Carlos Ramírez',
        fechaSolicitud: '2025-04-18',
        estado: 'en_proceso',
        estudiosTipo: ['Perfil lipídico', 'Hemoglobina glicosilada'],
        laboratorio: 'Laboratorio Médico',
        tieneResultados: false
      },
      {
        id: 3,
        pacienteId: 103,
        pacienteNombre: 'Daniela López',
        fechaSolicitud: '2025-04-15',
        fechaResultados: '2025-04-22',
        estado: 'completado',
        estudiosTipo: ['Perfil tiroideo', 'Electrolitos séricos'],
        laboratorio: 'Laboratorio Central',
        tieneResultados: true
      },
      {
        id: 4,
        pacienteId: 104,
        pacienteNombre: 'Juan Pérez',
        fechaSolicitud: '2025-04-10',
        fechaResultados: '2025-04-15',
        estado: 'completado',
        estudiosTipo: ['Perfil hepático', 'Urea y creatinina'],
        laboratorio: 'Laboratorio Médico',
        tieneResultados: true
      }
    ];
    
    setOrdenes(mockOrdenes);
  }, []);

  // Filtrar órdenes por estado y término de búsqueda
  const ordenesFiltradas = ordenes.filter(orden => {
    const matchEstado = orden.estado === activeTab;
    const matchBusqueda = searchTerm 
      ? orden.pacienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.estudiosTipo.some(estudio => estudio.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    
    return matchEstado && matchBusqueda;
  });

  // Formatear estado para mostrar
  const formatEstado = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En proceso';
      case 'completado': return 'Completado';
      default: return estado;
    }
  };

  // Obtener color del badge según el estado
  const getEstadoBadgeColor = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'bg-amber-100 text-amber-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'completado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Ver detalle o resultados
  const verOrden = (id: number) => {
    // En producción, redirigir a la página de detalle
    navigate(`/dashboard/doctor/laboratorio/${id}`);
  };

  // Crear nueva orden (mock)
  const crearOrden = () => {
    alert('Se creará una nueva orden de laboratorio');
    setDialogOpen(false);
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Laboratorio</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva orden
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear orden de laboratorio</DialogTitle>
              <DialogDescription>
                Solicite estudios de laboratorio para un paciente
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="paciente">Paciente</Label>
                <Select>
                  <SelectTrigger id="paciente">
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="101">Ana García</SelectItem>
                    <SelectItem value="102">Carlos Ramírez</SelectItem>
                    <SelectItem value="103">Daniela López</SelectItem>
                    <SelectItem value="104">Juan Pérez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="laboratorio">Laboratorio</Label>
                <Select>
                  <SelectTrigger id="laboratorio">
                    <SelectValue placeholder="Seleccionar laboratorio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab1">Laboratorio Central</SelectItem>
                    <SelectItem value="lab2">Laboratorio Médico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estudios">Estudios</Label>
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="hemograma" className="rounded" />
                    <Label htmlFor="hemograma" className="cursor-pointer">Hemograma completo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="glucosa" className="rounded" />
                    <Label htmlFor="glucosa" className="cursor-pointer">Glucosa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perfil_lipidico" className="rounded" />
                    <Label htmlFor="perfil_lipidico" className="cursor-pointer">Perfil lipídico</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="hb_glicosilada" className="rounded" />
                    <Label htmlFor="hb_glicosilada" className="cursor-pointer">Hemoglobina glicosilada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="perfil_tiroideo" className="rounded" />
                    <Label htmlFor="perfil_tiroideo" className="cursor-pointer">Perfil tiroideo</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="indicaciones">Indicaciones especiales (opcional)</Label>
                <Input id="indicaciones" placeholder="Indicaciones para el laboratorio o paciente" />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={crearOrden}>Crear orden</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por paciente o tipo de estudio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Tabs defaultValue="pendiente" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
          <TabsTrigger value="en_proceso">En proceso</TabsTrigger>
          <TabsTrigger value="completado">Completados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pendiente" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes pendientes</CardTitle>
              <CardDescription>
                Órdenes de laboratorio que no han sido procesadas aún
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha solicitud</TableHead>
                    <TableHead>Estudios</TableHead>
                    <TableHead>Laboratorio</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenesFiltradas.map((orden) => (
                    <TableRow key={orden.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {orden.pacienteNombre}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(orden.fechaSolicitud).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {orden.estudiosTipo.map((estudio, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {estudio}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{orden.laboratorio}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm"
                          onClick={() => verOrden(orden.id)}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ordenesFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No hay órdenes pendientes
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="en_proceso" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes en proceso</CardTitle>
              <CardDescription>
                Órdenes enviadas al laboratorio y en espera de resultados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha solicitud</TableHead>
                    <TableHead>Estudios</TableHead>
                    <TableHead>Laboratorio</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenesFiltradas.map((orden) => (
                    <TableRow key={orden.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {orden.pacienteNombre}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(orden.fechaSolicitud).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {orden.estudiosTipo.map((estudio, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {estudio}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{orden.laboratorio}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm"
                          onClick={() => verOrden(orden.id)}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ordenesFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No hay órdenes en proceso
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completado" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes completadas</CardTitle>
              <CardDescription>
                Órdenes con resultados disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Fecha resultados</TableHead>
                    <TableHead>Estudios</TableHead>
                    <TableHead>Laboratorio</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordenesFiltradas.map((orden) => (
                    <TableRow key={orden.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {orden.pacienteNombre}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {orden.fechaResultados 
                            ? new Date(orden.fechaResultados).toLocaleDateString()
                            : 'Pendiente'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {orden.estudiosTipo.map((estudio, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {estudio}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{orden.laboratorio}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm"
                          variant={orden.tieneResultados ? "default" : "outline"}
                          onClick={() => verOrden(orden.id)}
                        >
                          {orden.tieneResultados ? 'Ver resultados' : 'Ver detalle'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ordenesFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No hay órdenes completadas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DoctorLayout>
  );
}