import { createServer } from 'http';
import pkg from 'pg';
const { Pool } = pkg;
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configuración básica de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// Rutas API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'El servidor está funcionando correctamente' });
});

// Ruta para probar la conexión a la base de datos
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Conexión a la base de datos exitosa', 
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Error al conectar con la base de datos', 
      error: error.message 
    });
  }
});

// Crear el servidor HTTP
const server = createServer(app);

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});