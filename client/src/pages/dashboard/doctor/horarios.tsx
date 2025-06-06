import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus } from 'lucide-react';

export default function HorariosPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Horarios</h1>
          <p className="text-muted-foreground">
            Administre sus horarios de consulta y disponibilidad
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Horario
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Lunes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  9:00 AM - 1:00 PM
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Activo</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  3:00 PM - 7:00 PM
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Activo</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t flex justify-between">
            <Button variant="outline" size="sm">Editar</Button>
            <Button variant="destructive" size="sm">Eliminar</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Miércoles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  10:00 AM - 2:00 PM
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Activo</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  4:00 PM - 8:00 PM
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Activo</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t flex justify-between">
            <Button variant="outline" size="sm">Editar</Button>
            <Button variant="destructive" size="sm">Eliminar</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Viernes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  8:00 AM - 1:00 PM
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Activo</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t flex justify-between">
            <Button variant="outline" size="sm">Editar</Button>
            <Button variant="destructive" size="sm">Eliminar</Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Excepciones y Días No Laborables</CardTitle>
          <CardDescription>
            Configure períodos de vacaciones o días específicos en los que no estará disponible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Vacaciones</p>
                <p className="text-sm text-muted-foreground">15/07/2025 - 30/07/2025</p>
              </div>
              <Button variant="destructive" size="sm">Eliminar</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Congreso Médico</p>
                <p className="text-sm text-muted-foreground">10/09/2025 - 15/09/2025</p>
              </div>
              <Button variant="destructive" size="sm">Eliminar</Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Excepción
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}