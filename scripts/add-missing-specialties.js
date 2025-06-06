// Añadir especialidades faltantes: Psicología y Odontología
import pg from 'pg';
const { Pool } = pg;

async function main() {
  try {
    console.log('Conectando a la base de datos...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Especialidades a agregar si no existen
    const newSpecialties = [
      { name: "Psicología", description: "Especialistas en salud mental y comportamiento" },
      { name: "Odontología", description: "Especialistas en salud dental y bucal" }
    ];

    for (const specialty of newSpecialties) {
      // Verificar si la especialidad ya existe
      const existingSpecialty = await pool.query(
        'SELECT * FROM specialties WHERE name = $1',
        [specialty.name]
      );

      if (existingSpecialty.rows.length === 0) {
        // La especialidad no existe, la agregamos
        await pool.query(
          'INSERT INTO specialties (name, description) VALUES ($1, $2)',
          [specialty.name, specialty.description]
        );
        console.log(`Especialidad "${specialty.name}" agregada exitosamente.`);
      } else {
        console.log(`La especialidad "${specialty.name}" ya existe.`);
      }
    }

    await pool.end();
    console.log('Conexión a la base de datos cerrada.');
  } catch (error) {
    console.error('Error al actualizar especialidades:', error);
    process.exit(1);
  }
}

main().catch(console.error);