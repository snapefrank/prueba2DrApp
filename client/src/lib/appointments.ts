import { apiRequest, queryClient } from "./queryClient";
import { Appointment, InsertAppointment, User } from "@shared/schema";

// Enhanced appointment type with doctor and patient info
export type EnhancedAppointment = Appointment & {
  doctor: {
    id: number;
    name: string;
  } | null;
  patient: {
    id: number;
    name: string;
  } | null;
};

export async function createAppointment(appointment: InsertAppointment): Promise<EnhancedAppointment> {
  const res = await apiRequest("POST", "/api/appointments", appointment);
  const data = await res.json();
  
  // Invalidate appointments query cache
  queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
  
  return data;
}

export async function updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<EnhancedAppointment> {
  const res = await apiRequest("PATCH", `/api/appointments/${id}`, appointmentData);
  const data = await res.json();
  
  // Invalidate appointments query cache
  queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
  
  return data;
}

// Helper function to format appointment date
export function formatAppointmentDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get status badge color based on appointment status
export function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Get human-readable status
export function getStatusText(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'Programada';
    case 'completed':
      return 'Completada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
}
