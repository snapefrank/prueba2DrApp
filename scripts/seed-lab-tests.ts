import { db } from '../server/db';
import { labTestCatalog } from '../shared/schema';

async function main() {
  console.log("Insertando catálogo de pruebas de laboratorio...");

  // Verificar si ya hay registros en la tabla
  const existingTests = await db.query.labTestCatalog.findMany();
  
  if (existingTests.length > 0) {
    console.log(`La tabla ya contiene ${existingTests.length} pruebas de laboratorio.`);
    if (existingTests.length >= 20) {
      console.log("Suficientes registros encontrados. No se añadirán más.");
      return;
    }
  }

  // Lista ampliada de pruebas de laboratorio aprobadas por COFEPRIS
  const labTests = [
    {
      name: "Biometría Hemática Completa",
      category: "laboratorio",
      description: "Análisis completo de las células sanguíneas, incluyendo conteo de glóbulos rojos, blancos y plaquetas",
      normalValues: "Varía según el parámetro y sexo del paciente",
      units: "Varios (células/µL, g/dL, %)",
      preparationInstructions: "Ayuno recomendado de 8 horas",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Química Sanguínea de 6 elementos",
      category: "laboratorio",
      description: "Evaluación de glucosa, urea, creatinina, ácido úrico, colesterol y triglicéridos",
      normalValues: "Glucosa: 70-99 mg/dL, Urea: 15-45 mg/dL",
      units: "mg/dL",
      preparationInstructions: "Ayuno estricto de 12 horas",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Perfil Tiroideo",
      category: "laboratorio",
      description: "Análisis de hormonas tiroideas T3, T4 y TSH",
      normalValues: "T3: 80-200 ng/dL, T4: 5.0-12.0 µg/dL, TSH: 0.3-5.0 µU/mL",
      units: "Varios",
      preparationInstructions: "No requiere ayuno",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Perfil Hepático",
      category: "laboratorio",
      description: "Evaluación completa de la función del hígado",
      normalValues: "ALT: 7-56 U/L, AST: 5-40 U/L, Bilirrubina: 0.2-1.2 mg/dL",
      units: "U/L, mg/dL",
      preparationInstructions: "Ayuno de 8 horas",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Perfil Renal",
      category: "laboratorio",
      description: "Evaluación de la función de los riñones",
      normalValues: "Creatinina: 0.7-1.3 mg/dL, Urea: 15-45 mg/dL, BUN: 7-21 mg/dL",
      units: "mg/dL",
      preparationInstructions: "Ayuno de 8 horas",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Perfil Lipídico",
      category: "laboratorio",
      description: "Análisis de lípidos en sangre",
      normalValues: "Colesterol total: <200 mg/dL, HDL: >40 mg/dL, LDL: <100 mg/dL",
      units: "mg/dL",
      preparationInstructions: "Ayuno de 12 horas",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Hemoglobina Glicosilada (HbA1c)",
      category: "laboratorio",
      description: "Medición del control de glucosa durante los últimos 3 meses",
      normalValues: "4-5.6% (normal), 5.7-6.4% (prediabetes), >6.5% (diabetes)",
      units: "%",
      preparationInstructions: "No requiere ayuno",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Prueba de Embarazo (Beta-hCG)",
      category: "laboratorio",
      description: "Detección de hormona del embarazo en sangre",
      normalValues: "<5 mUI/mL (no embarazo), >25 mUI/mL (posible embarazo)",
      units: "mUI/mL",
      preparationInstructions: "No requiere preparación especial",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Examen General de Orina",
      category: "laboratorio",
      description: "Análisis físico, químico y microscópico de la orina",
      normalValues: "Varía según el parámetro",
      units: "Varios",
      preparationInstructions: "Muestra de la primera orina de la mañana, aseo genital previo",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Cultivo de Orina",
      category: "laboratorio",
      description: "Identificación de bacterias en orina y sensibilidad antibiótica",
      normalValues: "Negativo (sin crecimiento bacteriano)",
      units: "UFC/mL",
      preparationInstructions: "Recolección a mitad del chorro, previo aseo genital",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Radiografía de Tórax PA y Lateral",
      category: "imagen",
      description: "Imagen de los pulmones, corazón y caja torácica en dos proyecciones",
      normalValues: "Interpretación por médico radiólogo",
      units: "N/A",
      preparationInstructions: "Remover objetos metálicos, usar bata de hospital",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Tomografía Computarizada de Cráneo",
      category: "imagen",
      description: "Imagen detallada del cerebro y estructuras craneales",
      normalValues: "Interpretación por médico radiólogo",
      units: "N/A",
      preparationInstructions: "Remover objetos metálicos, informar sobre alergias a contrastes",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Ultrasonido Abdominal",
      category: "imagen",
      description: "Imagen de órganos abdominales mediante ultrasonido",
      normalValues: "Interpretación por médico radiólogo",
      units: "N/A",
      preparationInstructions: "Ayuno de 6-8 horas, vejiga llena (tomar 1L de agua)",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Resonancia Magnética de Columna",
      category: "imagen",
      description: "Imagen detallada de la columna vertebral",
      normalValues: "Interpretación por médico radiólogo",
      units: "N/A",
      preparationInstructions: "Remover objetos metálicos, informar sobre implantes",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Mastografía Bilateral",
      category: "imagen",
      description: "Radiografía de las mamas para detección de cáncer",
      normalValues: "Clasificación BI-RADS por radiólogo",
      units: "N/A",
      preparationInstructions: "No usar desodorante, talco o cremas en axilas y senos",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Electrocardiograma de 12 derivaciones",
      category: "imagen",
      description: "Registro de la actividad eléctrica del corazón",
      normalValues: "Ritmo sinusal, frecuencia 60-100 lpm",
      units: "mV, ms",
      preparationInstructions: "No consumir estimulantes (café, té) 2 horas antes",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Densitometría Ósea",
      category: "imagen",
      description: "Medición de la densidad mineral ósea",
      normalValues: "T-score: >-1 (normal), -1 a -2.5 (osteopenia), <-2.5 (osteoporosis)",
      units: "g/cm²",
      preparationInstructions: "Evitar suplementos de calcio 24 horas antes",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Perfil Viral Hepatitis",
      category: "laboratorio",
      description: "Detección de marcadores de hepatitis A, B y C",
      normalValues: "No reactivo",
      units: "Cualitativo",
      preparationInstructions: "Ayuno de 8 horas recomendado",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Cultivo Faríngeo",
      category: "laboratorio",
      description: "Identificación de bacterias en garganta",
      normalValues: "Negativo (sin crecimiento de patógenos)",
      units: "Cualitativo",
      preparationInstructions: "No usar enjuague bucal 12 horas antes",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Perfil Hormonal Femenino",
      category: "laboratorio",
      description: "Medición de FSH, LH, Estradiol, Progesterona",
      normalValues: "Varía según fase del ciclo menstrual",
      units: "mUI/mL, pg/mL, ng/mL",
      preparationInstructions: "Realizar en días específicos del ciclo menstrual",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Espirometría",
      category: "laboratorio",
      description: "Evaluación de la función pulmonar",
      normalValues: "VEF1/CVF > 70%, VEF1 > 80% del predicho",
      units: "L, L/s, %",
      preparationInstructions: "No fumar 2 horas antes, no medicamentos broncodilatadores",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Ecocardiograma Transtorácico",
      category: "imagen",
      description: "Ultrasonido del corazón para evaluar función y estructura",
      normalValues: "Fracción de eyección 55-70%, válvulas sin alteraciones",
      units: "%, cm, m/s",
      preparationInstructions: "No requiere preparación especial",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "PET-CT de Cuerpo Completo",
      category: "imagen",
      description: "Imagen funcional y anatómica del cuerpo mediante radiofármaco",
      normalValues: "Sin captación anormal del radiofármaco",
      units: "SUV",
      preparationInstructions: "Ayuno de 6 horas, control de glucemia previo",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Ultrasonido Doppler Vascular",
      category: "imagen",
      description: "Evaluación del flujo sanguíneo en vasos",
      normalValues: "Flujo laminar sin obstrucciones",
      units: "cm/s",
      preparationInstructions: "No fumar 2 horas antes",
      cofeprisApproved: true,
      isActive: true
    }
  ];

  // Insertar los registros en la base de datos
  try {
    console.log(`Insertando ${labTests.length} pruebas de laboratorio...`);
    
    // Filtrar pruebas existentes
    const existingNames = existingTests.map(test => test.name);
    const newTests = labTests.filter(test => !existingNames.includes(test.name));
    
    if (newTests.length === 0) {
      console.log("Todas las pruebas ya existen en la base de datos.");
      return;
    }
    
    await db.insert(labTestCatalog).values(newTests);
    console.log(`${newTests.length} pruebas insertadas exitosamente.`);
  } catch (error) {
    console.error("Error al insertar pruebas de laboratorio:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error en el script:", error);
    process.exit(1);
  });