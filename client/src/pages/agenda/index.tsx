import { useState } from "react";
import DoctorLayout from "@/layouts/DoctorLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, Search, FileText, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Datos de ejemplo para el calendario de citas
const appointmentsData = [
  {
    id: 1,
    patientName: "María García",
    date: new Date(2025, 3, 30, 10, 0),
    status: "scheduled",
    type: "first_visit"
  },
  {
    id: 2,
    patientName: "Carlos Rodríguez",
    date: new Date(2025, 3, 30, 11, 30),
    status: "scheduled",
    type: "follow_up"
  },
  {
    id: 3,
    patientName: "Ana Martínez",
    date: new Date(2025, 3, 30, 13, 0),
    status: "completed",
    type: "follow_up"
  },
  {
    id: 4,
    patientName: "Pedro López",
    date: new Date(2025, 3, 30, 16, 0),
    status: "cancelled",
    type: "emergency"
  },
  {
    id: 5,
    patientName: "Laura Sánchez",
    date: new Date(2025, 4, 1, 9, 0),
    status: "scheduled",
    type: "telemedicine"
  }
];

export default function AgendaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const currentDate = new Date();
  
  // Filtrar citas por término de búsqueda
  const filteredAppointments = appointmentsData.filter(appointment => 
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mapear estado de cita a color de badge
  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-orange-100 text-orange-800"
  };
  
  // Mapear estado de cita a texto
  const statusText: Record<string, string> = {
    scheduled: "Programada",
    completed: "Completada",
    cancelled: "Cancelada",
    no_show: "No asistió"
  };
  
  // Mapear tipo de cita a texto
  const appointmentTypeMap: Record<string, string> = {
    first_visit: "Primera visita",
    follow_up: "Seguimiento",
    emergency: "Urgencia",
    telemedicine: "Telemedicina"
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Agenda</h1>
            <p className="text-muted-foreground mt-2">
              Gestione sus citas y horarios disponibles
            </p>
          </div>
          <div className="flex mt-4 md:mt-0 gap-3">
            <Link href="/agenda/nueva-cita">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Cita
              </Button>
            </Link>
            <Link href="/agenda/horarios">
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Horarios Disponibles
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Calendario */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Calendario de Citas</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <CardDescription>
                {format(currentDate, "EEEE, d 'de' MMMM, yyyy", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="today">
                <TabsList className="mb-4">
                  <TabsTrigger value="today">Hoy</TabsTrigger>
                  <TabsTrigger value="week">Esta Semana</TabsTrigger>
                  <TabsTrigger value="month">Este Mes</TabsTrigger>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className="space-y-4">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">No hay citas para mostrar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.map(appointment => (
                        <Card key={appointment.id}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-primary/10 p-2.5 rounded-full mr-4">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{appointment.patientName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(appointment.date, "HH:mm", { locale: es })} - {appointmentTypeMap[appointment.type]}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={statusColors[appointment.status]}
                              >
                                {statusText[appointment.status]}
                              </Badge>
                              <Link href={`/agenda/cita/${appointment.id}`}>
                                <Button variant="outline" size="sm">
                                  Ver detalles
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="week">
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">Citas de esta semana</p>
                  </div>
                </TabsContent>
                <TabsContent value="month">
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">Citas de este mes</p>
                  </div>
                </TabsContent>
                <TabsContent value="all">
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">Todas las citas</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Panel de Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/agenda/horarios">
                <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                  <Clock className="mr-3 h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Configurar horarios disponibles</span>
                </div>
              </Link>
              <Link href="/recetas/nueva">
                <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                  <FileText className="mr-3 h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Crear nueva receta médica</span>
                </div>
              </Link>
              <Link href="/laboratorio/solicitar">
                <div className="bg-white rounded-md shadow-sm hover:bg-gray-100 transition-colors h-[44px] min-h-[44px] flex items-center px-3 cursor-pointer border border-border">
                  <Activity className="mr-3 h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Solicitar estudios de laboratorio</span>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DoctorLayout>
  );
}