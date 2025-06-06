import { db, pool } from "../server/db";
import { createSecurePgConfig } from "../server/utils"; 
import * as dotenv from "dotenv";
import { 
  labTestCatalog,
  laboratories,
  InsertLabTestCatalog,
  InsertLaboratory
} from "@shared/schema";

// Cargar variables de entorno si existen
dotenv.config();

async function main() {
  console.log("Iniciando carga de catálogo de laboratorio...");
  
  // Laboratorios
  const labsToAdd: InsertLaboratory[] = [
    {
      name: "Laboratorio Médica Sur",
      address: "Puente de Piedra 150, Toriello Guerra, Tlalpan, 14050 Ciudad de México, CDMX",
      contactInfo: "Tel: 55 5424 7200",
      isActive: true
    },
    {
      name: "Laboratorios Chopo",
      address: "Multiple locations",
      contactInfo: "Tel: 55 5424 6900",
      isActive: true
    },
    {
      name: "Laboratorios Polanco",
      address: "Multiple locations",
      contactInfo: "Tel: 55 5531 0107",
      isActive: true
    },
    {
      name: "Salud Digna",
      address: "Multiple locations",
      contactInfo: "Tel: 800 0060 618",
      isActive: true
    },
    {
      name: "Olab Diagnósticos",
      address: "Multiple locations",
      contactInfo: "Tel: 800 1100 160",
      isActive: true
    }
  ];
  
  // Estudios de laboratorio
  const testsToAdd: InsertLabTestCatalog[] = [
    // Laboratorio (análisis de sangre)
    {
      name: "Biometría Hemática Completa",
      category: "laboratorio",
      description: "Análisis completo de células sanguíneas incluyendo conteo de glóbulos rojos, blancos y plaquetas",
      normalValues: "Varía según parámetro y sexo",
      units: "Varios",
      preparationInstructions: "Ayuno de 8 horas",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Química Sanguínea 27 elementos",
      category: "laboratorio",
      description: "Panel completo que incluye glucosa, colesterol, triglicéridos, enzimas hepáticas y más",
      normalValues: "Varía según parámetro",
      units: "mg/dL",
      preparationInstructions: "Ayuno de 12 horas",
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
      name: "Perfil Lipídico",
      category: "laboratorio",
      description: "Análisis de grasas en sangre",
      normalValues: "Colesterol total: <200 mg/dL, HDL: >40 mg/dL, LDL: <100 mg/dL, Triglicéridos: <150 mg/dL",
      units: "mg/dL",
      preparationInstructions: "Ayuno de 12 horas",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Hemoglobina Glucosilada",
      category: "laboratorio",
      description: "Medición del control de glucosa durante los últimos 3 meses",
      normalValues: "4-5.6%",
      units: "%",
      preparationInstructions: "No requiere ayuno",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Prueba de Embarazo en Sangre (Beta-HCG)",
      category: "laboratorio",
      description: "Determina la presencia de la hormona gonadotropina coriónica humana",
      normalValues: "Positivo: >5 mUI/mL, Negativo: <5 mUI/mL",
      units: "mUI/mL",
      preparationInstructions: "No requiere ayuno",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Examen General de Orina",
      category: "laboratorio",
      description: "Análisis físico, químico y microscópico de la orina",
      normalValues: "Varía según parámetro",
      units: "Varios",
      preparationInstructions: "Muestra de primera orina de la mañana",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Perfil Hepático",
      category: "laboratorio",
      description: "Evaluación de la función del hígado",
      normalValues: "AST: 5-40 U/L, ALT: 5-40 U/L, GGT: 8-61 U/L",
      units: "U/L",
      preparationInstructions: "Ayuno de 8 horas",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Perfil Renal",
      category: "laboratorio",
      description: "Evaluación de la función renal",
      normalValues: "Creatinina: 0.6-1.2 mg/dL, BUN: 7-20 mg/dL",
      units: "mg/dL",
      preparationInstructions: "Ayuno de 8 horas",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Antígeno Prostático Específico (PSA)",
      category: "laboratorio",
      description: "Evaluación para detección de problemas en la próstata",
      normalValues: "<4 ng/mL",
      units: "ng/mL",
      preparationInstructions: "No requiere ayuno",
      cofeprisApproved: true,
      isActive: true
    },
    
    // Estudios de imagen
    {
      name: "Radiografía de Tórax",
      category: "imagen",
      description: "Imagen de los pulmones, corazón y costillas",
      normalValues: "Interpretación médica",
      units: "N/A",
      preparationInstructions: "Remover objetos metálicos, joyas y retirar ropa de la cintura hacia arriba",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Tomografía Computarizada",
      category: "imagen",
      description: "Imagen detallada de órganos internos en capas",
      normalValues: "Interpretación médica",
      units: "N/A",
      preparationInstructions: "Ayuno de 4 horas, informar sobre alergias a contrastes",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Ultrasonido Abdominal",
      category: "imagen",
      description: "Imagen de órganos abdominales usando ondas sonoras",
      normalValues: "Interpretación médica",
      units: "N/A",
      preparationInstructions: "Ayuno de 8 horas, vejiga llena",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Resonancia Magnética",
      category: "imagen",
      description: "Imagen detallada de tejidos blandos usando campos magnéticos",
      normalValues: "Interpretación médica",
      units: "N/A",
      preparationInstructions: "Remover objetos metálicos, informar sobre implantes o dispositivos metálicos en el cuerpo",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Mamografía",
      category: "imagen",
      description: "Radiografía específica para tejido mamario",
      normalValues: "BIRADS 1-2",
      units: "N/A",
      preparationInstructions: "No usar desodorante, talco o crema en el área de los senos el día del estudio",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Densitometría Ósea",
      category: "imagen",
      description: "Evaluación de la densidad mineral ósea",
      normalValues: "T-score > -1.0",
      units: "g/cm²",
      preparationInstructions: "No requiere preparación especial",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Ecocardiograma",
      category: "imagen",
      description: "Ultrasonido del corazón para evaluar estructura y función",
      normalValues: "Interpretación médica",
      units: "N/A",
      preparationInstructions: "No requiere preparación especial",
      cofeprisApproved: true,
      isActive: true
    },
    {
      name: "Electrocardiograma",
      category: "imagen",
      description: "Registro de la actividad eléctrica del corazón",
      normalValues: "Interpretación médica",
      units: "N/A",
      preparationInstructions: "No consumir estimulantes (café, tabaco) 3 horas antes",
      cofeprisApproved: true,
      isActive: true
    }
  ];
  
  // Insertar laboratorios
  for (const lab of labsToAdd) {
    try {
      const exists = await db.query.laboratories.findFirst({
        where: (laboratories, { eq }) => eq(laboratories.name, lab.name)
      });
      
      if (!exists) {
        console.log(`Agregando laboratorio: ${lab.name}`);
        await db.insert(laboratories).values(lab);
      } else {
        console.log(`Laboratorio ya existe: ${lab.name}`);
      }
    } catch (error) {
      console.error(`Error al agregar laboratorio ${lab.name}:`, error);
    }
  }
  
  // Insertar estudios
  for (const test of testsToAdd) {
    try {
      const exists = await db.query.labTestCatalog.findFirst({
        where: (labTestCatalog, { eq }) => eq(labTestCatalog.name, test.name)
      });
      
      if (!exists) {
        console.log(`Agregando estudio: ${test.name}`);
        await db.insert(labTestCatalog).values(test);
      } else {
        console.log(`Estudio ya existe: ${test.name}`);
      }
    } catch (error) {
      console.error(`Error al agregar estudio ${test.name}:`, error);
    }
  }
  
  console.log("Catálogo de laboratorio inicializado correctamente.");
  await pool.end();
}

main().catch(error => {
  console.error("Error al inicializar catálogo de laboratorio:", error);
  process.exit(1);
});