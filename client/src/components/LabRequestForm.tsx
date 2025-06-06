import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Esquema de validación para el formulario
const labRequestSchema = z.object({
  laboratoryId: z.number({
    required_error: "Debe seleccionar un laboratorio",
  }),
  testIds: z.array(z.number()).min(1, {
    message: "Debe seleccionar al menos un estudio de laboratorio",
  }),
  notes: z.string().optional(),
  priority: z.enum(["normal", "urgent", "stat"], {
    required_error: "Debe seleccionar una prioridad",
  }).default("normal"),
  dueDate: z.date().optional(),
});

type LabRequestFormValues = z.infer<typeof labRequestSchema>;

interface LabTest {
  id: number;
  name: string;
  category: string;
  description?: string;
  normalValues?: string;
  units?: string;
  preparationInstructions?: string;
  cofeprisApproved: boolean;
  isActive: boolean;
}

interface Laboratory {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
}

interface LabRequestFormProps {
  doctorId: number;
  patientId: number;
  patientName: string;
  labTests: LabTest[];
  laboratories: Laboratory[];
  onLabRequestSaved?: () => void;
  onSubmit: (values: LabRequestFormValues) => void;
}

export default function LabRequestForm({
  doctorId,
  patientId,
  patientName,
  labTests,
  laboratories,
  onLabRequestSaved,
  onSubmit,
}: LabRequestFormProps) {
  const [selectedTestsMap, setSelectedTestsMap] = useState<Record<number, boolean>>({});
  const [searchTestTerm, setSearchTestTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [openLabsCombobox, setOpenLabsCombobox] = useState(false);
  const [openTestsSelector, setOpenTestsSelector] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Agrupar los estudios por categoría
  const testsByCategory = labTests.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, LabTest[]>);

  // Obtener una lista de las categorías únicas para el filtro
  const categories = Object.keys(testsByCategory).sort();

  // Configuración del formulario
  const form = useForm<LabRequestFormValues>({
    resolver: zodResolver(labRequestSchema),
    defaultValues: {
      laboratoryId: undefined,
      testIds: [],
      notes: "",
      priority: "normal",
      dueDate: undefined,
    },
  });

  // Filtrar los estudios disponibles
  const filteredTests = labTests.filter(test => {
    const matchesSearch = searchTestTerm === "" || 
      test.name.toLowerCase().includes(searchTestTerm.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchTestTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "" || test.category === categoryFilter;
    
    return matchesSearch && matchesCategory && test.isActive;
  });

  // Filtrar los laboratorios por isActive
  const activeLabories = laboratories.filter(lab => lab.isActive);

  // Manejar la selección de estudios
  const toggleTestSelection = (testId: number) => {
    const currentTestIds = form.getValues("testIds");
    const updatedTestIds = currentTestIds.includes(testId)
      ? currentTestIds.filter(id => id !== testId)
      : [...currentTestIds, testId];
    
    // Actualizar el mapa de selección para la UI
    setSelectedTestsMap({
      ...selectedTestsMap,
      [testId]: !selectedTestsMap[testId]
    });
    
    form.setValue("testIds", updatedTestIds);
  };

  // Manejar la eliminación de un estudio
  const removeTest = (testId: number) => {
    const updatedTestIds = form.getValues("testIds").filter(id => id !== testId);
    form.setValue("testIds", updatedTestIds);
    setSelectedTestsMap({
      ...selectedTestsMap,
      [testId]: false
    });
  };

  // Obtener el número de estudios seleccionados
  const selectedTestsCount = form.watch("testIds").length;

  // Obtener los detalles de los estudios seleccionados
  const selectedTests = form.watch("testIds").map(id => 
    labTests.find(test => test.id === id)
  ).filter(Boolean) as LabTest[];

  // Manejar el envío del formulario
  const handleSubmit = async (values: LabRequestFormValues) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      
      // Resetear el formulario
      form.reset({
        laboratoryId: undefined,
        testIds: [],
        notes: "",
        priority: "normal",
        dueDate: undefined,
      });
      
      // Limpiar selecciones
      setSelectedTestsMap({});
      
      // Callback opcional
      if (onLabRequestSaved) {
        onLabRequestSaved();
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Selección de Laboratorio */}
          <FormField
            control={form.control}
            name="laboratoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Laboratorio</FormLabel>
                <Popover open={openLabsCombobox} onOpenChange={setOpenLabsCombobox}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openLabsCombobox}
                        className={cn(
                          "w-full justify-between font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? activeLabories.find(lab => lab.id === field.value)?.name
                          : "Seleccione un laboratorio"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar laboratorio..." />
                      <CommandEmpty>No se encontró ningún laboratorio.</CommandEmpty>
                      <CommandGroup>
                        {activeLabories.map((lab) => (
                          <CommandItem
                            key={lab.id}
                            value={lab.name}
                            onSelect={() => {
                              form.setValue("laboratoryId", lab.id);
                              setOpenLabsCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                lab.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {lab.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Seleccione el laboratorio donde se realizarán los estudios.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selector de Estudios */}
          <FormField
            control={form.control}
            name="testIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estudios de laboratorio</FormLabel>
                <div className="flex flex-col space-y-2">
                  <div className="flex gap-2 mb-2">
                    <Popover open={openTestsSelector} onOpenChange={setOpenTestsSelector}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openTestsSelector}
                          className="w-full justify-between"
                        >
                          {selectedTestsCount > 0
                            ? `${selectedTestsCount} estudio(s) seleccionado(s)`
                            : "Seleccionar estudios"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <div className="flex p-2 border-b">
                          <Input 
                            placeholder="Buscar estudios..."
                            value={searchTestTerm}
                            onChange={(e) => setSearchTestTerm(e.target.value)}
                            className="w-full mr-2"
                          />
                          <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Todas las categorías" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Todas las categorías</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <ScrollArea className="h-[300px]">
                          <div className="p-2">
                            {filteredTests.length === 0 ? (
                              <div className="text-center py-4 text-muted-foreground">
                                No se encontraron estudios que coincidan con la búsqueda.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {filteredTests.map((test) => (
                                  <div
                                    key={test.id}
                                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted ${
                                      field.value.includes(test.id) ? "bg-primary/10" : ""
                                    }`}
                                    onClick={() => toggleTestSelection(test.id)}
                                  >
                                    <Checkbox
                                      checked={field.value.includes(test.id)}
                                      onCheckedChange={() => toggleTestSelection(test.id)}
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium">{test.name}</div>
                                      <div className="text-xs text-muted-foreground">{test.category}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Mostrar estudios seleccionados */}
                  {selectedTests.length > 0 && (
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-base">Estudios seleccionados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedTests.map((test) => (
                            <Badge 
                              key={test.id} 
                              variant="secondary"
                              className="flex items-center gap-1 px-2 py-1"
                            >
                              {test.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1"
                                onClick={() => removeTest(test.id)}
                              >
                                <span className="sr-only">Eliminar</span>
                                &times;
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notas adicionales */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas e instrucciones</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Instrucciones adicionales o información relevante para el laboratorio..." 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Incluya cualquier detalle importante para el laboratorio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prioridad */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="stat">STAT (Inmediato)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Seleccione la prioridad con la que se debe realizar este estudio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha límite */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha límite (opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Fecha máxima para la realización de los estudios (opcional).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botón de envío */}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar solicitud de laboratorio"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}