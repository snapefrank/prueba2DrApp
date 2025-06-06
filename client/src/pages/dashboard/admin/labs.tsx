import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FlaskRound, 
  Search, 
  AlertCircle, 
  Plus, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Laboratory, InsertLaboratory } from "@shared/schema";
import { Loader2 } from "lucide-react";

// Laboratory form schema
const laboratorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  contactInfo: z.string().min(5, "La información de contacto debe tener al menos 5 caracteres"),
  isActive: z.boolean().default(true),
});

type LaboratoryFormValues = z.infer<typeof laboratorySchema>;

export default function AdminLabs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);

  // Fetch laboratories
  const {
    data: laboratories,
    isLoading,
    error,
  } = useQuery<Laboratory[]>({
    queryKey: ["/api/laboratories"],
  });

  // Form for creating/editing a laboratory
  const form = useForm<LaboratoryFormValues>({
    resolver: zodResolver(laboratorySchema),
    defaultValues: {
      name: "",
      address: "",
      contactInfo: "",
      isActive: true,
    },
  });

  // Handle laboratory creation
  const createLabMutation = useMutation({
    mutationFn: async (data: InsertLaboratory) => {
      const res = await apiRequest("POST", "/api/laboratories", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Laboratorio creado",
        description: "El laboratorio ha sido creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/laboratories"] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el laboratorio. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Handle laboratory update
  const updateLabMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Laboratory> }) => {
      const res = await apiRequest("PATCH", `/api/laboratories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Laboratorio actualizado",
        description: "El laboratorio ha sido actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/laboratories"] });
      setOpen(false);
      form.reset();
      setIsEditing(false);
      setSelectedLab(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el laboratorio. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: LaboratoryFormValues) {
    if (isEditing && selectedLab) {
      updateLabMutation.mutate({ id: selectedLab.id, data: values });
    } else {
      createLabMutation.mutate(values);
    }
  }

  function toggleLabStatus(lab: Laboratory) {
    updateLabMutation.mutate({ 
      id: lab.id, 
      data: { isActive: !lab.isActive } 
    });
  }

  function editLab(lab: Laboratory) {
    setSelectedLab(lab);
    setIsEditing(true);
    form.reset({
      name: lab.name,
      address: lab.address,
      contactInfo: lab.contactInfo,
      isActive: lab.isActive,
    });
    setOpen(true);
  }

  function openCreateDialog() {
    setIsEditing(false);
    setSelectedLab(null);
    form.reset({
      name: "",
      address: "",
      contactInfo: "",
      isActive: true,
    });
    setOpen(true);
  }

  // Filter laboratories by search term and status
  const filteredLabs = laboratories
    ?.filter(lab => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        lab.name.toLowerCase().includes(searchLower) ||
        lab.address.toLowerCase().includes(searchLower) ||
        lab.contactInfo.toLowerCase().includes(searchLower)
      );
    })
    .filter(lab => {
      if (statusFilter === "all") return true;
      return lab.isActive === (statusFilter === "active");
    });

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Laboratorios</h1>
          <p className="text-gray-500 mt-1">Administra los laboratorios asociados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Laboratorio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar" : "Nuevo"} Laboratorio</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Actualiza la información del laboratorio seleccionado" 
                  : "Ingresa los detalles para crear un nuevo laboratorio"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Laboratorio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Laboratorio Clínico Central" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ej: Av. Principal 123, Colonia Centro" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Información de Contacto</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ej: Tel: +52 55 1234 5678, Email: contacto@laboratorio.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Estado Activo</FormLabel>
                        <FormDescription>
                          {field.value 
                            ? "El laboratorio estará disponible para los médicos" 
                            : "El laboratorio no estará disponible para los médicos"}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isEditing ? updateLabMutation.isPending : createLabMutation.isPending}
                  >
                    {isEditing ? (
                      updateLabMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        "Actualizar"
                      )
                    ) : (
                      createLabMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        "Crear"
                      )
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex items-center w-full sm:w-96">
              <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar laboratorios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Activos</TabsTrigger>
                <TabsTrigger value="inactive">Inactivos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>Error al cargar los laboratorios. Intenta de nuevo.</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredLabs && filteredLabs.length > 0 ? (
        <div className="space-y-4">
          {filteredLabs.map((lab) => (
            <Card key={lab.id} className={cn(!lab.isActive && "bg-gray-50")}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="p-2 bg-primary-50 rounded-full h-fit">
                        <FlaskRound className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-lg">{lab.name}</h3>
                        <Badge className={cn(
                          "mt-1",
                          lab.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}>
                          {lab.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-gray-600 ml-10">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{lab.address}</span>
                      </div>
                      <div className="flex items-start">
                        <Phone className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span>{lab.contactInfo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => editLab(lab)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant={lab.isActive ? "destructive" : "default"} 
                      size="sm"
                      onClick={() => toggleLabStatus(lab)}
                      disabled={updateLabMutation.isPending}
                    >
                      {updateLabMutation.isPending && selectedLab?.id === lab.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : lab.isActive ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center py-12">
            <FlaskRound className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No se encontraron laboratorios</h3>
            <p className="text-gray-500 mt-1 mb-6 max-w-md mx-auto">
              No hay laboratorios que coincidan con tus criterios de búsqueda o aún no has creado ninguno.
            </p>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nuevo Laboratorio
              </Button>
            </DialogTrigger>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
