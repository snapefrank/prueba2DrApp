import React from 'react';
import Joyride from 'react-joyride';
import { useOnboardingTour } from '@/hooks/use-onboarding-tour';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Estilos personalizados para el tour
const joyrideStyles = {
  options: {
    zIndex: 10000,
    arrowColor: '#ffffff',
    backgroundColor: '#ffffff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    primaryColor: '#4f46e5', // Color principal (indigo)
    textColor: '#1f2937',
    width: 320,
    beaconSize: 36,
  },
  tooltipContainer: {
    textAlign: 'left' as const,
  },
  tooltipTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  buttonBack: {
    fontSize: '14px',
    marginRight: 10,
  },
  buttonClose: {
    fontSize: '14px',
    marginLeft: 10,
    color: '#6b7280',
  },
  buttonNext: {
    fontSize: '14px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '0.375rem',
  },
  buttonSkip: {
    fontSize: '14px',
    color: '#6b7280',
  },
};

// Textos en español para los botones
const joyrideLocale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Finalizar',
  next: 'Siguiente',
  skip: 'Omitir',
};

interface OnboardingTourProps {
  showResetButton?: boolean;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ showResetButton = false }) => {
  const { run, steps, stepIndex, handleJoyrideCallback, resetTour } = useOnboardingTour();
  const { toast } = useToast();

  const handleResetTour = () => {
    resetTour();
    toast({
      title: "Tour reiniciado",
      description: "El tour de bienvenida se ha reiniciado. Sigue los pasos para conocer la plataforma.",
      variant: "default",
    });
  };

  return (
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        styles={joyrideStyles}
        run={run}
        stepIndex={stepIndex}
        locale={joyrideLocale}
        disableScrolling
        disableOverlayClose
      />
      
      {showResetButton && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            onClick={handleResetTour} 
            variant="outline" 
            size="sm"
            className="bg-white shadow-md hover:bg-gray-50"
          >
            Ver tour de bienvenida
          </Button>
        </div>
      )}
    </>
  );
};