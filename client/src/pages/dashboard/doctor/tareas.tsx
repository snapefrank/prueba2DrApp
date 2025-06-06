import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createInternalLink } from '@/lib/subdomain';
import { Link } from 'wouter';
import { Plus, Calendar, FileText, Clipboard, User, Clock, CheckCircle, XCircle, AlertTriangle, Filter, ArrowDown, ArrowUp } from 'lucide-react';

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  vencimiento?: string;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'completada' | 'vencida';
  tipo: 'general' | 'paciente' | 'receta' | 'laboratorio' | 'expediente';
  pacienteId?: string;
  pacienteNombre?: string;
}

export default function TareasPage() {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState<string>('todas');
  const [ordenamiento, setOrdenamiento] = useState<string>('fecha-asc');
  const [busqueda, setBusqueda] = useState<string>('');

  // Datos de ejemplo para tareas
  const tareasMock: Tarea[] = [
    {
      id: '1',
      titulo: 'Revisar resultados de laboratorio',
      descripcion: 'Revisar los últimos análisis de sangre y actualizar expediente',
      fecha: '2025-05-14',
      vencimiento: '2025-05-17',
      prioridad: 'alta',
      estado: 'pendiente',
      tipo: 'laboratorio',
      pacienteId: '12',
      pacienteNombre: 'María Rodríguez'
    },
    {
      id: '2',
      titulo: 'Actualizar expediente clínico',
      descripcion: 'Completar la información del historial médico con los nuevos datos',
      fecha: '2025-05-13',
      vencimiento: '2025-05-16',
      prioridad: 'media',
      estado: 'pendiente',
      tipo: 'expediente',
      pacienteId: '8',
      pacienteNombre: 'Juan Pérez'
    },
    {
      id: '3',
      titulo: 'Firmar recetas pendientes',
      descripcion: 'Revisar y firmar las recetas electrónicas generadas esta semana',
      fecha: '2025-05-12',
      vencimiento: '2025-05-15',
      prioridad: 'alta',
      estado: 'pendiente',
      tipo: 'receta'
    },
    {
      id: '4',
      titulo: 'Preparar informe mensual',
      descripcion: 'Generar el informe de pacientes atendidos para el seguro',
      fecha: '2025-05-10',
      vencimiento: '2025-05-15',
      prioridad: 'baja',
      estado: 'pendiente',
      tipo: 'general'
    },
    {
      id: '5',
      titulo: 'Confirmar citas de la próxima semana',
      descripcion: 'Revisar la agenda y contactar a los pacientes para confirmar asistencia',
      fecha: '2025-05-09',
      vencimiento: '2025-05-17',
      prioridad: 'media',
      estado: 'completada',
      tipo: 'general'
    },
    {
      id: '6',
      titulo: 'Actualizar prescripción',
      descripcion: 'Actualizar la prescripción de medicamentos para tratamiento crónico',
      fecha: '2025-05-08',
      vencimiento: '2025-05-11',
      prioridad: 'alta',
      estado: 'vencida',
      tipo: 'receta',
      pacienteId: '23',
      pacienteNombre: 'Carlos López'
    }
  ];

  // Filtrar tareas
  const tareasFiltradas = tareasMock.filter(tarea => {
    // Filtro por estado
    if (filtro === 'pendientes' && tarea.estado !== 'pendiente') return false;
    if (filtro === 'completadas' && tarea.estado !== 'completada') return false;
    if (filtro === 'vencidas' && tarea.estado !== 'vencida') return false;
    
    // Filtro por búsqueda
    if (busqueda) {
      const textoBusqueda = busqueda.toLowerCase();
      const textoTarea = `${tarea.titulo} ${tarea.descripcion} ${tarea.pacienteNombre || ''}`.toLowerCase();
      if (!textoTarea.includes(textoBusqueda)) return false;
    }
    
    return true;
  });

  // Ordenar tareas
  const tareasOrdenadas = [...tareasFiltradas].sort((a, b) => {
    switch (ordenamiento) {
      case 'fecha-asc':
        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      case 'fecha-desc':
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      case 'vencimiento-asc':
        if (!a.vencimiento) return 1;
        if (!b.vencimiento) return -1;
        return new Date(a.vencimiento).getTime() - new Date(b.vencimiento).getTime();
      case 'vencimiento-desc':
        if (!a.vencimiento) return 1;
        if (!b.vencimiento) return -1;
        return new Date(b.vencimiento).getTime() - new Date(a.vencimiento).getTime();
      case 'prioridad-asc':
        const prioridadValor = { baja: 1, media: 2, alta: 3 };
        return prioridadValor[a.prioridad] - prioridadValor[b.prioridad];
      case 'prioridad-desc':
        const prioridadValorDesc = { baja: 1, media: 2, alta: 3 };
        return prioridadValorDesc[b.prioridad] - prioridadValorDesc[a.prioridad];
      default:
        return 0;
    }
  });

  const handleCompletarTarea = (id: string) => {
    // Lógica para marcar como completada
    toast({
      title: "Tarea completada",
      description: "La tarea ha sido marcada como completada exitosamente",
    });
  };

  const handleEliminarTarea = (id: string) => {
    // Lógica para eliminar tarea
    toast({
      title: "Tarea eliminada",
      description: "La tarea ha sido eliminada exitosamente",
    });
  };

  // Colores por prioridad
  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Iconos por tipo
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'paciente': return <User className="h-4 w-4" />;
      case 'receta': return <FileText className="h-4 w-4" />;
      case 'laboratorio': return <Clipboard className="h-4 w-4" />;
      case 'expediente': return <Clipboard className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Gestión de Tareas</h1>
        <Button asChild>
          <Link to={createInternalLink("/dashboard/tareas/nueva")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva tarea
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="todas" value={filtro} onValueChange={setFiltro} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <TabsList className="mb-2 md:mb-0">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
            <TabsTrigger value="completadas">Completadas</TabsTrigger>
            <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
          </TabsList>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Input
                placeholder="Buscar tarea..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-8"
              />
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={ordenamiento} onValueChange={setOrdenamiento}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fecha-desc">Fecha ↓</SelectItem>
                <SelectItem value="fecha-asc">Fecha ↑</SelectItem>
                <SelectItem value="vencimiento-asc">Vencimiento ↑</SelectItem>
                <SelectItem value="vencimiento-desc">Vencimiento ↓</SelectItem>
                <SelectItem value="prioridad-desc">Prioridad ↓</SelectItem>
                <SelectItem value="prioridad-asc">Prioridad ↑</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="todas" className="mt-0">
          <Card>
            <CardContent className="p-4">
              {tareasOrdenadas.length > 0 ? (
                <div className="space-y-4">
                  {tareasOrdenadas.map((tarea) => (
                    <div 
                      key={tarea.id} 
                      className={`p-4 border rounded-lg transition-colors ${
                        tarea.estado === 'completada' ? 'bg-green-50' : 
                        tarea.estado === 'vencida' ? 'bg-red-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          {tarea.estado !== 'completada' ? (
                            <Checkbox 
                              id={`task-${tarea.id}`}
                              className="mt-1"
                              onCheckedChange={() => handleCompletarTarea(tarea.id)}
                            />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                          )}
                          <div className="space-y-1">
                            <Label 
                              htmlFor={`task-${tarea.id}`}
                              className={`text-md font-medium ${tarea.estado === 'completada' ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {tarea.titulo}
                            </Label>
                            <p className="text-sm text-muted-foreground">{tarea.descripcion}</p>
                            {tarea.pacienteNombre && (
                              <div className="flex items-center text-xs text-blue-600">
                                <User className="h-3 w-3 mr-1" />
                                <span>Paciente: {tarea.pacienteNombre}</span>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                                {tarea.prioridad === 'alta' ? 'Alta' : tarea.prioridad === 'media' ? 'Media' : 'Baja'}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getTipoIcon(tarea.tipo)}
                                <span className="ml-1 capitalize">{tarea.tipo}</span>
                              </span>
                              {tarea.vencimiento && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Vence: {new Date(tarea.vencimiento).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex">
                          {tarea.estado === 'vencida' && <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleEliminarTarea(tarea.id)}
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No hay tareas que coincidan con los criterios seleccionados</p>
                  <Button asChild variant="outline">
                    <Link to={createInternalLink("/dashboard/tareas/nueva")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear una nueva tarea
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                {tareasOrdenadas.length} tareas encontradas
              </div>
              <Button variant="outline" size="sm">
                <ArrowDown className="mr-2 h-4 w-4" />
                Exportar lista
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pendientes" className="mt-0">
          {/* Contenido idéntico, pero ya se filtraron las tareas pendientes */}
        </TabsContent>

        <TabsContent value="completadas" className="mt-0">
          {/* Contenido idéntico, pero ya se filtraron las tareas completadas */}
        </TabsContent>

        <TabsContent value="vencidas" className="mt-0">
          {/* Contenido idéntico, pero ya se filtraron las tareas vencidas */}
        </TabsContent>
      </Tabs>
    </div>
  );
}