import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getRequest, postRequest, putRequest, deleteRequest } from "./apiClient";

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const url = queryKey[0] as string;
      return await getRequest<T>(url);
    } catch (error: any) {
      // Si el error es 401 y la opción es returnNull, retornamos null
      if (unauthorizedBehavior === "returnNull" && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  };

/**
 * Función de utilidad para realizar peticiones API - usada principalmente por mutaciones
 * @param method - Método HTTP a utilizar
 * @param url - URL relativa de la API
 * @param data - Datos a enviar en el cuerpo de la petición
 * @returns Respuesta de la API
 */
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<T> {
  switch (method) {
    case 'GET':
      return getRequest<T>(url);
    case 'POST':
      return postRequest<T>(url, data);
    case 'PUT':
      return putRequest<T>(url, data);
    case 'DELETE':
      return deleteRequest<T>(url);
    default:
      throw new Error(`Método HTTP no soportado: ${method}`);
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      onError: (error) => {
        console.error('React-Query error:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        if ('response' in (error as any)) {
          console.error('API Response error:', (error as any).response);
        }
        if ('request' in (error as any)) {
          console.error('API Request details:', (error as any).request);
        }
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        if ('response' in (error as any)) {
          console.error('API Response error:', (error as any).response);
        }
        if ('request' in (error as any)) {
          console.error('API Request details:', (error as any).request);
        }
      },
    },
  },
});
