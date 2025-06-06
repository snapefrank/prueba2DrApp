import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useAuth } from '@/hooks/use-auth';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface OnboardingConfig {
  steps: {
    [key: string]: Step[];
  };
  roles: {
    [key: string]: string[];
  };
}

export function useOnboardingTour() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [run, setRun] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourCompleted, setTourCompleted] = useLocalStorage('tourCompleted', false);

  // Configuración del tour según el rol de usuario
  const config: OnboardingConfig = {
    // Definimos las rutas para cada rol
    roles: {
      patient: ['/', '/dashboard', '/dashboard/citas', '/dashboard/chat', '/dashboard/historial'],
      doctor: ['/', '/dashboard', '/dashboard/pacientes', '/dashboard/citas', '/dashboard/chat'],
      admin: ['/', '/dashboard', '/dashboard/usuarios', '/dashboard/estadisticas']
    },
    // Pasos específicos para cada ruta
    steps: {
      // Home page
      '/': [
        {
          target: 'body',
          content: 'Bienvenido a MediConnect. Esta guía te ayudará a conocer nuestra plataforma y sacar el máximo provecho de ella.',
          placement: 'center',
          disableBeacon: true,
          title: '¡Bienvenido!',
        },
        {
          target: '.navbar',
          content: 'Desde la barra de navegación puedes acceder a todas las secciones de la plataforma.',
          placement: 'bottom',
          title: 'Navegación principal',
        },
        {
          target: '.dashboard-link',
          content: 'Accede a tu panel personalizado desde aquí para gestionar todas tus actividades.',
          placement: 'bottom',
          title: 'Tu panel personal',
        }
      ],
      // Dashboard principal
      '/dashboard': [
        {
          target: '.sidebar',
          content: 'Este es tu menú principal donde encontrarás todas las herramientas según tu rol en la plataforma.',
          placement: 'right',
          title: 'Menú principal',
        },
        {
          target: '.profile-section',
          content: 'Aquí puedes ver y editar tu información personal y de perfil.',
          placement: 'left',
          title: 'Tu perfil',
        },
        {
          target: '.notifications-panel',
          content: 'Recibirás notificaciones importantes sobre tu actividad en la plataforma.',
          placement: 'bottom',
          title: 'Centro de notificaciones',
        }
      ],
      // Citas - específico para pacientes
      '/dashboard/citas': [
        {
          target: '.appointment-calendar',
          content: 'Consulta tus próximas citas programadas y el historial de consultas anteriores.',
          placement: 'top',
          title: 'Calendario de citas',
        },
        {
          target: '.new-appointment-btn',
          content: 'Programa una nueva cita con cualquiera de nuestros especialistas.',
          placement: 'right',
          title: 'Programar cita',
        }
      ],
      // Chat - común para doctores y pacientes
      '/dashboard/chat': [
        {
          target: '.chat-conversations',
          content: 'Aquí encontrarás todas tus conversaciones con profesionales de la salud.',
          placement: 'right',
          title: 'Tus conversaciones',
        },
        {
          target: '.chat-window',
          content: 'Comunícate de forma segura y privada con tus médicos o pacientes.',
          placement: 'left',
          title: 'Ventana de chat',
        },
        {
          target: '.attachment-button',
          content: 'Puedes compartir documentos e imágenes relevantes a tus consultas médicas.',
          placement: 'top',
          title: 'Compartir archivos',
        }
      ],
      // Historial - específico para pacientes
      '/dashboard/historial': [
        {
          target: '.medical-records',
          content: 'Revisa tu historial médico completo y todos tus documentos clínicos.',
          placement: 'top',
          title: 'Historial médico',
        },
        {
          target: '.lab-results',
          content: 'Consulta los resultados de tus análisis y estudios realizados.',
          placement: 'right',
          title: 'Resultados de laboratorio',
        }
      ],
      // Pacientes - específico para doctores
      '/dashboard/pacientes': [
        {
          target: '.patients-list',
          content: 'Administra todos tus pacientes desde esta lista.',
          placement: 'top',
          title: 'Lista de pacientes',
        },
        {
          target: '.patient-search',
          content: 'Busca rápidamente a cualquiera de tus pacientes por nombre o ID.',
          placement: 'bottom',
          title: 'Búsqueda de pacientes',
        }
      ],
      // Usuarios - específico para administradores
      '/dashboard/usuarios': [
        {
          target: '.users-management',
          content: 'Gestiona todos los usuarios de la plataforma: pacientes, médicos y otros administradores.',
          placement: 'top',
          title: 'Gestión de usuarios',
        },
        {
          target: '.verification-panel',
          content: 'Revisa y verifica los documentos de los médicos para validar sus perfiles.',
          placement: 'right',
          title: 'Verificación de médicos',
        }
      ],
      // Estadísticas - específico para administradores
      '/dashboard/estadisticas': [
        {
          target: '.analytics-dashboard',
          content: 'Visualiza estadísticas importantes sobre el uso de la plataforma.',
          placement: 'top',
          title: 'Panel de estadísticas',
        },
        {
          target: '.reports-section',
          content: 'Genera reportes personalizados según diferentes métricas y períodos.',
          placement: 'left',
          title: 'Reportes y análisis',
        }
      ]
    }
  };

  useEffect(() => {
    // Solo mostrar el tour si no se ha completado antes
    if (user && !tourCompleted) {
      const userRole = user.userType || 'patient';
      
      // Verificar si la ruta actual está en la lista de rutas para el rol del usuario
      if (config.roles[userRole]?.includes(location)) {
        // Obtener los pasos para esta ruta
        const routeSteps = config.steps[location] || [];
        if (routeSteps.length > 0) {
          setCurrentSteps(routeSteps);
          // Añadimos un pequeño delay para asegurar que la página se ha cargado completamente
          setTimeout(() => {
            setRun(true);
          }, 1000);
        }
      }
    }
  }, [user, location, tourCompleted]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index } = data;
    
    // Actualizar el índice del paso actual
    if (action === 'update' && index !== undefined) {
      setStepIndex(index);
    }

    // Cuando el tour se completa o se salta
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      
      // Marcar como completado solo si terminó todo el recorrido
      if (status === STATUS.FINISHED) {
        setTourCompleted(true);
      }
    }
  };

  // Función para resetear el estado del tour y mostrarlo nuevamente
  const resetTour = () => {
    setTourCompleted(false);
    setStepIndex(0);
    setRun(true);
  };

  return {
    run,
    steps: currentSteps,
    stepIndex,
    handleJoyrideCallback,
    resetTour,
    setRun
  };
}

