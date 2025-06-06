import React, { useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthMetric } from '@shared/schema';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface SparklineChartProps {
  data: HealthMetric[];
  metricType: 'bloodPressure' | 'heartRate' | 'temperature' | 'weight' | 'oxygenSaturation' | 'glucose';
  title: string;
  description: string;
  color?: string;
  limit?: number;
}

// Función para extraer el valor correspondiente según el tipo de métrica
const extractValue = (metric: HealthMetric, type: string) => {
  switch (type) {
    case 'bloodPressure':
      return {
        systolic: metric.bloodPressureSystolic,
        diastolic: metric.bloodPressureDiastolic,
        hasSomeValue: metric.bloodPressureSystolic !== null || metric.bloodPressureDiastolic !== null
      };
    case 'heartRate':
      return {
        value: metric.heartRate,
        hasSomeValue: metric.heartRate !== null
      };
    case 'temperature':
      return {
        value: metric.temperature !== null ? parseFloat(metric.temperature!) : null,
        hasSomeValue: metric.temperature !== null
      };
    case 'weight':
      return {
        value: metric.weight !== null ? parseFloat(metric.weight!) : null,
        hasSomeValue: metric.weight !== null
      };
    case 'oxygenSaturation':
      return {
        value: metric.oxygenSaturation,
        hasSomeValue: metric.oxygenSaturation !== null
      };
    case 'glucose':
      return {
        value: metric.glucose,
        hasSomeValue: metric.glucose !== null
      };
    default:
      return {
        value: null,
        hasSomeValue: false
      };
  }
};

export default function SparklineChart({
  data,
  metricType,
  title,
  description,
  color = '#3b82f6',
  limit = 10
}: SparklineChartProps) {
  const { toast } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);

  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    return data
      .filter(metric => {
        const extracted = extractValue(metric, metricType);
        return extracted.hasSomeValue;
      })
      .sort((a, b) => new Date(a.metricDate).getTime() - new Date(b.metricDate).getTime())
      .slice(-limit)
      .map(metric => {
        const date = new Date(metric.metricDate);
        if (metricType === 'bloodPressure') {
          const { systolic, diastolic } = extractValue(metric, metricType);
          return {
            date,
            dateFormatted: formatDistanceToNow(date, { addSuffix: true, locale: es }),
            valueA: systolic,
            valueB: diastolic,
            dateString: metric.metricDate,
            notes: metric.notes
          };
        } else {
          const { value } = extractValue(metric, metricType);
          return {
            date,
            dateFormatted: formatDistanceToNow(date, { addSuffix: true, locale: es }),
            value,
            dateString: metric.metricDate,
            notes: metric.notes
          };
        }
      });
  }, [data, metricType, limit]);

  // Calcular valores máximos, mínimos y promedios para métricas
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    if (metricType === 'bloodPressure') {
      const systolicValues = chartData.map(d => d.valueA).filter(v => v !== null) as number[];
      const diastolicValues = chartData.map(d => d.valueB).filter(v => v !== null) as number[];
      
      return {
        avgA: systolicValues.length ? Math.round(systolicValues.reduce((sum, val) => sum + val, 0) / systolicValues.length) : null,
        maxA: systolicValues.length ? Math.max(...systolicValues) : null,
        minA: systolicValues.length ? Math.min(...systolicValues) : null,
        avgB: diastolicValues.length ? Math.round(diastolicValues.reduce((sum, val) => sum + val, 0) / diastolicValues.length) : null,
        maxB: diastolicValues.length ? Math.max(...diastolicValues) : null,
        minB: diastolicValues.length ? Math.min(...diastolicValues) : null,
        lastValueA: chartData[chartData.length - 1]?.valueA,
        lastValueB: chartData[chartData.length - 1]?.valueB,
        lastDate: chartData[chartData.length - 1]?.dateFormatted
      };
    } else {
      const values = chartData.map(d => d.value).filter(v => v !== null) as number[];
      
      return {
        avg: values.length ? 
          metricType === 'temperature' || metricType === 'weight' 
            ? (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)
            : Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
          : null,
        max: values.length ? Math.max(...values) : null,
        min: values.length ? Math.min(...values) : null,
        lastValue: chartData[chartData.length - 1]?.value,
        lastDate: chartData[chartData.length - 1]?.dateFormatted
      };
    }
  }, [chartData, metricType]);

  // Agregar efectos de animación cuando el componente se monta
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.classList.add('animate-in', 'fade-in', 'duration-700');
    }
  }, []);

  // Si no hay datos para este tipo de métrica, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <Card ref={chartRef} className="overflow-hidden">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="text-muted-foreground mb-2">No hay datos registrados</div>
          <div className="text-sm text-muted-foreground">
            Registra tu primera métrica para ver tendencias
          </div>
        </CardContent>
      </Card>
    );
  }

  // Función para mostrar detalles al hacer click en un punto del gráfico
  const handleChartClick = (data: any) => {
    if (!data) return;
    
    const formattedDate = new Date(data.dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    let message;
    if (metricType === 'bloodPressure') {
      message = `${data.valueA || '?'}/${data.valueB || '?'} mmHg`;
    } else {
      switch (metricType) {
        case 'heartRate':
          message = `${data.value} bpm`;
          break;
        case 'temperature':
          message = `${data.value} °C`;
          break;
        case 'weight':
          message = `${data.value} kg`;
          break;
        case 'oxygenSaturation':
          message = `${data.value}%`;
          break;
        case 'glucose':
          message = `${data.value} mg/dL`;
          break;
      }
    }
    
    toast({
      title: `${title} - ${formattedDate}`,
      description: <div>
        <p className="font-medium">{message}</p>
        {data.notes && <p className="text-sm mt-1">{data.notes}</p>}
      </div>,
    });
  };

  return (
    <Card ref={chartRef} className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current value display */}
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm text-muted-foreground">Último registro: {stats?.lastDate}</div>
          <div className="font-bold text-xl">
            {metricType === 'bloodPressure' 
              ? `${stats?.lastValueA || '-'}/${stats?.lastValueB || '-'}`
              : stats?.lastValue || '-'}
          </div>
        </div>

        {/* Line chart */}
        <div className="w-full h-[150px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              onClick={(e) => e && e.activePayload && handleChartClick(e.activePayload[0].payload)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="dateFormatted" 
                hide={true}
              />
              <YAxis hide={true} />
              <Tooltip 
                formatter={(value, name) => [value, name === 'valueB' ? 'Diastólica' : name === 'valueA' ? 'Sistólica' : title]}
                labelFormatter={(label) => 'Fecha: ' + label}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px'
                }}
              />
              {metricType === 'bloodPressure' ? (
                <>
                  <Line 
                    type="monotone"
                    dataKey="valueA" 
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5, fill: color }}
                    name="Sistólica"
                    connectNulls
                  />
                  <Line 
                    type="monotone"
                    dataKey="valueB" 
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#94a3b8' }}
                    activeDot={{ r: 5, fill: '#94a3b8' }}
                    name="Diastólica"
                    connectNulls
                  />
                </>
              ) : (
                <Line 
                  type="monotone"
                  dataKey="value" 
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: color }}
                  activeDot={{ r: 5, fill: color }}
                  name={title}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="flex justify-between mt-4 text-sm text-muted-foreground">
          {metricType === 'bloodPressure' ? (
            <>
              <div>S: {stats?.minA ?? '-'}/{stats?.minB ?? '-'} <span className="ml-1">min</span></div>
              <div>S: {stats?.avgA ?? '-'}/{stats?.avgB ?? '-'} <span className="ml-1">prom</span></div>
              <div>S: {stats?.maxA ?? '-'}/{stats?.maxB ?? '-'} <span className="ml-1">max</span></div>
            </>
          ) : (
            <>
              <div>{stats?.min ?? '-'} <span className="ml-1">min</span></div>
              <div>{stats?.avg ?? '-'} <span className="ml-1">prom</span></div>
              <div>{stats?.max ?? '-'} <span className="ml-1">max</span></div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}