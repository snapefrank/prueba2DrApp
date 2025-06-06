import { db } from "../server/db";
import { specialties } from "../shared/schema";
import { eq } from "drizzle-orm";

const specialtiesList = [
  // 20 especialidades más populares (serán marcadas como isPopular: true)
  { name: "Medicina General", description: "Atención médica integral para pacientes de todas las edades", category: "médica", isPopular: true, displayOrder: 1 },
  { name: "Pediatría", description: "Atención médica especializada para bebés, niños y adolescentes", category: "médica", isPopular: true, displayOrder: 2 },
  { name: "Ginecología y Obstetricia", description: "Especialistas en salud femenina, embarazo y parto", category: "médica", isPopular: true, displayOrder: 3 },
  { name: "Cardiología", description: "Especialistas en el corazón y sistema circulatorio", category: "médica", isPopular: true, displayOrder: 4 },
  { name: "Dermatología", description: "Especialistas en el cuidado y tratamiento de la piel", category: "médica", isPopular: true, displayOrder: 5 },
  { name: "Psiquiatría", description: "Diagnóstico y tratamiento médico de trastornos mentales", category: "médica", isPopular: true, displayOrder: 6 },
  { name: "Psicología", description: "Atención para el bienestar emocional y salud mental", category: "salud mental", isPopular: true, displayOrder: 7 },
  { name: "Odontología", description: "Cuidado de la salud dental y bucal", category: "dental", isPopular: true, displayOrder: 8 },
  { name: "Oftalmología", description: "Especialistas en la visión y enfermedades oculares", category: "médica", isPopular: true, displayOrder: 9 },
  { name: "Nutrición", description: "Asesoramiento nutricional y planes alimenticios personalizados", category: "nutricional", isPopular: true, displayOrder: 10 },
  { name: "Traumatología", description: "Especialistas en lesiones y enfermedades del sistema musculoesquelético", category: "médica", isPopular: true, displayOrder: 11 },
  { name: "Neurología", description: "Especialistas en el sistema nervioso y enfermedades neurológicas", category: "médica", isPopular: true, displayOrder: 12 },
  { name: "Endocrinología", description: "Especialistas en glándulas y hormonas", category: "médica", isPopular: true, displayOrder: 13 },
  { name: "Otorrinolaringología", description: "Especialistas en oído, nariz y garganta", category: "médica", isPopular: true, displayOrder: 14 },
  { name: "Gastroenterología", description: "Especialistas en el sistema digestivo", category: "médica", isPopular: true, displayOrder: 15 },
  { name: "Urología", description: "Especialistas en el sistema urinario y reproductor masculino", category: "médica", isPopular: true, displayOrder: 16 },
  { name: "Fisioterapia", description: "Rehabilitación física y tratamiento del dolor", category: "terapéutica", isPopular: true, displayOrder: 17 },
  { name: "Alergología", description: "Diagnóstico y tratamiento de alergias", category: "médica", isPopular: true, displayOrder: 18 },
  { name: "Neumología", description: "Especialistas en pulmones y sistema respiratorio", category: "médica", isPopular: true, displayOrder: 19 },
  { name: "Reumatología", description: "Especialistas en enfermedades reumáticas y autoinmunes", category: "médica", isPopular: true, displayOrder: 20 },
  
  // Especialidades médicas adicionales
  { name: "Anestesiología", description: "Especialistas en anestesia y manejo del dolor", category: "médica", isPopular: false, displayOrder: 21 },
  { name: "Cirugía General", description: "Procedimientos quirúrgicos generales", category: "médica", isPopular: false, displayOrder: 22 },
  { name: "Cirugía Plástica", description: "Procedimientos reconstructivos y estéticos", category: "médica", isPopular: false, displayOrder: 23 },
  { name: "Cirugía Cardíaca", description: "Intervenciones quirúrgicas en el corazón", category: "médica", isPopular: false, displayOrder: 24 },
  { name: "Cirugía Vascular", description: "Intervenciones en el sistema vascular", category: "médica", isPopular: false, displayOrder: 25 },
  { name: "Cirugía Pediátrica", description: "Procedimientos quirúrgicos en niños", category: "médica", isPopular: false, displayOrder: 26 },
  { name: "Hematología", description: "Especialistas en enfermedades de la sangre", category: "médica", isPopular: false, displayOrder: 27 },
  { name: "Oncología", description: "Tratamiento del cáncer", category: "médica", isPopular: false, displayOrder: 28 },
  { name: "Geriatría", description: "Atención médica especializada para adultos mayores", category: "médica", isPopular: false, displayOrder: 29 },
  { name: "Medicina Interna", description: "Diagnóstico y tratamiento de enfermedades en adultos", category: "médica", isPopular: false, displayOrder: 30 },
  { name: "Nefrología", description: "Especialistas en riñones", category: "médica", isPopular: false, displayOrder: 31 },
  { name: "Infectología", description: "Especialistas en enfermedades infecciosas", category: "médica", isPopular: false, displayOrder: 32 },
  { name: "Medicina Física y Rehabilitación", description: "Recuperación funcional tras lesiones o enfermedades", category: "terapéutica", isPopular: false, displayOrder: 33 },
  { name: "Medicina del Deporte", description: "Atención médica para deportistas", category: "médica", isPopular: false, displayOrder: 34 },
  { name: "Medicina del Trabajo", description: "Especialistas en salud laboral", category: "médica", isPopular: false, displayOrder: 35 },
  { name: "Medicina Familiar", description: "Atención médica integral para toda la familia", category: "médica", isPopular: false, displayOrder: 36 },
  { name: "Medicina Preventiva", description: "Enfoque en prevención de enfermedades", category: "médica", isPopular: false, displayOrder: 37 },
  { name: "Neurocirugía", description: "Intervenciones quirúrgicas en el sistema nervioso", category: "médica", isPopular: false, displayOrder: 38 },
  { name: "Medicina Estética", description: "Procedimientos no quirúrgicos con fines estéticos", category: "estética", isPopular: false, displayOrder: 39 },
  { name: "Radiología", description: "Diagnóstico por imágenes", category: "médica", isPopular: false, displayOrder: 40 },
  { name: "Ortopedia", description: "Corrección de deformidades del sistema musculoesquelético", category: "médica", isPopular: false, displayOrder: 41 },
  { name: "Proctología", description: "Especialistas en enfermedades del colon, recto y ano", category: "médica", isPopular: false, displayOrder: 42 },
  { name: "Medicina Nuclear", description: "Diagnóstico y tratamiento con materiales radiactivos", category: "médica", isPopular: false, displayOrder: 43 },
  { name: "Medicina Paliativa", description: "Cuidados para pacientes con enfermedades terminales", category: "médica", isPopular: false, displayOrder: 44 },

  // Especialidades dentales
  { name: "Ortodoncia", description: "Corrección de la alineación dental", category: "dental", isPopular: false, displayOrder: 45 },
  { name: "Endodoncia", description: "Tratamiento de conductos dentales", category: "dental", isPopular: false, displayOrder: 46 },
  { name: "Periodoncia", description: "Tratamiento de las encías", category: "dental", isPopular: false, displayOrder: 47 },
  { name: "Odontopediatría", description: "Atención dental para niños", category: "dental", isPopular: false, displayOrder: 48 },
  { name: "Prostodoncia", description: "Restauración dental con prótesis", category: "dental", isPopular: false, displayOrder: 49 },
  { name: "Cirugía Maxilofacial", description: "Cirugía de cara, boca y mandíbula", category: "dental", isPopular: false, displayOrder: 50 },
  { name: "Odontología Estética", description: "Mejora estética de la sonrisa", category: "dental", isPopular: false, displayOrder: 51 },
  { name: "Implantología Dental", description: "Colocación de implantes dentales", category: "dental", isPopular: false, displayOrder: 52 },

  // Especialidades en salud mental
  { name: "Psicología Clínica", description: "Diagnóstico y tratamiento de trastornos psicológicos", category: "salud mental", isPopular: false, displayOrder: 53 },
  { name: "Psicología Infantil", description: "Atención psicológica para niños", category: "salud mental", isPopular: false, displayOrder: 54 },
  { name: "Psicoanálisis", description: "Enfoque psicoanalítico para el tratamiento mental", category: "salud mental", isPopular: false, displayOrder: 55 },
  { name: "Terapia Familiar", description: "Intervención para mejorar la dinámica familiar", category: "salud mental", isPopular: false, displayOrder: 56 },
  { name: "Terapia de Pareja", description: "Atención para resolver conflictos de pareja", category: "salud mental", isPopular: false, displayOrder: 57 },
  { name: "Neuropsicología", description: "Estudio de la relación entre cerebro y comportamiento", category: "salud mental", isPopular: false, displayOrder: 58 },
  { name: "Psiquiatría Infantil", description: "Atención psiquiátrica especializada para niños", category: "salud mental", isPopular: false, displayOrder: 59 },
  { name: "Paidopsiquiatría", description: "Psiquiatría especializada en niños y adolescentes", category: "salud mental", isPopular: false, displayOrder: 60 },

  // Otras especialidades terapéuticas
  { name: "Terapia Ocupacional", description: "Rehabilitación a través de actividades cotidianas", category: "terapéutica", isPopular: false, displayOrder: 61 },
  { name: "Fonoaudiología", description: "Diagnóstico y tratamiento de trastornos de comunicación", category: "terapéutica", isPopular: false, displayOrder: 62 },
  { name: "Logopedia", description: "Tratamiento de trastornos del habla y lenguaje", category: "terapéutica", isPopular: false, displayOrder: 63 },
  { name: "Podología", description: "Cuidado y tratamiento de problemas en los pies", category: "terapéutica", isPopular: false, displayOrder: 64 },
  { name: "Osteopatía", description: "Terapia manual para trastornos musculoesqueléticos", category: "terapéutica", isPopular: false, displayOrder: 65 },
  { name: "Quiropraxia", description: "Diagnóstico y tratamiento manual del sistema musculoesquelético", category: "terapéutica", isPopular: false, displayOrder: 66 },
  { name: "Acupuntura", description: "Terapia basada en la medicina tradicional china", category: "terapéutica", isPopular: false, displayOrder: 67 },
  { name: "Naturopatía", description: "Tratamientos naturales para promover la salud", category: "terapéutica", isPopular: false, displayOrder: 68 },
  { name: "Homeopatía", description: "Tratamiento con sustancias diluidas", category: "terapéutica", isPopular: false, displayOrder: 69 },

  // Especialidades en nutrición
  { name: "Nutrición Deportiva", description: "Planes nutricionales para deportistas", category: "nutricional", isPopular: false, displayOrder: 70 },
  { name: "Nutrición Clínica", description: "Tratamiento nutricional para condiciones médicas", category: "nutricional", isPopular: false, displayOrder: 71 },
  { name: "Dietética", description: "Diseño de dietas personalizadas", category: "nutricional", isPopular: false, displayOrder: 72 },
  { name: "Nutrición Pediátrica", description: "Nutrición especializada para niños", category: "nutricional", isPopular: false, displayOrder: 73 },

  // Especialidades relacionadas con la visión
  { name: "Optometría", description: "Examen visual y corrección de problemas refractivos", category: "visión", isPopular: false, displayOrder: 74 },
  { name: "Oftalmología Pediátrica", description: "Atención oftalmológica para niños", category: "visión", isPopular: false, displayOrder: 75 },
  { name: "Cirugía Refractiva", description: "Corrección quirúrgica de problemas visuales", category: "visión", isPopular: false, displayOrder: 76 },
  { name: "Retinología", description: "Especialista en enfermedades de la retina", category: "visión", isPopular: false, displayOrder: 77 },
  
  // Especialidades de medicina alternativa
  { name: "Medicina Tradicional China", description: "Enfoque tradicional oriental para la salud", category: "alternativa", isPopular: false, displayOrder: 78 },
  { name: "Reflexología", description: "Terapia basada en la aplicación de presión en pies y manos", category: "alternativa", isPopular: false, displayOrder: 79 },
  { name: "Aromaterapia", description: "Uso terapéutico de aceites esenciales", category: "alternativa", isPopular: false, displayOrder: 80 },
  { name: "Medicina Ayurvédica", description: "Sistema holístico de medicina originario de la India", category: "alternativa", isPopular: false, displayOrder: 81 },
  
  // Subespecialidades médicas
  { name: "Cardiología Intervencionista", description: "Procedimientos mínimamente invasivos para cardiopatías", category: "médica", isPopular: false, displayOrder: 82 },
  { name: "Electrofisiología Cardíaca", description: "Diagnóstico y tratamiento de arritmias", category: "médica", isPopular: false, displayOrder: 83 },
  { name: "Neurología Pediátrica", description: "Atención neurológica para niños", category: "médica", isPopular: false, displayOrder: 84 },
  { name: "Neurofisiología Clínica", description: "Estudio de la función del sistema nervioso", category: "médica", isPopular: false, displayOrder: 85 },
  { name: "Hepatología", description: "Especialista en enfermedades del hígado", category: "médica", isPopular: false, displayOrder: 86 },
  { name: "Coloproctología", description: "Especialista en enfermedades del colon y recto", category: "médica", isPopular: false, displayOrder: 87 },
  { name: "Dermatología Pediátrica", description: "Atención dermatológica para niños", category: "médica", isPopular: false, displayOrder: 88 },
  { name: "Alergia e Inmunología Pediátrica", description: "Atención de alergias en niños", category: "médica", isPopular: false, displayOrder: 89 },
  { name: "Ginecología Oncológica", description: "Tratamiento de cánceres del sistema reproductor femenino", category: "médica", isPopular: false, displayOrder: 90 },
  { name: "Medicina Materno-Fetal", description: "Atención de embarazos de alto riesgo", category: "médica", isPopular: false, displayOrder: 91 },
  { name: "Endocrinología Pediátrica", description: "Atención de trastornos hormonales en niños", category: "médica", isPopular: false, displayOrder: 92 },
  { name: "Neumología Pediátrica", description: "Atención respiratoria para niños", category: "médica", isPopular: false, displayOrder: 93 },
  { name: "Reumatología Pediátrica", description: "Atención reumatológica para niños", category: "médica", isPopular: false, displayOrder: 94 },
  { name: "Gastroenterología Pediátrica", description: "Atención digestiva para niños", category: "médica", isPopular: false, displayOrder: 95 },
  { name: "Urología Pediátrica", description: "Atención urológica para niños", category: "médica", isPopular: false, displayOrder: 96 },
  { name: "Nefrología Pediátrica", description: "Atención renal para niños", category: "médica", isPopular: false, displayOrder: 97 },
  { name: "Hematología Pediátrica", description: "Atención hematológica para niños", category: "médica", isPopular: false, displayOrder: 98 },
  { name: "Oncología Pediátrica", description: "Tratamiento del cáncer en niños", category: "médica", isPopular: false, displayOrder: 99 },
  { name: "Oncología Radioterápica", description: "Tratamiento del cáncer con radioterapia", category: "médica", isPopular: false, displayOrder: 100 },
  { name: "Oncología Médica", description: "Tratamiento médico del cáncer", category: "médica", isPopular: false, displayOrder: 101 },
  { name: "Medicina Intensiva", description: "Cuidados intensivos y críticos", category: "médica", isPopular: false, displayOrder: 102 },
  { name: "Medicina de Urgencias", description: "Atención médica de emergencia", category: "médica", isPopular: false, displayOrder: 103 },
  { name: "Cuidados Paliativos", description: "Atención para mejorar calidad de vida en enfermedades graves", category: "médica", isPopular: false, displayOrder: 104 },
  { name: "Genética Médica", description: "Diagnóstico y manejo de enfermedades genéticas", category: "médica", isPopular: false, displayOrder: 105 },
  { name: "Inmunología Clínica", description: "Atención de trastornos del sistema inmune", category: "médica", isPopular: false, displayOrder: 106 }
];

// Importación de íconos para especialidades comunes
const specialtyIcons = {
  "Cardiología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  "Neurología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>',
  "Pediatría": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-baby"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>',
  "Oftalmología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  "Traumatología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bone"><path d="M17 10c.7-.7 1.69-1 2.5-1a3.5 3.5 0 0 1 0 7c-.81 0-1.8-.3-2.5-1"/><path d="M17 14c-.7.7-1.69 1-2.5 1a3.5 3.5 0 0 1 0-7c.81 0 1.8.3 2.5 1"/><path d="M14 10c-.7-.7-1.69-1-2.5-1a3.5 3.5 0 0 0 0 7c.81 0 1.8-.3 2.5-1"/><path d="M14 14c.7.7 1.69 1 2.5 1a3.5 3.5 0 0 0 0-7c-.81 0-1.8.3-2.5 1"/></svg>',
  "Medicina General": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-stethoscope"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>',
  "Dermatología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>',
  "Endocrinología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pill"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>',
  "Oncología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-microscope"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h.01"/><path d="M9 8a3 3 0 0 0-2.83 4"/><path d="M14 8h-4"/></svg>',
  "Ginecología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-pulse"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4 .5-1h8.78"/></svg>',
  "Otorrinolaringología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ear"><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/></svg>',
  "Inmunología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-syringe"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="m19 9-3-3"/><path d="m2 22 4-4"/><path d="m7 17-3 3"/><path d="m9 19-3-3"/><path d="M11 13V8l-5 5v5h5z"/><path d="m16 16-4-4"/><path d="m19 13-4 4"/><path d="m13 19 4-4"/></svg>',
  "Reumatología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>',
  "Psicología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain-circuit"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 1.98-2.94 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-2.96-3.08A2.5 2.5 0 0 0 12 4.5Z"/><path d="M12 8v12"/><path d="M8 9v.01"/><path d="M16 9v.01"/><path d="M8 14v.01"/><path d="M16 14v.01"/></svg>',
  "Odontología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tooth"><path d="M12 5.5c-1.5-1-2.5-2-2.5-3.1-.1-.8.5-1.9 1.5-1.9.8 0 1.5.2 2 1 .5-.8 1.2-1 2-1 1 0 1.6 1.1 1.5 1.9 0 1.1-1 2.1-2.5 3.1"/><path d="M12 5.5C8 7 8.3 12.5 8 20c0 .5.2 1 .8 1 .6 0 1-.5 1.2-1 .2-.5.4-.8 1-.8s.8.3 1 .8c.2.5.6 1 1.2 1 .6 0 .8-.5.8-1-.3-7.5 0-13-5-14.5Z"/></svg>',
  "Psiquiatría": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain-cog"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 1.98-2.94 2.5 2.5 0 0 0 1.32-4.24 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-2.96-3.08A2.5 2.5 0 0 0 12 4.5"/><circle cx="12" cy="12" r="3"/><path d="M12 8v1"/><path d="M12 15v1"/><path d="M16 12h-1"/><path d="M9 12H8"/><path d="m14.7 9.7-.7.7"/><path d="m14.7 14.3-.7-.7"/><path d="m9.3 9.7.7.7"/><path d="m9.3 14.3.7-.7"/></svg>',
  "Nutrición": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-apple"><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/></svg>',
  "Gastroenterología": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check"><path d="M8 2a3 3 0 0 0-3 3m11-3a3 3 0 0 1 3 3m0 3v5"/><path d="M2 5a3 3 0 0 1 3-3"/><path d="M5 2a3 3 0 0 1 3 3m3-3h-2m-6 3v14a2 2 0 0 0 2 2h8m-2-4h3a1 1 0 0 0 1-1v-9"/><path d="m9 16 1.5 1.5L15 13"/></svg>',
  "Fisioterapia": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-helping-hand"><path d="M7 11.5V14l2 2"/><path d="M15.5 11.5V10"/><path d="M12 5h2.5"/><path d="M13.5 22h-3a4 4 0 0 1-4-4v-5l2-3v-4a2 2 0 1 1 4 0v4"/><path d="M13.5 22h3a4 4 0 0 0 4-4v-3l-2-4-.5-1"/><path d="M14.5 9 16 8"/></svg>'
};

async function main() {
  try {
    console.log("Iniciando actualización de especialidades...");
    
    for (const specialtyData of specialtiesList) {
      const { name } = specialtyData;
      const existingSpecialty = await db.query.specialties.findFirst({
        where: eq(specialties.name, name)
      });
      
      if (existingSpecialty) {
        console.log(`Actualizando especialidad: ${name}`);
        await db.update(specialties)
          .set({
            description: specialtyData.description,
            isPopular: specialtyData.isPopular,
            category: specialtyData.category,
            displayOrder: specialtyData.displayOrder,
            icon: specialtyIcons[name] || null
          })
          .where(eq(specialties.name, name));
      } else {
        console.log(`Creando nueva especialidad: ${name}`);
        await db.insert(specialties).values({
          name: name,
          description: specialtyData.description,
          isPopular: specialtyData.isPopular,
          category: specialtyData.category,
          displayOrder: specialtyData.displayOrder,
          icon: specialtyIcons[name] || null
        });
      }
    }
    
    console.log("Actualización de especialidades completada.");
    process.exit(0);
  } catch (error) {
    console.error("Error actualizando especialidades:", error);
    process.exit(1);
  }
}

main();