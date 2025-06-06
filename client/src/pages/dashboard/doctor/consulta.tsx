import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorLayout from "@/layouts/DoctorLayout";

// Tipos de datos
type Consulta = {
    id: number;
    pacienteId: number;
    pacienteNombre: string;
    fecha: string;
    estado: "en_espera" | "activa" | "completada";
    motivo: string;
    notas: string;
};

// Componente para la página de consultas
export default function ConsultaPage() {
    const [consultas, setConsultas] = useState<Consulta[]>([]);
    const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(
        null
    );
    const [nota, setNota] = useState("");
    const [activeTab, setActiveTab] = useState("en_espera");

    // Cargar datos de ejemplo (esto se reemplazaría con una llamada a la API)
    useEffect(() => {
        // Datos de muestra - en producción, se obtendrían de una API
        const mockConsultas: Consulta[] = [
            {
                id: 1,
                pacienteId: 101,
                pacienteNombre: "Ana García",
                fecha: "2025-04-27T10:00:00",
                estado: "en_espera",
                motivo: "Dolor abdominal intenso",
                notas: "",
            },
            {
                id: 2,
                pacienteId: 102,
                pacienteNombre: "Carlos Ramírez",
                fecha: "2025-04-27T11:30:00",
                estado: "activa",
                motivo: "Seguimiento tratamiento hipertensión",
                notas: "Paciente reporta mareos ocasionales",
            },
            {
                id: 3,
                pacienteId: 103,
                pacienteNombre: "Daniela López",
                fecha: "2025-04-27T14:00:00",
                estado: "en_espera",
                motivo: "Renovación receta",
                notas: "",
            },
        ];

        setConsultas(mockConsultas);
    }, []);

    // Filtrar consultas por estado
    const filteredConsultas = consultas.filter(c => c.estado === activeTab);

    // Cambiar estado de consulta
    const changeEstado = (
        consultaId: number,
        nuevoEstado: "en_espera" | "activa" | "completada"
    ) => {
        setConsultas(
            consultas.map(c =>
                c.id === consultaId ? { ...c, estado: nuevoEstado } : c
            )
        );

        if (
            selectedConsulta?.id === consultaId &&
            nuevoEstado === "completada"
        ) {
            setSelectedConsulta(null);
        }
    };

    // Guardar notas
    const guardarNotas = () => {
        if (!selectedConsulta) return;

        setConsultas(
            consultas.map(c =>
                c.id === selectedConsulta.id ? { ...c, notas: nota } : c
            )
        );

        // En producción: llamada a API para actualizar las notas
        alert("Notas guardadas con éxito");
    };

    return (
        // <DoctorLayout>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Consultas médicas</h1>
            </div>

            <Tabs
                defaultValue="en_espera"
                onValueChange={value => setActiveTab(value as any)}
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="en_espera">En espera</TabsTrigger>
                    <TabsTrigger value="activa">Activas</TabsTrigger>
                    <TabsTrigger value="completada">Completadas</TabsTrigger>
                </TabsList>

                <TabsContent value="en_espera" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pacientes en sala de espera</CardTitle>
                            <CardDescription>
                                Pacientes que están esperando ser atendidos hoy
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Motivo</TableHead>
                                        <TableHead className="text-right">
                                            Acción
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredConsultas.map(consulta => (
                                        <TableRow key={consulta.id}>
                                            <TableCell className="font-medium">
                                                {consulta.pacienteNombre}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    consulta.fecha
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {consulta.motivo}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        changeEstado(
                                                            consulta.id,
                                                            "activa"
                                                        )
                                                    }
                                                >
                                                    Iniciar consulta
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredConsultas.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-4"
                                            >
                                                No hay pacientes en espera en
                                                este momento
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activa" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Consultas activas</CardTitle>
                                <CardDescription>
                                    Pacientes en consulta actualmente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Paciente</TableHead>
                                            <TableHead>Motivo</TableHead>
                                            <TableHead>Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredConsultas.map(consulta => (
                                            <TableRow
                                                key={consulta.id}
                                                className={
                                                    selectedConsulta?.id ===
                                                    consulta.id
                                                        ? "bg-primary-50"
                                                        : ""
                                                }
                                            >
                                                <TableCell className="font-medium">
                                                    {consulta.pacienteNombre}
                                                </TableCell>
                                                <TableCell>
                                                    {consulta.motivo}
                                                </TableCell>
                                                <TableCell className="space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setSelectedConsulta(
                                                                consulta
                                                            )
                                                        }
                                                    >
                                                        Ver
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            changeEstado(
                                                                consulta.id,
                                                                "completada"
                                                            )
                                                        }
                                                    >
                                                        Finalizar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredConsultas.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="text-center py-4"
                                                >
                                                    No hay consultas activas en
                                                    este momento
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card className={!selectedConsulta ? "opacity-50" : ""}>
                            <CardHeader>
                                <CardTitle>Notas de consulta</CardTitle>
                                <CardDescription>
                                    {selectedConsulta
                                        ? `Paciente: ${selectedConsulta.pacienteNombre}`
                                        : "Seleccione una consulta activa"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedConsulta ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="font-medium">
                                                Motivo de consulta:
                                            </p>
                                            <p>{selectedConsulta.motivo}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-2">
                                                Notas:
                                            </p>
                                            <Textarea
                                                value={
                                                    nota ||
                                                    selectedConsulta.notas
                                                }
                                                onChange={e =>
                                                    setNota(e.target.value)
                                                }
                                                placeholder="Escriba sus notas sobre la consulta aquí..."
                                                rows={6}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <Button onClick={guardarNotas}>
                                                Guardar notas
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <p className="text-muted-foreground">
                                            Seleccione una consulta para ver y
                                            añadir notas
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="completada" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Consultas completadas</CardTitle>
                            <CardDescription>
                                Consultas finalizadas hoy
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead>Motivo</TableHead>
                                        <TableHead>Notas</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredConsultas.map(consulta => (
                                        <TableRow key={consulta.id}>
                                            <TableCell className="font-medium">
                                                {consulta.pacienteNombre}
                                            </TableCell>
                                            <TableCell>
                                                {consulta.motivo}
                                            </TableCell>
                                            <TableCell>
                                                {consulta.notas
                                                    ? consulta.notas.substring(
                                                          0,
                                                          60
                                                      ) +
                                                      (consulta.notas.length >
                                                      60
                                                          ? "..."
                                                          : "")
                                                    : "Sin notas"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredConsultas.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center py-4"
                                            >
                                                No hay consultas completadas hoy
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
        // </DoctorLayout>
    );
}
