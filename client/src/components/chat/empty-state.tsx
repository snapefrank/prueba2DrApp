import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No hay conversaciones seleccionadas",
  description = "Selecciona una conversación de la lista o inicia una nueva",
  action,
  icon = <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
}: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center gap-2 max-w-md">
        <div className="rounded-full bg-muted p-4 mb-4">
          {icon}
        </div>
        
        <h3 className="text-xl font-semibold">{title}</h3>
        
        <p className="text-muted-foreground mb-4">
          {description}
        </p>
        
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}