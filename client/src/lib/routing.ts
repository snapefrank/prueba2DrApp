import { UserType, UserTypeValues } from "@shared/schema";

// Rutas accesibles sin autenticación
export const PUBLIC_ROUTES = [
  "/auth-page",
  "/registro",
  "/planes",
  "/contacto",
  "/especialidades",
  "/",
];

// Rutas del dashboard para diferentes tipos de usuario
export const DOCTOR_ROUTES = [
  "/dashboard",
  "/dashboard/pacientes",
  "/dashboard/agenda",
  "/dashboard/expedientes",
  "/dashboard/consulta",
  "/dashboard/laboratorio",
  "/dashboard/mensajes",
  "/dashboard/perfil",
  "/dashboard/configuracion",
  "/dashboard/tareas",
];

export const PATIENT_ROUTES = [
  "/dashboard",
  "/dashboard/doctores",
  "/dashboard/citas",
  "/dashboard/expediente",
  "/dashboard/mensajes",
  "/dashboard/perfil",
  "/dashboard/configuracion",
  "/dashboard/pagos",
];

export const ADMIN_ROUTES = [
  "/dashboard",
  "/dashboard/usuarios",
  "/dashboard/doctores",
  "/dashboard/pacientes",
  "/dashboard/reportes",
  "/dashboard/configuracion",
  "/dashboard/verificaciones",
];

export const LAB_ROUTES = [
  "/dashboard",
  "/dashboard/estudios",
  "/dashboard/resultados",
  "/dashboard/doctores",
  "/dashboard/pacientes",
  "/dashboard/configuracion",
];

// Función para verificar si una ruta es pública
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
}

// Función para verificar si una ruta es accesible para un tipo de usuario
export function isRouteAccessibleForUser(path: string, userType: UserTypeValues): boolean {
  switch (userType) {
    case UserType.DOCTOR:
      return DOCTOR_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
    case UserType.PATIENT:
      return PATIENT_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
    case UserType.ADMIN:
      return ADMIN_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
    case UserType.LABORATORY:
      return LAB_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
    default:
      return false;
  }
}

// Función para obtener la ruta de inicio del dashboard según el tipo de usuario
export function getDashboardHomeForUserType(userType: UserTypeValues): string {
  switch (userType) {
    case UserType.DOCTOR:
      return "/dashboard";
    case UserType.PATIENT:
      return "/dashboard";
    case UserType.ADMIN:
      return "/dashboard";
    case UserType.LABORATORY:
      return "/dashboard";
    default:
      return "/dashboard";
  }
}