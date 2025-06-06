import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, ChevronRight, Info, Search, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const pacientes = [
  { id: 1, nombre: 'Carlos Rodríguez', edad: 45, genero: 'Masculino' },
  { id: 2, nombre: 'Ana Martínez', edad: 32, genero: 'Femenino' },
  { id: 3, nombre: 'Juan López', edad: 28, genero: 'Masculino' },
  { id: 4, nombre: 'María González', edad: 56, genero: 'Femenino' },
];

const tiposEstudio = [
  { id: 1, nombre: 'Hemograma Completo', categoria: 'Hematología' },
  { id: 2, nombre: 'Perfil Lipídico', categoria: 'Bioquímica' },
  { id: 3, nombre: 'Glucosa en Sangre', categoria: 'Bioquímica' },
  { id: 4, nombre: 'Prueba de Función Hepática', categoria: 'Bioquímica' },
  { id: 5, nombre: 'Prueba de Función Renal', categoria: 'Bioquímica' },
  { id: 6, nombre: 'TSH y T4', categoria: 'Endocrinología' },
  { id: 7, nombre: 'Análisis de Orina', categoria: 'Uroanálisis' },
  { id: 8, nombre: 'PCR (Proteína C Reactiva)', categoria: 'Inmunología' },
  { id: 9, nombre: 'Ferritina', categoria: 'Hematología' },
  { id: 10, nombre: 'Vitamina B12', categoria: 'Bioquímica' },
];

const SolicitarLaboratorioPage: React.FC = () => {
  const { toast } = useToast();
  const [pacienteSearch, setPacienteSearch] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState<number | null>(null);
  const [selectedEstudios, setSelectedEstudios] = useState<number[]>([]);
  const [showPacienteResults, setShowPacienteResults] = useState(false);
  const [indicaciones, setIndicaciones] = useState('');
  const [urgente, setUrgente] = useState('no');
  const [fechaProgramada, setFechaProgramada] = useState(
    new Date().toISOString().split('T')[0]
  );

  const filteredPacientes = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(pacienteSearch.toLowerCase())
  );

  const handleSelectEstudio = (id: number) => {
    if (selectedEstudios.includes(id)) {
      setSelectedEstudios(selectedEstudios.filter(e => e !== id));
    } else {
      setSelectedEstudios([...selectedEstudios, id]);
    }
  };

  const handleSelectPaciente = (id: number) => {
    setSelectedPaciente(id);
    setShowPacienteResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaciente) {
      toast({
        title: "Error",
        description: "Debe seleccionar un paciente",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedEstudios.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un estudio",
        variant: "destructive"
      });
      return;
    }
    
    // Aquí iría la lógica para enviar la solicitud al servidor
    toast({
      title: "Solicitud enviada",
      description: "La solicitud de laboratorio se ha enviado correctamente",
    });
    
    // Reset the form
    setSelectedEstudios([]);
    setIndicaciones('');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Solicitud de Laboratorio</h1>
        <p className="text-muted-foreground">
          Complete el formulario para solicitar estudios de laboratorio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
            <CardDescription>Seleccione el paciente para el que solicita los estudios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Buscar paciente por nombre..."
                    value={pacienteSearch}
                    onChange={(e) => {
                      setPacienteSearch(e.target.value);
                      setShowPacienteResults(true);
                    }}
                    className="w-full"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button type="button" variant="outline">Nuevo Paciente</Button>
              </div>
              
              {showPacienteResults && pacienteSearch && (
                <Card className="absolute top-full left-0 right-0 mt-1 z-10">
                  <CardContent className="p-2">
                    {filteredPacientes.length > 0 ? (
                      <ul className="space-y-1">
                        {filteredPacientes.map((paciente) => (
                          <li 
                            key={paciente.id}
                            className="p-2 hover:bg-accent rounded cursor-pointer flex items-center justify-between"
                            onClick={() => handleSelectPaciente(paciente.id)}
                          >
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{paciente.nombre}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{paciente.edad} años, {paciente.genero}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">
                        No se encontraron pacientes
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            
            {selectedPaciente && (
              <div className="p-4 border rounded-lg bg-primary/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium">
                        {pacientes.find(p => p.id === selectedPaciente)?.nombre}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {pacientes.find(p => p.id === selectedPaciente)?.edad} años, 
                        {pacientes.find(p => p.id === selectedPaciente)?.genero}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPaciente(null)}
                  >
                    Cambiar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selección de Estudios</CardTitle>
            <CardDescription>Elija los estudios de laboratorio que desea solicitar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tiposEstudio.map((estudio) => (
                  <div 
                    key={estudio.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedEstudios.includes(estudio.id) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => handleSelectEstudio(estudio.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{estudio.nombre}</p>
                        <p className={`text-sm ${selectedEstudios.includes(estudio.id) ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {estudio.categoria}
                        </p>
                      </div>
                      {selectedEstudios.includes(estudio.id) && (
                        <CheckCircle className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedEstudios.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Estudios seleccionados:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEstudios.map(id => (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {tiposEstudio.find(e => e.id === id)?.nombre}
                        <button 
                          className="ml-1 hover:text-destructive"
                          onClick={() => handleSelectEstudio(id)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles adicionales</CardTitle>
            <CardDescription>Proporcione información adicional para el laboratorio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="indicaciones">Indicaciones especiales</Label>
              <Textarea 
                id="indicaciones" 
                placeholder="Instrucciones o información relevante para el laboratorio..."
                value={indicaciones}
                onChange={(e) => setIndicaciones(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="urgente">Prioridad</Label>
              <Select value={urgente} onValueChange={setUrgente}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Normal</SelectItem>
                  <SelectItem value="si">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha programada</Label>
              <Input 
                id="fecha" 
                type="date" 
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" type="button">Cancelar</Button>
            <Button type="submit">
              Enviar Solicitud
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default SolicitarLaboratorioPage;