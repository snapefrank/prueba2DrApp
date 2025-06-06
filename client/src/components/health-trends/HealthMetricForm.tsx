import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertHealthMetricSchema } from '@shared/schema';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Extendemos el esquema para añadir validaciones específicas
const healthMetricFormSchema = insertHealthMetricSchema.extend({
  metricDate: z.string().min(1, { message: 'La fecha es requerida' }),
  // Hacemos que al menos uno de los valores de métricas sea requerido
}).refine(
  (data) => 
    data.bloodPressureSystolic !== null || 
    data.bloodPressureDiastolic !== null || 
    data.heartRate !== null || 
    data.temperature !== null || 
    data.weight !== null || 
    data.oxygenSaturation !== null || 
    data.glucose !== null,
  {
    message: "Debe ingresar al menos un valor de métrica de salud",
    path: ["bloodPressureSystolic"],
  }
);

type HealthMetricFormValues = z.infer<typeof healthMetricFormSchema>;

interface HealthMetricFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
}

export default function HealthMetricForm({ open, onOpenChange, patientId }: HealthMetricFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<HealthMetricFormValues>({
    resolver: zodResolver(healthMetricFormSchema),
    defaultValues: {
      patientId,
      metricDate: new Date().toISOString().split('T')[0],
      bloodPressureSystolic: null,
      bloodPressureDiastolic: null,
      heartRate: null,
      temperature: null,
      weight: null,
      oxygenSaturation: null,
      glucose: null,
      notes: null
    }
  });

  const createMetricMutation = useMutation({
    mutationFn: async (values: HealthMetricFormValues) => {
      const res = await apiRequest('POST', '/api/health-metrics', values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Métrica registrada',
        description: 'La métrica de salud ha sido registrada exitosamente',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/health-metrics/patient/${patientId}`] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo registrar la métrica: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  function onSubmit(values: HealthMetricFormValues) {
    createMetricMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Métrica de Salud</DialogTitle>
          <DialogDescription>
            Añada valores para al menos una métrica de salud a continuación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="metricDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de registro</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bloodPressureSystolic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presión Sistólica (mmHg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => 
                          field.onChange(e.target.value === '' ? null : parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bloodPressureDiastolic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presión Diastólica (mmHg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => 
                          field.onChange(e.target.value === '' ? null : parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heartRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ritmo Cardíaco (bpm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field} 
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => 
                          field.onChange(e.target.value === '' ? null : parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.1"
                        {...field} 
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => 
                          field.onChange(e.target.value === '' ? null : e.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.1"
                        {...field} 
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => 
                          field.onChange(e.target.value === '' ? null : e.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oxygenSaturation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saturación de O2 (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        max="100"
                        {...field} 
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => 
                          field.onChange(e.target.value === '' ? null : parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="glucose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Glucosa (mg/dL)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field} 
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => 
                          field.onChange(e.target.value === '' ? null : parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre estas métricas" 
                      className="resize-none"
                      {...field}
                      value={field.value === null ? '' : field.value} 
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMetricMutation.isPending}
              >
                {createMetricMutation.isPending ? 'Guardando...' : 'Guardar Métrica'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}