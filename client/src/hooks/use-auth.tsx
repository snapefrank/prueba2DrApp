import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser, UserType } from "@shared/schema";
import { getQueryFn, queryClient } from "../lib/queryClient";
import { getRequest, postRequest } from "../lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { getDefaultSubdomainForUserType, buildSubdomainUrl, SUBDOMAINS, getCurrentSubdomain } from "@/lib/subdomain";

// Constantes para localStorage
const LOCAL_STORAGE_USER_KEY = "mediconnect_user";
const LOCAL_STORAGE_AUTH_TOKEN_KEY = "mediconnect_auth_token";

// Tipo para la respuesta de autenticación (nos da flexibilidad para manejar token)
interface AuthResponse {
  user: User;
  token?: string;
}

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, InsertUser>;
};

type LoginData = {
  username: string;
  password: string;
};

// Funciones auxiliares para localStorage
const saveUserToLocalStorage = (user: User, token?: string) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    if (token) {
      localStorage.setItem(LOCAL_STORAGE_AUTH_TOKEN_KEY, token);
    }
    console.log("[Auth] Usuario guardado en localStorage:", user.username);
  } catch (error) {
    console.error("[Auth] Error al guardar usuario en localStorage:", error);
  }
};

const removeUserFromLocalStorage = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
    console.log("[Auth] Usuario eliminado de localStorage");
  } catch (error) {
    console.error("[Auth] Error al eliminar usuario de localStorage:", error);
  }
};

const getUserFromLocalStorage = (): User | null => {
  try {
    const userJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error("[Auth] Error al recuperar usuario de localStorage:", error);
    return null;
  }
};

const getTokenFromLocalStorage = (): string | null => {
  try {
    return localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("[Auth] Error al recuperar token de localStorage:", error);
    return null;
  }
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Cargar datos iniciales desde localStorage
  const savedUser = getUserFromLocalStorage();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    initialData: savedUser, // Usar datos guardados como initialData
  });
  
  // Verificar y mantener la coherencia entre el usuario y el subdominio
  // Ahora solo registramos información pero NO hacemos redirecciones automáticas
  useEffect(() => {
    // Solo se ejecuta si hay un usuario autenticado
    if (user) {
      // Obtener el subdominio actual usando la función centralizada
      const currentSubdomain = getCurrentSubdomain();
      
      console.log(`[AuthProvider] Usuario: ${user.username}, Tipo: ${user.userType}, Subdominio actual: ${currentSubdomain}`);
      
      // Obtener el subdominio que corresponde al tipo de usuario
      const expectedSubdomain = getDefaultSubdomainForUserType(user.userType);
      
      // Solo registramos en consola, pero NO redirigimos automáticamente
      // La navegación a subdominios ahora es explícita a través de botones en la UI
      if (currentSubdomain !== expectedSubdomain && 
          currentSubdomain !== SUBDOMAINS.WWW) {
        console.log(`[AuthProvider] NOTA: Subdominio actual (${currentSubdomain}) diferente del esperado para el rol (${expectedSubdomain}). Pero no se hará redirección automática.`);
      }
    }
  }, [user]);

  // Versión mejorada del login con mejor manejo de errores
  const loginMutation = useMutation<AuthResponse, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      try {
        console.log("[Auth] Intentando login con usuario:", credentials.username);
        
        // Primero probar con la ruta estándar, si falla, intentar con /api/auth/login
        try {
          // Intentamos obtener la respuesta que contiene user y potencialmente token
          const response = await postRequest<AuthResponse | User>("/api/login", credentials);
          console.log("[Auth] Respuesta exitosa de /api/login:", response);
          
          // Convertimos la respuesta al formato AuthResponse
          if ('user' in response && response.user) {
            // La API ya devuelve un formato {user, token}
            return response as AuthResponse;
          } else {
            // La API devuelve solo el usuario sin token
            return { user: response as User };
          }
        } catch (error) {
          console.log("[Auth] Intentando con ruta alternativa /api/auth/login");
          const response = await postRequest<AuthResponse | User>("/api/auth/login", credentials);
          console.log("[Auth] Respuesta exitosa de /api/auth/login:", response);
          
          // Convertimos la respuesta al formato AuthResponse
          if ('user' in response && response.user) {
            // La API ya devuelve un formato {user, token}
            return response as AuthResponse;
          } else {
            // La API devuelve solo el usuario sin token
            return { user: response as User };
          }
        }
      } catch (err: any) {
        console.error("[Auth] Error de inicio de sesión:", err);
        
        // Crear un mensaje de error más descriptivo
        let errorMessage = "Error de autenticación";
        
        if (err.response) {
          const status = err.response.status;
          errorMessage = `Error ${status}: `;
          
          if (status === 401) {
            errorMessage += "Credenciales incorrectas";
          } else if (status === 403) {
            errorMessage += "No tienes permisos para acceder";
          } else if (status === 404) {
            errorMessage += "Recurso no encontrado";
          } else if (status === 500) {
            errorMessage += "Error interno del servidor";
          } else {
            errorMessage += err.response.data?.message || "Error desconocido";
          }
        } else if (err.request) {
          errorMessage = "No se recibió respuesta del servidor";
        } else {
          errorMessage = err.message || "Error desconocido";
        }
        
        // Lanzar un nuevo error con mensaje descriptivo
        throw new Error(errorMessage);
      }
    },
    onSuccess: (response: AuthResponse) => {
      const { user, token = "" } = response;
      
      // Establecer datos del usuario en caché
      queryClient.setQueryData(["/api/user"], user);
      
      // Guardar usuario en localStorage
      saveUserToLocalStorage(user, token);
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.firstName}!`,
      });
      
      console.log("[Auth] Login exitoso. Usuario:", user);
      
      // Usamos setTimeout para dar tiempo a que el toast se muestre
      setTimeout(() => {
        try {
          // Obtenemos el subdominio actual
          const currentSubdomain = getCurrentSubdomain();
          // Si ya estamos en un subdominio, mantener al usuario donde está
          if (currentSubdomain === SUBDOMAINS.WWW) {
            // Si estamos en el subdominio principal (www), redirigir a la página principal
            console.log(`[Login] Manteniendo al usuario en subdominio www y redirigiendo a /dashboard`);
            window.location.href = '/dashboard';
          } else {
            // Redirigir al dashboard manteniendo el mismo subdominio
            console.log(`[Login] Manteniendo el subdominio actual (${currentSubdomain}) y redirigiendo a /dashboard`);
            window.location.pathname = '/dashboard';
          }
        } catch (error) {
          console.error('[Login] Error en redirección:', error);
          // Fallback seguro en caso de error
          window.location.href = '/dashboard';
        }
      }, 800);
    },
    onError: (error: Error) => {
      console.error("[Auth] Error en mutación login:", error);
      
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
    },
  });

  // Versión mejorada del registro con mejor manejo de errores
  const registerMutation = useMutation<AuthResponse, Error, InsertUser>({
    mutationFn: async (userData: InsertUser) => {
      try {
        console.log("[Auth] Intentando registro de usuario:", userData.username);
        
        // Primero probar con la ruta estándar, si falla, intentar con /api/auth/register
        try {
          const response = await postRequest<AuthResponse | User>("/api/register", userData);
          console.log("[Auth] Respuesta exitosa de /api/register:", response);
          
          // Convertimos la respuesta al formato AuthResponse
          if ('user' in response && response.user) {
            // La API ya devuelve un formato {user, token}
            return response as AuthResponse;
          } else {
            // La API devuelve solo el usuario sin token
            return { user: response as User };
          }
        } catch (error) {
          console.log("[Auth] Intentando con ruta alternativa /api/auth/register");
          const response = await postRequest<AuthResponse | User>("/api/auth/register", userData);
          console.log("[Auth] Respuesta exitosa de /api/auth/register:", response);
          
          // Convertimos la respuesta al formato AuthResponse
          if ('user' in response && response.user) {
            // La API ya devuelve un formato {user, token}
            return response as AuthResponse;
          } else {
            // La API devuelve solo el usuario sin token
            return { user: response as User };
          }
        }
      } catch (err: any) {
        console.error("[Auth] Error de registro:", err);
        
        // Crear un mensaje de error más descriptivo
        let errorMessage = "Error de registro";
        
        if (err.response) {
          const status = err.response.status;
          errorMessage = `Error ${status}: `;
          
          if (status === 400) {
            errorMessage += err.response.data?.message || "Datos de registro inválidos";
          } else if (status === 409) {
            errorMessage += "Usuario o correo ya existen";
          } else if (status === 500) {
            errorMessage += "Error interno del servidor";
          } else {
            errorMessage += err.response.data?.message || "Error desconocido";
          }
        } else if (err.request) {
          errorMessage = "No se recibió respuesta del servidor";
        } else {
          errorMessage = err.message || "Error desconocido";
        }
        
        // Lanzar un nuevo error con mensaje descriptivo
        throw new Error(errorMessage);
      }
    },
    onSuccess: (response: AuthResponse) => {
      const { user, token = "" } = response;
      
      // Establecer datos del usuario en caché
      queryClient.setQueryData(["/api/user"], user);
      
      // Guardar usuario en localStorage
      saveUserToLocalStorage(user, token);
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${user.firstName}!`,
      });
      
      console.log("[Auth] Registro exitoso. Usuario:", user);
      
      // Usamos setTimeout para dar tiempo a que el toast se muestre
      setTimeout(() => {
        try {
          // Obtenemos el subdominio actual
          const currentSubdomain = getCurrentSubdomain();
          // Si ya estamos en un subdominio, mantener al usuario donde está
          if (currentSubdomain === SUBDOMAINS.WWW) {
            // Si estamos en el subdominio principal (www), redirigir a la página principal
            console.log(`[Registro] Manteniendo al usuario en subdominio www y redirigiendo a /dashboard`);
            window.location.href = '/dashboard';
          } else {
            // Redirigir al dashboard manteniendo el mismo subdominio
            console.log(`[Registro] Manteniendo el subdominio actual (${currentSubdomain}) y redirigiendo a /dashboard`);
            window.location.pathname = '/dashboard';
          }
        } catch (error) {
          console.error('[Registro] Error en redirección:', error);
          // Fallback seguro en caso de error
          window.location.href = '/dashboard';
        }
      }, 800);
    },
    onError: (error: Error) => {
      console.error("[Auth] Error en mutación de registro:", error);
      
      toast({
        title: "Error al registrarse",
        description: error.message || "No se pudo completar el registro",
        variant: "destructive",
      });
    },
  });

  // Versión mejorada del logout con mejor manejo de errores
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        console.log("[Auth] Iniciando proceso de logout");
        
        // Primero probar con la ruta estándar, si falla, intentar con /api/auth/logout
        try {
          await postRequest<void>("/api/logout", {});
          console.log("[Auth] Logout exitoso usando /api/logout");
        } catch (error) {
          console.log("[Auth] Intentando con ruta alternativa /api/auth/logout");
          await postRequest<void>("/api/auth/logout", {});
          console.log("[Auth] Logout exitoso usando /api/auth/logout");
        }
      } catch (err: any) {
        console.error("[Auth] Error al cerrar sesión:", err);
        
        // Crear un mensaje de error más descriptivo
        let errorMessage = "Error al cerrar sesión";
        
        if (err.response) {
          const status = err.response.status;
          errorMessage = `Error ${status}: `;
          
          if (status === 401) {
            errorMessage += "No hay sesión activa";
          } else if (status === 500) {
            errorMessage += "Error interno del servidor";
          } else {
            errorMessage += err.response.data?.message || "Error desconocido";
          }
        } else if (err.request) {
          errorMessage = "No se recibió respuesta del servidor";
        } else {
          errorMessage = err.message || "Error desconocido";
        }
        
        // A pesar del error, vamos a limpiar la sesión en el cliente para evitar bloqueos
        console.log("[Auth] Forzando cierre de sesión en cliente a pesar del error");
        queryClient.setQueryData(["/api/user"], null);
        
        // Lanzar un nuevo error con mensaje descriptivo
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Limpiar datos de usuario en caché
      queryClient.setQueryData(["/api/user"], null);
      
      // Eliminar usuario y token de localStorage
      removeUserFromLocalStorage();
      
      // Cerrar la conexión WebSocket si existe
      if (typeof window !== 'undefined' && window._chatWebSocket) {
        console.log("[Auth] Cerrando conexión WebSocket al hacer logout");
        if (window._chatWebSocket.readyState === window._chatWebSocket.OPEN) {
          window._chatWebSocket.close(1000, "Logout");
        }
        window._chatWebSocket = null;
        window._chatWebSocketConnected = false;
        window._chatWebSocketUserId = null;
      }
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
      console.log("[Auth] Logout exitoso, redirigiendo al inicio");
      
      // Redirección al home del dominio principal
      setTimeout(() => {
        try {
          // Redirigir a la página principal en el subdominio www
          const redirectUrl = buildSubdomainUrl(SUBDOMAINS.WWW, '/');
          window.location.href = redirectUrl;
        } catch (error) {
          console.error('[Logout] Error en redirección:', error);
          // Fallback seguro en caso de error
          window.location.href = '/?subdomain=www';
        }
      }, 800);
    },
    onError: (error: Error) => {
      console.error("[Auth] Error en mutación de logout:", error);
      
      // A pesar del error, eliminar datos locales
      removeUserFromLocalStorage();
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
      
      // Redirigir al inicio de todos modos para evitar bloqueos de sesión
      setTimeout(() => {
        window.location.href = '/?subdomain=www';
      }, 1500);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null, // Garantizar que user es User | null, nunca undefined
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}