import axios from 'axios';

// Función para determinar la URL base del API
function getApiBaseUrl(): string {
  const currentHost = 'http://localhost:5000';
  const protocol = window.location.protocol;
  
  console.log(`Determinando URL base para API. Host actual: ${currentHost}`);
  
  // En producción, usar una URL absoluta basada en VITE_API_URL o el dominio principal
  if (import.meta.env.PROD) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log(`Modo producción. Usando URL base: ${baseUrl}`);
    return baseUrl;
  }
  
  // Verificar si estamos en un entorno Replit (.replit.app, .replit.dev, .repl.co)
  const isReplit = currentHost.includes('replit.app') || 
                  currentHost.includes('replit.dev') || 
                  currentHost.includes('.repl.co');
                  
  console.log(`Detectando entorno: isReplit=${isReplit}, currentHost=${currentHost}, origin=${window.location.origin}`);
  
  if (isReplit) {
    console.log(`Entorno Replit detectado: ${currentHost}`);
    
    // Manejo especial para Replit: identificar la estructura del dominio
    const parts = currentHost.split('.');
    
    // Tenemos que determinar si es un subdominio o el dominio principal de la app
    if (parts.length >= 3) {
      // Considerar casos especiales de subdominios de Replit
      const replitGenerated = parts[0].includes('-');
      
      // En Replit, SIEMPRE usar la URL actual completa para evitar problemas CORS
      // Comentamos esta transformación de subdominio a dominio base para mayor compatibilidad
      /*
      if (!replitGenerated && parts[0] !== 'www') {
        // Estamos en un subdominio como doctor.miapp.replit.app
        // Necesitamos usar el dominio principal: miapp.replit.app
        const baseHost = parts.slice(1).join('.');
        const baseUrl = `${protocol}//${baseHost}`;
        console.log(`Subdominio en Replit. URL base: ${baseUrl}`);
        return baseUrl;
      }
      */
      
      // Usar la URL actual completa en Replit para mayor compatibilidad
      console.log(`Usando URL origen actual en Replit: ${window.location.origin}`);
      return window.location.origin;
    }
    
    // En Replit pero no subdominio, usar el origen actual
    console.log(`Dominio principal en Replit. URL base: ${window.location.origin}`);
    return window.location.origin;
  }
  
  // En desarrollo local, simplemente usar el origen actual
  console.log(`Entorno local de desarrollo. URL base: ${window.location.origin}`);
  return window.location.origin;
}

// Cliente API usando axios
export const apiClient = axios.create({
  // baseURL: getApiBaseUrl(),
  baseURL: "http://localhost:5000",
  withCredentials: true, // Importante para enviar cookies en solicitudes cross-origin
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Ayuda a identificar solicitudes AJAX
  },
  // Timeout de 15 segundos para evitar esperas infinitas
  timeout: 15000,
  // Configuración explícita de CORS y cookies para entornos problemáticos
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Constante para localStorage
const LOCAL_STORAGE_AUTH_TOKEN_KEY = "mediconnect_auth_token";

// Función para recuperar el token de autenticación
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("[API] Error al recuperar token de localStorage:", error);
    return null;
  }
};

// Añadir interceptor para logging de peticiones y agregar token
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] Petición ${config.method?.toUpperCase()} a ${config.baseURL}${config.url}`);
    
    // Obtener token de localStorage y agregarlo a los headers si existe
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("token pa: ", token);
      console.log('[API] Token de autenticación agregado a la petición');
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);

// Añadir interceptor para logging de respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Respuesta de ${response.config.url}: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Error del servidor (códigos 4xx, 5xx)
      console.error(
        `[API] Error ${error.response.status} en ${error.config.url}:`, 
        error.response.data
      );
    } else if (error.request) {
      // No se recibió respuesta del servidor
      console.error(
        `[API] No hubo respuesta del servidor para ${error.config?.url}:`,
        error.message
      );
    } else {
      // Error al configurar la petición
      console.error('[API] Error en la configuración de la petición:', error.message);
    }
    
    // Pasar el error para que pueda ser manejado por el código que llamó
    return Promise.reject(error);
  }
);

// Funciones de ayuda para las operaciones comunes
export async function getRequest<T>(url: string): Promise<T> {
  const response = await apiClient.get<T>(url);
  return response.data;
}

export async function postRequest<T>(url: string, data: any): Promise<T> {
  const response = await apiClient.post<T>(url, data);
  return response.data;
}

export async function putRequest<T>(url: string, data: any): Promise<T> {
  const response = await apiClient.put<T>(url, data);
  return response.data;
}

export async function deleteRequest<T>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url);
  return response.data;
}

// Exportar también un cliente para uploads con FormData
export async function uploadFile<T>(url: string, formData: FormData): Promise<T> {
  const response = await apiClient.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}