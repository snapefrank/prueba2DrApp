import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertSpecialtySchema, Specialty } from "@shared/schema";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash, Pencil } from "lucide-react";

// Extend the specialty schema for validation
const specialtyFormSchema = insertSpecialtySchema.extend({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
});

type SpecialtyFormValues = z.infer<typeof specialtyFormSchema>;

export default function AdminSpecialties() {
  const { toast } = useToast();
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editSpecialty, setEditSpecialty] = useState<Specialty | null>(null);
  
  // Fetch specialties
  const { data: specialties, isLoading } = useQuery<Specialty[]>({
    queryKey: ["/api/specialties"],
    throwOnError: false,
  });

  // Form for adding/editing specialties
  const form = useForm<SpecialtyFormValues>({
    resolver: zodResolver(specialtyFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Create specialty mutation
  const createMutation = useMutation({
    mutationFn: async (data: SpecialtyFormValues) => {
      const res = await apiRequest("POST", "/api/specialties", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/specialties"] });
      form.reset();
      setIsNewDialogOpen(false);
      toast({
        title: "Especialidad creada",
        description: "La especialidad ha sido creada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear la especialidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update specialty mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SpecialtyFormValues & { id: number }) => {
      const { id, ...specialtyData } = data;
      const res = await apiRequest("PUT", `/api/specialties/${id}`, specialtyData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/specialties"] });
      form.reset();
      setEditSpecialty(null);
      toast({
        title: "Especialidad actualizada",
        description: "La especialidad ha sido actualizada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar la especialidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete specialty mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/specialties/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/specialties"] });
      toast({
        title: "Especialidad eliminada",
        description: "La especialidad ha sido eliminada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar la especialidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SpecialtyFormValues) => {
    if (editSpecialty) {
      updateMutation.mutate({ ...data, id: editSpecialty.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (specialty: Specialty) => {
    setEditSpecialty(specialty);
    form.reset({
      name: specialty.name,
      description: specialty.description,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar esta especialidad?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    form.reset();
    setEditSpecialty(null);
    setIsNewDialogOpen(false);
  };

  return (
    <DDashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Especialidades</h1>
          <p className="text-muted-foreground">
            Gestiona las especialidades médicas disponibles en la plataforma.
          </p>
        </div>
        <Dialog open={isNewDialogOpen || !!editSpecialty} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsNewDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Especialidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editSpecialty ? "Editar Especialidad" : "Nueva Especialidad"}
              </DialogTitle>
              <DialogDescription>
                {editSpecialty
                  ? "Actualiza los datos de la especialidad médica."
                  : "Agrega una nueva especialidad médica a la plataforma."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Cardiología" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Especialidad enfocada en el diagnóstico y tratamiento de enfermedades del corazón."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editSpecialty ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Especialidades Médicas</CardTitle>
          <CardDescription>
            Lista de todas las especialidades médicas registradas en la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : specialties && specialties.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialties.map((specialty) => (
                  <TableRow key={specialty.id}>
                    <TableCell>{specialty.id}</TableCell>
                    <TableCell className="font-medium">{specialty.name}</TableCell>
                    <TableCell>
                      {specialty.description.length > 100
                        ? `${specialty.description.substring(0, 100)}...`
                        : specialty.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(specialty)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(specialty.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No hay especialidades registradas. Agrega una nueva especialidad para comenzar.
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}