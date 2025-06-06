import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/landing/Footer";
import {
    Heart,
    Brain,
    Baby,
    Eye,
    Bone,
    Stethoscope,
    SquarePen,
    Pill,
    Microscope,
    HeartPulse,
    Ear,
    Syringe,
    RefreshCcw,
    Search,
    Loader2,
    ChevronDown,
    Apple,
    HelpingHand,
    Filter,
    Smartphone,
    ThermometerSun,
    Radiation,
    Flower2,
    TestTube,
    PersonStanding,
    Gauge,
    Scissors,
    Activity,
    Milestone,
    Crosshair,
    Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interfaz para especialidades
interface Specialty {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    isPopular?: boolean;
    category?: string;
    displayOrder?: number;
}

// Función para convertir nombre a slug
const getSpecialtySlug = (name: string) => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
};

// Mapa de iconos por nombre de especialidad (en minúsculas)
const specialtyIcons: Record<string, React.ReactNode> = {
    cardiología: <Heart className="h-6 w-6" />,
    neurología: <Brain className="h-6 w-6" />,
    pediatría: <Baby className="h-6 w-6" />,
    oftalmología: <Eye className="h-6 w-6" />,
    ortopedia: <Bone className="h-6 w-6" />,
    "medicina interna": <Stethoscope className="h-6 w-6" />,
    "medicina general": <Stethoscope className="h-6 w-6" />,
    "medicina familiar": <Stethoscope className="h-6 w-6" />,
    dermatología: <SquarePen className="h-6 w-6" />,
    endocrinología: <Gauge className="h-6 w-6" />,
    oncología: <Microscope className="h-6 w-6" />,
    ginecología: <HeartPulse className="h-6 w-6" />,
    "ginecología y obstetricia": <Baby className="h-6 w-6" />,
    otorrinolaringología: <Ear className="h-6 w-6" />,
    inmunología: <Syringe className="h-6 w-6" />,
    alergología: <Flower2 className="h-6 w-6" />,
    reumatología: <Bone className="h-6 w-6" />,
    nutrición: <Apple className="h-6 w-6" />,
    traumatología: <Bone className="h-6 w-6" />,
    fisioterapia: <HelpingHand className="h-6 w-6" />,
    rehabilitación: <PersonStanding className="h-6 w-6" />,
    psicología: <Brain className="h-6 w-6" />,
    psiquiatría: <Brain className="h-6 w-6" />,
    odontología: <Stethoscope className="h-6 w-6" />,
    neumología: <HeartPulse className="h-6 w-6" />,
    gastroenterología: <Activity className="h-6 w-6" />,
    nefrología: <Activity className="h-6 w-6" />,
    urología: <TestTube className="h-6 w-6" />,
    hematología: <TestTube className="h-6 w-6" />,
    "cirugía general": <Scissors className="h-6 w-6" />,
    "cirugía plástica": <Scissors className="h-6 w-6" />,
    anestesiología: <Pill className="h-6 w-6" />,
    radiología: <Radiation className="h-6 w-6" />,
    geriatría: <Milestone className="h-6 w-6" />,
    deportología: <PersonStanding className="h-6 w-6" />,
    "medicina del trabajo": <Stethoscope className="h-6 w-6" />,
    "anatomía patológica": <Microscope className="h-6 w-6" />,
    "medicina estética": <Sparkles className="h-6 w-6" />,
    "medicina preventiva": <Crosshair className="h-6 w-6" />,
    telemedicina: <Smartphone className="h-6 w-6" />,
};

// Categorías de especialidades
const categoryTranslations: Record<string, string> = {
    médica: "Especialidades Médicas",
    dental: "Salud Dental",
    "salud mental": "Salud Mental",
    terapéutica: "Terapias y Rehabilitación",
    nutricional: "Nutrición",
    visión: "Salud Visual",
    alternativa: "Medicina Alternativa",
    estética: "Medicina Estética",
};

// Función para renderizar el icono correcto
const renderIcon = (specialty: Specialty) => {
    // Normalizar el nombre (quitar acentos y convertir a minúsculas)
    const normalizedName = specialty.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    // Si la especialidad tiene un icono personalizado, usarlo
    if (specialty.icon) {
        try {
            return (
                <span dangerouslySetInnerHTML={{ __html: specialty.icon }} />
            );
        } catch (e) {
            console.error("Error al renderizar icono:", e);
        }
    }

    // Buscar coincidencias exactas
    if (specialtyIcons[normalizedName]) {
        return specialtyIcons[normalizedName];
    }

    // Buscar coincidencias parciales
    for (const key in specialtyIcons) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return specialtyIcons[key];
        }
    }

    // Si no hay coincidencia, mostrar un icono genérico
    console.log(`No icon found for specialty: ${specialty.name}`);
    return <Stethoscope className="h-6 w-6" />;
};

const EspecialidadesPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );
    const [showAllPopular, setShowAllPopular] = useState(false);
    const [activeTab, setActiveTab] = useState("populares");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Consulta para obtener las especialidades
    const {
        data: specialties,
        isLoading,
        error,
    } = useQuery<Specialty[]>({
        queryKey: ["/api/public/specialties"],
    });

    // Especialidades populares
    const popularSpecialties = specialties
        ?.filter(specialty => specialty.isPopular)
        .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

    // Obtener todas las categorías disponibles
    const categories = specialties
        ? Array.from(new Set(specialties.map(s => s.category || "médica")))
        : [];

    // Filtrar especialidades según la búsqueda y/o categoría
    const filteredSpecialties = specialties
        ?.filter(specialty => {
            const matchesSearch = specialty.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesCategory =
                !selectedCategory || specialty.category === selectedCategory;

            // Para la pestaña "populares", solo mostrar las que tienen isPopular = true
            if (activeTab === "populares" && !specialty.isPopular) {
                return false;
            }

            // Para la pestaña "todas", aplicar filtros de búsqueda y categoría
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            // Ordenar por orden de visualización primero, luego alfabéticamente
            const orderA = a.displayOrder || 999;
            const orderB = b.displayOrder || 999;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            return a.name.localeCompare(b.name);
        });

    // Manejar cambio de pestaña y resetear filtros
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setSearchTerm("");
        setSelectedCategory(null);

        // Enfocar el campo de búsqueda cuando se cambia a la pestaña "todas"
        if (value === "todas" && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

    // Mostrar un número limitado de especialidades populares en la vista inicial
    const displayedPopularSpecialties = showAllPopular
        ? popularSpecialties
        : popularSpecialties?.slice(0, 12);

    // Agrupar especialidades por categoría cuando se muestra el catálogo completo
    const specialtiesByCategory = categories.reduce((acc, category) => {
        acc[category] = (filteredSpecialties || []).filter(
            s => s.category === category
        );
        return acc;
    }, {} as Record<string, Specialty[]>);

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <div className="bg-gradient-to-b from-primary/10 to-background py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Especialidades médicas
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Encuentra al especialista ideal para tus
                                necesidades médicas. Contamos con médicos
                                certificados en diversas áreas de la medicina.
                            </p>

                            <Tabs
                                defaultValue="populares"
                                className="w-full max-w-4xl mx-auto mt-8"
                                value={activeTab}
                                onValueChange={handleTabChange}
                            >
                                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                                    <TabsTrigger value="populares">
                                        Especialidades populares
                                    </TabsTrigger>
                                    <TabsTrigger value="todas">
                                        Catálogo completo
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="populares" className="mt-8">
                                    {/* Sin barra de búsqueda para las populares, se muestran directo */}
                                </TabsContent>

                                <TabsContent value="todas" className="mt-8">
                                    <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                ref={searchInputRef}
                                                type="text"
                                                placeholder="Buscar especialidad..."
                                                className="pl-10 py-6"
                                                value={searchTerm}
                                                onChange={e =>
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="md:w-auto w-full"
                                                >
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    {selectedCategory
                                                        ? categoryTranslations[
                                                              selectedCategory
                                                          ]
                                                        : "Categorías"}
                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel>
                                                    Categorías
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setSelectedCategory(
                                                                null
                                                            )
                                                        }
                                                    >
                                                        Todas las categorías
                                                    </DropdownMenuItem>
                                                    {categories.map(
                                                        category => (
                                                            <DropdownMenuItem
                                                                key={category}
                                                                onClick={() =>
                                                                    setSelectedCategory(
                                                                        category
                                                                    )
                                                                }
                                                            >
                                                                {categoryTranslations[
                                                                    category
                                                                ] || category}
                                                            </DropdownMenuItem>
                                                        )
                                                    )}
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {[...Array(12)].map((_, index) => (
                                    <Card
                                        key={index}
                                        className="overflow-hidden"
                                    >
                                        <CardContent className="p-6 flex flex-col items-center">
                                            <Skeleton className="h-16 w-16 rounded-full mb-4" />
                                            <Skeleton className="h-6 w-32 mb-2" />
                                            <Skeleton className="h-4 w-full mb-1" />
                                            <Skeleton className="h-4 w-3/4 mb-4" />
                                            <Skeleton className="h-9 w-full rounded-md" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-16 bg-gray-50 rounded-lg">
                                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-100 mb-4">
                                    <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    Error al cargar especialidades
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    No pudimos cargar la lista de
                                    especialidades. Por favor intenta nuevamente
                                    más tarde.
                                </p>
                                <Button
                                    onClick={() => window.location.reload()}
                                >
                                    Reintentar
                                </Button>
                            </div>
                        ) : (
                            <>
                                {activeTab === "populares" && (
                                    <>
                                        {/* Especialidades populares */}
                                        {!displayedPopularSpecialties ||
                                        displayedPopularSpecialties.length ===
                                            0 ? (
                                            <div className="text-center py-16 bg-gray-50 rounded-lg">
                                                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                                    <Search className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                                    No se encontraron
                                                    especialidades
                                                </h3>
                                                <p className="text-gray-500 max-w-md mx-auto">
                                                    Por el momento no tenemos
                                                    especialidades destacadas.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                    {displayedPopularSpecialties.map(
                                                        specialty => (
                                                            <Link
                                                                key={
                                                                    specialty.id
                                                                }
                                                                href={`/especialidades/${getSpecialtySlug(
                                                                    specialty.name
                                                                )}`}
                                                                className="block h-full"
                                                            >
                                                                <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                                                                    <CardContent className="p-6 flex flex-col items-center text-center h-full">
                                                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                                                            {renderIcon(
                                                                                specialty
                                                                            )}
                                                                        </div>
                                                                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                                                            {
                                                                                specialty.name
                                                                            }
                                                                        </h3>
                                                                        <p className="text-gray-600 mb-4 flex-grow text-sm">
                                                                            {specialty.description ||
                                                                                `Especialistas certificados en ${specialty.name}`}
                                                                        </p>
                                                                        <Button
                                                                            variant="outline"
                                                                            className="w-full mt-auto"
                                                                        >
                                                                            Ver
                                                                            especialistas
                                                                        </Button>
                                                                    </CardContent>
                                                                </Card>
                                                            </Link>
                                                        )
                                                    )}
                                                </div>

                                                {/* Botón para mostrar más especialidades populares */}
                                                {popularSpecialties &&
                                                    popularSpecialties.length >
                                                        12 &&
                                                    !showAllPopular && (
                                                        <div className="text-center mt-10">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setShowAllPopular(
                                                                        true
                                                                    )
                                                                }
                                                            >
                                                                Ver todas las
                                                                especialidades
                                                                populares
                                                            </Button>
                                                        </div>
                                                    )}
                                            </>
                                        )}
                                    </>
                                )}

                                {activeTab === "todas" && (
                                    <>
                                        {/* Catálogo completo */}
                                        {!filteredSpecialties ||
                                        filteredSpecialties.length === 0 ? (
                                            <div className="text-center py-16 bg-gray-50 rounded-lg mt-8">
                                                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                                    <Search className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                                    No se encontraron
                                                    especialidades
                                                </h3>
                                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                                    No encontramos
                                                    especialidades que coincidan
                                                    con tu búsqueda. Por favor,
                                                    intenta con otros términos.
                                                </p>
                                                {(searchTerm ||
                                                    selectedCategory) && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSearchTerm("");
                                                            setSelectedCategory(
                                                                null
                                                            );
                                                        }}
                                                    >
                                                        Limpiar filtros
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {selectedCategory ? (
                                                    // Mostrar especialidades de la categoría seleccionada
                                                    <div className="mt-10">
                                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                                            {categoryTranslations[
                                                                selectedCategory
                                                            ] ||
                                                                selectedCategory}
                                                        </h2>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                            {(
                                                                specialtiesByCategory[
                                                                    selectedCategory
                                                                ] || []
                                                            ).map(
                                                                (
                                                                    specialty: Specialty
                                                                ) => (
                                                                    <Link
                                                                        key={
                                                                            specialty.id
                                                                        }
                                                                        href={`/especialidades/${getSpecialtySlug(
                                                                            specialty.name
                                                                        )}`}
                                                                        className="block h-full"
                                                                    >
                                                                        <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                                                                            <CardContent className="p-6 flex flex-col items-center text-center h-full">
                                                                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                                                                    {renderIcon(
                                                                                        specialty
                                                                                    )}
                                                                                </div>
                                                                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                                                                    {
                                                                                        specialty.name
                                                                                    }
                                                                                </h3>
                                                                                <p className="text-gray-600 mb-4 flex-grow text-sm">
                                                                                    {specialty.description ||
                                                                                        `Especialistas certificados en ${specialty.name}`}
                                                                                </p>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className="w-full mt-auto"
                                                                                >
                                                                                    Ver
                                                                                    especialistas
                                                                                </Button>
                                                                            </CardContent>
                                                                        </Card>
                                                                    </Link>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : searchTerm ? (
                                                    // Mostrar resultados de búsqueda
                                                    <div className="mt-10">
                                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                                            Resultados de
                                                            búsqueda
                                                            <Badge className="ml-2 bg-primary/20 hover:bg-primary/30 text-primary border-0">
                                                                {
                                                                    filteredSpecialties.length
                                                                }
                                                            </Badge>
                                                        </h2>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                            {filteredSpecialties.map(
                                                                specialty => (
                                                                    <Link
                                                                        key={
                                                                            specialty.id
                                                                        }
                                                                        href={`/especialidades/${getSpecialtySlug(
                                                                            specialty.name
                                                                        )}`}
                                                                        className="block h-full"
                                                                    >
                                                                        <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                                                                            <CardContent className="p-6 flex flex-col items-center text-center h-full">
                                                                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                                                                    {renderIcon(
                                                                                        specialty
                                                                                    )}
                                                                                </div>
                                                                                <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
                                                                                    {
                                                                                        categoryTranslations[
                                                                                            specialty.category ||
                                                                                                "médica"
                                                                                        ]
                                                                                    }
                                                                                </Badge>
                                                                                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                                                                    {
                                                                                        specialty.name
                                                                                    }
                                                                                </h3>
                                                                                <p className="text-gray-600 mb-4 flex-grow text-sm">
                                                                                    {specialty.description ||
                                                                                        `Especialistas certificados en ${specialty.name}`}
                                                                                </p>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    className="w-full mt-auto"
                                                                                >
                                                                                    Ver
                                                                                    especialistas
                                                                                </Button>
                                                                            </CardContent>
                                                                        </Card>
                                                                    </Link>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Mostrar todo el catálogo organizado por categorías
                                                    <div className="space-y-16">
                                                        {categories
                                                            .sort()
                                                            .map(category => {
                                                                // Omitir categorías sin especialidades
                                                                if (
                                                                    !specialtiesByCategory[
                                                                        category
                                                                    ] ||
                                                                    specialtiesByCategory[
                                                                        category
                                                                    ].length ===
                                                                        0
                                                                ) {
                                                                    return null;
                                                                }

                                                                return (
                                                                    <div
                                                                        key={
                                                                            category
                                                                        }
                                                                        className="mt-10"
                                                                    >
                                                                        <div className="flex items-center justify-between mb-6">
                                                                            <h2 className="text-2xl font-bold text-gray-900">
                                                                                {categoryTranslations[
                                                                                    category
                                                                                ] ||
                                                                                    category}
                                                                            </h2>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    setSelectedCategory(
                                                                                        category
                                                                                    )
                                                                                }
                                                                            >
                                                                                Ver
                                                                                todo
                                                                                <ChevronDown className="ml-2 h-4 w-4" />
                                                                            </Button>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                                            {specialtiesByCategory[
                                                                                category
                                                                            ]
                                                                                .slice(
                                                                                    0,
                                                                                    8
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        specialty: Specialty
                                                                                    ) => (
                                                                                        <Link
                                                                                            key={
                                                                                                specialty.id
                                                                                            }
                                                                                            href={`/especialidades/${getSpecialtySlug(
                                                                                                specialty.name
                                                                                            )}`}
                                                                                            className="block h-full"
                                                                                        >
                                                                                            <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                                                                                                <CardContent className="p-6 flex flex-col items-center text-center h-full">
                                                                                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                                                                                        {renderIcon(
                                                                                                            specialty
                                                                                                        )}
                                                                                                    </div>
                                                                                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                                                                                        {
                                                                                                            specialty.name
                                                                                                        }
                                                                                                    </h3>
                                                                                                    <p className="text-gray-600 mb-4 flex-grow text-sm">
                                                                                                        {specialty.description ||
                                                                                                            `Especialistas certificados en ${specialty.name}`}
                                                                                                    </p>
                                                                                                    <Button
                                                                                                        variant="outline"
                                                                                                        className="w-full mt-auto"
                                                                                                    >
                                                                                                        Ver
                                                                                                        especialistas
                                                                                                    </Button>
                                                                                                </CardContent>
                                                                                            </Card>
                                                                                        </Link>
                                                                                    )
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Sección de información */}
                <div className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                ¿Por qué elegir MediConnect?
                            </h2>
                            <p className="text-gray-600">
                                Nuestro servicio conecta a pacientes con médicos
                                certificados y verificados para asegurar la
                                mejor atención médica posible.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary mx-auto">
                                    <BadgeCheck className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Médicos verificados
                                </h3>
                                <p className="text-gray-600">
                                    Todos nuestros especialistas pasan por un
                                    riguroso proceso de verificación para
                                    garantizar su formación y experiencia.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary mx-auto">
                                    <Calendar className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Citas flexibles
                                </h3>
                                <p className="text-gray-600">
                                    Programa tus citas según tu disponibilidad y
                                    necesidades médicas, con acceso 24/7 a tu
                                    agenda.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary mx-auto">
                                    <MessageCircle className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Comunicación directa
                                </h3>
                                <p className="text-gray-600">
                                    Mantén comunicación directa con tus médicos
                                    para resolver dudas y dar seguimiento a tu
                                    tratamiento.
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <Button asChild size="lg">
                                <Link href="/como-funciona">
                                    Conoce más sobre nuestro servicio
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* <Footer /> */}
        </div>
    );
};

// Importación de íconos restantes
import { BadgeCheck, Calendar, MessageCircle } from "lucide-react";

export default EspecialidadesPage;
