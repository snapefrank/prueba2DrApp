import { apiRequest, queryClient } from "./queryClient";
import { PatientDocument, InsertPatientDocument } from "@shared/schema";

export async function uploadDocument(document: InsertPatientDocument): Promise<PatientDocument> {
  const res = await apiRequest("POST", "/api/patient-documents", document);
  const data = await res.json();
  
  // Invalidate documents query cache
  queryClient.invalidateQueries({ queryKey: [`/api/patient-documents/${document.patientId}`] });
  
  return data;
}

// Helper function to get document type label
export function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case 'lab_result':
      return 'Resultados de laboratorio';
    case 'prescription':
      return 'Receta médica';
    case 'radiology':
      return 'Estudio radiológico';
    case 'clinical_note':
      return 'Nota clínica';
    case 'medical_certificate':
      return 'Certificado médico';
    case 'referral':
      return 'Referencia médica';
    default:
      return type;
  }
}

// Document type options for forms
export const documentTypeOptions = [
  { value: 'lab_result', label: 'Resultados de laboratorio' },
  { value: 'prescription', label: 'Receta médica' },
  { value: 'radiology', label: 'Estudio radiológico' },
  { value: 'clinical_note', label: 'Nota clínica' },
  { value: 'medical_certificate', label: 'Certificado médico' },
  { value: 'referral', label: 'Referencia médica' },
  { value: 'other', label: 'Otro' }
];

// Helper to format document date
export function formatDocumentDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Function to simulate a document URL for demo purposes
// In a real app, this would be a proper file storage URL
export function getDocumentUrl(document: PatientDocument): string {
  return `https://example.com/documents/${document.id}`;
}
