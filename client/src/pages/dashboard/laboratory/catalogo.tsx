import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LaboratoryLayout from "@/layouts/LaboratoryLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TestTube, Plus, Search, Edit, Trash } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { postRequest, putRequest, deleteRequest } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

// Tipos para el catálogo de pruebas
interface LabTest {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  preparationInstructions: string;
  resultTime: string;
  sampleType: string;
}

const CatalogoLaboratorio = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState<Partial<LabTest>>({
    name: "",
    description: "",
    category: "",
    price: 0,
    preparationInstructions: "",
    resultTime: "",
    sampleType: ""
  });

  // Obtener el catálogo de pruebas
  const { data: tests, isLoading } = useQuery<LabTest[]>({
    queryKey: ["/api/laboratory/catalog"],
    queryFn: async () => {
      // En una implementación futura, esto debería obtener datos reales de la API
      // Para la demostración, usamos datos simulados
      return [
        {
          id: 1,
          name: "Química sanguínea",
          description: "Análisis básico de sangre que mide glucosa, colesterol, triglicéridos y más",
          category: "Sangre",
          price: 850,
          preparationInstructions: "Ayuno de 8 horas",
          resultTime: "24 horas",
          sampleType: "Sangre venosa"
        },
        {
          id: 2,
          name: "Biometría hemática",
          description: "Conteo completo de células sanguíneas y análisis de sus características",
          category: "Sangre",
          price: 450,
          preparationInstructions: "No requiere ayuno",
          resultTime: "24 horas",
          sampleType: "Sangre venosa"
        },
        {
          id: 3,
          name: "Perfil tiroideo",
          description: "Análisis de hormonas tiroideas: T3, T4 y TSH",
          category: "Hormonas",
          price: 1200,
          preparationInstructions: "Ayuno de 8 horas",
          resultTime: "48 horas",
          sampleType: "Sangre venosa"
        },
        {
          id: 4,
          name: "Examen general de orina",
          description: "Análisis físico, químico y microscópico de la orina",
          category: "Orina",
          price: 350,
          preparationInstructions: "Recolectar primera orina de la mañana",
          resultTime: "24 horas",
          sampleType: "Orina"
        },
        {
          id: 5,
          name: "Prueba COVID-19 PCR",
          description: "Detección del material genético del virus SARS-CoV-2",
          category: "Infecciosas",
          price: 1500,
          preparationInstructions: "No comer ni beber 30 minutos antes",
          resultTime: "48 horas",
          sampleType: "Hisopado nasofaríngeo"
        }
      ];
    },
  });

  // Filtrar pruebas según el término de búsqueda
  const filteredTests = tests?.filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar la adición de una nueva prueba
  const handleAddTest = async () => {
    try {
      // En una implementación futura, esto debería enviar datos a la API
      // Por ahora, simulamos éxito y cerramos el diálogo
      toast({
        title: "Prueba añadida",
        description: "La prueba se ha añadido correctamente al catálogo",
      });
      setIsAddDialogOpen(false);
      setNewTest({
        name: "",
        description: "",
        category: "",
        price: 0,
        preparationInstructions: "",
        resultTime: "",
        sampleType: ""
      });
      // Invalidar la consulta para refrescar datos
      // queryClient.invalidateQueries({ queryKey: ["/api/laboratory/catalog"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir la prueba. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Renderizar el componente
  return (
    <LaboratoryLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de pruebas</h1>
          <p className="text-gray-500">
            Gestiona las pruebas de laboratorio disponibles
          </p>
        </div>
        <div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Añadir prueba
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Añadir nueva prueba</DialogTitle>
                <DialogDescription>
                  Completa la información para agregar una nueva prueba al catálogo
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={newTest.name}
                    onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descripción
                  </Label>
                  <Input
                    id="description"
                    value={newTest.description}
                    onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Categoría
                  </Label>
                  <Select 
                    value={newTest.category}
                    onValueChange={(value) => setNewTest({...newTest, category: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sangre">Sangre</SelectItem>
                      <SelectItem value="Orina">Orina</SelectItem>
                      <SelectItem value="Hormonas">Hormonas</SelectItem>
                      <SelectItem value="Infecciosas">Infecciosas</SelectItem>
                      <SelectItem value="Genética">Genética</SelectItem>
                      <SelectItem value="Microbiología">Microbiología</SelectItem>
                      <SelectItem value="Imagenología">Imagenología</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Precio (MXN)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={newTest.price?.toString() || "0"}
                    onChange={(e) => setNewTest({...newTest, price: parseFloat(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="preparationInstructions" className="text-right">
                    Preparación
                  </Label>
                  <Input
                    id="preparationInstructions"
                    value={newTest.preparationInstructions}
                    onChange={(e) => setNewTest({...newTest, preparationInstructions: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="resultTime" className="text-right">
                    Tiempo de resultado
                  </Label>
                  <Input
                    id="resultTime"
                    value={newTest.resultTime}
                    onChange={(e) => setNewTest({...newTest, resultTime: e.target.value})}
                    className="col-span-3"
                    placeholder="Ej: 24 horas, 3 días"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sampleType" className="text-right">
                    Tipo de muestra
                  </Label>
                  <Input
                    id="sampleType"
                    value={newTest.sampleType}
                    onChange={(e) => setNewTest({...newTest, sampleType: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddTest}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sección de filtrado */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar pruebas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="Sangre">Sangre</SelectItem>
                  <SelectItem value="Orina">Orina</SelectItem>
                  <SelectItem value="Hormonas">Hormonas</SelectItem>
                  <SelectItem value="Infecciosas">Infecciosas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-grow"></div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="hidden md:flex">
                Exportar
              </Button>
              <Button variant="outline" className="hidden md:flex">
                Imprimir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de pruebas */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Precio (MXN)</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando catálogo...
                  </TableCell>
                </TableRow>
              ) : filteredTests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No se encontraron pruebas que coincidan con la búsqueda
                  </TableCell>
                </TableRow>
              ) : (
                filteredTests?.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <TestTube className="h-4 w-4 text-indigo-600" />
                        {test.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {test.category}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{test.description}</TableCell>
                    <TableCell className="text-right">${test.price.toFixed(2)}</TableCell>
                    <TableCell>{test.resultTime}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash className="h-4 w-4" />
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

export default CatalogoLaboratorio;