import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard, Mail, Bell, Shield, DollarSign, User, Key, LogOut, 
  Camera, Trash2, CheckCircle, XCircle, Clock, AlertCircle, MapPin,
  Phone, Building, FileText, Stethoscope 
} from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    phone: "",
    address: "",
    specialtyId: ""
  });
  
  // Cargar datos del perfil
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        bio: "",
        phone: "",
        address: "",
        specialtyId: ""
      });

      // Cargar el perfil del usuario según su tipo
      const fetchProfile = async () => {
        try {
          const profileResponse = await apiRequest("GET", "/api/profile");
          const profile = await profileResponse.json();
          setUserProfile(profile);
          
          // Actualizar el estado del formulario con los datos del perfil
          setFormData(prevData => ({
            ...prevData,
            bio: profile.bio || "",
            phone: profile.phone || "",
            address: profile.address || "",
            specialtyId: profile.specialtyId ? profile.specialtyId.toString() : ""
          }));
          
          // Establecer imagen de perfil
          setProfileImage(profile.profileImage || null);
        } catch (error) {
          console.error("Error al cargar el perfil:", error);
        }
      };
      
      // Cargar especialidades si el usuario es médico
      const fetchSpecialties = async () => {
        if (user.userType === "doctor") {
          try {
            const specialtiesResponse = await apiRequest("GET", "/api/specialties");
            const specialtiesData = await specialtiesResponse.json();
            setSpecialties(specialtiesData);
          } catch (error) {
            console.error("Error al cargar especialidades:", error);
          }
        }
      };
      
      fetchProfile();
      fetchSpecialties();
    }
  }, [user]);
  
  // Mock de planes de suscripción (esto vendría de la API)
  const subscriptionPlans = [
    { id: 1, name: "Plan Básico", price: 0, features: ["Acceso básico", "Perfiles médicos limitados", "Soporte por email"] },
    { id: 2, name: "Plan Profesional", price: 299, features: ["Acceso completo", "Perfiles médicos ilimitados", "Soporte prioritario", "Sin anuncios"] },
    { id: 3, name: "Plan Premium", price: 499, features: ["Todo lo del Plan Profesional", "Gestión avanzada de pacientes", "Integraciones con sistemas de laboratorio", "Soporte telefónico 24/7"] },
  ];
  
  // Mock de suscripción actual del usuario (esto vendría de la API)
  const userSubscription = {
    planId: 2,
    status: "active",
    nextBillingDate: "2023-12-15",
    paymentMethod: {
      type: "card",
      last4: "4242",
      brand: "visa",
      expiryMonth: 12,
      expiryYear: 2024
    }
  };
  
  const handleEmailPreferenceChange = (checked: boolean, type: string) => {
    toast({
      title: "Preferencias actualizadas",
      description: `Has ${checked ? 'activado' : 'desactivado'} notificaciones por ${type}`
    });
  };
  
  const handlePasswordChange = () => {
    toast({
      title: "Cambiar contraseña",
      description: "Esta funcionalidad está en desarrollo"
    });
  };
  
  const handlePaymentMethodChange = () => {
    toast({
      title: "Actualizar método de pago",
      description: "Esta funcionalidad está en desarrollo"
    });
  };
  
  const handlePlanChange = (planId: string) => {
    toast({
      title: "Cambio de plan",
      description: `Has seleccionado el plan ${planId}. Esta funcionalidad está en desarrollo.`
    });
  };
  
  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Manejar subida de imagen de perfil
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    setUploadingImage(true);
    
    try {
      // Usar FormData directamente
      const response = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        setProfileImage(data.imageUrl);
        toast({
          title: "Imagen actualizada",
          description: "Tu imagen de perfil ha sido actualizada correctamente"
        });
        // Refrescar el perfil de usuario en el contexto global
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Eliminar imagen de perfil
  const handleRemoveImage = async () => {
    if (!profileImage || !user) return;
    
    try {
      const response = await apiRequest("DELETE", `/api/profile/delete-image/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setProfileImage(null);
        toast({
          title: "Imagen eliminada",
          description: "Tu imagen de perfil ha sido eliminada correctamente"
        });
        // Refrescar el perfil de usuario en el contexto global
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };
  
  // Guardar cambios en el perfil
  const handleSaveProfile = async () => {
    try {
      const response = await apiRequest("PUT", "/api/profile", formData);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Perfil actualizado",
          description: "Tu perfil ha sido actualizado correctamente"
        });
        // Refrescar el perfil de usuario en el contexto global
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };
  
  if (!user) return null;
  
  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-5xl py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Configuración</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Actualiza la configuración general de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" defaultValue={`${user.firstName} ${user.lastName}`} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input id="username" defaultValue={user.username} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Seleccionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="theme">Tema</Label>
                    <p className="text-sm text-muted-foreground">Cambiar entre tema claro y oscuro</p>
                  </div>
                  <Select defaultValue="light">
                    <SelectTrigger className="w-[180px]" id="theme">
                      <SelectValue placeholder="Seleccionar tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-base font-medium">Cerrar sesión en todos los dispositivos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cierra la sesión en todos los dispositivos donde hayas iniciado sesión
                  </p>
                  <Button variant="outline" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Cerrar todas las sesiones
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Guardar cambios</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
                <CardDescription>
                  Configura cómo y cuándo quieres recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notificaciones por Email
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-appointments" className="flex flex-col space-y-1">
                        <span>Citas y recordatorios</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Recibe notificaciones sobre tus citas
                        </span>
                      </Label>
                      <Switch 
                        id="email-appointments" 
                        defaultChecked 
                        onCheckedChange={(checked) => handleEmailPreferenceChange(checked, 'citas')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-updates" className="flex flex-col space-y-1">
                        <span>Actualizaciones de la plataforma</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Recibe información sobre nuevas funcionalidades
                        </span>
                      </Label>
                      <Switch 
                        id="email-updates" 
                        defaultChecked 
                        onCheckedChange={(checked) => handleEmailPreferenceChange(checked, 'actualizaciones')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-marketing" className="flex flex-col space-y-1">
                        <span>Marketing y promociones</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Recibe ofertas y promociones especiales
                        </span>
                      </Label>
                      <Switch 
                        id="email-marketing" 
                        onCheckedChange={(checked) => handleEmailPreferenceChange(checked, 'marketing')}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notificaciones en la Aplicación
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-messages" className="flex flex-col space-y-1">
                        <span>Mensajes nuevos</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Recibe notificaciones cuando tengas mensajes nuevos
                        </span>
                      </Label>
                      <Switch 
                        id="app-messages" 
                        defaultChecked 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-appointments" className="flex flex-col space-y-1">
                        <span>Cambios en citas</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Recibe notificaciones sobre cambios en tus citas
                        </span>
                      </Label>
                      <Switch 
                        id="app-appointments" 
                        defaultChecked 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app-results" className="flex flex-col space-y-1">
                        <span>Resultados de estudios</span>
                        <span className="font-normal text-sm text-muted-foreground">
                          Recibe notificaciones cuando tus resultados estén listos
                        </span>
                      </Label>
                      <Switch 
                        id="app-results" 
                        defaultChecked 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Guardar preferencias</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Perfil Profesional</CardTitle>
                <CardDescription>
                  Personaliza tu perfil profesional y actualiza tus datos de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Imagen de perfil */}
                <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-32 h-32 border-2 border-primary/20">
                        <AvatarImage src={profileImage || undefined} alt={user.firstName} />
                        <AvatarFallback className="text-2xl">
                          {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
                        </AvatarFallback>
                      </Avatar>
                      {uploadingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                          <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <label htmlFor="profile-image-upload" className="cursor-pointer">
                        <input
                          type="file"
                          id="profile-image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button variant="outline" type="button" size="sm" className="flex items-center gap-1">
                          <Camera className="h-4 w-4" />
                          Subir foto
                        </Button>
                      </label>
                      {profileImage && (
                        <Button variant="outline" type="button" size="sm" onClick={handleRemoveImage} className="flex items-center gap-1">
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input 
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellidos</Label>
                        <Input 
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía / Descripción Profesional</Label>
                      <Textarea 
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Escribe una breve descripción sobre ti o tu práctica profesional"
                        className="min-h-24"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono de contacto</Label>
                        <div className="flex">
                          <Phone className="h-5 w-5 text-muted-foreground mr-2 mt-2" />
                          <Input 
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+52 1 33 1234 5678"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <div className="flex">
                          <Mail className="h-5 w-5 text-muted-foreground mr-2 mt-2" />
                          <Input 
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección del consultorio</Label>
                      <div className="flex">
                        <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-2" />
                        <Input 
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Av. Chapultepec 123, Col. Americana, Guadalajara, Jalisco"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Especialidad (solo para médicos) */}
                {user.userType === "doctor" && (
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Especialidad Médica
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="specialtyId">Selecciona tu especialidad</Label>
                      <Select 
                        value={formData.specialtyId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, specialtyId: value }))}
                      >
                        <SelectTrigger id="specialtyId">
                          <SelectValue placeholder="Selecciona una especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map(specialty => (
                            <SelectItem key={specialty.id} value={specialty.id.toString()}>
                              {specialty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {/* Estatus de verificación (solo para médicos) */}
                {user.userType === "doctor" && userProfile && (
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Estado de verificación
                    </h3>
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-3">
                        {userProfile.verificationStatus === "approved" ? (
                          <>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                            <div>
                              <h4 className="font-medium">Perfil verificado</h4>
                              <p className="text-sm text-muted-foreground">Tu perfil médico ha sido verificado y aprobado.</p>
                            </div>
                          </>
                        ) : userProfile.verificationStatus === "rejected" ? (
                          <>
                            <XCircle className="h-8 w-8 text-red-500" />
                            <div>
                              <h4 className="font-medium">Verificación rechazada</h4>
                              <p className="text-sm text-muted-foreground">Por favor revisa los comentarios y sube nuevamente tus documentos.</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Clock className="h-8 w-8 text-yellow-500" />
                            <div>
                              <h4 className="font-medium">Verificación pendiente</h4>
                              <p className="text-sm text-muted-foreground">Tu solicitud está siendo revisada por nuestro equipo.</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {userProfile.verificationStatus === "pending" && (
                        <Button variant="outline" className="mt-4" onClick={() => {
                          // Navegar a la página de verificación
                          window.location.href = "/dashboard/doctor/verification";
                        }}>
                          Ver estado de documentos
                        </Button>
                      )}
                      
                      {userProfile.verificationStatus === "rejected" && (
                        <Button variant="outline" className="mt-4" onClick={() => {
                          // Navegar a la página de verificación para volver a subir documentos
                          window.location.href = "/dashboard/doctor/verification";
                        }}>
                          Subir documentos nuevamente
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile}>Guardar cambios</Button>
              </CardFooter>
            </Card>
          </TabsContent>
              
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Seguridad de la Cuenta</CardTitle>
                <CardDescription>
                  Gestiona la seguridad de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Contraseña
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Actualiza tu contraseña regularmente para mantener segura tu cuenta
                    </p>
                    <div className="mt-2 space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="current-password">Contraseña actual</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-password">Nueva contraseña</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    <Button onClick={handlePasswordChange}>Cambiar Contraseña</Button>
                  </div>
                  
                  <div className="pt-6 border-t space-y-4">
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Autenticación de Dos Factores
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Añade una capa extra de seguridad a tu cuenta
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Estado:</h4>
                        <Badge variant="outline" className="mt-1">No activado</Badge>
                      </div>
                      <Button variant="outline">Configurar 2FA</Button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t space-y-4">
                    <h3 className="text-base font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Sesiones activas
                    </h3>
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-medium">Este dispositivo</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Última actividad: {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Activo ahora
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Facturación y Suscripción</CardTitle>
                <CardDescription>
                  Gestiona tu plan de suscripción y métodos de pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Plan Actual
                  </h3>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium">
                          {subscriptionPlans.find(p => p.id === userSubscription.planId)?.name || "Plan Básico"}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Próxima facturación: {userSubscription.nextBillingDate}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {userSubscription.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Select onValueChange={handlePlanChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cambiar plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionPlans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.name} - ${plan.price}/mes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-6 border-t space-y-4">
                  <h3 className="text-base font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Método de Pago
                  </h3>
                  
                  {userSubscription.paymentMethod ? (
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                            {userSubscription.paymentMethod.brand === "visa" ? "VISA" : 
                              userSubscription.paymentMethod.brand === "mastercard" ? "MC" : 
                              userSubscription.paymentMethod.brand}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">
                              **** **** **** {userSubscription.paymentMethod.last4}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Expira: {userSubscription.paymentMethod.expiryMonth}/{userSubscription.paymentMethod.expiryYear}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handlePaymentMethodChange}>
                          Editar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border rounded-md">
                      <p className="text-muted-foreground mb-4">No hay métodos de pago registrados</p>
                      <Button variant="outline" onClick={handlePaymentMethodChange}>
                        Agregar método de pago
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 border-t space-y-4">
                  <h3 className="text-base font-medium">Historial de Facturación</h3>
                  
                  <div className="rounded-md border">
                    <div className="py-3 px-4 border-b bg-muted/50">
                      <div className="grid grid-cols-3 font-medium text-sm">
                        <div>Fecha</div>
                        <div>Importe</div>
                        <div>Estado</div>
                      </div>
                    </div>
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No hay facturas disponibles
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}