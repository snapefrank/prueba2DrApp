import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Plus, X, FileSpreadsheet, Printer, ClipboardList } from "lucide-react";
import { InsertLabCommission, Laboratory } from "@shared/schema";

// Función para formatear fecha
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Esquema de validación para la orden de laboratorio
const labOrderSchema = z.object({
  patientId: z.number().min(1, { message: "Seleccione un paciente" }),
  laboratoryId: z.number().min(1, { message: "Seleccione un laboratorio" }),
  serviceName: z.string().optional(),
  testType: z.string().optional(),
  description: z.string().min(5, { message: "La descripción debe tener al menos 5 caracteres" }),
  amount: z.string().min(1, { message: "Ingrese el monto" }),
  urgency: z.string().optional()
});

type LabOrderFormValues = z.infer<typeof labOrderSchema>;

export default function LaboratoryOrderForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Consultar laboratorios
  const { data: laboratories } = useQuery<Laboratory[]>({
    queryKey: ["/api/laboratories"],
    queryFn: async () => {
      const response = await fetch("/api/laboratories");
      if (!response.ok) throw new Error("Error al cargar laboratorios");
      return response.json();
    }
  });
  
  // Consultar pacientes
  const { data: patients } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users?type=patient");
      if (!response.ok) throw new Error("Error al cargar pacientes");
      return response.json();
    },
    enabled: user?.userType === "admin" || user?.userType === "doctor"
  });
  
  // Consultar catálogo de pruebas
  const { data: labTests } = useQuery<any[]>({
    queryKey: ["/api/lab-tests"],
    queryFn: async () => {
      const response = await fetch("/api/lab-tests");
      if (!response.ok) throw new Error("Error al cargar pruebas de laboratorio");
      return response.json();
    }
  });
  
  // Filtrar pruebas por término de búsqueda
  const filteredTests = labTests?.filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];
  
  // Configurar formulario
  const form = useForm<LabOrderFormValues>({
    resolver: zodResolver(labOrderSchema),
    defaultValues: {
      description: "",
      amount: "",
      urgency: "normal",
      serviceName: "",
      testType: "",
    }
  });
  
  // Mutación para crear orden de laboratorio
  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertLabCommission) => {
      const response = await apiRequest("POST", "/api/lab-commissions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-commissions"] });
      toast({
        title: "Orden creada",
        description: "La orden de laboratorio ha sido creada exitosamente",
      });
      form.reset();
      setSelectedTests([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la orden de laboratorio",
        variant: "destructive",
      });
    }
  });
  
  // Función para agregar prueba a la selección
  const addTest = (test: any) => {
    if (!selectedTests.some(t => t.id === test.id)) {
      setSelectedTests([...selectedTests, test]);
    }
    setIsDialogOpen(false);
  };
  
  // Función para remover prueba de la selección
  const removeTest = (id: number) => {
    setSelectedTests(selectedTests.filter(test => test.id !== id));
  };
  
  // Función para manejar el envío del formulario
  const onSubmit = (data: LabOrderFormValues) => {
    if (selectedTests.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una prueba de laboratorio",
        variant: "destructive",
      });
      return;
    }
    
    // Preparar los nombres de las pruebas para la descripción
    const testNames = selectedTests.map(test => test.name).join(", ");
    
    // Crear objeto para enviar
    const orderData: InsertLabCommission = {
      patientId: data.patientId,
      doctorId: user!.id, // El doctor actual
      laboratoryId: data.laboratoryId,
      amount: data.amount,
      description: data.description,
      notes: `Pruebas solicitadas: ${testNames}`,
      serviceName: testNames,
      testType: selectedTests[0]?.category || "laboratorio",
      urgency: data.urgency || "normal",
      status: "pending",
    };
    
    createOrderMutation.mutate(orderData);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Generar Orden de Laboratorio</h1>
        <p className="text-muted-foreground">
          Complete el formulario para generar una orden de laboratorio o estudio de imagen
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Orden</CardTitle>
              <CardDescription>
                Seleccione el paciente, laboratorio y las pruebas requeridas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paciente</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un paciente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {patients?.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id.toString()}>
                                  {patient.firstName} {patient.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Paciente para quien se genera la orden
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="laboratoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Laboratorio</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un laboratorio" />
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
                          <FormDescription>
                            Laboratorio que realizará los estudios
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <FormLabel>Pruebas de Laboratorio</FormLabel>
                    <div className="flex items-center justify-between">
                      <FormDescription>
                        Seleccione las pruebas de laboratorio o estudios de imagen requeridos
                      </FormDescription>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar prueba
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Agregar prueba de laboratorio</DialogTitle>
                            <DialogDescription>
                              Busque y seleccione las pruebas a incluir en la orden
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="relative my-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="search"
                              placeholder="Buscar prueba..."
                              className="pl-8"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          
                          <div className="max-h-[300px] overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nombre</TableHead>
                                  <TableHead>Categoría</TableHead>
                                  <TableHead className="text-right">Acción</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredTests.length > 0 ? (
                                  filteredTests.map(test => (
                                    <TableRow key={test.id}>
                                      <TableCell>{test.name}</TableCell>
                                      <TableCell>
                                        {test.category === "laboratorio" ? "Laboratorio" : "Imagen"}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => addTest(test)}
                                        >
                                          Agregar
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                      No se encontraron pruebas
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <Card className="border border-dashed">
                      <CardContent className="p-4">
                        {selectedTests.length > 0 ? (
                          <div className="space-y-2">
                            {selectedTests.map(test => (
                              <div key={test.id} className="flex items-center justify-between bg-secondary/20 rounded-md p-2">
                                <div>
                                  <p className="font-medium text-sm">{test.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {test.category === "laboratorio" ? "Laboratorio" : "Imagen"}
                                  </p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeTest(test.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <ClipboardList className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">
                              No hay pruebas seleccionadas. Haga clic en "Agregar prueba" para comenzar.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto (MXN)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              {...field} 
                              type="text"
                              inputMode="decimal"
                            />
                          </FormControl>
                          <FormDescription>
                            Costo total de las pruebas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgencia</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione nivel de urgencia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                              <SelectItem value="immediate">Inmediata</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Nivel de urgencia de las pruebas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción o Indicaciones</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Instrucciones adicionales para el laboratorio o paciente" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Información adicional para el laboratorio
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" type="button" onClick={() => {
                      form.reset();
                      setSelectedTests([]);
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createOrderMutation.isPending}>
                      {createOrderMutation.isPending ? (
                        <>
                          <div className="spinner-border spinner-border-sm mr-2" role="status" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Generar Orden
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>
                Ejemplo de cómo se verá la orden generada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4 bg-white">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-xl">MEDICONNECT</h3>
                  <p className="text-sm text-muted-foreground">
                    Orden de Laboratorio
                  </p>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-medium">Fecha:</p>
                      <p>{formatDate(new Date())}</p>
                    </div>
                    <div>
                      <p className="font-medium">Folio:</p>
                      <p>MED-{Math.floor(Math.random() * 10000)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">Médico:</p>
                    <p>{user?.firstName} {user?.lastName}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Paciente:</p>
                    <p>
                      {patients?.find(p => p.id === form.getValues().patientId)
                        ? `${patients.find(p => p.id === form.getValues().patientId).firstName} ${patients.find(p => p.id === form.getValues().patientId).lastName}`
                        : "No seleccionado"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Laboratorio:</p>
                    <p>
                      {laboratories?.find(l => l.id === form.getValues().laboratoryId)
                        ? laboratories.find(l => l.id === form.getValues().laboratoryId).name
                        : "No seleccionado"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Estudios solicitados:</p>
                    {selectedTests.length > 0 ? (
                      <ul className="list-disc pl-5 mt-1">
                        {selectedTests.map(test => (
                          <li key={test.id}>{test.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="italic text-muted-foreground">No hay estudios seleccionados</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium">Indicaciones:</p>
                    <p>{form.getValues().description || "Sin indicaciones adicionales"}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Urgencia:</p>
                    <p className={
                      form.getValues().urgency === "immediate" 
                        ? "text-red-500 font-medium" 
                        : form.getValues().urgency === "urgent"
                          ? "text-amber-500 font-medium"
                          : ""
                    }>
                      {form.getValues().urgency === "normal" 
                        ? "Normal" 
                        : form.getValues().urgency === "urgent"
                          ? "Urgente"
                          : "Inmediata"}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Monto:</p>
                    <p>$ {form.getValues().amount || "0.00"} MXN</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mt-8 text-center border-t pt-4">
                  <p className="font-medium">______________________________</p>
                  <p className="text-sm">Firma del médico</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Vista Previa
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}