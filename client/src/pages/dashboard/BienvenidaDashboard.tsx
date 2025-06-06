import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  Calendar, 
  Users, 
  FileText, 
  Beaker, 
  HeartPulse, 
  Activity, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  Clipboard, 
  Stethoscope,
  PlusCircle,
  ChevronRight,
  ClockIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createInternalLink } from "@/lib/subdomain";

/**
 * Componente de bienvenida que se muestra cuando el usuario accede directamente a /dashboard
 * Evita mostrar una pantalla en blanco y proporciona acceso rápido a las secciones principales
 */
export default function BienvenidaDashboard() {
  const { user } = useAuth();
  
  // Datos ficticios para las estadísticas
  const stats = [
    { id: 'citas', titulo: 'Citas de hoy', valor: 8, icono: <Calendar className="h-6 w-6 text-blue-500" /> },
    { id: 'pendientes', titulo: 'Pendientes', valor: 3, icono: <ClockIcon className="h-6 w-6 text-orange-500" /> },
    { id: 'pacientes', titulo: 'Pacientes totales', valor: 356, icono: <Users className="h-6 w-6 text-green-500" /> },
    { id: 'mensajes', titulo: 'Mensajes nuevos', valor: 12, icono: <MessageSquare className="h-6 w-6 text-indigo-500" /> }
  ];

  // Próximas citas ficticias
  const proximasCitas = [
    { id: 1, hora: '9:00', paciente: 'Ana García', motivo: 'Consulta general', estatus: 'pendiente' },
    { id: 2, hora: '10:30', paciente: 'Carlos López', motivo: 'Seguimiento tratamiento', estatus: 'confirmada' },
    { id: 3, hora: '12:00', paciente: 'María Rodríguez', motivo: 'Revisión anual', estatus: 'pendiente' },
    { id: 4, hora: '13:30', paciente: 'José Martínez', motivo: 'Análisis resultados', estatus: 'confirmada' }
  ];

  // Funciones recientes
  const accionesPendientes = [
    { id: 'receta1', texto: 'Firmar receta para Ricardo Fuentes', ruta: '/dashboard/recetas' },
    { id: 'lab1', texto: 'Revisar resultados de laboratorio de Lucía Méndez', ruta: '/dashboard/laboratorio' },
    { id: 'exp1', texto: 'Actualizar expediente de Mario Gutiérrez', ruta: '/dashboard/expedientes' }
  ];

  // Accesos rápidos
  const accesosRapidos = [
    {
      id: 'pacientes',
      titulo: 'Pacientes',
      descripcion: 'Gestiona tu directorio de pacientes',
      icono: <Users className="h-8 w-8 text-primary mb-2" />,
      ruta: '/dashboard/pacientes'
    },
    {
      id: 'agenda',
      titulo: 'Agenda',
      descripcion: 'Administra tu calendario de citas',
      icono: <Calendar className="h-8 w-8 text-primary mb-2" />,
      ruta: '/dashboard/agenda'
    },
    {
      id: 'recetas',
      titulo: 'Recetas',
      descripcion: 'Genera y consulta recetas médicas',
      icono: <FileText className="h-8 w-8 text-primary mb-2" />,
      ruta: '/dashboard/recetas'
    },
    {
      id: 'laboratorio',
      titulo: 'Laboratorio',
      descripcion: 'Solicita y revisa estudios clínicos',
      icono: <Beaker className="h-8 w-8 text-primary mb-2" />,
      ruta: '/dashboard/laboratorio'
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Cabecera de bienvenida */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            ¡Bienvenido, Dr. {user?.firstName || 'Especialista'}!
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild variant="default">
            <Link to={createInternalLink("/dashboard/pacientes/nuevo")} className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo paciente
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={createInternalLink("/dashboard/agenda/nueva")} className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva cita
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.id} className="border-l-4 border-l-primary">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.titulo}</p>
                <h2 className="text-3xl font-bold mt-1">{stat.valor}</h2>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                {stat.icono}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sección de contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Próximas citas */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Próximas citas</CardTitle>
              <CardDescription>Citas programadas para hoy</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to={createInternalLink("/dashboard/agenda")}>
                Ver todas <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximasCitas.map((cita) => (
                <div key={cita.id} className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 w-16 text-center">
                    <span className="font-bold text-primary">{cita.hora}</span>
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="font-medium">{cita.paciente}</p>
                    <p className="text-sm text-muted-foreground">{cita.motivo}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      cita.estatus === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {cita.estatus === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-center">
            <Button asChild variant="outline">
              <Link to={createInternalLink("/dashboard/agenda/nueva")}>
                <Calendar className="mr-2 h-4 w-4" />
                Programar nueva cita
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Columna 2: Acciones pendientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
            <CardDescription>Tareas que requieren tu atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accionesPendientes.map((accion) => (
                <div key={accion.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Link to={createInternalLink(accion.ruta)}>
                    <p className="text-sm font-medium hover:text-primary cursor-pointer">{accion.texto}</p>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-center">
            <Button asChild variant="outline">
              <Link to={createInternalLink("/dashboard/tareas")}>
                <Clipboard className="mr-2 h-4 w-4" />
                Ver todas las tareas
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Accesos rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accesosRapidos.map((acceso) => (
            <Card key={acceso.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex flex-col items-center justify-center">
                  {acceso.icono}
                  <CardTitle className="text-lg">{acceso.titulo}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-3">{acceso.descripcion}</CardDescription>
                <Button asChild className="w-full">
                  <Link to={createInternalLink(acceso.ruta)}>Acceder</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
