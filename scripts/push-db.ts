import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../shared/schema";

async function main() {
  console.log("Creating PostgreSQL connection...");
  // Create a PostgreSQL connection
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { max: 1 });
  
  // Create a Drizzle instance
  const db = drizzle(sql, { schema });
  
  console.log("Pushing schema to database...");
  try {
    // Push the schema to the database
    await db.query.users.findMany();
    console.log("Schema already exists!");
  } catch (error) {
    console.log("Creating schema...");
    // Create tables for each schema object
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        user_type TEXT NOT NULL,
        profile_image TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS specialties (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS doctor_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        specialty_id INTEGER NOT NULL REFERENCES specialties(id),
        license_number TEXT NOT NULL,
        consultation_fee INTEGER NOT NULL,
        biography TEXT NOT NULL,
        education TEXT NOT NULL,
        experience INTEGER NOT NULL,
        available_hours JSONB NOT NULL
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS patient_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        date_of_birth TIMESTAMP WITH TIME ZONE NOT NULL,
        gender TEXT NOT NULL,
        blood_type TEXT,
        allergies TEXT,
        chronic_conditions TEXT
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL,
        patient_id INTEGER NOT NULL REFERENCES users(id),
        doctor_id INTEGER NOT NULL REFERENCES users(id),
        date_time TIMESTAMP WITH TIME ZONE NOT NULL,
        reason TEXT NOT NULL,
        notes TEXT
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        patient_id INTEGER NOT NULL REFERENCES users(id),
        doctor_id INTEGER NOT NULL REFERENCES users(id),
        notes TEXT,
        appointment_id INTEGER REFERENCES appointments(id),
        diagnosis TEXT NOT NULL,
        prescription TEXT
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS patient_documents (
        id SERIAL PRIMARY KEY,
        description TEXT,
        patient_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        file_url TEXT NOT NULL,
        document_type TEXT NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS laboratories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        contact_info TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS lab_commissions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        doctor_id INTEGER NOT NULL REFERENCES users(id),
        patient_id INTEGER NOT NULL REFERENCES users(id),
        laboratory_id INTEGER NOT NULL REFERENCES laboratories(id),
        service_name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price INTEGER NOT NULL,
        duration_days INTEGER NOT NULL,
        max_appointments INTEGER NOT NULL,
        includes_specialists BOOLEAN NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
        start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES users(id),
        patient_id INTEGER NOT NULL REFERENCES users(id),
        medical_record_id INTEGER REFERENCES medical_records(id),
        prescription_text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS lab_test_results (
        id SERIAL PRIMARY KEY,
        commission_id INTEGER NOT NULL REFERENCES lab_commissions(id),
        result_url TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        doctor_review_comments TEXT
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS health_metrics (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES users(id),
        metric_type TEXT NOT NULL,
        value NUMERIC NOT NULL,
        unit TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        notes TEXT
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS doctor_verification_documents (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES users(id),
        document_type TEXT NOT NULL,
        file_url TEXT NOT NULL,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        notes TEXT
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS doctor_verification_history (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL,
        reviewer_id INTEGER REFERENCES users(id),
        comments TEXT,
        review_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `;
    
    console.log("Schema created successfully!");
  }
  
  // Close the connection
  await sql.end();
  console.log("Migration complete!");
}

main().catch(err => {
  console.error("Error during migration:", err);
  process.exit(1);
});