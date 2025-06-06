import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Check } from "lucide-react";
import { SubscriptionPlan, UserSubscription } from "@shared/schema";

type ExtendedSubscription = UserSubscription & {
  plan: SubscriptionPlan;
};

// Función para formatear precio
const formatPrice = (price: string | number) => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(numericPrice);
};

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Obtener planes de suscripción activos
  const { data: plans, isLoading: isLoadingPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    throwOnError: true,
  });

  // Obtener suscripción actual del usuario si existe
  const { 
    data: currentSubscription, 
    isLoading: isLoadingSubscription,
    isError: isSubscriptionError
  } = useQuery<ExtendedSubscription>({
    queryKey: ['/api/user-subscription'],
    throwOnError: false,
  });

  // Mutación para subscribirse a un plan
  const subscribeMutation = useMutation({
    mutationFn: async (planId: number) => {
      // Calcular fecha de fin un mes después
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      const res = await apiRequest('POST', '/api/user-subscription', {
        planId,
        endDate,
        autoRenew: true
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-subscription'] });
      toast({
        title: 'Suscripción exitosa',
        description: 'Te has suscrito exitosamente al plan',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al suscribirse',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutación para cancelar suscripción
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: number) => {
      const res = await apiRequest('POST', `/api/user-subscription/${subscriptionId}/cancel`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-subscription'] });
      toast({
        title: 'Suscripción cancelada',
        description: 'Tu suscripción ha sido cancelada exitosamente',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al cancelar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Manejar clic en botón de suscripción
  const handleSubscribe = async (planId: number) => {
    setSelectedPlanId(planId);
    try {
      await subscribeMutation.mutateAsync(planId);
    } finally {
      setSelectedPlanId(null);
    }
  };

  // Manejar clic en botón de cancelación
  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    
    try {
      await cancelSubscriptionMutation.mutateAsync(currentSubscription.id);
    } catch (error) {
      console.error("Error al cancelar la suscripción:", error);
    }
  };

  if (isLoadingPlans || isLoadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Planes de Suscripción</h1>
      
      {currentSubscription && currentSubscription.status === "active" && (
        <div className="bg-muted p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-2">Suscripción Actual</h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-lg font-medium">{currentSubscription.plan.name}</p>
              <p className="text-sm text-muted-foreground">
                Activa hasta: {new Date(currentSubscription.endDate).toLocaleDateString()}
              </p>
              {currentSubscription.autoRenew && (
                <Badge variant="outline" className="mt-2">Renovación automática</Badge>
              )}
            </div>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
            >
              {cancelSubscriptionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Cancelar Suscripción
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card key={plan.id} className={`flex flex-col h-full ${currentSubscription?.plan.id === plan.id ? 'border-primary' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-3xl font-bold mb-4">{formatPrice(plan.price)}<span className="text-sm font-normal">/mes</span></p>
              <div className="space-y-2">
                {(plan.features as string[])?.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  <span>{plan.maxAppointments} citas por mes</span>
                </div>
                {plan.includesLabTests && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>Incluye pruebas de laboratorio</span>
                  </div>
                )}
                {plan.includesSpecialists && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span>Acceso a especialistas</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan.id)}
                disabled={
                  subscribeMutation.isPending || 
                  (currentSubscription?.status === "active" && currentSubscription.plan.id === plan.id) ||
                  selectedPlanId === plan.id
                }
                variant={currentSubscription?.plan.id === plan.id ? "outline" : "default"}
              >
                {subscribeMutation.isPending && selectedPlanId === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {currentSubscription?.status === "active" && currentSubscription.plan.id === plan.id
                  ? "Plan Actual"
                  : "Suscribirse"}
              </Button>
            </CardFooter>
          </Card>
        ))}

        {plans?.length === 0 && (
          <p>No hay planes de suscripción disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
}