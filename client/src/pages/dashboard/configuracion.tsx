import { useState } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { AlertTriangle, BellRing, KeyRound, LockKeyhole, Mail, Shield, User } from 'lucide-react';

// Esquema para validación de cambio de contraseña
const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "La contraseña actual es requerida" }),
  newPassword: z
    .string()
    .min(8, { message: "La nueva contraseña debe tener al menos 8 caracteres" })
    .regex(/[A-Z]/, { message: "Debe incluir al menos una letra mayúscula" })
    .regex(/[a-z]/, { message: "Debe incluir al menos una letra minúscula" })
    .regex(/[0-9]/, { message: "Debe incluir al menos un número" }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Esquema para validación de notificaciones
const notificationsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  inAppNotifications: z.boolean().default(true),
  notifyAppointments: z.boolean().default(true),
  notifyResults: z.boolean().default(true),
  notifyMessages: z.boolean().default(true),
});

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('cuenta');
  const { toast } = useToast();
  
  // Formulario de cambio de contraseña
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Formulario de notificaciones
  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      notifyAppointments: true,
      notifyResults: true,
      notifyMessages: true,
    },
  });
  
  // Manejar envío del formulario de contraseña
  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    // En producción, enviar al backend
    console.log("Contraseña a actualizar:", data);
    
    // Mostrar confirmación
    toast({
      title: "Contraseña actualizada",
      description: "Su contraseña ha sido actualizada exitosamente",
    });
    
    // Resetear formulario
    passwordForm.reset();
  };
  
  // Manejar envío del formulario de notificaciones
  const onNotificationsSubmit = (data: z.infer<typeof notificationsSchema>) => {
    // En producción, enviar al backend
    console.log("Preferencias de notificaciones:", data);
    
    // Mostrar confirmación
    toast({
      title: "Preferencias actualizadas",
      description: "Sus preferencias de notificaciones han sido actualizadas",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md grid grid-cols-3">
          <TabsTrigger value="cuenta">Cuenta</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cuenta" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
              <CardDescription>
                Actualice su información personal y datos de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" value="Ricardo" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input id="apellidos" value="Martínez López" readOnly />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" value="ricardo.martinez@ejemplo.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" value="555-123-4567" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Guardar cambios</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Información profesional</CardTitle>
              <CardDescription>
                Esta información no puede ser modificada desde aquí. Para cambios importantes, visite la sección de Perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="especialidad">Especialidad</Label>
                    <Input id="especialidad" value="Cardiología" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cedula">Cédula profesional</Label>
                    <Input id="cedula" value="12345678" readOnly />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard/perfil'}>
                <User className="mr-2 h-4 w-4" />
                Ir a perfil
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificaciones" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de notificaciones</CardTitle>
              <CardDescription>
                Controle cómo y cuándo recibe notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Canales de notificación</h3>
                    
                    <FormField
                      control={notificationsForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center">
                              <Mail className="mr-2 h-4 w-4" />
                              Correo electrónico
                            </FormLabel>
                            <FormDescription>
                              Recibir notificaciones por correo electrónico
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="smsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Mensajes SMS</FormLabel>
                            <FormDescription>
                              Recibir notificaciones por SMS
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="inAppNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center">
                              <BellRing className="mr-2 h-4 w-4" />
                              En la aplicación
                            </FormLabel>
                            <FormDescription>
                              Recibir notificaciones dentro de la aplicación
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Tipos de notificaciones</h3>
                    
                    <FormField
                      control={notificationsForm.control}
                      name="notifyAppointments"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Citas</FormLabel>
                            <FormDescription>
                              Notificar sobre nuevas citas, cambios o recordatorios
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="notifyResults"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Resultados</FormLabel>
                            <FormDescription>
                              Notificar cuando hay nuevos resultados de laboratorio
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationsForm.control}
                      name="notifyMessages"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Mensajes</FormLabel>
                            <FormDescription>
                              Notificar sobre nuevos mensajes de pacientes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Guardar preferencias</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seguridad" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
              <CardDescription>
                Actualice su contraseña regularmente para mantener su cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña actual</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas y números
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="mt-2">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Actualizar contraseña
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Opciones avanzadas</CardTitle>
              <CardDescription>
                Configuración de seguridad adicional y opciones de cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Verificación en dos pasos
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Añada una capa extra de seguridad a su cuenta
                  </p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium flex items-center">
                    <LockKeyhole className="mr-2 h-4 w-4" />
                    Sesiones activas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Vea y gestione los dispositivos en los que ha iniciado sesión
                  </p>
                </div>
                <Button variant="outline">Ver sesiones</Button>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Cerrar sesión en todos los dispositivos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción cerrará su sesión en todos los dispositivos, incluyendo este. Tendrá que iniciar sesión nuevamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        toast({
                          title: "Sesiones cerradas",
                          description: "Se han cerrado todas las sesiones activas",
                        });
                      }}
                    >
                      Cerrar todas las sesiones
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}