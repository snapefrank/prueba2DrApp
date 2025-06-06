import { useState } from 'react';
import DoctorLayout from '@/layouts/DoctorLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, Lock, User, Mail, Zap } from 'lucide-react';

// Esquema de validación para cambio de contraseña
const passwordSchema = z.object({
  currentPassword: z.string().min(8, {
    message: 'La contraseña actual debe tener al menos 8 caracteres',
  }),
  newPassword: z.string().min(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  }),
  confirmPassword: z.string().min(8, {
    message: 'Confirmar contraseña debe tener al menos 8 caracteres',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Esquema para notificaciones
const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  appNotifications: z.boolean(),
  appointmentReminders: z.boolean(),
  messageNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

export default function ConfiguracionPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('seguridad');
  
  // Formulario para cambio de contraseña
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Formulario para notificaciones
  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      appNotifications: true,
      appointmentReminders: true,
      messageNotifications: true,
      marketingEmails: false,
    },
  });

  // Manejar cambio de contraseña
  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    // Aquí iría la lógica para cambiar la contraseña
    console.log(values);
    
    toast({
      title: 'Contraseña actualizada',
      description: 'Tu contraseña ha sido actualizada exitosamente.',
    });
    
    passwordForm.reset();
  };

  // Manejar cambio en notificaciones
  const onNotificationsSubmit = (values: z.infer<typeof notificationsSchema>) => {
    // Aquí iría la lógica para actualizar preferencias de notificaciones
    console.log(values);
    
    toast({
      title: 'Preferencias actualizadas',
      description: 'Tus preferencias de notificaciones han sido actualizadas.',
    });
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Administra tus preferencias y configuración de cuenta
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="seguridad" className="flex items-center">
              <Lock className="mr-2 h-4 w-4" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notificaciones
            </TabsTrigger>
          </TabsList>
          
          {/* Pestaña de Seguridad */}
          <TabsContent value="seguridad" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña para mantener la seguridad de tu cuenta
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
                            <Input type="password" placeholder="••••••••" {...field} />
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
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            Usa una contraseña segura con al menos 8 caracteres
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
                          <FormLabel>Confirmar contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Actualizar contraseña</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sesiones activas</CardTitle>
                <CardDescription>
                  Administra tus sesiones activas en diferentes dispositivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Sesión actual</p>
                        <p className="text-sm text-muted-foreground">Ciudad de México • Chrome en Windows</p>
                      </div>
                    </div>
                    <Button variant="outline" disabled>Actual</Button>
                  </div>
                  
                  <Button variant="destructive">Cerrar todas las otras sesiones</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Notificaciones */}
          <TabsContent value="notificaciones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de notificaciones</CardTitle>
                <CardDescription>
                  Configura cómo y cuándo quieres recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationsForm}>
                  <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Canales de notificación</h3>
                      
                      <FormField
                        control={notificationsForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base flex items-center">
                                <Mail className="mr-2 h-4 w-4" />
                                Notificaciones por email
                              </FormLabel>
                              <FormDescription>
                                Recibe emails sobre tus citas, mensajes y actualizaciones
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
                        name="appNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base flex items-center">
                                <Bell className="mr-2 h-4 w-4" />
                                Notificaciones en la aplicación
                              </FormLabel>
                              <FormDescription>
                                Recibe notificaciones dentro de la plataforma
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">SMS</FormLabel>
                              <FormDescription>
                                Recibe mensajes de texto para recordatorios importantes
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
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Tipos de notificaciones</h3>
                      
                      <FormField
                        control={notificationsForm.control}
                        name="appointmentReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Recordatorios de citas</FormLabel>
                              <FormDescription>
                                Notificaciones sobre tus próximas citas
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
                        name="messageNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Mensajes nuevos</FormLabel>
                              <FormDescription>
                                Notificaciones cuando recibes mensajes de pacientes
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
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Emails de marketing</FormLabel>
                              <FormDescription>
                                Recibe información sobre nuevas funcionalidades y ofertas
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
        </Tabs>
      </div>
    </DoctorLayout>
  );
}