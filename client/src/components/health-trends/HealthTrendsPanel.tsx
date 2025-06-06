import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SparklineChart from './SparklineChart';
import { HealthMetric } from '@shared/schema';
import { Activity, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HealthTrendsPanelProps {
  patientId: number;
}

export default function HealthTrendsPanel({ patientId }: HealthTrendsPanelProps) {
  // Fetch health metrics for the patient
  const {
    data: healthMetrics,
    isLoading,
    error,
  } = useQuery<HealthMetric[]>({
    queryKey: [`/api/health-metrics/patient/${patientId}`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !healthMetrics) {
    return (
      <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>Error al cargar las métricas de salud</span>
      </div>
    );
  }

  if (healthMetrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
        <Activity className="h-12 w-12 text-gray-300 mb-2" />
        <h3 className="text-lg font-medium text-gray-900">No hay métricas registradas</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Registre su primera métrica de salud para comenzar a monitorear sus tendencias
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas las métricas</TabsTrigger>
          <TabsTrigger value="vital-signs">Signos vitales</TabsTrigger>
          <TabsTrigger value="measurements">Medidas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SparklineChart
              data={healthMetrics}
              metricType="bloodPressure"
              title="Presión Arterial"
              description="Sistólica/Diastólica (mmHg)"
              color="#ef4444"
            />
            <SparklineChart
              data={healthMetrics}
              metricType="heartRate"
              title="Ritmo Cardíaco"
              description="Latidos por minuto (bpm)"
              color="#8b5cf6"
            />
            <SparklineChart
              data={healthMetrics}
              metricType="temperature"
              title="Temperatura"
              description="Grados Celsius (°C)"
              color="#f97316"
            />
            <SparklineChart
              data={healthMetrics}
              metricType="weight"
              title="Peso"
              description="Kilogramos (kg)"
              color="#10b981"
            />
            <SparklineChart
              data={healthMetrics}
              metricType="glucose"
              title="Glucosa"
              description="mg/dL"
              color="#f59e0b"
            />
            <SparklineChart
              data={healthMetrics}
              metricType="oxygenSaturation"
              title="Saturación de Oxígeno"
              description="Porcentaje (%)"
              color="#0ea5e9"
            />
          </div>
        </TabsContent>

        <TabsContent value="vital-signs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SparklineChart
              data={healthMetrics}
              metricType="bloodPressure"
              title="Presión Arterial"
              description="Sistólica/Diastólica (mmHg)"
              color="#ef4444"
            />
            <SparklineChart
              data={healthMetrics}
              metricType="heartRate"
              title="Ritmo Cardíaco"
              description="Latidos por minuto (bpm)"
              color="#8b5cf6"
            />
            <SparklineChart
              data={healthMetrics}
              metricType="temperature"
              title="Temperatura"
              description="Grados Celsius (°C)"
              color="#f97316"
            />
            <SparklineChart
              data={healthMetrics}
              metricType="oxygenSaturation"
              title="Saturación de Oxígeno"
              description="Porcentaje (%)"
              color="#0ea5e9"
            />
          </div>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SparklineChart
              data={healthMetrics}
              metricType="weight"
              title="Peso"
              description="Kilogramos (kg)"
              color="#10b981"
            />
            <SparklineChart
              data={healthMetrics}
              metricType="glucose"
              title="Glucosa"
              description="mg/dL"
              color="#f59e0b"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}