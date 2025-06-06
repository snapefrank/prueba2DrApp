import postgres from "postgres";

// const sql = postgres(process.env.DATABASE_URL, {
//   ssl: { rejectUnauthorized: false }
// });
const sql = postgres({
  host: 'ep-ancient-brook-a6zhun0x.us-west-2.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_PYrkFJnM62Da',
  database: 'neondb',
  ssl: 'require'
});

async function test() {
  try {
    const res = await sql`SELECT NOW()`;
    console.log('Conexión exitosa:', res);
  } catch (err) {
    console.error('Error conexión:', err);
  } finally {
    await sql.end();
  }
}

test();
