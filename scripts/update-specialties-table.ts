import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Iniciando actualización del esquema de especialidades...");

    // Columna icon
    console.log("Añadiendo columna 'icon'...");
    await db.execute(sql`ALTER TABLE specialties ADD COLUMN IF NOT EXISTS icon TEXT;`);

    // Columna is_popular
    console.log("Añadiendo columna 'is_popular'...");
    await db.execute(sql`ALTER TABLE specialties ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;`);

    // Columna category
    console.log("Añadiendo columna 'category'...");
    await db.execute(sql`ALTER TABLE specialties ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'médica';`);

    // Columna display_order
    console.log("Añadiendo columna 'display_order'...");
    await db.execute(sql`ALTER TABLE specialties ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999;`);

    // Hacer que la descripción sea opcional
    console.log("Haciendo que la columna 'description' sea opcional...");
    await db.execute(sql`ALTER TABLE specialties ALTER COLUMN description DROP NOT NULL;`);

    console.log("Actualización del esquema completada correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error actualizando esquema:", error);
    process.exit(1);
  }
}

main();