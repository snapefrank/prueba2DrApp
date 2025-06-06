import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Edit, Trash } from "lucide-react";
import { SubscriptionPlan } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Esquema de validación
const planFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    { message: "El precio debe ser un número válido y mayor o igual a 0" }
  ),
  appointmentsPerMonth: z.number().int().min(0),
  includesLabTests: z.boolean(),
  includesSpecialists: z.boolean(),
  isActive: z.boolean(),
  features: z.array(z.string()).min(1, "Debe agregar al menos una característica"),
});

type PlanFormData = z.infer<typeof planFormSchema>;

export default function SubscriptionPlansAdmin() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [newFeature, setNewFeature] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  // Formulario
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      appointmentsPerMonth: 0,
      includesLabTests: false,
      includesSpecialists: false,
      isActive: true,
      features: [],
    },
  });

  // Obtener todos los planes de suscripción
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans/all'],
    throwOnError: true,
  });

  // Mutación para crear plan
  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const res = await apiRequest('POST', '/api/subscription-plans', {
        ...data,
        features: JSON.stringify(data.features),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans/all'] });
      toast({
        title: 'Plan creado',
        description: 'El plan de suscripción ha sido creado exitosamente',
        variant: 'default',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear plan',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutación para actualizar plan
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: PlanFormData }) => {
      const res = await apiRequest('PATCH', `/api/subscription-plans/${id}`, {
        ...data,
        features: JSON.stringify(data.features),
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans/all'] });
      toast({
        title: 'Plan actualizado',
        description: 'El plan de suscripción ha sido actualizado exitosamente',
        variant: 'default',
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar plan',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Resetear formulario
  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      price: "0",
      appointmentsPerMonth: 0,
      includesLabTests: false,
      includesSpecialists: false,
      isActive: true,
      features: [],
    });
    setFeatures([]);
    setEditingPlan(null);
  };

  // Abrir diálogo para editar
  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    
    // Parsear características desde JSON
    let parsedFeatures: string[] = [];
    try {
      parsedFeatures = JSON.parse(plan.features as string) as string[];
    } catch (error) {
      console.error("Error parsing features:", error);
      parsedFeatures = [];
    }
    
    setFeatures(parsedFeatures);
    
    form.reset({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      appointmentsPerMonth: plan.appointmentsPerMonth,
      includesLabTests: plan.includesLabTests,
      includesSpecialists: plan.includesSpecialists,
      isActive: plan.isActive,
      features: parsedFeatures,
    });
    
    setIsDialogOpen(true);
  };

  // Abrir diálogo para crear
  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Enviar formulario
  const onSubmit = (data: PlanFormData) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data });
    } else {
      createPlanMutation.mutate(data);
    }
  };

  // Agregar característica
  const addFeature = () => {
    if (newFeature.trim() === "") return;
    
    const updatedFeatures = [...features, newFeature.trim()];
    setFeatures(updatedFeatures);
    form.setValue("features", updatedFeatures);
    setNewFeature("");
  };

  // Eliminar característica
  const removeFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
    form.setValue("features", updatedFeatures);
  };

  // Formatear precio
  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(numericPrice);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Planes de Suscripción</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Nuevo Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planes de Suscripción</CardTitle>
          <CardDescription>
            Administra los planes de suscripción disponibles para los usuarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Citas/Mes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans?.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                  <TableCell>{formatPrice(plan.price)}</TableCell>
                  <TableCell>{plan.appointmentsPerMonth}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "success" : "secondary"}>
                      {plan.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {plans?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No hay planes de suscripción. Crea uno nuevo.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Editar Plan de Suscripción" : "Crear Plan de Suscripción"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan 
                ? "Modifica los detalles del plan de suscripción" 
                : "Completa los detalles para crear un nuevo plan de suscripción"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Plan Básico"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Plan de suscripción básico con acceso a servicios médicos generales"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio (MXN)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register("price")}
                  placeholder="199.99"
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointmentsPerMonth">Citas por mes</Label>
                <Input
                  id="appointmentsPerMonth"
                  type="number"
                  min="0"
                  {...form.register("appointmentsPerMonth", { valueAsNumber: true })}
                  placeholder="5"
                />
                {form.formState.errors.appointmentsPerMonth && (
                  <p className="text-sm text-destructive">{form.formState.errors.appointmentsPerMonth.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includesLabTests"
                  {...form.register("includesLabTests")}
                  checked={form.watch("includesLabTests")}
                  onCheckedChange={(checked) => form.setValue("includesLabTests", checked)}
                />
                <Label htmlFor="includesLabTests">Incluye pruebas de laboratorio</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includesSpecialists"
                  {...form.register("includesSpecialists")}
                  checked={form.watch("includesSpecialists")}
                  onCheckedChange={(checked) => form.setValue("includesSpecialists", checked)}
                />
                <Label htmlFor="includesSpecialists">Incluye acceso a especialistas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  {...form.register("isActive")}
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
                <Label htmlFor="isActive">Plan activo</Label>
              </div>

              <div className="space-y-2">
                <Label>Características</Label>
                <div className="flex space-x-2">
                  <Input 
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Añadir característica"
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    Añadir
                  </Button>
                </div>
                
                {form.formState.errors.features && (
                  <p className="text-sm text-destructive">{form.formState.errors.features.message}</p>
                )}

                <div className="space-y-2 mt-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span>{feature}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
              >
                {(createPlanMutation.isPending || updatePlanMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingPlan ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Badge component
function Badge({ variant, children }: { variant: "success" | "secondary"; children: React.ReactNode }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      variant === "success" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    }`}>
      {children}
    </span>
  );
}