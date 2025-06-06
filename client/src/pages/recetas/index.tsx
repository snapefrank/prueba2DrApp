import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilePenLine, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const RecetasPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recetas Médicas</h1>
          <p className="text-muted-foreground">
            Gestione las recetas médicas de sus pacientes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Receta
        </Button>
      </div>

      <div className="flex w-full max-w-xl mx-auto items-center space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Buscar por nombre de paciente o medicamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Button variant="ghost" type="submit">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="activas" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="activas">Activas</TabsTrigger>
          <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
        <TabsContent value="activas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <RecetaCard 
                key={index}
                paciente="María García" 
                fecha="12/04/2025"
                medicamento="Paracetamol 500mg"
                dosis="1 tableta cada 8 horas"
                status="active"
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="vencidas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <RecetaCard 
                key={index}
                paciente="Juan Pérez" 
                fecha="15/01/2025"
                medicamento="Ibuprofeno 400mg"
                dosis="1 tableta cada 12 horas"
                status="expired"
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="todas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <RecetaCard 
                key={index}
                paciente={index % 2 === 0 ? "María García" : "Juan Pérez"} 
                fecha={index % 2 === 0 ? "12/04/2025" : "15/01/2025"}
                medicamento={index % 2 === 0 ? "Paracetamol 500mg" : "Ibuprofeno 400mg"}
                dosis={index % 2 === 0 ? "1 tableta cada 8 horas" : "1 tableta cada 12 horas"}
                status={index % 3 === 0 ? "expired" : "active"}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface RecetaCardProps {
  paciente: string;
  fecha: string;
  medicamento: string;
  dosis: string;
  status: 'active' | 'expired';
}

const RecetaCard: React.FC<RecetaCardProps> = ({ paciente, fecha, medicamento, dosis, status }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{paciente}</CardTitle>
          <Badge variant={status === 'active' ? 'default' : 'destructive'}>
            {status === 'active' ? 'Activa' : 'Vencida'}
          </Badge>
        </div>
        <CardDescription>Fecha: {fecha}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Medicamento:</span>
            <p>{medicamento}</p>
          </div>
          <div>
            <span className="font-semibold">Dosis:</span>
            <p>{dosis}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Ver Detalles
        </Button>
        <Button variant="outline" size="sm">
          <FilePenLine className="h-4 w-4 mr-1" />
          Imprimir
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecetasPage;