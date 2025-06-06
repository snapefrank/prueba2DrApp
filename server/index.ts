import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import cors from "cors";
import morgan from "morgan";

const app = express();
app.use(express.json({ limit: '5mb' }));  // Aumentar el límite para permitir cargas más grandes
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Añadir morgan para registrar las peticiones HTTP
app.use(morgan('dev'));

// Middleware para establecer encabezados HTTP de seguridad y rendimiento
app.use((req, res, next) => {
  // Permitir que el navegador detecte tipos MIME incorrectos
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Establecer política de referencia para controlar qué información se incluye en los encabezados de referencia
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Prevenir clickjacking configurando X-Frame-Options
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Mejorar rendimiento permitiendo peticiones en segundo plano
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Configurar Access-Control-Allow-Origin dinámicamente para subdominios en Replit
  const origin = req.headers.origin;
  if (origin) {
    // En desarrollo o en Replit, permitir el origen de la solicitud
    if (process.env.NODE_ENV !== 'production' || 
        origin.includes('.replit.app') || 
        origin.includes('.replit.dev') || 
        origin.includes('.repl.co'))  
         {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  
  // Permitir métodos y cabeceras específicas
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Max-Age', '3600');
    return res.status(204).end();
  }
  
  next();
});

// Configurar CORS para permitir peticiones desde subdominios
app.use(cors({
  // Permitir solicitudes desde cualquier origen, pero validar según el entorno
  origin: (origin, callback) => {
    // En entorno de desarrollo, permitir todas las solicitudes
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // En producción, validar dominios permitidos
    // Lista de patrones de dominios permitidos
    const allowedDomainPatterns = [
      // Dominio principal y subdominios
      /^https?:\/\/(.*\.)?mediconnect\.com$/,
      // Dominios de Replit para pruebas en producción
      /^https?:\/\/(.*\.)?replit\.app$/,
      /^https?:\/\/(.*\.)?repl\.co$/,
      /^https?:\/\/(.*\.)?replit\.dev$/,
      /^http:\/\/localhost:5173$/,
    ];
    
    // Permitir solicitudes sin origen (como aplicaciones móviles, Postman o curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Verificar si el origen coincide con alguno de los patrones permitidos
    const isAllowed = allowedDomainPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      // Origen permitido
      return callback(null, true);
    } else {
      // Origen no permitido - rechazar la solicitud
      console.warn(`CORS: Origen rechazado: ${origin}`);
      return callback(new Error('No permitido por CORS'), false);
    }
  },
  
  // Permitir el envío de cookies en solicitudes cross-origin
  credentials: true,
  
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  
  // Cabeceras permitidas
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  
  // Permitir que el navegador cache la respuesta preflight OPTIONS durante 1 hora (3600 segundos)
  maxAge: 3600,
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } //else {
    //serveStatic(app);
  //}

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // const port = 5000;
  // server.listen({
  //   port,
  //   // host: "localhost",
  //   reusePort: true,
  // }, () => {
  //   log(`serving on port ${port}`);
  // });
const port = 5000;
const host = 'localhost'; 

server.listen(port, host, () => {
  log(`Serving on http://${host}:${port}`);
});
})();
