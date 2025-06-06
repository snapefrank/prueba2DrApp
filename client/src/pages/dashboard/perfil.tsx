import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  FileEdit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  BookOpen,
  Award,
  Shield,
  CheckCircle2,
  Settings,
  Lock
} from 'lucide-react';

export default function PerfilPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Esta función simula guardar los cambios
  const handleSaveChanges = () => {
    toast({
      title: "Perfil actualizado",
      description: "Tu información ha sido guardada correctamente",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Encabezado con información principal */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-1/3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src="/images/doctor-profile.jpg" alt="Foto de perfil" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold text-center">
                  {user?.firstName || 'Dr.'} {user?.lastName || 'Ejemplo'}
                </h2>
                
                <p className="text-muted-foreground text-center mb-2">
                  {user?.userType === 'doctor' ? 'Médico Especialista' : 'Usuario'}
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> 
                    Verificado
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    <Shield className="mr-1 h-3 w-3" /> 
                    Premium
                  </Badge>
                </div>
                
                <Button className="w-full" onClick={handleSaveChanges}>
                  <FileEdit className="mr-2 h-4 w-4" /> Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Gestiona y actualiza tu información personal y profesional
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="profesional">Profesional</TabsTrigger>
                  <TabsTrigger value="cuenta">Cuenta</TabsTrigger>
                </TabsList>
                
                {/* Información Personal */}
                <TabsContent value="personal" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Nombre</Label>
                      <Input id="first-name" defaultValue={user?.firstName || 'Carlos'} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Apellido</Label>
                      <Input id="last-name" defaultValue={user?.lastName || 'Rodríguez'} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-1">
                        <Mail className="h-4 w-4" /> Correo Electrónico
                      </Label>
                      <Input id="email" type="email" defaultValue={user?.email || 'ejemplo@mediconnect.com'} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        <Phone className="h-4 w-4" /> Teléfono
                      </Label>
                      <Input id="phone" defaultValue="+52 55 1234 5678" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> Dirección
                    </Label>
                    <Input id="address" defaultValue="Av. Insurgentes Sur 1234, Ciudad de México" />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
                  </div>
                </TabsContent>
                
                {/* Información Profesional */}
                <TabsContent value="profesional" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Especialidad</Label>
                      <Select defaultValue="cardiologia">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cardiologia">Cardiología</SelectItem>
                          <SelectItem value="dermatologia">Dermatología</SelectItem>
                          <SelectItem value="pediatria">Pediatría</SelectItem>
                          <SelectItem value="neurologia">Neurología</SelectItem>
                          <SelectItem value="ginecologia">Ginecología</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license">Cédula Profesional</Label>
                      <Input id="license" defaultValue="12345678" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education" className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" /> Formación Académica
                      </Label>
                      <Textarea id="education" defaultValue="Universidad Nacional Autónoma de México, Facultad de Medicina" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certifications" className="flex items-center gap-1">
                        <Award className="h-4 w-4" /> Certificaciones
                      </Label>
                      <Textarea id="certifications" defaultValue="Consejo Mexicano de Cardiología, Certificado 2022-2027" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consultation-time" className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Duración de Consulta
                      </Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="consultation-time">
                          <SelectValue placeholder="Selecciona duración" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="45">45 minutos</SelectItem>
                          <SelectItem value="60">60 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultation-price" className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Precio de Consulta
                      </Label>
                      <Input id="consultation-price" defaultValue="800" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
                  </div>
                </TabsContent>
                
                {/* Configuración de Cuenta */}
                <TabsContent value="cuenta" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-1">
                      <User className="h-4 w-4" /> Nombre de Usuario
                    </Label>
                    <Input id="username" defaultValue={user?.username || 'dr.carlos'} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="flex items-center gap-1">
                      <Lock className="h-4 w-4" /> Contraseña Actual
                    </Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nueva Contraseña</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="account-settings" className="flex items-center gap-1">
                      <Settings className="h-4 w-4" /> Configuración de la Cuenta
                    </Label>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <p className="text-sm">Estas opciones afectan a la visualización y seguridad de tu cuenta.</p>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="email-notifications" defaultChecked />
                          <label htmlFor="email-notifications">Recibir notificaciones por correo</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="profile-visible" defaultChecked />
                          <label htmlFor="profile-visible">Perfil visible en el directorio médico</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="two-factor" />
                          <label htmlFor="two-factor">Activar autenticación de dos factores</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="destructive" className="bg-red-600">
                      Desactivar Cuenta
                    </Button>
                    <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Sección de estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
          <CardDescription>Resumen de tu actividad en la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-blue-600 text-2xl font-bold">124</p>
              <p className="text-gray-600">Pacientes</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-green-600 text-2xl font-bold">45</p>
              <p className="text-gray-600">Consultas este mes</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-purple-600 text-2xl font-bold">87</p>
              <p className="text-gray-600">Recetas emitidas</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-center">
              <p className="text-amber-600 text-2xl font-bold">4.9</p>
              <p className="text-gray-600">Calificación promedio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}