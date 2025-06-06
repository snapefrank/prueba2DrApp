import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserPlus, 
  Stethoscope, 
  BarChart, 
  FlaskRound, 
  Calendar, 
  FileText, 
  AlertCircle,
  CreditCard
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function AdminDashboard() {
  // Fetch statistics
  const {
    data: statistics,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["/api/statistics"],
  });

  // Random colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare data for appointment status chart
  const appointmentStatusData = statistics?.appointmentsCount?.byStatus
    ? Object.entries(statistics.appointmentsCount.byStatus).map(([status, count]) => ({
        name: status === "scheduled" ? "Programadas" : 
              status === "completed" ? "Completadas" : 
              status === "cancelled" ? "Canceladas" : status,
        value: count,
      }))
    : [];

  // Prepare data for document types chart
  const documentTypesData = statistics?.documentsCount?.byType
    ? Object.entries(statistics.documentsCount.byType).map(([type, count]) => ({
        name: type === "lab_result" ? "Resultados" : 
              type === "prescription" ? "Recetas" : 
              type === "radiology" ? "Radiología" : 
              type === "clinical_note" ? "Notas" : 
              type === "medical_certificate" ? "Certificados" : 
              type === "referral" ? "Referencias" : type,
        value: count,
      }))
    : [];

  // Prepare data for user counts bar chart
  const userCountsData = statistics?.usersCount
    ? [
        { name: "Pacientes", count: statistics.usersCount.patients },
        { name: "Médicos", count: statistics.usersCount.doctors },
        { name: "Total", count: statistics.usersCount.total },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <div className="flex space-x-2">
          <Link href="/dashboard/admin/users">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Usuarios
            </Button>
          </Link>
          <Link href="/dashboard/admin/labs">
            <Button variant="outline">
              <FlaskRound className="mr-2 h-4 w-4" />
              Laboratorios
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                statistics?.usersCount?.total || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Pacientes y médicos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos Activos</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                statistics?.usersCount?.doctors || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                statistics?.appointmentsCount?.total || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                statistics?.documentsCount?.total || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* User Statistics */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Estadísticas de Usuarios</CardTitle>
            <CardDescription>
              Distribución de usuarios en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex justify-center">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : statsError ? (
              <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Error al cargar las estadísticas</span>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={userCountsData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Cantidad" fill="#3B82F6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Estado de Citas</CardTitle>
            <CardDescription>
              Distribución por estado de citas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex justify-center">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : statsError ? (
              <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Error al cargar las estadísticas</span>
              </div>
            ) : appointmentStatusData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {appointmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No hay datos</h3>
                <p className="text-sm text-gray-500 mt-1">
                  No hay información de citas disponible
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Types */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tipos de Documentos</CardTitle>
            <CardDescription>
              Distribución por tipo de documento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex justify-center">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : statsError ? (
              <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Error al cargar las estadísticas</span>
              </div>
            ) : documentTypesData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={documentTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {documentTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No hay datos</h3>
                <p className="text-sm text-gray-500 mt-1">
                  No hay información de documentos disponible
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-6">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link href="/dashboard/admin/users">
              <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                <Users className="mr-3 h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Gestionar Usuarios</span>
              </div>
            </Link>
            <Link href="/dashboard/admin/labs">
              <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                <FlaskRound className="mr-3 h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Gestionar Laboratorios</span>
              </div>
            </Link>
            <Link href="/dashboard/admin/statistics">
              <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                <BarChart className="mr-3 h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Estadísticas Detalladas</span>
              </div>
            </Link>
            <Link href="/dashboard/admin/subscription-plans">
              <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                <CreditCard className="mr-3 h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Gestionar Suscripciones</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : statsError ? (
              <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Error al cargar las estadísticas</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 text-primary-500 mr-2" />
                    <span className="text-sm font-medium">Pacientes registrados</span>
                  </div>
                  <span className="font-medium">{statistics?.usersCount?.patients || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Stethoscope className="h-5 w-5 text-primary-500 mr-2" />
                    <span className="text-sm font-medium">Médicos registrados</span>
                  </div>
                  <span className="font-medium">{statistics?.usersCount?.doctors || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary-500 mr-2" />
                    <span className="text-sm font-medium">Citas programadas</span>
                  </div>
                  <span className="font-medium">{statistics?.appointmentsCount?.byStatus?.scheduled || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary-500 mr-2" />
                    <span className="text-sm font-medium">Citas completadas</span>
                  </div>
                  <span className="font-medium">{statistics?.appointmentsCount?.byStatus?.completed || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
