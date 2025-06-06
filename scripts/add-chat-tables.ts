import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating chat tables...");

  try {
    // Create chat_conversations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES users(id),
        patient_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'active'
      );
    `);
    console.log("✅ Created chat_conversations table");

    // Create chat_messages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id),
        sender_id INTEGER NOT NULL REFERENCES users(id),
        message_type TEXT NOT NULL DEFAULT 'text',
        content TEXT NOT NULL,
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        is_delivered BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);
    console.log("✅ Created chat_messages table");

    // Create chat_notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        message_id INTEGER NOT NULL REFERENCES chat_messages(id),
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✅ Created chat_notifications table");

    console.log("✅ All chat tables created successfully!");
  } catch (error) {
    console.error("Error creating chat tables:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });