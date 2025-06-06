// Este script ejecuta migraciones directamente desde el esquema definido
const pg = require('pg');
const Pool = pg.Pool;

// Obtener la URL de la base de datos desde las variables de entorno
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL no está definida');
  process.exit(1);
}

async function main() {
  try {
    console.log('Conectando a la base de datos...');
    const pool = new Pool({ connectionString: databaseUrl });

    console.log('Creando tablas si no existen...');
    
    // Lista de tablas a crear
    const tables = [
      'users',
      'specialties',
      'doctor_profiles',
      'patient_profiles',
      'doctor_schedule',
      'doctor_unavailability',
      'appointments',
      'recurring_appointments',
      'appointment_follow_ups',
      'medical_records',
      'patient_documents',
      'laboratories',
      'lab_test_catalog',
      'lab_commissions',
      'subscription_plans',
      'user_subscriptions',
      'prescriptions',
      'lab_test_results',
      'health_metrics',
      'doctor_verification_documents',
      'doctor_verification_history',
      'chat_conversations',
      'chat_messages',
      'chat_notifications',
      'user_contacts',
      'doctor_recommendations',
      'doctor_reviews',
      'contact_imports',
      'social_notifications'
    ];

    // Crear un query batch para crear todas las tablas
    console.log('Ejecutando migraciones...');

    // Consulta SQL directa para crear las tablas si no existen
    for (const tableName of tables) {
      try {
        console.log(`Verificando tabla: ${tableName}`);
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [tableName]);
        
        const tableExists = result.rows[0].exists;
        console.log(`Tabla ${tableName}: ${tableExists ? 'existe' : 'no existe'}`);
      } catch (error) {
        console.error(`Error verificando tabla ${tableName}:`, error);
      }
    }

    console.log('Aplicando schema completo...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "first_name" TEXT,
        "last_name" TEXT,
        "profile_image" TEXT,
        "user_type" TEXT NOT NULL DEFAULT 'patient',
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS "specialties" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "icon" TEXT,
        "popularity" INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS "doctor_profiles" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "specialty_id" INTEGER REFERENCES "specialties"("id"),
        "license_number" TEXT NOT NULL,
        "consultation_fee" NUMERIC NOT NULL,
        "biography" TEXT,
        "education" TEXT,
        "experience" INTEGER,
        "available_hours" JSONB,
        "address" TEXT,
        "phone" TEXT,
        "profile_image" TEXT,
        "verification_status" TEXT DEFAULT 'pending',
        "license_verified" BOOLEAN DEFAULT false
      );
      
      CREATE TABLE IF NOT EXISTS "patient_profiles" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "birth_date" DATE,
        "gender" TEXT,
        "blood_type" TEXT,
        "allergies" TEXT,
        "chronic_diseases" TEXT,
        "emergency_contact" TEXT,
        "emergency_phone" TEXT,
        "address" TEXT,
        "phone" TEXT
      );
      
      CREATE TABLE IF NOT EXISTS "doctor_schedule" (
        "id" SERIAL PRIMARY KEY,
        "doctor_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "day_of_week" INTEGER NOT NULL,
        "start_time" TIME NOT NULL,
        "end_time" TIME NOT NULL,
        "slot_duration" INTEGER NOT NULL,
        "is_available" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS "doctor_unavailability" (
        "id" SERIAL PRIMARY KEY,
        "doctor_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "start_date_time" TIMESTAMP NOT NULL,
        "end_date_time" TIMESTAMP NOT NULL,
        "reason" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS "appointments" (
        "id" SERIAL PRIMARY KEY,
        "patient_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "doctor_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "date_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'scheduled',
        "type" TEXT NOT NULL DEFAULT 'first_visit',
        "reason" TEXT NOT NULL,
        "symptoms" TEXT,
        "notes" TEXT,
        "is_recurring" BOOLEAN DEFAULT false,
        "recurring_id" INTEGER,
        "reminder_sent" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS "recurring_appointments" (
        "id" SERIAL PRIMARY KEY,
        "patient_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "doctor_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "start_date" DATE NOT NULL,
        "end_date" DATE,
        "frequency" TEXT NOT NULL,
        "day_of_week" INTEGER,
        "time_of_day" TIME NOT NULL,
        "duration" INTEGER NOT NULL,
        "reason" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS "appointment_follow_ups" (
        "id" SERIAL PRIMARY KEY,
        "appointment_id" INTEGER NOT NULL REFERENCES "appointments"("id"),
        "recommended_date" DATE NOT NULL,
        "reason" TEXT NOT NULL,
        "instructions" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "follow_up_appointment_id" INTEGER REFERENCES "appointments"("id"),
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Migración completada exitosamente');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

main();