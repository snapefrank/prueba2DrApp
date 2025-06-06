import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notification-store';

// Este hook es solo para demostración
// En una aplicación real, las notificaciones vendrían de eventos reales
// como mensajes nuevos, recordatorios de citas, etc.
export function useDemoNotifications() {
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Ejemplo de notificación inicial para demostrar el funcionamiento
    setTimeout(() => {
      addNotification({
        type: 'info',
        title: 'Bienvenido a MediConnect',
        message: 'Este es un ejemplo de notificación. Puedes usar este sistema para mantener a los usuarios informados sobre eventos importantes.',
      });
    }, 2000);

    // Ejemplo de notificación de nueva cita en 4 segundos
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Nueva cita programada',
        message: 'El paciente Carlos Rodríguez ha programado una cita para el 30 de abril a las 14:00.',
      });
    }, 4000);
    
    // Ejemplo de notificación de resultados de laboratorio en 6 segundos
    setTimeout(() => {
      addNotification({
        type: 'info',
        title: 'Resultados de laboratorio disponibles',
        message: 'Los resultados de laboratorio para Ana González ya están disponibles para su revisión.',
      });
    }, 6000);
    
    // Para detener los timers en caso de que el componente se desmonte
    return () => {
      // Los timers se limpian automáticamente
    };
  }, [addNotification]);
}