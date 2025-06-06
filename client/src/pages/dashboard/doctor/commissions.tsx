import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Search, DollarSign, BarChart, Calendar, Plus, Loader2, Filter } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Commission schema for form validation
const commissionSchema = z.object({
  laboratoryId: z.number({
    required_error: "Selecciona un laboratorio",
  }),
  patientId: z.number({
    required_error: "Selecciona un paciente",
  }),
  serviceName: z.string().min(3, "El nombre del servicio debe tener al menos 3 caracteres"),
  amount: z.number({
    required_error: "Ingresa el monto de la comisión",
  }).min(1, "La comisión debe ser mayor a 0"),
});

type CommissionFormValues = z.infer<typeof commissionSchema>;

// Enhanced commission type with laboratory and patient info
type EnhancedCommission = {
  id: number;
  doctorId: number;
  laboratoryId: number;
  patientId: number;
  serviceName: string;
  amount: number;
  status: string;
  createdAt: string;
  laboratory?: {
    id: number;
    name: string;
  };
  patient?: {
    id: number;
    name: string;
  };
};

export default function DoctorCommissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [open, setOpen] = useState(false);

  // Fetch commissions
  const {
    data: commissions,
    isLoading: isLoadingCommissions,
    error: commissionsError,
  } = useQuery<EnhancedCommission[]>({
    queryKey: ["/api/lab-commissions"],
  });

  // Fetch laboratories for form
  const {
    data: laboratories,
    isLoading: isLoadingLabs,
  } = useQuery({
    queryKey: ["/api/laboratories"],
  });

  // Fetch patients for form
  const {
    data: patients,
    isLoading: isLoadingPatients,
  } = useQuery({
    queryKey: ["/api/appointments"],
    select: (data) => {
      const patientMap = new Map();
      data.forEach(appointment => {
        if (appointment.doctorId === user?.id && appointment.patient) {
          patientMap.set(appointment.patientId, appointment.patient);
        }
      });
      return Array.from(patientMap).map(([id, patient]) => ({
        id,
        ...patient
      }));
    },
  });

  // Form for creating a new commission
  const form = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionSchema),
    defaultValues: {
      serviceName: "",
      amount: 0,
    },
  });

  // Handle commission creation
  const createCommissionMutation = useMutation({
    mutationFn: async (data: CommissionFormValues) => {
      // Convert amount to cents for API
      const dataForApi = {
        ...data,
        amount: data.amount * 100, // Convert dollars to cents
      };
      const res = await apiRequest("POST", "/api/lab-commissions", dataForApi);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Comisión registrada",
        description: "La comisión ha sido registrada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lab-commissions"] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo registrar la comisión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: CommissionFormValues) {
    createCommissionMutation.mutate(values);
  }

  // Apply filters to commissions
  const filteredCommissions = commissions
    ?.filter(commission => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          commission.serviceName.toLowerCase().includes(searchLower) ||
          (commission.laboratory?.name.toLowerCase().includes(searchLower)) ||
          (commission.patient?.name.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter(commission => {
      // Filter by status
      if (filterStatus !== "all") {
        return commission.status === filterStatus;
      }
      return true;
    })
    .filter(commission => {
      // Filter by month
      if (filterMonth) {
        const commissionDate = new Date(commission.createdAt);
        const yearMonth = format(commissionDate, "yyyy-MM");
        return yearMonth === filterMonth;
      }
      return true;
    });

  // Calculate total commissions
  const totalCommissions = filteredCommissions?.reduce((acc, commission) => acc + commission.amount, 0) || 0;
  
  // Calculate total pending commissions
  const pendingCommissions = filteredCommissions?.filter(c => c.status === "pending").reduce((acc, commission) => acc + commission.amount, 0) || 0;
  
  // Calculate total paid commissions
  const paidCommissions = filteredCommissions?.filter(c => c.status === "paid").reduce((acc, commission) => acc + commission.amount, 0) || 0;

  // Get available months for filtering
  const availableMonths = commissions
    ? Array.from(new Set(commissions.map(c => format(new Date(c.createdAt), "yyyy-MM"))))
        .sort((a, b) => b.localeCompare(a)) // Sort descending
    : [];

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Comisiones</h1>
          <p className="text-gray-500 mt-1">Gestiona tus comisiones por laboratorios</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="mr-2 h-4 w-4" /> Registrar Comisión
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Comisión</DialogTitle>
              <DialogDescription>
                Ingresa los detalles de la comisión recibida por un laboratorio
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="laboratoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Laboratorio</FormLabel>
                      <Select
                        disabled={isLoadingLabs}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un laboratorio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {laboratories?.map((lab) => (
                            <SelectItem key={lab.id} value={lab.id.toString()}>
                              {lab.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente</FormLabel>
                      <Select
                        disabled={isLoadingPatients}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un paciente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients?.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servicio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Análisis de sangre, Radiografía, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto ($)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createCommissionMutation.isPending}>
                    {createCommissionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Registrar Comisión"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCommissions ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `$${(totalCommissions / 100).toFixed(2)}`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Pago</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCommissions ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `$${(pendingCommissions / 100).toFixed(2)}`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Recibidos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCommissions ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `$${(paidCommissions / 100).toFixed(2)}`
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex items-center w-full sm:w-96">
              <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar comisiones..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="paid">Pagados</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los meses</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {format(new Date(`${month}-01`), "MMMM yyyy", { locale: es })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoadingCommissions ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : commissionsError ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>Error al cargar las comisiones. Intenta de nuevo.</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredCommissions && filteredCommissions.length > 0 ? (
        <div className="space-y-4">
          {filteredCommissions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((commission) => (
              <Card key={commission.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="p-2 bg-primary-50 rounded-full h-fit">
                          <DollarSign className="h-5 w-5 text-primary-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-lg">{commission.serviceName}</h3>
                          <p className="text-gray-500 text-sm">
                            Laboratorio: {commission.laboratory?.name || "Desconocido"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Paciente: {commission.patient?.name || "Desconocido"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge className={cn(
                          commission.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        )}>
                          {commission.status === "pending" ? "Pendiente" : "Pagado"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        ${(commission.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {format(new Date(commission.createdAt), "PPP", { locale: es })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay comisiones</h3>
            <p className="text-gray-500 mt-1 mb-6 max-w-md mx-auto">
              No tienes comisiones registradas que coincidan con los filtros aplicados.
            </p>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Registrar Comisión
              </Button>
            </DialogTrigger>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
