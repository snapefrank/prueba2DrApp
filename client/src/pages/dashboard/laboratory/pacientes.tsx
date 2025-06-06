import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import LaboratoryLayout from "@/layouts/LaboratoryLayout";
import { createInternalLink } from "@/lib/subdomain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  UserRound, 
  Calendar, 
  TestTube,
  Clock,
  Phone,
  Mail,
  FileText,
  Plus,
  Copy
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Tipo para pacientes
interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit?: string;
  totalTests: number;
  pendingResults: number;
  gender: string;
  age: number;
  bloodType?: string;
  allergies?: string[];
}

const PacientesLaboratorio = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [visitFilter, setVisitFilter] = useState("all");
  const [, navigate] = useLocation();

  // Obtener la lista de pacientes
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/laboratory/patients"],
    queryFn: async () => {
      // En una implementación futura, esto debería obtener datos reales de la API
      // Para la demostración, usamos datos simulados
      return [
        {
          id: 101,
          name: "María González",
          email: "maria.gonzalez@example.com",
          phone: "+52 55 1234 5678",
          lastVisit: "2023-04-15T10:30:00",
          totalTests: 5,
          pendingResults: 0,
          gender: "female",
          age: 35,
          bloodType: "O+",
          allergies: ["Penicilina"]
        },
        {
          id: 102,
          name: "Carlos Rodríguez",
          email: "carlos.rodriguez@example.com",
          phone: "+52 55 8765 4321",
          lastVisit: "2023-04-20T09:15:00",
          totalTests: 3,
          pendingResults: 1,
          gender: "male",
          age: 42,
          bloodType: "A+",
          allergies: []
        },
        {
          id: 103,
          name: "Ana Martínez",
          email: "ana.martinez@example.com",
          phone: "+52 55 2345 6789",
          lastVisit: "2023-04-22T14:45:00",
          totalTests: 8,
          pendingResults: 2,
          gender: "female",
          age: 29,
          bloodType: "B-",
          allergies: ["Látex", "Sulfamidas"]
        },
        {
          id: 104,
          name: "Juan Pérez",
          email: "juan.perez@example.com",
          phone: "+52 55 3456 7890",
          lastVisit: "2023-04-10T11:00:00",
          totalTests: 2,
          pendingResults: 0,
          gender: "male",
          age: 56,
          bloodType: "AB+",
          allergies: []
        },
        {
          id: 105,
          name: "Sofía Vázquez",
          email: "sofia.vazquez@example.com",
          phone: "+52 55 4567 8901",
          totalTests: 0,
          pendingResults: 0,
          gender: "female",
          age: 24,
          bloodType: "O-",
          allergies: ["Aspirina"]
        }
      ];
    },
  });

  // Filtrar pacientes
  const filteredPatients = patients?.filter(patient => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    
    // Filtrar por última visita
    const matchesVisit = visitFilter === "all" || 
      (visitFilter === "recent" && patient.lastVisit && new Date(patient.lastVisit) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (visitFilter === "pending" && patient.pendingResults > 0) ||
      (visitFilter === "new" && !patient.lastVisit);
    
    return matchesSearch && matchesVisit;
  });

  // Ver perfil de paciente
  const handleViewPatient = (patientId: number) => {
    navigate(createInternalLink(`/dashboard/laboratory/pacientes/${patientId}`));
  };

  // Ver historial de paciente
  const handleViewHistory = (patientId: number) => {
    navigate(createInternalLink(`/dashboard/laboratory/pacientes/${patientId}/historial`));
  };

  // Agendar nuevo estudio
  const handleScheduleTest = (patientId: number) => {
    navigate(createInternalLink(`/dashboard/laboratory/pacientes/${patientId}/agendar`));
  };

  // Copiar información de contacto
  const handleCopyContact = (patient: Patient) => {
    const contactInfo = `${patient.name}\n${patient.phone}\n${patient.email}`;
    navigator.clipboard.writeText(contactInfo).then(() => {
      toast({
        title: "Información copiada",
        description: "Datos de contacto copiados al portapapeles",
      });
    });
  };

  return (
    <LaboratoryLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-gray-500">
            Base de datos de pacientes del laboratorio
          </p>
        </div>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo paciente
        </Button>
      </div>

      {/* Sección de filtrado */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre, email o teléfono..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select 
                value={visitFilter}
                onValueChange={setVisitFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar pacientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pacientes</SelectItem>
                  <SelectItem value="recent">Visita reciente (30 días)</SelectItem>
                  <SelectItem value="pending">Con resultados pendientes</SelectItem>
                  <SelectItem value="new">Nunca han visitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-grow"></div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="hidden md:flex">
                <Filter className="mr-2 h-4 w-4" />
                Más filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de pacientes */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Última visita</TableHead>
                <TableHead>Estudios</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando pacientes...
                  </TableCell>
                </TableRow>
              ) : filteredPatients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No se encontraron pacientes que coincidan con los filtros
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients?.map((patient) => (
                  <TableRow key={patient.id} className={patient.pendingResults > 0 ? "bg-amber-50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 rounded-full p-1">
                          <UserRound className="h-5 w-5 text-indigo-700" />
                        </div>
                        <div>
                          <div>{patient.name}</div>
                          <div className="text-xs text-gray-500">ID: {patient.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-gray-500" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-500" />
                          {patient.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.lastVisit ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {format(new Date(patient.lastVisit), "d MMM yyyy", { locale: es })}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin visitas previas</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <TestTube className="h-3 w-3 mr-1 text-gray-500" />
                          Total: {patient.totalTests}
                        </div>
                        {patient.pendingResults > 0 && (
                          <div className="flex items-center">
                            <Badge variant="outline" className="border-amber-500 text-amber-700 text-xs">
                              <Clock className="h-2 w-2 mr-1" />
                              {patient.pendingResults} pendientes
                            </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>{patient.age} años</div>
                        <div className="flex gap-2">
                          {patient.bloodType && (
                            <Badge variant="secondary" className="text-xs">
                              {patient.bloodType}
                            </Badge>
                          )}
                          {patient.gender === "male" ? (
                            <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50">
                              M
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-pink-200 bg-pink-50">
                              F
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="Ver perfil"
                          onClick={() => handleViewPatient(patient.id)}
                        >
                          <UserRound className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="Historial de estudios"
                          onClick={() => handleViewHistory(patient.id)}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="Copiar información de contacto"
                          onClick={() => handleCopyContact(patient)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleScheduleTest(patient.id)}
                        >
                          Agendar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </LaboratoryLayout>
  );
};

export default PacientesLaboratorio;