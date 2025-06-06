import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configurar Neon para WebSockets
neonConfig.webSocketConstructor = ws;

// Verificar si tenemos la URL de la base de datos
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida");
}

// Crear pool de conexiones
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Crear objeto de base de datos
const db = {
  async execute(query, params = []) {
    try {
      return await pool.query(query, params);
    } catch (error) {
      console.error("Error ejecutando consulta:", error);
      throw error;
    }
  }
};

async function main() {
  try {
    console.log("Actualizando esquema de la base de datos...");
    
    // Verificar si la columna 'type' existe y eliminarla si es así
    const checkTypeColumn = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'type';
    `);
    
    if (checkTypeColumn.rows.length > 0) {
      console.log("Eliminando columna 'type' de la tabla appointments...");
      await db.execute(`ALTER TABLE appointments DROP COLUMN IF EXISTS "type";`);
    }
    
    // Verificar si la columna 'appointment_type' ya existe
    const checkAppointmentTypeColumn = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' AND column_name = 'appointment_type';
    `);
    
    // Si no existe, crearla
    if (checkAppointmentTypeColumn.rows.length === 0) {
      console.log("Agregando columna 'appointment_type' a la tabla appointments...");
      await db.execute(`
        ALTER TABLE appointments 
        ADD COLUMN appointment_type TEXT DEFAULT 'first_visit';
      `);
    }
    
    // Verificar si la columna 'bio' existe en doctor_profiles
    const checkBioColumn = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'doctor_profiles' AND column_name = 'bio';
    `);
    
    // Si existe, eliminarla
    if (checkBioColumn.rows.length > 0) {
      console.log("Eliminando columna 'bio' de la tabla doctor_profiles...");
      await db.execute(`ALTER TABLE doctor_profiles DROP COLUMN IF EXISTS "bio";`);
    }
    
    console.log("Esquema actualizado exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("Error al actualizar esquema:", error);
    process.exit(1);
  }
}

main();