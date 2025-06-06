import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, SearchIcon } from "lucide-react";

interface LabTest {
    id: number;
    name: string;
    code: string;
    category: string;
    description: string;
    preparationInstructions: string;
    sampleType: string;
    price: number;
}

export default function CatalogoLaboratorioPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    // Consulta para obtener los estudios de laboratorio
    const {
        data: tests,
        isLoading,
        error,
    } = useQuery<LabTest[]>({
        queryKey: ["/api/public/lab-tests"],
        // Si no hay API real todavía, esto solo mostrará un estado de carga
    });

    // Datos de ejemplo para mostrar temporalmente
    const sampleTests: LabTest[] = [
        {
            id: 1,
            name: "Hemograma completo",
            code: "HEM-001",
            category: "hematologia",
            description:
                "Análisis sanguíneo que mide los diferentes tipos de células en la sangre",
            preparationInstructions: "Ayuno de 8 horas",
            sampleType: "Sangre",
            price: 350,
        },
        {
            id: 2,
            name: "Perfil lipídico",
            code: "BIO-002",
            category: "bioquimica",
            description: "Mide niveles de colesterol y triglicéridos",
            preparationInstructions: "Ayuno de 12 horas",
            sampleType: "Sangre",
            price: 450,
        },
        {
            id: 3,
            name: "Glucosa en sangre",
            code: "BIO-001",
            category: "bioquimica",
            description: "Mide el nivel de azúcar en la sangre",
            preparationInstructions: "Ayuno de 8 horas",
            sampleType: "Sangre",
            price: 150,
        },
        {
            id: 4,
            name: "Examen general de orina",
            code: "URI-001",
            category: "urinalisis",
            description: "Análisis físico, químico y microscópico de la orina",
            preparationInstructions: "Muestra de la primera orina de la mañana",
            sampleType: "Orina",
            price: 200,
        },
        {
            id: 5,
            name: "Prueba de embarazo en sangre",
            code: "HOR-001",
            category: "hormonas",
            description: "Detección de la hormona hCG en sangre",
            preparationInstructions: "No requiere preparación especial",
            sampleType: "Sangre",
            price: 300,
        },
    ];

    // Categorías disponibles
    const categories = [
        { id: "all", name: "Todos" },
        { id: "hematologia", name: "Hematología" },
        { id: "bioquimica", name: "Bioquímica" },
        { id: "urinalisis", name: "Urianálisis" },
        { id: "hormonas", name: "Hormonas" },
        { id: "microbiologia", name: "Microbiología" },
    ];

    // Filtrar tests según búsqueda y categoría
    const filteredTests = sampleTests.filter(test => {
        const matchesSearch =
            test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            activeCategory === "all" || test.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow py-10 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Catálogo de Estudios de Laboratorio
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
                            Encuentra todos los estudios clínicos disponibles en
                            nuestra red de laboratorios
                        </p>
                    </div>

                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-grow">
                                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por nombre o código"
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={e =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <Button
                                onClick={() => setSearchTerm("")}
                                variant="outline"
                                className="sm:w-auto"
                            >
                                Limpiar filtros
                            </Button>
                        </div>

                        <Tabs
                            defaultValue="all"
                            value={activeCategory}
                            onValueChange={setActiveCategory}
                        >
                            <TabsList className="mb-4 flex flex-wrap">
                                {categories.map(category => (
                                    <TabsTrigger
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {categories.map(category => (
                                <TabsContent
                                    key={category.id}
                                    value={category.id}
                                    className="mt-0"
                                >
                                    {isLoading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        </div>
                                    ) : error ? (
                                        <Card>
                                            <CardContent className="py-10 text-center">
                                                <p className="text-red-500">
                                                    Error al cargar el catálogo.
                                                    Por favor, intenta más
                                                    tarde.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ) : filteredTests.length === 0 ? (
                                        <Card>
                                            <CardContent className="py-10 text-center">
                                                <p className="text-gray-500">
                                                    No se encontraron estudios
                                                    que coincidan con tu
                                                    búsqueda.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    {category.id === "all"
                                                        ? "Todos los estudios"
                                                        : category.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>
                                                                Código
                                                            </TableHead>
                                                            <TableHead>
                                                                Nombre
                                                            </TableHead>
                                                            <TableHead>
                                                                Muestra
                                                            </TableHead>
                                                            <TableHead>
                                                                Preparación
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                Precio (MXN)
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredTests.map(
                                                            test => (
                                                                <TableRow
                                                                    key={
                                                                        test.id
                                                                    }
                                                                >
                                                                    <TableCell className="font-medium">
                                                                        {
                                                                            test.code
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            test.name
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            test.sampleType
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            test.preparationInstructions
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        $
                                                                        {test.price.toFixed(
                                                                            2
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                    <div className="mt-12 bg-white p-8 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">
                            Información importante
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    Preparación general
                                </h3>
                                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                    <li>
                                        Para la mayoría de los análisis de
                                        sangre, se recomienda ayuno de 8-12
                                        horas.
                                    </li>
                                    <li>
                                        Evita el ejercicio intenso 24 horas
                                        antes de tu examen.
                                    </li>
                                    <li>
                                        Informa al personal sobre cualquier
                                        medicamento que estés tomando.
                                    </li>
                                    <li>
                                        Llega 15 minutos antes de tu cita
                                        programada.
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    Entrega de resultados
                                </h3>
                                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                    <li>
                                        Los resultados estarán disponibles en tu
                                        portal de paciente.
                                    </li>
                                    <li>
                                        El tiempo de entrega varía según el
                                        estudio (24-72 horas).
                                    </li>
                                    <li>
                                        Puedes solicitar una copia impresa en el
                                        laboratorio.
                                    </li>
                                    <li>
                                        Para dudas sobre tus resultados, agenda
                                        una consulta con tu médico.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* <Footer /> */}
        </div>
    );
}
