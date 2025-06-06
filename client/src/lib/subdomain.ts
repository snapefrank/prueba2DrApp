// Importamos UserType y definimos el tipo de valor
import { UserType } from "@shared/schema";
import type { UserTypeValues } from "@shared/schema";

// Ya no necesitamos un tipo extendido ya que "laboratory" está incluido en UserType
export const ExtendedUserType = {
  ...UserType
} as const;

// Mantenemos el tipo ExtendedUserTypeValues por compatibilidad
export type ExtendedUserTypeValues = UserTypeValues;

// Definición de subdominios disponibles
export const SUBDOMAINS = {
  WWW: 'www',
  MEDICOS: 'doctor',
  PACIENTES: 'patient',
  ADMIN: 'admin',
  LABS: 'laboratory'
};

/**
 * Obtiene el subdominio actual de la URL
 * @returns El subdominio actual o 'www' si no hay subdominio
 */
export function getCurrentSubdomain(): string {
  try {
    const hostname = window.location.hostname;
    console.log(`Detectando subdominio. Hostname actual: ${hostname}`);
    
    // En desarrollo, usar parámetro de URL para pruebas
    if (import.meta.env.DEV) {
      const urlParams = new URLSearchParams(window.location.search);
      const testSubdomain = urlParams.get('subdomain');
      if (testSubdomain && Object.values(SUBDOMAINS).includes(testSubdomain)) {
        console.log(`Usando subdominio de parámetro URL: ${testSubdomain}`);
        return testSubdomain;
      }
    }
    
    // Si es localhost o IP, retornar 'www'
    if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      console.log('Detectado localhost o IP, usando subdominio www');
      return SUBDOMAINS.WWW;
    }
    
    // Detectar si estamos en Replit
    const isReplit = hostname.includes('.replit.app') || 
                     hostname.includes('.replit.dev') || 
                     hostname.includes('.repl.co');
    
    const hostParts = hostname.split('.');
    console.log(`Partes del hostname: ${JSON.stringify(hostParts)}`);
    
    if (isReplit) {
      console.log(`Detectado entorno Replit: ${hostname}`);
      
      // Detectar casos especiales de Replit
      const isReplitGenerated = hostParts[0].includes('-');
      
      // Si es un ID generado por Replit (como e672b065-...), usar www
      if (isReplitGenerated) {
        console.log('Detectado ID generado por Replit, usando subdominio www');
        return SUBDOMAINS.WWW;
      }
      
      // Si es un subdominio válido en Replit
      if (hostParts.length >= 3) {
        const subdomain = hostParts[0];
        const validSubdomains = Object.values(SUBDOMAINS);
        
        if (validSubdomains.includes(subdomain)) {
          console.log(`Subdominio válido en Replit: ${subdomain}`);
          return subdomain;
        } else {
          console.log(`Subdominio no reconocido en Replit: ${subdomain}, usando www`);
          return SUBDOMAINS.WWW;
        }
      }
    }
    
    // Para otros casos (producción o desarrollo no-Replit)
    if (hostParts.length >= 3) {
      const subdomain = hostParts[0];
      
      // Verificar si es un subdominio válido
      const validSubdomains = Object.values(SUBDOMAINS);
      if (validSubdomains.includes(subdomain)) {
        console.log(`Subdominio válido: ${subdomain}`);
        return subdomain;
      }
    }
    
    // Por defecto, usar 'www'
    console.log('Usando subdominio por defecto: www');
    return SUBDOMAINS.WWW;
  } catch (error) {
    console.error('Error en getCurrentSubdomain:', error);
    // En caso de error, devolver 'www' como subdominio seguro por defecto
    return SUBDOMAINS.WWW;
  }
}

/**
 * Obtiene el subdominio por defecto para un tipo de usuario
 * @param userType Tipo de usuario
 * @returns El subdominio apropiado para el tipo de usuario
 */
export function getDefaultSubdomainForUserType(userType: UserTypeValues | string): string {
  switch (userType) {
    case UserType.DOCTOR:
    case "specialist": // Tratar especialistas como doctores para compatibilidad
      return SUBDOMAINS.MEDICOS;
      
    case UserType.PATIENT:
      return SUBDOMAINS.PACIENTES;
      
    case UserType.ADMIN:
      return SUBDOMAINS.ADMIN;
      
    case UserType.LABORATORY: // Caso para el tipo LABORATORY
      return SUBDOMAINS.LABS;
      
    default:
      console.log(`Tipo de usuario no reconocido para subdominio: ${userType}, usando www`);
      return SUBDOMAINS.WWW;
  }
}

/**
 * Construye una URL completa para un subdominio y ruta específicos
 * @param subdomain El subdominio deseado
 * @param path La ruta deseada (debe comenzar con /)
 * @returns URL completa con el subdominio
 */
export function buildSubdomainUrl(subdomain: string, path: string = '/'): string {
  try {
    console.log(`Construyendo URL para subdominio: ${subdomain}, path: ${path}`);
    
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Asegurar que el path comienza con una sola barra
    if (path && !path.startsWith('/')) {
      path = '/' + path;
    }
    // Eliminar dobles barras en el path si existen
    path = path.replace(/\/\//g, '/');
    
    // Manejo específico para entorno de desarrollo
    if (import.meta.env.DEV) {
      console.log(`Estamos en entorno de desarrollo`);
      // En desarrollo, solo cambiar el parámetro de URL para simular subdominios
      const url = new URL(window.location.href);
      url.pathname = path;
      url.searchParams.set('subdomain', subdomain);
      const finalUrl = url.toString();
      console.log(`URL de desarrollo construida: ${finalUrl}`);
      return finalUrl;
    }
    
    // Para Replit específicamente - construir URL de subdominio real
    if (hostname.includes('.repl.co') || hostname.includes('.replit.app') || hostname.includes('.replit.dev')) {
      console.log(`Entorno de Replit detectado: ${hostname}`);
      
      // En Replit, necesitamos manejar varios casos especiales
      const parts = hostname.split('.');
      console.log(`Partes del hostname: ${JSON.stringify(parts)}`);
      
      // Detectar si estamos en una URL generada por Replit (e672b065-...)
      const isReplitGenerated = parts[0].includes('-');
      
      // Si es un ID generado por Replit, no podemos usar subdominios reales
      // En este caso, usamos parámetros de URL (como en desarrollo)
      if (isReplitGenerated) {
        console.log('URL generada por Replit, usando parámetros de URL para simular subdominios');
        const url = new URL(window.location.href);
        url.pathname = path;
        url.searchParams.set('subdomain', subdomain);
        const finalUrl = url.toString();
        console.log(`URL de Replit con parámetros construida: ${finalUrl}`);
        return finalUrl;
      }
      
      // Si no es una URL generada y tenemos estructura normal de subdominio
      if (parts.length >= 3) {
        // Reemplazar el primer segmento (subdominio actual) con el nuevo
        parts[0] = subdomain;
        const newHost = parts.join('.');
        const finalUrl = `${protocol}//${newHost}${path}`;
        console.log(`URL de Replit construida: ${finalUrl}`);
        return finalUrl;
      } else {
        // Caso improbable: Replit sin al menos 3 segmentos
        const finalUrl = `${protocol}//${subdomain}.${hostname}${path}`;
        console.log(`URL de Replit (caso especial) construida: ${finalUrl}`);
        return finalUrl;
      }
    }
    
    // Para entorno de producción - crear URL directa al dashboard (sin parámetros)
    console.log(`Construyendo URL directa para producción`);
    
    if (path === '/dashboard' || path.startsWith('/dashboard/')) {
      // Si estamos yendo al dashboard, usar URL absoluta del dashboard para el subdominio
      return `${protocol}//${subdomain}.midominio.com${path}`;
    } else {
      // Para otras rutas, usar la estructura normal de subdominio
      console.log(`Construyendo URL para producción con hostname: ${hostname}`);
      const hostParts = hostname.split('.');
      
      // Construcción de la URL con subdominio
      if (hostParts.length >= 3) {
        // Si ya tiene un subdominio, reemplazarlo
        console.log(`Reemplazando subdominio existente ${hostParts[0]} con ${subdomain}`);
        hostParts[0] = subdomain;
      } else if (hostParts.length === 2) {
        // Si no tiene subdominio, añadirlo
        console.log(`Añadiendo subdominio ${subdomain} a ${hostname}`);
        hostParts.unshift(subdomain);
      } else {
        console.log(`Caso especial: hostParts tiene ${hostParts.length} elementos`);
        // Caso especial, solo añadir subdominio
        return `${protocol}//${subdomain}.${hostname}${path}`;
      }
      
      const finalUrl = `${protocol}//${hostParts.join('.')}${path}`;
      console.log(`URL producción construida: ${finalUrl}`);
      return finalUrl;
    }
  } catch (error) {
    console.error('Error al construir URL con subdominio:', error);
    // En caso de error, devolver una URL por defecto segura
    return `${window.location.protocol}//${window.location.host}${path}`;
  }
}

/**
 * Redirecciona al usuario al subdominio apropiado basado en el tipo de usuario
 * @param userType Tipo de usuario
 * @param path Ruta a la que redirigir (por defecto /)
 * @param forcedRedirect Si es true, fuerza la redirección aunque el usuario esté en el subdominio WWW
 */
export function redirectToUserSubdomain(userType: UserTypeValues | string, path = '/', forcedRedirect = false): void {
  try {
    console.log(`Evaluando redirección para usuario de tipo ${userType} a ruta ${path}`);
    const targetSubdomain = getDefaultSubdomainForUserType(userType);
    console.log(`Subdominio recomendado: ${targetSubdomain}`);
    const currentSubdomain = getCurrentSubdomain();
    console.log(`Subdominio actual: ${currentSubdomain}`);
    
    // Comportamiento modificado: 
    // 1. Si se ha especificado forzar la redirección explícitamente, entonces redirigir
    // 2. En WWW, nunca redirigir a un subdominio específico (es universal)
    // 3. Si estamos en otro subdominio pero no es forzado, nos quedamos donde estamos
    
    // Solo redirigir si se ha especificado explicitamente forzar la redirección
    if (forcedRedirect) {
      console.log(`Redirección FORZADA solicitada explícitamente para ir al subdominio ${targetSubdomain}`);
      
      const targetUrl = buildSubdomainUrl(targetSubdomain, path);
      console.log(`Redirigiendo a: ${targetUrl}`);
      
      // Analizar el entorno actual
      const isDevMode = import.meta.env.DEV;
      const hostname = window.location.hostname;
      const isReplit = hostname.includes('.replit.app') || 
                       hostname.includes('.replit.dev') || 
                       hostname.includes('.repl.co');
      const hostParts = hostname.split('.');
      const isReplitGenerated = hostParts.length > 0 && hostParts[0].includes('-');
      
      // Estrategia para entorno de desarrollo local o URL generada por Replit
      if (isDevMode && !isReplit || (isReplit && isReplitGenerated)) {
        try {
          console.log(`Usando estrategia con parámetros: ${isDevMode ? 'desarrollo local' : 'URL generada por Replit'}`);
          // Usar history.pushState para evitar recargar la página en desarrollo local
          const url = new URL(window.location.href);
          url.pathname = path;
          url.searchParams.set('subdomain', targetSubdomain);
          window.history.pushState({}, '', url.toString());
          // Forzar una recarga para que React actualice la interfaz basada en la nueva URL
          window.location.reload();
        } catch (error) {
          console.error(`Error en redirección con parámetros:`, error);
          // Fallback seguro en caso de error - ya no redirigimos por defecto
          console.warn('Error al cambiar subdominios. No se realizará redirección automática');
        }
      } 
      // Estrategia para Replit (sin ID generado) y producción: redirección completa
      else {
        console.log(`Redirigiendo a URL completa: ${targetUrl}`);
        
        // En Replit y producción, necesitamos una redirección completa a la nueva URL con subdominio
        // El uso de replace en lugar de href proporciona una mejor experiencia de navegación
        window.location.replace(targetUrl);
      }
    } else {
      // CAMBIO IMPORTANTE: Solo navegamos a la ruta sin cambiar de subdominio
      console.log(`Permaneciendo en el subdominio actual ${currentSubdomain}, navegando a la ruta ${path}`);
      // Solo cambiamos la ruta, manteniendo el subdominio actual
      if (path && path !== window.location.pathname) {
        window.location.pathname = path;
      } else {
        console.log('Ya estamos en la ruta correcta, no es necesario navegar');
      }
    }
  } catch (error) {
    console.error('Error en redirectToUserSubdomain:', error);
    // Fallback de seguridad para evitar que la app se bloquee
    console.warn('Error detectado pero NO se realizará redirección automática');
    // Ya no redirigimos automáticamente ante un error
  }
}

/**
 * Devuelve el parámetro de URL para el subdominio basado en el rol del usuario
 * @param role Rol del usuario
 * @returns Parámetro de URL con el subdominio ("?subdomain=doctor", etc.)
 */
export function getSubdomainByRole(role: UserTypeValues | string): string {
  switch (role) {
    case UserType.DOCTOR:
    case "specialist":
      return "?subdomain=doctor";
    case UserType.PATIENT:
      return "?subdomain=patient";
    case UserType.ADMIN:
      return "?subdomain=admin";
    case UserType.LABORATORY:
      return "?subdomain=laboratory";
    default:
      return "";
  }
}

/**
 * Verifica si un tipo de usuario tiene acceso a un subdominio específico
 * @param userType Tipo de usuario
 * @param subdomain Subdominio a verificar
 * @returns true si tiene acceso, false si no
 */
export function hasAccessToSubdomain(userType: UserTypeValues | string, subdomain: string): boolean {
  const defaultSubdomain = getDefaultSubdomainForUserType(userType);
  
  // Todos los usuarios pueden acceder al subdominio www
  if (subdomain === SUBDOMAINS.WWW) {
    return true;
  }
  
  // Verificar si el subdominio coincide con el predeterminado para el tipo de usuario
  return subdomain === defaultSubdomain;
}

/**
 * Crea un enlace interno que preserva el subdominio actual
 * Útil para la navegación dentro de un dashboard específico
 * @param path La ruta a la que se desea navegar (debe empezar con /)
 * @returns La ruta completa con el parámetro de subdominio actual
 */
export function createInternalLink(path: string): string {
  try {
    const currentSubdomain = getCurrentSubdomain();
    
    // Asegurar que el path comienza con una barra
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Determinar el entorno para aplicar la estrategia correcta
    const isDevMode = import.meta.env.DEV;
    const hostname = window.location.hostname;
    const isReplit = hostname.includes('.replit.app') || hostname.includes('.replit.dev') || hostname.includes('.repl.co');
    
    // Detectar si es una instancia generada por Replit (contiene guiones en el primer segmento)
    const hostParts = hostname.split('.');
    const isReplitGenerated = hostParts.length > 0 && hostParts[0].includes('-');
    
    // En desarrollo local o en Replit con URL generada, usar parámetros en URL
    if (isDevMode || isReplitGenerated) {
      console.log(`Creando enlace interno con parámetros para ${path}. Hostname: ${hostname}, isReplit: ${isReplit}, isReplitGenerated: ${isReplitGenerated}`);
      // Verificar si la URL ya tiene parámetros
      if (path.includes('?')) {
        return `${path}&subdomain=${currentSubdomain}`;
      } else {
        return `${path}?subdomain=${currentSubdomain}`;
      }
    }
    
    // En producción o subdominio real de Replit, simplemente devolver la ruta
    // ya que los subdominios se manejan por DNS
    console.log(`Creando enlace interno sin parámetros para ${path}. Hostname: ${hostname}`);
    return path;
  } catch (error) {
    console.error('Error en createInternalLink:', error);
    // En caso de error, devolver la ruta original como fallback seguro
    return path;
  }
}