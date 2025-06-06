import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Microscope, Scan } from "lucide-react";

type LabTest = {
  id: number;
  name: string;
  category: "laboratorio" | "imagen";
  description: string;
  normalValues: string;
  units: string;
  preparationInstructions: string;
  cofeprisApproved: boolean;
  isActive: boolean;
  createdAt: string;
};

export default function LabTestCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filteredTests, setFilteredTests] = useState<LabTest[]>([]);
  
  const { data: labTests, isLoading, error } = useQuery<LabTest[]>({
    queryKey: ["/api/lab-tests"],
  });
  
  const getCategoryIcon = (category: string) => {
    return category === "laboratorio" ? (
      <Microscope className="h-4 w-4" />
    ) : (
      <Scan className="h-4 w-4" />
    );
  };
  
  useEffect(() => {
    if (!labTests) return;
    
    let filtered = [...labTests];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        test.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por categoría
    if (activeTab !== "all") {
      filtered = filtered.filter(test => test.category === activeTab);
    }
    
    setFilteredTests(filtered);
  }, [labTests, searchTerm, activeTab]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[1, 2, 3, 4].map((_, index) => (
          <Skeleton key={index} className="h-48 w-full" />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-bold text-red-500 mb-2">
          Error al cargar el catálogo
        </h3>
        <p className="text-gray-600">
          No pudimos cargar la lista de estudios. Por favor intenta nuevamente más tarde.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Catálogo de Estudios Médicos</h1>
      <p className="text-gray-600 mb-8">
        Consulta nuestro catálogo completo de estudios de laboratorio e imagenología aprobados por COFEPRIS.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o descripción..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select 
          defaultValue="all"
          onValueChange={(value) => setActiveTab(value)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estudios</SelectItem>
            <SelectItem value="laboratorio">Laboratorio clínico</SelectItem>
            <SelectItem value="imagen">Imagenología</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="laboratorio">Laboratorio</TabsTrigger>
          <TabsTrigger value="imagen">Imagenología</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredTests.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No se encontraron estudios</h3>
          <p className="text-gray-600">
            No hay estudios que coincidan con los criterios de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={test.category === "laboratorio" ? "default" : "outline"} className="mb-2">
                    <span className="flex items-center gap-1">
                      {getCategoryIcon(test.category)}
                      {test.category === "laboratorio" ? "Laboratorio" : "Imagenología"}
                    </span>
                  </Badge>
                  {test.cofeprisApproved && (
                    <Badge variant="secondary" className="mb-2">COFEPRIS</Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{test.name}</CardTitle>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {test.normalValues && (
                  <div>
                    <strong>Valores normales:</strong> {test.normalValues}
                  </div>
                )}
                {test.units && test.units !== "N/A" && (
                  <div>
                    <strong>Unidades:</strong> {test.units}
                  </div>
                )}
                {test.preparationInstructions && (
                  <div>
                    <strong>Preparación:</strong> {test.preparationInstructions}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Ver detalles
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}