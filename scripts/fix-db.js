import { db } from '../server/db.ts';
import { labTestCatalog } from '../shared/schema.ts';

async function main() {
  try {
    console.log("Creando tabla lab_test_catalog...");
    
    // Crear la tabla directamente usando SQL
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lab_test_catalog (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        description TEXT,
        normal_values TEXT,
        units TEXT,
        preparation_instructions TEXT,
        cofepris_approved BOOLEAN DEFAULT TRUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    
    console.log("Tabla lab_test_catalog creada exitosamente");
    
    // Verificar si la tabla fue creada correctamente
    const result = await db.execute('SELECT * FROM lab_test_catalog LIMIT 1');
    console.log("Verificación exitosa:", result);

    process.exit(0);
  } catch (error) {
    console.error("Error al crear tabla:", error);
    process.exit(1);
  }
}

main();