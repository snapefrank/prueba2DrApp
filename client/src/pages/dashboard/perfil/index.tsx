import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Building, CreditCard, Edit2, MapPin, Phone, Star, Upload, User, X, Mail, Award, FileText, Building2, Stethoscope } from 'lucide-react';

// Tipos de datos
type MedicoPerfil = {
  id: number;
  nombre: string;
  apellidos: string;
  especialidad: string;
  cedula: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  horarioConsulta: string;
  biografia: string;
  formacionAcademica: Array<{
    titulo: string;
    institucion: string;
    año: string;
  }>;
  certificaciones: Array<{
    nombre: string;
    institucion: string;
    año: string;
  }>;
  imagenPerfil?: string;
  estadoVerificacion: 'pendiente' | 'verificado' | 'rechazado';
};

// Esquema para la edición de información personal
const perfilSchema = z.object({
  nombre: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  apellidos: z.string().min(2, { message: "Los apellidos deben tener al menos 2 caracteres" }),
  especialidad: z.string(),
  cedula: z.string(),
  correo: z.string().email({ message: "Ingrese un correo electrónico válido" }),
  telefono: z.string(),
  direccion: z.string(),
  ciudad: z.string(),
  estado: z.string(),
  codigoPostal: z.string(),
  horarioConsulta: z.string(),
  biografia: z.string(),
});

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [perfil, setPerfil] = useState<MedicoPerfil | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Cargar datos de ejemplo (esto se reemplazaría con una llamada a la API)
  useEffect(() => {
    // Datos de muestra - en producción, se obtendrían de una API
    const mockPerfil: MedicoPerfil = {
      id: 1,
      nombre: "Ricardo",
      apellidos: "Martínez López",
      especialidad: "Cardiología",
      cedula: "12345678",
      correo: "ricardo.martinez@ejemplo.com",
      telefono: "555-123-4567",
      direccion: "Av. Paseo de la Reforma 123",
      ciudad: "Ciudad de México",
      estado: "CDMX",
      codigoPostal: "06500",
      horarioConsulta: "Lunes a Viernes de 9:00 a 14:00",
      biografia: "Especialista en cardiología con más de 10 años de experiencia. Enfocado en la prevención y tratamiento de enfermedades cardiovasculares.",
      formacionAcademica: [
        {
          titulo: "Doctorado en Medicina",
          institucion: "Universidad Nacional Autónoma de México",
          año: "2010"
        },
        {
          titulo: "Especialidad en Cardiología",
          institucion: "Instituto Nacional de Cardiología",
          año: "2014"
        }
      ],
      certificaciones: [
        {
          nombre: "Certificación en Ecocardiografía",
          institucion: "Sociedad Mexicana de Cardiología",
          año: "2015"
        },
        {
          nombre: "Certificación en Cardiología Intervencionista",
          institucion: "Colegio Mexicano de Cardiología",
          año: "2017"
        }
      ],
      estadoVerificacion: 'verificado'
    };
    
    setPerfil(mockPerfil);
  }, []);

  // Inicializar el formulario cuando se carguen los datos
  const form = useForm<z.infer<typeof perfilSchema>>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: perfil?.nombre || "",
      apellidos: perfil?.apellidos || "",
      especialidad: perfil?.especialidad || "",
      cedula: perfil?.cedula || "",
      correo: perfil?.correo || "",
      telefono: perfil?.telefono || "",
      direccion: perfil?.direccion || "",
      ciudad: perfil?.ciudad || "",
      estado: perfil?.estado || "",
      codigoPostal: perfil?.codigoPostal || "",
      horarioConsulta: perfil?.horarioConsulta || "",
      biografia: perfil?.biografia || "",
    },
  });

  // Actualizar formulario cuando cambian los datos
  useEffect(() => {
    if (perfil) {
      form.reset({
        nombre: perfil.nombre,
        apellidos: perfil.apellidos,
        especialidad: perfil.especialidad,
        cedula: perfil.cedula,
        correo: perfil.correo,
        telefono: perfil.telefono,
        direccion: perfil.direccion,
        ciudad: perfil.ciudad,
        estado: perfil.estado,
        codigoPostal: perfil.codigoPostal,
        horarioConsulta: perfil.horarioConsulta,
        biografia: perfil.biografia,
      });
    }
  }, [perfil, form]);

  // Guardar cambios en el perfil
  const onSubmit = (data: z.infer<typeof perfilSchema>) => {
    // En producción, enviar al backend
    console.log("Datos a guardar:", data);
    
    // Actualizar el estado local
    setPerfil(prevPerfil => {
      if (!prevPerfil) return null;
      return {
        ...prevPerfil,
        ...data
      };
    });
    
    // Mostrar confirmación
    toast({
      title: "Perfil actualizado",
      description: "Los cambios han sido guardados correctamente",
    });
    
    // Salir del modo edición
    setIsEditing(false);
  };

  // Obtener la etiqueta de estado de verificación
  const getVerificationBadge = () => {
    if (!perfil) return null;
    
    let color;
    let text;
    
    switch (perfil.estadoVerificacion) {
      case 'verificado':
        color = "bg-green-100 text-green-800";
        text = "Verificado";
        break;
      case 'pendiente':
        color = "bg-amber-100 text-amber-800";
        text = "Pendiente de verificación";
        break;
      case 'rechazado':
        color = "bg-red-100 text-red-800";
        text = "Verificación rechazada";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
        text = "Estado desconocido";
    }
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };

  if (!perfil) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mi perfil profesional</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Editar perfil
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="informacion">
        <TabsList className="grid w-full max-w-lg grid-cols-2">
          <TabsTrigger value="informacion">Información personal</TabsTrigger>
          <TabsTrigger value="profesional">Perfil profesional</TabsTrigger>
        </TabsList>
        
        <TabsContent value="informacion" className="mt-4 space-y-6">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Editar información personal</CardTitle>
                <CardDescription>
                  Actualice los datos de su perfil profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="space-y-4 flex-1">
                        <FormField
                          control={form.control}
                          name="nombre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="apellidos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellidos</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="especialidad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Especialidad</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione su especialidad" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Cardiología">Cardiología</SelectItem>
                                  <SelectItem value="Dermatología">Dermatología</SelectItem>
                                  <SelectItem value="Neurología">Neurología</SelectItem>
                                  <SelectItem value="Pediatría">Pediatría</SelectItem>
                                  <SelectItem value="Ginecología">Ginecología</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cedula"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cédula profesional</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4 flex-1">
                        <FormField
                          control={form.control}
                          name="correo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo electrónico</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="telefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="horarioConsulta"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horario de consulta</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="direccion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="ciudad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ciudad</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="estado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estado</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="codigoPostal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código postal</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="biografia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Biografía profesional</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Describa su experiencia y especialización..."
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Guardar cambios
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader className="text-center">
                  <div className="mx-auto flex justify-center mb-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={perfil.imagenPerfil} />
                      <AvatarFallback className="text-4xl">
                        {perfil.nombre.charAt(0)}{perfil.apellidos.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle>{perfil.nombre} {perfil.apellidos}</CardTitle>
                  <div className="flex justify-center mt-2">
                    {getVerificationBadge()}
                  </div>
                  <CardDescription className="mt-2 flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    {perfil.especialidad}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                    <div>
                      <div className="font-medium">Cédula profesional</div>
                      <div className="text-sm text-muted-foreground">
                        {perfil.cedula}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                    <div>
                      <div className="font-medium">Correo electrónico</div>
                      <div className="text-sm text-muted-foreground">
                        {perfil.correo}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                    <div>
                      <div className="font-medium">Teléfono</div>
                      <div className="text-sm text-muted-foreground">
                        {perfil.telefono}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Información profesional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Biografía</h3>
                    <p className="text-muted-foreground">{perfil.biografia}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Ubicación</h3>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div className="text-muted-foreground">
                        {perfil.direccion}, {perfil.ciudad}, {perfil.estado}, CP {perfil.codigoPostal}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Horario de consulta</h3>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div className="text-muted-foreground">
                        {perfil.horarioConsulta}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="profesional" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Formación académica</CardTitle>
              <CardDescription>
                Estudios y especialidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {perfil.formacionAcademica.map((formacion, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                    <div>
                      <div className="font-medium">{formacion.titulo}</div>
                      <div className="text-sm text-muted-foreground">
                        {formacion.institucion} - {formacion.año}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Añadir formación
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Certificaciones</CardTitle>
              <CardDescription>
                Certificaciones y reconocimientos profesionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {perfil.certificaciones.map((certificacion, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                    <div>
                      <div className="font-medium">{certificacion.nombre}</div>
                      <div className="text-sm text-muted-foreground">
                        {certificacion.institucion} - {certificacion.año}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Añadir certificación
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Documentos de verificación</CardTitle>
              <CardDescription>
                Estado de verificación: {getVerificationBadge()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                      <span>Cédula profesional (frente y reverso)</span>
                    </div>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                      <span>Título y diploma de especialidad</span>
                    </div>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                      <span>Identificación oficial</span>
                    </div>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Subir nuevo documento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}