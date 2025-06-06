import React from 'react';
import DoctorLayout from '@/layouts/DoctorLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarRange, Clock, Users, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function HorariosPage() {
  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración de Horarios</h1>
            <p className="text-muted-foreground mt-1">
              Configure sus horarios de atención y disponibilidad
            </p>
          </div>
          <Button>
            <CalendarRange className="mr-2 h-4 w-4" />
            Guardar cambios
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Horarios de Atención</CardTitle>
            <CardDescription>
              Defina los días y horas en que atenderá pacientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="lunes" className="w-full">
              <TabsList className="grid grid-cols-7">
                <TabsTrigger value="lunes">Lun</TabsTrigger>
                <TabsTrigger value="martes">Mar</TabsTrigger>
                <TabsTrigger value="miercoles">Mié</TabsTrigger>
                <TabsTrigger value="jueves">Jue</TabsTrigger>
                <TabsTrigger value="viernes">Vie</TabsTrigger>
                <TabsTrigger value="sabado">Sáb</TabsTrigger>
                <TabsTrigger value="domingo">Dom</TabsTrigger>
              </TabsList>
              
              {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((day) => (
                <TabsContent key={day} value={day} className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium capitalize">{day === 'miercoles' ? 'Miércoles' : day}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Estado:</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Disponible
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-muted/20 rounded-lg text-center">
                    <p className="text-muted-foreground text-sm">
                      Funcionalidad en desarrollo. Próximamente podrá configurar horarios específicos para cada día.
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Duración de Citas</CardTitle>
            <CardDescription>
              Configure la duración predeterminada de sus citas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted/20 rounded-lg text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Módulo en desarrollo</h3>
              <p className="text-muted-foreground">
                Esta sección estará disponible próximamente. Podrá establecer diferentes duraciones para tipos de citas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}