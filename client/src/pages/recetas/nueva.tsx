import React, { useState } from 'react';
import DoctorLayout from '@/layouts/DoctorLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { ArrowLeft, Plus, FileText, Save, AlertCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function NuevaRecetaPage() {
  // Estado para el formulario
  const [formState, setFormState] = useState({
    paciente: '',
    edad: '',
    genero: '',
    cedula: 'ABC123456',
    medicamentos: [{ nombre: '', dosis: '', indicaciones: '', duracion: '' }],
    diagnostico: '',
    notas: ''
  });
  
  // Función para agregar un nuevo medicamento
  const agregarMedicamento = () => {
    setFormState({
      ...formState,
      medicamentos: [
        ...formState.medicamentos,
        { nombre: '', dosis: '', indicaciones: '', duracion: '' }
      ]
    });
  };
  
  // Función para eliminar un medicamento
  const eliminarMedicamento = (index: number) => {
    const nuevosMedicamentos = [...formState.medicamentos];
    nuevosMedicamentos.splice(index, 1);
    setFormState({
      ...formState,
      medicamentos: nuevosMedicamentos
    });
  };
  
  // Función para actualizar un medicamento
  const actualizarMedicamento = (index: number, campo: string, valor: string) => {
    const nuevosMedicamentos = [...formState.medicamentos];
    nuevosMedicamentos[index] = {
      ...nuevosMedicamentos[index],
      [campo]: valor
    };
    setFormState({
      ...formState,
      medicamentos: nuevosMedicamentos
    });
  };
  
  // Función para manejar cambios en el formulario principal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value
    });
  };
  
  // Función para manejar cambios en selects
  const handleSelectChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value
    });
  };
  
  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulario enviado:', formState);
    // Aquí iría la lógica para guardar la receta
  };
  
  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/recetas">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nueva Receta Médica</h1>
            <p className="text-muted-foreground mt-1">
              Cree una receta médica electrónica para su paciente
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del paciente */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Paciente</CardTitle>
                <CardDescription>
                  Datos del paciente para la receta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paciente">Nombre del Paciente</Label>
                    <Input
                      id="paciente"
                      name="paciente"
                      placeholder="Nombre completo"
                      value={formState.paciente}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edad">Edad</Label>
                      <Input
                        id="edad"
                        name="edad"
                        placeholder="Edad"
                        value={formState.edad}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genero">Género</Label>
                      <Select
                        value={formState.genero}
                        onValueChange={(value) => handleSelectChange('genero', value)}
                      >
                        <SelectTrigger id="genero">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Información del médico */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Médico</CardTitle>
                <CardDescription>
                  Sus datos profesionales aparecerán en la receta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/20 h-16 w-16 rounded-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Dr. Carlos Mendoza López</h3>
                      <p className="text-sm text-muted-foreground">Cardiología</p>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          Cédula: {formState.cedula}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nota importante</AlertTitle>
                  <AlertDescription>
                    Esta receta electrónica es válida de acuerdo a la normativa de COFEPRIS.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            {/* Medicamentos */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Medicamentos</CardTitle>
                    <CardDescription>
                      Agregue los medicamentos para esta receta
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={agregarMedicamento} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar medicamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {formState.medicamentos.map((med, index) => (
                  <div key={index} className="p-4 border rounded-lg relative">
                    <div className="absolute right-4 top-4">
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => eliminarMedicamento(index)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <h3 className="font-medium mb-4">Medicamento {index + 1}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`med-nombre-${index}`}>Nombre del medicamento</Label>
                        <Input
                          id={`med-nombre-${index}`}
                          placeholder="Ej. Paracetamol"
                          value={med.nombre}
                          onChange={(e) => actualizarMedicamento(index, 'nombre', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`med-dosis-${index}`}>Dosis</Label>
                        <Input
                          id={`med-dosis-${index}`}
                          placeholder="Ej. 500mg cada 8 horas"
                          value={med.dosis}
                          onChange={(e) => actualizarMedicamento(index, 'dosis', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`med-indicaciones-${index}`}>Indicaciones</Label>
                        <Textarea
                          id={`med-indicaciones-${index}`}
                          placeholder="Detalles sobre cómo tomar el medicamento"
                          className="min-h-[80px]"
                          value={med.indicaciones}
                          onChange={(e) => actualizarMedicamento(index, 'indicaciones', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`med-duracion-${index}`}>Duración del tratamiento</Label>
                        <Input
                          id={`med-duracion-${index}`}
                          placeholder="Ej. 7 días"
                          value={med.duracion}
                          onChange={(e) => actualizarMedicamento(index, 'duracion', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Diagnóstico y notas */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Diagnóstico y Notas Adicionales</CardTitle>
                <CardDescription>
                  Información complementaria para la receta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnostico">Diagnóstico</Label>
                  <Textarea
                    id="diagnostico"
                    name="diagnostico"
                    placeholder="Diagnóstico del paciente"
                    className="min-h-[100px]"
                    value={formState.diagnostico}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notas">Notas adicionales</Label>
                  <Textarea
                    id="notas"
                    name="notas"
                    placeholder="Instrucciones adicionales, restricciones, etc."
                    className="min-h-[100px]"
                    value={formState.notas}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4 pt-4">
                <Link href="/recetas">
                  <Button variant="outline">Cancelar</Button>
                </Link>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Receta
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </DoctorLayout>
  );
}