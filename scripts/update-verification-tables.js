import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { eq } from "drizzle-orm";

// Crear cliente Postgres con URL de la base de datos
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function main() {
  try {
    console.log("Iniciando actualización de tablas de verificación...");

    // Verificar si existen las tablas
    try {
      console.log("Verificando si existen las tablas...");
      // Consulta directa para verificar si la tabla existe
      const result = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'doctor_verification_documents'
        );
      `);
      const tableExists = result.rows && result.rows[0] && result.rows[0].exists;
      
      if (tableExists) {
        console.log("Tabla doctorVerificationDocuments encontrada");
      } else {
        throw new Error("Tabla no encontrada");
      }
    } catch (error) {
      console.log("Creando tabla doctorVerificationDocuments...");
      await db.execute(`
        CREATE TABLE IF NOT EXISTS doctor_verification_documents (
          id SERIAL PRIMARY KEY,
          doctor_id INTEGER NOT NULL REFERENCES users(id),
          document_type TEXT NOT NULL CHECK (document_type IN ('license', 'id', 'specialty_cert', 'specialty_diploma', 'additional')),
          file_url TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
          reviewed_at TIMESTAMP,
          reviewer_id INTEGER REFERENCES users(id),
          notes TEXT
        )
      `);
      console.log("Tabla doctorVerificationDocuments creada con éxito");
    }

    try {
      console.log("Verificando si existe la tabla doctorVerificationHistory...");
      // Consulta directa para verificar si la tabla existe
      const result = await db.execute(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'doctor_verification_history'
        );
      `);
      const tableExists = result.rows && result.rows[0] && result.rows[0].exists;
      
      if (tableExists) {
        console.log("Tabla doctorVerificationHistory encontrada");
      } else {
        throw new Error("Tabla no encontrada");
      }
    } catch (error) {
      console.log("Creando tabla doctorVerificationHistory...");
      await db.execute(`
        CREATE TABLE IF NOT EXISTS doctor_verification_history (
          id SERIAL PRIMARY KEY,
          doctor_id INTEGER NOT NULL REFERENCES users(id),
          status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
          reviewer_id INTEGER REFERENCES users(id),
          notes TEXT,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log("Tabla doctorVerificationHistory creada con éxito");
    }

    console.log("Actualización de tablas de verificación completada con éxito");
  } catch (error) {
    console.error("Error durante la actualización de tablas de verificación:", error);
  } finally {
    await client.end();
  }
}

main();