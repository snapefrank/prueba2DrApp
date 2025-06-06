import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// const connectionString = process.env.DATABASE_URL!;
// const client = postgres(connectionString, {
//   connect_timeout: 30, // 30 segundos de timeout para la conexión
//   max_lifetime: 60 * 5, // Conexiones viven máximo 5 minutos
//   idle_timeout: 30, // Timeout de inactividad de 30 segundos
//   max: 10, // Máximo 10 conexiones en el pool
//   max_prepare: 20, // Máximo 20 sentencias preparadas
//   prepare: true, // Habilitar sentencias preparadas
//   ssl: false, // Habilitar SSL
//   connection: {
//     timezone: 'UTC',
//   },
//   debug: process.env.NODE_ENV !== 'production', // Habilitar logs de debug en desarrollo
//   onnotice: () => {}, // Ignorar notificaciones para evitar spam de logs
// });
const client = postgres({
    host: 'ep-ancient-brook-a6zhun0x.us-west-2.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_PYrkFJnM62Da',
  database: 'neondb',
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(client, { schema });