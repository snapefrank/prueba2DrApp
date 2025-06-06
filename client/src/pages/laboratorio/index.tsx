import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Search, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const LaboratorioPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laboratorio</h1>
          <p className="text-muted-foreground">
            Gestione las solicitudes y resultados de laboratorio
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Solicitud
        </Button>
      </div>

      <div className="flex w-full max-w-xl mx-auto items-center space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Buscar por paciente o tipo de estudio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Button variant="ghost" type="submit">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="pendientes" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="finalizadas">Finalizadas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes</CardTitle>
              <CardDescription>Estudios de laboratorio en espera de resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo de Estudio</TableHead>
                    <TableHead>Fecha Solicitud</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">Carlos Rodríguez</TableCell>
                      <TableCell>Hemograma Completo</TableCell>
                      <TableCell>{`${10 + index}/04/2025`}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Pendiente</Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="finalizadas">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Finalizadas</CardTitle>
              <CardDescription>Estudios de laboratorio con resultados disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo de Estudio</TableHead>
                    <TableHead>Fecha Resultado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">Ana Martínez</TableCell>
                      <TableCell>{index === 0 ? 'Perfil Lipídico' : index === 1 ? 'Glucosa en Sangre' : 'Prueba de Función Hepática'}</TableCell>
                      <TableCell>{`0${index + 1}/04/2025`}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Completado</Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Descargar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="todas">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Solicitudes</CardTitle>
              <CardDescription>Historial completo de estudios de laboratorio</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo de Estudio</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index % 2 === 0 ? 'Carlos Rodríguez' : 'Ana Martínez'}</TableCell>
                      <TableCell>
                        {index % 4 === 0 ? 'Hemograma Completo' : 
                         index % 4 === 1 ? 'Perfil Lipídico' : 
                         index % 4 === 2 ? 'Glucosa en Sangre' : 
                         'Prueba de Función Hepática'}
                      </TableCell>
                      <TableCell>{`${(index + 1).toString().padStart(2, '0')}/04/2025`}</TableCell>
                      <TableCell>
                        {index < 5 ? (
                          <Badge variant="outline">Pendiente</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Completado</Badge>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          {index < 5 ? 'Detalles' : 'Ver'}
                        </Button>
                        {index >= 5 && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaboratorioPage;