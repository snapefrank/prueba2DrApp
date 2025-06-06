import React, { useState, useEffect } from 'react';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, FileText, Filter, Search, Tag, User } from 'lucide-react';
import { createInternalLink } from "@/lib/subdomain";

// Tipos de datos
type Expediente = {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  fechaCreacion: string;
  tipo: 'consulta' | 'historial_clinico' | 'laboratorio' | 'receta';
  descripcion: string;
  tieneArchivos: boolean;
};

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [filtro, setFiltro] = useState({ 
    texto: '', 
    tipo: 'all' as 'consulta' | 'historial_clinico' | 'laboratorio' | 'receta' | 'all'
  });
  const [, navigate] = useLocation();

  // Cargar datos de ejemplo (esto se reemplazaría con una llamada a la API)
  useEffect(() => {
    // Datos de muestra - en producción, se obtendrían de una API
    const mockExpedientes: Expediente[] = [
      {
        id: 1,
        pacienteId: 101,
        pacienteNombre: 'Ana García',
        fechaCreacion: '2025-04-20',
        tipo: 'consulta',
        descripcion: 'Consulta por dolor abdominal',
        tieneArchivos: true
      },
      {
        id: 2,
        pacienteId: 101,
        pacienteNombre: 'Ana García',
        fechaCreacion: '2025-04-15',
        tipo: 'laboratorio',
        descripcion: 'Resultados de análisis de sangre',
        tieneArchivos: true
      },
      {
        id: 3,
        pacienteId: 102,
        pacienteNombre: 'Carlos Ramírez',
        fechaCreacion: '2025-04-22',
        tipo: 'historial_clinico',
        descripcion: 'Actualización de historial clínico',
        tieneArchivos: false
      },
      {
        id: 4,
        pacienteId: 103,
        pacienteNombre: 'Daniela López',
        fechaCreacion: '2025-04-23',
        tipo: 'receta',
        descripcion: 'Receta para tratamiento de hipertensión',
        tieneArchivos: true
      },
      {
        id: 5,
        pacienteId: 102,
        pacienteNombre: 'Carlos Ramírez',
        fechaCreacion: '2025-04-10',
        tipo: 'consulta',
        descripcion: 'Consulta de seguimiento',
        tieneArchivos: true
      }
    ];
    
    setExpedientes(mockExpedientes);
  }, []);

  // Filtrar expedientes
  const expedientesFiltrados = expedientes.filter(expediente => {
    // Filtro por texto
    const matchTexto = filtro.texto 
      ? expediente.pacienteNombre.toLowerCase().includes(filtro.texto.toLowerCase()) ||
        expediente.descripcion.toLowerCase().includes(filtro.texto.toLowerCase())
      : true;
    
    // Filtro por tipo
    const matchTipo = filtro.tipo === 'all' ? true : expediente.tipo === filtro.tipo;
    
    return matchTexto && matchTipo;
  });

  // Formatear nombre del tipo de expediente
  const formatTipoExpediente = (tipo: string) => {
    switch(tipo) {
      case 'consulta': return 'Consulta';
      case 'historial_clinico': return 'Historial Clínico';
      case 'laboratorio': return 'Laboratorio';
      case 'receta': return 'Receta';
      default: return tipo;
    }
  };

  // Obtener color del badge según el tipo
  const getTipoBadgeColor = (tipo: string) => {
    switch(tipo) {
      case 'consulta': return 'bg-purple-100 text-purple-800';
      case 'historial_clinico': return 'bg-blue-100 text-blue-800';
      case 'laboratorio': return 'bg-green-100 text-green-800';
      case 'receta': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Ver detalle de expediente
  const verExpediente = (id: number) => {
    // Redireccionar a la página de detalle del expediente
    navigate(createInternalLink(`/dashboard/expedientes/${id}`));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Expedientes médicos</h1>
        <Button 
          onClick={() => navigate(createInternalLink('/dashboard/expedientes/nota-medica'))}
        >
          <FileText className="mr-2 h-4 w-4" />
          Nueva nota médica
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Buscar expedientes</CardTitle>
          <CardDescription>
            Filtre los expedientes por paciente, tipo o contenido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-2/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por paciente o descripción..."
                value={filtro.texto}
                onChange={(e) => setFiltro({...filtro, texto: e.target.value})}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-1/3">
              <Select 
                value={filtro.tipo} 
                onValueChange={(value) => setFiltro({...filtro, tipo: value as any})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="historial_clinico">Historial Clínico</SelectItem>
                  <SelectItem value="laboratorio">Laboratorio</SelectItem>
                  <SelectItem value="receta">Receta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Listado de expedientes</CardTitle>
          <CardDescription>
            {expedientesFiltrados.length} expedientes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expedientesFiltrados.map((expediente) => (
                <TableRow key={expediente.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {expediente.pacienteNombre}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(expediente.fechaCreacion).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getTipoBadgeColor(expediente.tipo)}`}>
                      {formatTipoExpediente(expediente.tipo)}
                    </Badge>
                  </TableCell>
                  <TableCell>{expediente.descripcion}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm"
                      onClick={() => verExpediente(expediente.id)}
                    >
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {expedientesFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No se encontraron expedientes que coincidan con los criterios de búsqueda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}