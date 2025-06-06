import { useState, useEffect } from "react";
import { useLocation, useSearch, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useDirectLogin } from "@/hooks/use-direct-login";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertUser, UserType, ProfessionalType, insertUserSchema } from "@shared/schema";
import { ExtendedUserType, ExtendedUserTypeValues, buildSubdomainUrl } from "@/lib/subdomain";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AlertOctagon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interfaz que define la estructura de una especialidad médica
interface Specialty {
  id: number;
  name: string;
  description: string;
}

// Extended schemas with validation
const loginSchema = z.object({
  username: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

const registerSchema = insertUserSchema.extend({
  passwordConfirm: z.string().min(1, "La confirmación de contraseña es requerida"),
  specialtyId: z.number().optional(),
  professionalType: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseFile: z.instanceof(File).optional(),
  identificationFile: z.instanceof(File).optional(),
  diplomaFile: z.instanceof(File).optional(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirm"],
}).refine(
  (data) => !data.userType || data.userType !== UserType.DOCTOR || (data.specialtyId && data.professionalType),
  {
    message: "Debe seleccionar un tipo de profesional y una especialidad",
    path: ["professionalType"],
  }
).refine(
  (data) => !data.userType || data.userType !== UserType.DOCTOR || (data.licenseNumber && data.licenseNumber.length > 5),
  {
    message: "Debe ingresar un número de licencia profesional válido",
    path: ["licenseNumber"],
  }
);

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, error } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [specialtiesList, setSpecialtiesList] = useState<Specialty[]>([]);
  const [authInfo, setAuthInfo] = useState<{visible: boolean, info: string}>({visible: false, info: ""});
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [, setLocation] = useLocation();
  
  // Obtener especialidades para el selector
  const { data: specialties, isLoading: loadingSpecialties } = useQuery({
    queryKey: ["/api/specialties"],
    enabled: activeTab === "register", // Solo hacer la consulta si estamos en el tab de registro
  });
  
  // Actualizar la lista de especialidades cuando cambian los datos
  useEffect(() => {
    if (specialties) {
      setSpecialtiesList(specialties as Specialty[]);
    }
  }, [specialties]);
  
  // Login form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Estados para los archivos a subir
  const [filesPreview, setFilesPreview] = useState<{
    license: string | null;
    identification: string | null;
    diploma: string | null;
  }>({
    license: null,
    identification: null,
    diploma: null,
  });

  // Register form setup
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
      firstName: "",
      lastName: "",
      userType: UserType.PATIENT,
      isActive: true,
      specialtyId: undefined,
      professionalType: undefined,
      licenseNumber: "",
      licenseFile: undefined,
      identificationFile: undefined,
      diplomaFile: undefined,
    }
  });
  
  // Observar el tipo de usuario para mostrar selector de especialidad si es médico
  const userType = registerForm.watch("userType");
  
  // Maneja el cambio en los parámetros de URL
  useEffect(() => {
    if (params.get("register") === "true") {
      setActiveTab("register");
      
      // Si viene con tipo de usuario preseleccionado, lo establecemos
      const userType = params.get("type");
      if (userType === "doctor") {
        registerForm.setValue("userType", UserType.DOCTOR);
      } else if (userType === "patient") {
        registerForm.setValue("userType", UserType.PATIENT);
      }
    }
  }, [params, registerForm]);

  // Redirect if already logged in
  // Redireccionar al dashboard si el usuario ya está autenticado
  useEffect(() => {
    if (user) {
      console.log("Usuario autenticado detectado:", user);
      console.log(`[Auth] Redirigiendo a usuario ${user.userType} al dashboard central`);
      
      // Forzar navegación directa con location.replace para evitar problemas con el historial
      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 300);
    }
  }, [user]);

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Función para manejar la carga de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'licenseFile' | 'identificationFile' | 'diplomaFile') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    // Actualizar el formulario
    registerForm.setValue(fieldName, file);
    
    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewType = fieldName === 'licenseFile' 
        ? 'license' 
        : fieldName === 'identificationFile' 
          ? 'identification' 
          : 'diploma';
      
      setFilesPreview(prev => ({
        ...prev,
        [previewType]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    // Remove passwordConfirm as it's not in the API schema
    const { passwordConfirm, licenseFile, identificationFile, diplomaFile, ...registerData } = data;
    
    // Validar que se haya seleccionado una especialidad para médicos
    if (registerData.userType === UserType.DOCTOR) {
      if (!registerData.specialtyId) {
        registerForm.setError("specialtyId", {
          type: "manual",
          message: "Debe seleccionar una especialidad"
        });
        return;
      }
      
      if (!registerData.professionalType) {
        registerForm.setError("professionalType", {
          type: "manual",
          message: "Debe seleccionar un tipo de profesional"
        });
        return;
      }
      
      if (!registerData.licenseNumber || registerData.licenseNumber.length < 5) {
        registerForm.setError("licenseNumber", {
          type: "manual",
          message: "Debe ingresar un número de cédula profesional válido"
        });
        return;
      }
      
      if (!licenseFile) {
        registerForm.setError("licenseFile", {
          type: "manual",
          message: "Debe cargar una imagen de su cédula profesional"
        });
        return;
      }
    }
    
    // Aquí deberíamos subir los archivos y obtener las URLs
    // Por ahora, solo enviamos los datos básicos
    registerMutation.mutate(registerData as InsertUser);
  };

  // Para depuración - eliminar en producción
  const debugAuth = () => {
    const cookie = document.cookie;
    console.log("==== DEPURACIÓN AUTENTICACIÓN ====");
    console.log("Cookies actuales:", cookie);
    console.log("Estado de autenticación:", user ? "Autenticado" : "No autenticado");
    console.log("Login pendiente:", loginMutation.isPending);
    console.log("Login error:", loginMutation.error);
    console.log("================================");
  };

  // Obtener el hook para login directo
  const { loginAsDoctor, loginAsPatient, loginAsAdmin, loginAsLab, isLoading: directLoginLoading } = useDirectLogin();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Column - Auth Forms */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-primary-600 text-3xl font-bold">
              MediConnect
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {activeTab === "login" ? "Iniciar Sesión" : "Crear una Cuenta"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {activeTab === "login" 
                ? "Ingresa tus credenciales para acceder" 
                : "Completa el formulario para registrarte"}
            </p>
            {/* Botón temporal para depuración */}
            <button
              type="button"
              onClick={debugAuth}
              className="text-xs text-primary-600 mt-2 underline"
            >
              Depurar Estado Autenticación
            </button>
          </div>

          {/* Alerta de solución temporal */}
          <Alert className="mb-4 border-amber-500">
            <AlertOctagon className="h-4 w-4 text-amber-500" />
            <AlertTitle>Inicio de sesión de emergencia</AlertTitle>
            <AlertDescription>
              Estamos experimentando problemas con la autenticación. Usa los botones de acceso directo para continuar con tu trabajo.
            </AlertDescription>
          </Alert>

          {/* Botones de acceso directo */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button 
              onClick={loginAsDoctor} 
              variant="outline" 
              disabled={directLoginLoading}
              className="border-blue-500 hover:bg-blue-50"
            >
              {directLoginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Acceder como Médico
            </Button>
            <Button 
              onClick={loginAsPatient} 
              variant="outline" 
              disabled={directLoginLoading}
              className="border-green-500 hover:bg-green-50"
            >
              {directLoginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Acceder como Paciente
            </Button>
            <Button 
              onClick={loginAsAdmin} 
              variant="outline" 
              disabled={directLoginLoading}
              className="border-purple-500 hover:bg-purple-50"
            >
              {directLoginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Acceder como Admin
            </Button>
            <Button 
              onClick={loginAsLab} 
              variant="outline" 
              disabled={directLoginLoading}
              className="border-amber-500 hover:bg-amber-50"
            >
              {directLoginLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Acceder como Laboratorio
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardContent className="pt-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu nombre de usuario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Tu contraseña" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                            Recordarme
                          </label>
                        </div>

                        <div className="text-sm">
                          <Link href="/auth/recuperar-password" className="font-medium text-primary-600 hover:text-primary-500">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando sesión...
                          </>
                        ) : (
                          "Iniciar Sesión"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        O continúa con
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" type="button">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button">
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardContent className="pt-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu nombre" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apellido</FormLabel>
                              <FormControl>
                                <Input placeholder="Tu apellido" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario</FormLabel>
                            <FormControl>
                              <Input placeholder="Elige un nombre de usuario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                              <Input placeholder="Tu correo electrónico" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Usuario</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona tipo de usuario" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={UserType.PATIENT}>Paciente</SelectItem>
                                <SelectItem value={UserType.DOCTOR}>Médico</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Campos adicionales para médicos */}
                      {userType === UserType.DOCTOR && (
                        <>
                          {/* Tipo de profesional */}
                          <FormField
                            control={registerForm.control}
                            name="professionalType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Profesional</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className={!field.value ? "text-muted-foreground" : ""}>
                                      <SelectValue placeholder="Selecciona tu tipo de profesional" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value={ProfessionalType.MEDICO}>Médico</SelectItem>
                                    <SelectItem value={ProfessionalType.DENTISTA}>Dentista</SelectItem>
                                    <SelectItem value={ProfessionalType.PSICOLOGO}>Psicólogo</SelectItem>
                                    <SelectItem value={ProfessionalType.NUTRIOLOGO}>Nutriólogo</SelectItem>
                                    <SelectItem value={ProfessionalType.FISIOTERAPEUTA}>Fisioterapeuta</SelectItem>
                                    <SelectItem value={ProfessionalType.OPTOMETRISTA}>Optometrista</SelectItem>
                                    <SelectItem value={ProfessionalType.OTRO}>Otro</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Especialidad */}
                          <FormField
                            control={registerForm.control}
                            name="specialtyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Especialidad</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                                  value={field.value?.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger className={!field.value ? "text-muted-foreground" : ""}>
                                      <SelectValue placeholder="Selecciona tu especialidad" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {loadingSpecialties ? (
                                      <div className="flex items-center justify-center p-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      </div>
                                    ) : specialtiesList.map((specialty) => (
                                      <SelectItem key={specialty.id} value={specialty.id.toString()}>
                                        {specialty.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Cédula profesional */}
                          <FormField
                            control={registerForm.control}
                            name="licenseNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número de Cédula Profesional</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ingresa tu número de cédula profesional" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Imagen de cédula profesional */}
                          <div className="space-y-2">
                            <Label htmlFor="licenseFile">Imagen de Cédula Profesional*</Label>
                            <Input
                              id="licenseFile"
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange(e, 'licenseFile')}
                              className="cursor-pointer"
                            />
                            {filesPreview.license && (
                              <div className="mt-2 border rounded p-2 relative">
                                <img 
                                  src={filesPreview.license} 
                                  alt="Vista previa de cédula" 
                                  className="w-full h-auto max-h-40 object-contain"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white"
                                  onClick={() => {
                                    setFilesPreview(prev => ({ ...prev, license: null }));
                                    registerForm.setValue('licenseFile', undefined);
                                  }}
                                >
                                  ✕
                                </Button>
                              </div>
                            )}
                            <FormMessage>
                              {registerForm.formState.errors.licenseFile?.message}
                            </FormMessage>
                          </div>

                          {/* Identificación oficial */}
                          <div className="space-y-2">
                            <Label htmlFor="identificationFile">Identificación Oficial</Label>
                            <Input
                              id="identificationFile"
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange(e, 'identificationFile')}
                              className="cursor-pointer"
                            />
                            {filesPreview.identification && (
                              <div className="mt-2 border rounded p-2 relative">
                                <img 
                                  src={filesPreview.identification} 
                                  alt="Vista previa de identificación" 
                                  className="w-full h-auto max-h-40 object-contain"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white"
                                  onClick={() => {
                                    setFilesPreview(prev => ({ ...prev, identification: null }));
                                    registerForm.setValue('identificationFile', undefined);
                                  }}
                                >
                                  ✕
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Título o diploma */}
                          <div className="space-y-2">
                            <Label htmlFor="diplomaFile">Título o Diploma Profesional</Label>
                            <Input
                              id="diplomaFile"
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleFileChange(e, 'diplomaFile')}
                              className="cursor-pointer"
                            />
                            {filesPreview.diploma && (
                              <div className="mt-2 border rounded p-2 relative">
                                <img 
                                  src={filesPreview.diploma} 
                                  alt="Vista previa de diploma" 
                                  className="w-full h-auto max-h-40 object-contain"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="icon" 
                                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white"
                                  onClick={() => {
                                    setFilesPreview(prev => ({ ...prev, diploma: null }));
                                    registerForm.setValue('diplomaFile', undefined);
                                  }}
                                >
                                  ✕
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="text-sm text-gray-500 mt-2 p-3 bg-gray-50 rounded-md">
                            <p>Importante: Tu perfil médico deberá ser validado por nuestro equipo antes de que puedas comenzar a usar todas las funciones de la plataforma.</p>
                          </div>
                        </>
                      )}
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Crea una contraseña" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="passwordConfirm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Repite tu contraseña" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          "Registrarse"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Al registrarte, aceptas nuestros{" "}
                    <Link href="/legal/terminos" className="text-primary-600 hover:text-primary-500">
                      Términos de Servicio
                    </Link>{" "}
                    y{" "}
                    <Link href="/legal/privacidad" className="text-primary-600 hover:text-primary-500">
                      Política de Privacidad
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right Column - Hero Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="h-full flex flex-col justify-center items-center px-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-6">
            Salud al alcance de todos
          </h1>
          <p className="text-primary-100 text-xl mb-8 max-w-lg">
            MediConnect te ofrece una plataforma médica basada en suscripción que permite tener acceso fácil, rápido y organizado a servicios de salud.
          </p>
          <img 
            src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
            alt="Médicos trabajando" 
            className="rounded-lg shadow-2xl max-w-md"
          />
        </div>
      </div>
    </div>
  );
}
