import { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Bell,
    ChevronRight,
    Plus,
    Search,
    Send,
    User,
    UserPlus,
} from "lucide-react";
import DoctorLayout from "@/layouts/DoctorLayout";

// Tipos de datos
type Mensaje = {
    id: number;
    emisorId: number;
    receptorId: number;
    emisorNombre: string;
    contenido: string;
    timestamp: string;
    leido: boolean;
};

type Conversacion = {
    id: number;
    usuarioId: number;
    usuarioNombre: string;
    ultimoMensaje: string;
    timestamp: string;
    noLeidos: number;
    avatar?: string;
};

export default function MensajesPage() {
    const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [selectedConversacion, setSelectedConversacion] =
        useState<Conversacion | null>(null);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const mensajesEndRef = useRef<HTMLDivElement>(null);

    // Cargar datos de ejemplo
    useEffect(() => {
        // Datos de muestra - en producción, se obtendrían de una API
        const mockConversaciones: Conversacion[] = [
            {
                id: 1,
                usuarioId: 101,
                usuarioNombre: "Ana García",
                ultimoMensaje: "Necesito reagendar mi cita del viernes",
                timestamp: "2025-04-26T14:30:00",
                noLeidos: 2,
            },
            {
                id: 2,
                usuarioId: 102,
                usuarioNombre: "Carlos Ramírez",
                ultimoMensaje: "Gracias por enviar los resultados",
                timestamp: "2025-04-25T10:15:00",
                noLeidos: 0,
            },
            {
                id: 3,
                usuarioId: 103,
                usuarioNombre: "Daniela López",
                ultimoMensaje: "¿Cuándo estarán listos mis resultados?",
                timestamp: "2025-04-23T16:45:00",
                noLeidos: 0,
            },
            {
                id: 4,
                usuarioId: 104,
                usuarioNombre: "Hospital Central",
                ultimoMensaje: "Se ha programado una junta para el lunes",
                timestamp: "2025-04-22T09:00:00",
                noLeidos: 0,
            },
        ];

        const mockMensajes: Record<number, Mensaje[]> = {
            1: [
                {
                    id: 101,
                    emisorId: 101,
                    receptorId: 1,
                    emisorNombre: "Ana García",
                    contenido: "Hola doctor, ¿cómo está?",
                    timestamp: "2025-04-26T14:00:00",
                    leido: true,
                },
                {
                    id: 102,
                    emisorId: 1,
                    receptorId: 101,
                    emisorNombre: "Dr. Martínez",
                    contenido: "Hola Ana, muy bien ¿en qué puedo ayudarte?",
                    timestamp: "2025-04-26T14:05:00",
                    leido: true,
                },
                {
                    id: 103,
                    emisorId: 101,
                    receptorId: 1,
                    emisorNombre: "Ana García",
                    contenido:
                        "Necesito reagendar mi cita del viernes porque tengo un compromiso laboral",
                    timestamp: "2025-04-26T14:10:00",
                    leido: true,
                },
                {
                    id: 104,
                    emisorId: 101,
                    receptorId: 1,
                    emisorNombre: "Ana García",
                    contenido: "¿Sería posible cambiarla para el lunes?",
                    timestamp: "2025-04-26T14:30:00",
                    leido: false,
                },
            ],
            2: [
                {
                    id: 201,
                    emisorId: 102,
                    receptorId: 1,
                    emisorNombre: "Carlos Ramírez",
                    contenido:
                        "Doctor, ¿ya tiene los resultados de mis análisis?",
                    timestamp: "2025-04-25T09:30:00",
                    leido: true,
                },
                {
                    id: 202,
                    emisorId: 1,
                    receptorId: 102,
                    emisorNombre: "Dr. Martínez",
                    contenido:
                        "Hola Carlos, sí, acabo de recibirlos. Te los envío ahora mismo.",
                    timestamp: "2025-04-25T10:00:00",
                    leido: true,
                },
                {
                    id: 203,
                    emisorId: 1,
                    receptorId: 102,
                    emisorNombre: "Dr. Martínez",
                    contenido: "[Archivo adjunto: resultados_laboratorio.pdf]",
                    timestamp: "2025-04-25T10:05:00",
                    leido: true,
                },
                {
                    id: 204,
                    emisorId: 102,
                    receptorId: 1,
                    emisorNombre: "Carlos Ramírez",
                    contenido: "Gracias por enviar los resultados",
                    timestamp: "2025-04-25T10:15:00",
                    leido: true,
                },
            ],
        };

        setConversaciones(mockConversaciones);

        // Si hay una conversación seleccionada, cargar sus mensajes
        if (selectedConversacion) {
            setMensajes(mockMensajes[selectedConversacion.id] || []);
        }
    }, [selectedConversacion?.id]);

    // Hacer scroll hasta el último mensaje
    useEffect(() => {
        if (mensajesEndRef.current) {
            mensajesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [mensajes]);

    // Filtrar conversaciones por término de búsqueda
    const conversacionesFiltradas = conversaciones.filter(conv =>
        conv.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Seleccionar una conversación
    const seleccionarConversacion = (conversacion: Conversacion) => {
        setSelectedConversacion(conversacion);

        // Marcar mensajes como leídos
        setConversaciones(
            conversaciones.map(c =>
                c.id === conversacion.id ? { ...c, noLeidos: 0 } : c
            )
        );
    };

    // Enviar un nuevo mensaje
    const enviarMensaje = () => {
        if (!nuevoMensaje.trim() || !selectedConversacion) return;

        const nuevoMsg: Mensaje = {
            id: Math.floor(Math.random() * 1000),
            emisorId: 1, // ID del doctor
            receptorId: selectedConversacion.usuarioId,
            emisorNombre: "Dr. Martínez",
            contenido: nuevoMensaje,
            timestamp: new Date().toISOString(),
            leido: true,
        };

        setMensajes([...mensajes, nuevoMsg]);
        setNuevoMensaje("");

        // Actualizar la última conversación
        setConversaciones(
            conversaciones.map(c =>
                c.id === selectedConversacion.id
                    ? {
                          ...c,
                          ultimoMensaje: nuevoMensaje,
                          timestamp: new Date().toISOString(),
                      }
                    : c
            )
        );
    };

    // Formatear fecha
    const formatearFecha = (fechaISO: string) => {
        const fecha = new Date(fechaISO);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);

        if (fecha.toDateString() === hoy.toDateString()) {
            return fecha.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (fecha.toDateString() === ayer.toDateString()) {
            return "Ayer";
        } else {
            return fecha.toLocaleDateString();
        }
    };

    return (
        // <DoctorLayout>
        <div className="h-full flex flex-col">
            <div className="pb-0">
                <h1 className="text-2xl font-bold mb-4">Mensajes</h1>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden p-6">
                <Card className="md:col-span-1 border-r rounded-r-none h-full flex flex-col">
                    <CardHeader className="py-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Buscar conversación..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {conversacionesFiltradas.map(conversacion => (
                                    <div
                                        key={conversacion.id}
                                        className={`p-4 hover:bg-accent cursor-pointer ${
                                            selectedConversacion?.id ===
                                            conversacion.id
                                                ? "bg-accent"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            seleccionarConversacion(
                                                conversacion
                                            )
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage
                                                    src={conversacion.avatar}
                                                />
                                                <AvatarFallback className="bg-primary/10">
                                                    {conversacion.usuarioNombre.charAt(
                                                        0
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium truncate">
                                                        {
                                                            conversacion.usuarioNombre
                                                        }
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatearFecha(
                                                            conversacion.timestamp
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-sm truncate text-muted-foreground">
                                                        {
                                                            conversacion.ultimoMensaje
                                                        }
                                                    </p>
                                                    {conversacion.noLeidos >
                                                        0 && (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                                                            {
                                                                conversacion.noLeidos
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {conversacionesFiltradas.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No se encontraron conversaciones
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </ScrollArea>
                    <div className="p-4 border-t">
                        <Button variant="outline" className="w-full">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Nueva conversación
                        </Button>
                    </div>
                </Card>

                <Card className="md:col-span-2 border-l rounded-l-none h-full flex flex-col">
                    {selectedConversacion ? (
                        <>
                            <CardHeader className="py-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage
                                                src={
                                                    selectedConversacion.avatar
                                                }
                                            />
                                            <AvatarFallback className="bg-primary/10">
                                                {selectedConversacion.usuarioNombre.charAt(
                                                    0
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">
                                                {
                                                    selectedConversacion.usuarioNombre
                                                }
                                            </CardTitle>
                                            <CardDescription>
                                                Última actividad:{" "}
                                                {formatearFecha(
                                                    selectedConversacion.timestamp
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <Bell className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <ScrollArea className="flex-1 px-4">
                                <CardContent className="py-4">
                                    <div className="space-y-4">
                                        {mensajes.map(mensaje => (
                                            <div
                                                key={mensaje.id}
                                                className={`flex ${
                                                    mensaje.emisorId === 1
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-lg p-3 
                            ${
                                mensaje.emisorId === 1
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                            }`}
                                                >
                                                    <p>{mensaje.contenido}</p>
                                                    <p
                                                        className={`text-xs mt-1 
                            ${
                                mensaje.emisorId === 1
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                            }`}
                                                    >
                                                        {new Date(
                                                            mensaje.timestamp
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={mensajesEndRef} />
                                    </div>
                                </CardContent>
                            </ScrollArea>
                            <div className="p-4 border-t">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Escribe un mensaje..."
                                        value={nuevoMensaje}
                                        onChange={e =>
                                            setNuevoMensaje(e.target.value)
                                        }
                                        onKeyDown={e =>
                                            e.key === "Enter" && enviarMensaje()
                                        }
                                    />
                                    <Button
                                        onClick={enviarMensaje}
                                        disabled={!nuevoMensaje.trim()}
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-medium text-lg mb-2">
                                Selecciona una conversación
                            </h3>
                            <p className="text-muted-foreground max-w-xs">
                                Elige una conversación de la lista o inicia una
                                nueva para comenzar a chatear
                            </p>
                            <Button variant="outline" className="mt-6">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Iniciar nueva conversación
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
        // </DoctorLayout>
    );
}
