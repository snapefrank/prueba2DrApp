import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Clock, AlertCircle, Calendar as CalendarIcon, CreditCard, Activity } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { EnhancedAppointment, formatAppointmentDate, getStatusColor, getStatusText } from "@/lib/appointments";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import HealthTrendsPanel from "@/components/health-trends/HealthTrendsPanel";
import HealthMetricForm from "@/components/health-trends/HealthMetricForm";

export default function PatientDashboard() {
  const { user } = useAuth();
  const now = new Date();
  const [healthMetricModalOpen, setHealthMetricModalOpen] = useState(false);

  // Fetch appointments
  const {
    data: appointments,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useQuery<EnhancedAppointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Fetch medical records
  const {
    data: medicalRecords,
    isLoading: isLoadingRecords,
    error: recordsError,
  } = useQuery({
    queryKey: [`/api/medical-records/${user?.id}`],
  });

  // Fetch patient documents
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useQuery({
    queryKey: [`/api/patient-documents/${user?.id}`],
  });

  // Format upcoming appointments (filter only those that are in the future and scheduled)
  const upcomingAppointments = appointments
    ?.filter(
      (apt) => 
        new Date(apt.dateTime) > now && 
        apt.status === "scheduled" && 
        apt.patientId === user?.id
    )
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.firstName}</h1>
        <Link href="/dashboard/patient/appointments">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Agendar Cita
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAppointments ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                appointments?.filter(apt => apt.patientId === user?.id).length || 0
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
              {isLoadingDocuments ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                documents?.length || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros médicos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingRecords ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                medicalRecords?.length || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima cita</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {isLoadingAppointments ? (
                <Skeleton className="h-8 w-full" />
              ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                <time dateTime={upcomingAppointments[0].dateTime.toString()}>
                  {format(new Date(upcomingAppointments[0].dateTime), "PPP", { locale: es })}
                </time>
              ) : (
                "No hay citas programadas"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Upcoming Appointments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
            <CardDescription>
              Visualiza tus próximas consultas médicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : appointmentsError ? (
              <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>Error al cargar las citas</span>
              </div>
            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-primary-50 rounded-full">
                        <CalendarIcon className="h-5 w-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.doctor?.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatAppointmentDate(new Date(appointment.dateTime))}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{appointment.reason}</p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 ml-0 sm:ml-4">
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No hay citas programadas</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Programa tu primera cita médica ahora
                </p>
                <Link href="/dashboard/patient/appointments">
                  <Button>Agendar Cita</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>
              Accede a las funciones principales
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link href="/dashboard/patient/appointments">
              <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                <Calendar className="mr-3 h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Mis Citas</span>
              </div>
            </Link>
            <Link href="/dashboard/patient/documents">
              <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                <FileText className="mr-3 h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Mis Documentos</span>
              </div>
            </Link>
            <Link href="/dashboard/patient/medical-history">
              <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                <FileText className="mr-3 h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Historial Médico</span>
              </div>
            </Link>
            <Link href="/dashboard/subscriptions">
              <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                <CreditCard className="mr-3 h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Suscripciones</span>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Métricas de Salud</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setHealthMetricModalOpen(true)}
          >
            <Activity className="mr-2 h-4 w-4" />
            Registrar Métrica
          </Button>
        </div>
        {user && <HealthTrendsPanel patientId={user.id} />}
        
        {/* Health Metric Form Modal */}
        {user && (
          <HealthMetricForm 
            open={healthMetricModalOpen} 
            onOpenChange={setHealthMetricModalOpen} 
            patientId={user.id} 
          />
        )}
      </div>
    </div>
  );
}
