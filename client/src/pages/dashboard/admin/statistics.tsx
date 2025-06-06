import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  PieChart, 
  LineChart,
  Calendar, 
  Activity, 
  Users, 
  FileText, 
  Clock, 
  AlertCircle,
  Filter
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Helper function to generate months array
function getLastMonths(count: number) {
  const months = [];
  for (let i = 0; i < count; i++) {
    const date = subMonths(new Date(), i);
    months.unshift(format(date, 'MMMM yyyy', { locale: es }));
  }
  return months;
}

export default function AdminStatistics() {
  const [period, setPeriod] = useState("last6months");
  const [chartType, setChartType] = useState("appointments");
  
  // Fetch statistics
  const {
    data: statistics,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["/api/statistics", period],
  });

  // Determine the time period based on selection
  const getTimeRange = () => {
    switch(period) {
      case "last3months":
        return getLastMonths(3);
      case "last6months":
        return getLastMonths(6);
      case "last12months":
        return getLastMonths(12);
      default:
        return getLastMonths(6);
    }
  };

  const timeLabels = getTimeRange();
  
  // Chart data for appointments
  const appointmentsData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Programadas',
        data: timeLabels.map(() => Math.floor(Math.random() * 50) + 10),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Completadas',
        data: timeLabels.map(() => Math.floor(Math.random() * 40) + 5),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Canceladas',
        data: timeLabels.map(() => Math.floor(Math.random() * 15)),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  // Chart data for user registrations
  const usersData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Pacientes',
        data: timeLabels.map(() => Math.floor(Math.random() * 30) + 5),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Médicos',
        data: timeLabels.map(() => Math.floor(Math.random() * 10) + 2),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Chart data for document uploads
  const documentsData = {
    labels: ['Resultados', 'Recetas', 'Radiología', 'Notas', 'Certificados', 'Referencias'],
    datasets: [
      {
        label: 'Documentos por tipo',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartType === 'appointments' 
          ? 'Estadísticas de Citas' 
          : chartType === 'users' 
            ? 'Registro de Usuarios'
            : 'Documentos por Tipo',
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Estadísticas Detalladas</h1>
        <p className="text-gray-500 mt-1">Análisis completo de la actividad en la plataforma</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Tabs defaultValue="appointments" onValueChange={setChartType} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="appointments" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Citas
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Usuarios
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Documentos
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last3months">Últimos 3 meses</SelectItem>
                <SelectItem value="last6months">Últimos 6 meses</SelectItem>
                <SelectItem value="last12months">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoadingStats ? (
        <Card>
          <CardContent className="p-6">
            <div className="h-80">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
      ) : statsError ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>Error al cargar las estadísticas. Intenta de nuevo.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="h-80">
              {chartType === 'appointments' && (
                <Line options={options} data={appointmentsData} />
              )}
              {chartType === 'users' && (
                <Bar options={options} data={usersData} />
              )}
              {chartType === 'documents' && (
                <Pie options={options} data={documentsData} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Citas Totales
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                statistics?.appointmentsCount?.total || "0"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Incluye citas programadas, completadas y canceladas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Diario
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                "5.8"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Citas por día (último mes)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Promedio
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                "32 min"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Duración promedio de consulta
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Rendimiento</CardTitle>
            <CardDescription>
              Resumen de métricas clave de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tasa de Finalización de Citas</p>
                  <p className="text-xs text-muted-foreground">
                    Porcentaje de citas programadas que se completaron
                  </p>
                </div>
                <div className="text-lg font-bold">
                  {isLoadingStats ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    "82%"
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Crecimiento de Usuarios</p>
                  <p className="text-xs text-muted-foreground">
                    Incremento en los últimos 30 días
                  </p>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {isLoadingStats ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    "+12%"
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Documentos por Paciente</p>
                  <p className="text-xs text-muted-foreground">
                    Promedio de documentos subidos por paciente
                  </p>
                </div>
                <div className="text-lg font-bold">
                  {isLoadingStats ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    "3.4"
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Comisiones Mensuales</p>
                  <p className="text-xs text-muted-foreground">
                    Total de comisiones de laboratorio (último mes)
                  </p>
                </div>
                <div className="text-lg font-bold">
                  {isLoadingStats ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    "$1,248.50"
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}