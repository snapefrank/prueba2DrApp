import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, FileSpreadsheet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LabTestCatalog } from "@shared/schema";

export default function LaboratoryTestCatalog() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Fetch lab tests
  const { data: labTests, isLoading, error } = useQuery<LabTestCatalog[]>({
    queryKey: ["/api/lab-tests", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/lab-tests?category=${selectedCategory}`
        : '/api/lab-tests';
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar pruebas de laboratorio");
      return res.json();
    }
  });
  
  // Filter lab tests by search term
  const filteredTests = labTests?.filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Get unique categories
  const categories = labTests 
    ? [...new Set(labTests.map(test => test.category))]
    : [];
  
  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Catálogo de Pruebas de Laboratorio</h1>
          <p className="text-muted-foreground">
            Estudios aprobados por COFEPRIS disponibles para solicitar
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar prueba..."
              className="pl-8 w-full md:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="ml-2 w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === "laboratorio" ? "Laboratorio" : "Imagen"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="laboratory" className="mb-6">
        <TabsList>
          <TabsTrigger value="laboratory" onClick={() => setSelectedCategory("laboratorio")}>
            Laboratorio
          </TabsTrigger>
          <TabsTrigger value="imaging" onClick={() => setSelectedCategory("imagen")}>
            Imagen
          </TabsTrigger>
          <TabsTrigger value="all" onClick={() => setSelectedCategory("")}>
            Todos
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Separator className="my-6" />
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-muted-foreground">Cargando catálogo de pruebas...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          <p>Error al cargar el catálogo de pruebas. Por favor intente nuevamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests && filteredTests.length > 0 ? (
            filteredTests.map((test) => (
              <Card key={test.id} className="overflow-hidden">
                <CardHeader className={test.category === "laboratorio" ? "bg-blue-50" : "bg-amber-50"}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Categoría: {test.category === "laboratorio" ? "Laboratorio" : "Imagen"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        COFEPRIS
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                    
                    {test.preparationInstructions && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">PREPARACIÓN:</p>
                        <p className="text-sm">{test.preparationInstructions}</p>
                      </div>
                    )}
                    
                    {test.normalValues && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">VALORES NORMALES:</p>
                        <p className="text-sm">{test.normalValues}</p>
                      </div>
                    )}
                    
                    {test.units && test.units !== "N/A" && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted-foreground">UNIDADES:</p>
                        <p className="text-sm">{test.units}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => toast({
                      title: "Proximamente",
                      description: "La generación de órdenes será implementada pronto",
                    })}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Generar orden
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-muted-foreground">No se encontraron pruebas que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}