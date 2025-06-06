// Script para agregar tablas de redes sociales
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

// Configurar para conexión WebSocket en Neon DB
neonConfig.webSocketConstructor = ws;

async function main() {
  try {
    console.log("Iniciando migración de tablas para redes sociales...");
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    // SQL directo para crear las tablas
    const sql = `
    -- Tabla de contactos
    CREATE TABLE IF NOT EXISTS user_contacts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      contact_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      is_hidden BOOLEAN NOT NULL DEFAULT false,
      shared_medical_info BOOLEAN NOT NULL DEFAULT false
    );
    
    -- Tabla de recomendaciones 
    CREATE TABLE IF NOT EXISTS doctor_recommendations (
      id SERIAL PRIMARY KEY,
      from_user_id INTEGER NOT NULL REFERENCES users(id),
      to_user_id INTEGER NOT NULL REFERENCES users(id),
      doctor_id INTEGER NOT NULL REFERENCES users(id),
      is_anonymous BOOLEAN NOT NULL DEFAULT false,
      message TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      is_read BOOLEAN NOT NULL DEFAULT false
    );
    
    -- Tabla de reseñas
    CREATE TABLE IF NOT EXISTS doctor_reviews (
      id SERIAL PRIMARY KEY,
      doctor_id INTEGER NOT NULL REFERENCES users(id),
      patient_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL,
      comment TEXT,
      is_anonymous BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      is_visible BOOLEAN NOT NULL DEFAULT true,
      has_appointment_verified BOOLEAN NOT NULL DEFAULT false
    );
    
    -- Tabla de importación de contactos
    CREATE TABLE IF NOT EXISTS contact_imports (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      source TEXT NOT NULL,
      import_data JSONB NOT NULL,
      imported_at TIMESTAMP NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'pending',
      processed_contacts INTEGER NOT NULL DEFAULT 0,
      total_contacts INTEGER NOT NULL DEFAULT 0
    );
    
    -- Tabla de notificaciones sociales
    CREATE TABLE IF NOT EXISTS social_notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      reference_id INTEGER NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT false,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    `;
    
    // Ejecutar SQL
    await db.execute(sql);
    
    console.log("✅ Migración exitosa de tablas para redes sociales");
  } catch (error) {
    console.error("Error durante la migración:", error);
    process.exit(1);
  }
  process.exit(0);
}

main();