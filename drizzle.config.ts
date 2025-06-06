import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // url: process.env.DATABASE_URL,
    host: 'ep-ancient-brook-a6zhun0x.us-west-2.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_PYrkFJnM62Da',
  database: 'neondb',
  ssl: { rejectUnauthorized: false },
  },
});
