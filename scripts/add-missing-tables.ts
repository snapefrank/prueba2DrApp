import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

async function main() {
  console.log("Creating PostgreSQL connection...");
  // Create a PostgreSQL connection
  const connectionString = process.env.DATABASE_URL!;
  const sql = postgres(connectionString, { max: 1 });
  
  // Create a Drizzle instance
  const db = drizzle(sql, { schema });
  
  console.log("Checking for missing tables...");
    
  try {
    // Check if user_subscriptions table exists
    await sql`SELECT 1 FROM user_subscriptions LIMIT 1`;
    console.log("user_subscriptions table already exists");
  } catch (error) {
    console.log("Creating subscription tables...");
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
    console.log("Subscription tables created successfully");
  }
  
  try {
    // Check if prescriptions table exists
    await sql`SELECT 1 FROM prescriptions LIMIT 1`;
    console.log("prescriptions table already exists");
  } catch (error) {
    console.log("Creating prescriptions table...");
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
    console.log("Prescriptions table created successfully");
  }
  
  try {
    // Check if lab_test_results table exists
    await sql`SELECT 1 FROM lab_test_results LIMIT 1`;
    console.log("lab_test_results table already exists");
  } catch (error) {
    console.log("Creating lab_test_results table...");
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
    console.log("Lab test results table created successfully");
  }
  
  try {
    // Check if health_metrics table exists
    await sql`SELECT 1 FROM health_metrics LIMIT 1`;
    console.log("health_metrics table already exists");
  } catch (error) {
    console.log("Creating health_metrics table...");
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
    console.log("Health metrics table created successfully");
  }
  
  try {
    // Check if doctor_verification_documents table exists
    await sql`SELECT 1 FROM doctor_verification_documents LIMIT 1`;
    console.log("doctor_verification_documents table already exists");
  } catch (error) {
    console.log("Creating doctor verification tables...");
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
    console.log("Doctor verification tables created successfully");
  }
  
  // Close the connection
  await sql.end();
  console.log("Migration complete!");
}

main().catch(err => {
  console.error("Error during migration:", err);
  process.exit(1);
});