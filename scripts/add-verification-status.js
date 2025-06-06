// Add missing verification_status column to doctor_profiles table
import pg from 'pg';
const { Pool } = pg;

async function main() {
  try {
    console.log('Connecting to the database...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    console.log('Adding missing verification_status column to doctor_profiles table...');
    
    // Check if the column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'doctor_profiles' 
      AND column_name = 'verification_status'
    `);
    
    if (checkResult.rows.length === 0) {
      // The column doesn't exist, so add it
      await pool.query(`
        ALTER TABLE doctor_profiles 
        ADD COLUMN verification_status TEXT DEFAULT 'pending' NOT NULL
      `);
      console.log('Column verification_status added successfully!');
    } else {
      console.log('Column verification_status already exists.');
    }
    
    await pool.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

main().catch(console.error);