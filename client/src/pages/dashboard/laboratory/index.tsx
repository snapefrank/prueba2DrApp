import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { createInternalLink } from "@/lib/subdomain";
import LaboratoryLayout from "@/layouts/LaboratoryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  TestTube, 
  BarChart3, 
  Clipboard, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

const LaboratoryDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    pendingRequests: 0,
    scheduledTests: 0,
    completedTests: 0,
    totalPatients: 0,
    todayTests: 0,
    urgentTests: 0,
  });

  // En una versión futura se debe implementar la consulta a la API
  // para obtener estadísticas reales
  const { data: pendingRequests, isLoading: isLoadingPending } = useQuery({
    queryKey: ["/api/laboratory/requests/pending/count"],
    queryFn: async () => {
      // Por ahora retornamos un valor simulado
      return { count: 12 };
    },
  });

  useEffect(() => {
    // Simulación de datos para el dashboard
    setStats({
      pendingRequests: pendingRequests?.count || 0,
      scheduledTests: 8,
      completedTests: 154,
      totalPatients: 87,
      todayTests: 5,
      urgentTests: 2,
    });
  }, [pendingRequests]);

  return (
    <LaboratoryLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Laboratorio</h1>
          <p className="text-gray-500">
            Bienvenido, {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden md:flex">
            <Calendar className="mr-2 h-4 w-4" />
            Descargar reporte
          </Button>
          <Button className="hidden md:flex">
            <TestTube className="mr-2 h-4 w-4" />
            Nuevo estudio
          </Button>
        </div>
      </div>

      {/* Panel de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes pendientes</CardTitle>
            <Clipboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Solicitudes por procesar
            </p>
            <Button variant="link" className="px-0 text-xs" asChild>
              <Link href={createInternalLink("/dashboard/laboratory/solicitudes")}>
                Ver solicitudes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estudios agendados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledTests}</div>
            <p className="text-xs text-muted-foreground">
              Estudios programados esta semana
            </p>
            <Button variant="link" className="px-0 text-xs" asChild>
              <Link href={createInternalLink("/dashboard/laboratory/programados")}>
                Ver agenda
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estudios realizados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTests}</div>
            <p className="text-xs text-muted-foreground">
              Estudios completados (total)
            </p>
            <Button variant="link" className="px-0 text-xs" asChild>
              <Link href={createInternalLink("/dashboard/laboratory/resultados")}>
                Ver resultados
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pacientes atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Total de pacientes registrados
            </p>
            <Button variant="link" className="px-0 text-xs" asChild>
              <Link href={createInternalLink("/dashboard/laboratory/pacientes")}>
                Ver pacientes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estudios para hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTests}</div>
            <p className="text-xs text-muted-foreground">
              Agendados para el día de hoy
            </p>
            <Button variant="link" className="px-0 text-xs" asChild>
              <Link href={createInternalLink("/dashboard/laboratory/programados?date=today")}>
                Ver detalles
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className={stats.urgentTests > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={`text-sm font-medium ${stats.urgentTests > 0 ? "text-red-600" : ""}`}>
              Urgentes
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.urgentTests > 0 ? "text-red-600" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.urgentTests > 0 ? "text-red-600" : ""}`}>
              {stats.urgentTests}
            </div>
            <p className={`text-xs ${stats.urgentTests > 0 ? "text-red-500" : "text-muted-foreground"}`}>
              Solicitudes urgentes pendientes
            </p>
            {stats.urgentTests > 0 && (
              <Button variant="link" className="px-0 text-xs text-red-600" asChild>
                <Link href={createInternalLink("/dashboard/laboratory/solicitudes?filter=urgent")}>
                  Atender urgentes
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sección de actividad reciente */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>
            Últimas actualizaciones en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-blue-100 p-2">
                <TestTube className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo resultado subido</p>
                <p className="text-xs text-gray-500">Química sanguínea para Juan Pérez</p>
              </div>
              <div className="text-xs text-gray-500">Hace 25 min</div>
            </div>
            
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-green-100 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Estudio completado</p>
                <p className="text-xs text-gray-500">Biometría hemática para María González</p>
              </div>
              <div className="text-xs text-gray-500">Hace 1 hora</div>
            </div>
            
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-purple-100 p-2">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nueva cita agendada</p>
                <p className="text-xs text-gray-500">Perfil tiroideo para Carlos Rodríguez</p>
              </div>
              <div className="text-xs text-gray-500">Hace 3 horas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </LaboratoryLayout>
  );
};

export default LaboratoryDashboard;