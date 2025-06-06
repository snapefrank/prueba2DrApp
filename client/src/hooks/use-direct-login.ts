import { useState } from 'react';
import { UserType, User } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getDefaultSubdomainForUserType, buildSubdomainUrl } from '@/lib/subdomain';

const mockDoctor: User = {
  id: 1,
  username: 'doctorprueba',
  password: 'encriptada',
  email: 'doctor@ejemplo.com',
  firstName: 'Doctor',
  lastName: 'Prueba',
  userType: UserType.DOCTOR,
  isActive: true,
  createdAt: new Date(),
  profileImage: null
};

const mockPatient: User = {
  id: 2,
  username: 'pacienteprueba',
  password: 'encriptada',
  email: 'paciente@ejemplo.com',
  firstName: 'Paciente',
  lastName: 'Prueba',
  userType: UserType.PATIENT,
  isActive: true,
  createdAt: new Date(),
  profileImage: null
};

const mockAdmin: User = {
  id: 3,
  username: 'adminprueba',
  password: 'encriptada',
  email: 'admin@ejemplo.com',
  firstName: 'Admin',
  lastName: 'Prueba',
  userType: UserType.ADMIN,
  isActive: true,
  createdAt: new Date(),
  profileImage: null
};

const mockLab: User = {
  id: 4,
  username: 'labprueba',
  password: 'encriptada',
  email: 'lab@ejemplo.com',
  firstName: 'Laboratorio',
  lastName: 'Prueba',
  userType: UserType.LABORATORY,
  isActive: true,
  createdAt: new Date(),
  profileImage: null
};

/**
 * Función de emergencia para iniciar sesión cuando el backend tiene problemas.
 * Esta es una solución temporal hasta que el backend esté funcionando correctamente.
 */
export const useDirectLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginAs = async (userType: string) => {
    setIsLoading(true);
    try {
      // Seleccionar usuario según el tipo
      let user: User;
      
      switch(userType) {
        case 'doctor':
          user = mockDoctor;
          break;
        case 'patient':
          user = mockPatient;
          break;
        case 'admin':
          user = mockAdmin;
          break;
        case 'laboratory':
          user = mockLab;
          break;
        default:
          user = mockDoctor;
      }

      // Establecer el usuario en la caché del cliente de consultas
      queryClient.setQueryData(['/api/user'], user);
      
      // Redirigir al usuario a la página de inicio del dashboard
      const subdomain = getDefaultSubdomainForUserType(user.userType);
      
      // Mostrar mensaje de éxito
      toast({
        title: 'Inicio de sesión exitoso',
        description: `Bienvenido ${user.firstName} ${user.lastName}`,
        variant: 'default',
      });

      // Si estamos en el entorno de desarrollo local/Replit, no hay que cambiar de subdominio
      const currentHost = window.location.hostname;
      const isLocalOrReplit = currentHost === 'localhost' || 
                             currentHost.includes('replit.dev') || 
                             currentHost.includes('replit.co');
      
      // Forzar navegación al dashboard usando location.replace para evitar problemas con el historial
      setTimeout(() => {
        if (isLocalOrReplit) {
          window.location.replace('/dashboard');
        } else {
          window.location.replace(buildSubdomainUrl(subdomain, '/dashboard'));
        }
      }, 500);

      return user;
    } catch (error) {
      console.error('Error en inicio de sesión directo:', error);
      toast({
        title: 'Error de inicio de sesión',
        description: 'Hubo un problema al iniciar sesión. Inténtalo de nuevo.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginAsDoctor: () => loginAs('doctor'),
    loginAsPatient: () => loginAs('patient'),
    loginAsAdmin: () => loginAs('admin'),
    loginAsLab: () => loginAs('laboratory'),
    isLoading
  };
};