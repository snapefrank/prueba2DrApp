import { useState } from 'react';
import DoctorLayout from '@/layouts/DoctorLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  CreditCard, 
  Download, 
  FileText, 
  Star,
  Info,
  AlertTriangle 
} from 'lucide-react';

// Datos de ejemplo para los planes
const plans = [
  {
    id: 'plan_básico',
    name: 'Básico',
    price: 299,
    features: [
      'Hasta 50 pacientes',
      'Historial médico',
      'Gestión de citas',
      'Recetas médicas',
      'Soporte por email',
    ],
    recommended: false,
  },
  {
    id: 'plan_profesional',
    name: 'Profesional',
    price: 599,
    features: [
      'Hasta 200 pacientes',
      'Historial médico avanzado',
      'Gestión de citas',
      'Recetas médicas digitales',
      'Laboratorio integrado',
      'Chat con pacientes',
      'Soporte prioritario',
    ],
    recommended: true,
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    price: 999,
    features: [
      'Pacientes ilimitados',
      'Todas las características profesionales',
      'IA asistente de diagnóstico',
      'Videoconferencia',
      'Verificación premium',
      'Soporte 24/7',
      'API personalizada',
    ],
    recommended: false,
  },
];

// Datos de ejemplo para el historial de facturas
const facturas = [
  {
    id: 'INV-001',
    date: '2025-04-01',
    amount: 599,
    status: 'Pagada',
    plan: 'Profesional',
    period: 'Abr 2025 - May 2025',
  },
  {
    id: 'INV-002',
    date: '2025-03-01',
    amount: 599,
    status: 'Pagada',
    plan: 'Profesional',
    period: 'Mar 2025 - Abr 2025',
  },
  {
    id: 'INV-003',
    date: '2025-02-01',
    amount: 599,
    status: 'Pagada',
    plan: 'Profesional',
    period: 'Feb 2025 - Mar 2025',
  },
];

// Datos de ejemplo del usuario
const userSubscription = {
  plan: 'Profesional',
  status: 'Activa',
  nextPayment: '2025-05-01',
  paymentMethod: {
    type: 'credit_card',
    brand: 'Visa',
    last4: '4242'
  }
};

export default function SuscripcionesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('plan');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  // Función para cambiar el plan
  const handleChangePlan = (planId: string) => {
    // Aquí iría la lógica para cambiar de plan
    toast({
      title: 'Plan actualizado',
      description: `Has cambiado exitosamente al plan ${plans.find(p => p.id === planId)?.name}`,
    });
  };
  
  // Función para simular la descarga de factura
  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: 'Descargando factura',
      description: `Se está descargando la factura ${invoiceId}`,
    });
  };
  
  // Función para cancelar suscripción
  const handleCancelSubscription = () => {
    setCancelDialogOpen(false);
    
    toast({
      title: 'Suscripción cancelada',
      description: 'Tu suscripción ha sido cancelada. Terminará al final del periodo actual.',
      variant: 'destructive',
    });
  };

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suscripciones</h1>
          <p className="text-muted-foreground">
            Administra tu plan de suscripción y método de pago
          </p>
        </div>
        
        {/* Tarjeta de suscripción actual */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plan actual: {userSubscription.plan}</CardTitle>
                <CardDescription>
                  Suscripción {userSubscription.status.toLowerCase()}
                </CardDescription>
              </div>
              <Badge variant={userSubscription.status === 'Activa' ? 'default' : 'destructive'}>
                {userSubscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Próximo pago</h3>
                <p>{new Date(userSubscription.nextPayment).toLocaleDateString('es-MX', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Método de pago</h3>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>{userSubscription.paymentMethod.brand} terminada en {userSubscription.paymentMethod.last4}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Actualizar método de pago</Button>
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Cancelar suscripción</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                    Cancelar suscripción
                  </DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro que deseas cancelar tu suscripción? Perderás acceso a las funcionalidades premium al finalizar el periodo actual.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <p className="text-sm font-medium">Importante:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Tu suscripción terminará el {new Date(userSubscription.nextPayment).toLocaleDateString()}</li>
                    <li>• Podrás seguir usando todas las funcionalidades hasta entonces</li>
                    <li>• No se realizarán reembolsos por el periodo actual</li>
                  </ul>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                    Mantener suscripción
                  </Button>
                  <Button variant="destructive" onClick={handleCancelSubscription}>
                    Confirmar cancelación
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="plan">Cambiar plan</TabsTrigger>
            <TabsTrigger value="facturas">Historial de facturas</TabsTrigger>
          </TabsList>
          
          {/* Pestaña de planes */}
          <TabsContent value="plan">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className={plan.recommended ? 'border-primary' : ''}>
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      <Badge className="bg-primary">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Recomendado
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      ${plan.price.toLocaleString('es-MX')}/mes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-4 w-4 mr-2 text-primary mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {plan.name === userSubscription.plan ? (
                      <Button className="w-full" disabled>Plan actual</Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleChangePlan(plan.id)}
                      >
                        Cambiar a este plan
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Pestaña de historial de facturas */}
          <TabsContent value="facturas">
            <Card>
              <CardHeader>
                <CardTitle>Historial de facturas</CardTitle>
                <CardDescription>
                  Consulta y descarga tus facturas previas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Factura</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturas.map((factura) => (
                      <TableRow key={factura.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            {factura.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(factura.date).toLocaleDateString('es-MX')}
                        </TableCell>
                        <TableCell>{factura.plan}</TableCell>
                        <TableCell>{factura.period}</TableCell>
                        <TableCell>${factura.amount.toLocaleString('es-MX')}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={factura.status === 'Pagada' ? 'outline' : 'destructive'}
                            className={factura.status === 'Pagada' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                          >
                            {factura.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDownloadInvoice(factura.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center p-4 border rounded-lg bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-5 w-5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">¿Necesitas un plan personalizado?</p>
            <p className="text-sm mt-1">Contáctanos a <a href="mailto:ventas@mediconnect.com" className="underline">ventas@mediconnect.com</a> para un plan a medida para hospitales o grupos médicos.</p>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}