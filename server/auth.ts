import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, UserType } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    // Validar que stored tenga el formato correcto
    if (!stored || !stored.includes('.')) {
      console.log('Formato de contraseña almacenada incorrecto');
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error al comparar contraseñas:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Generate random session secret if not provided
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
  
  // Determinar automáticamente el dominio basado en el entorno
  const isDevEnv = process.env.NODE_ENV !== 'production';
  const isReplit = process.env.REPL_SLUG || process.env.REPL_ID || process.env.REPL_OWNER;
  
  // Configurar dominio y opciones de seguridad para cookies
  let cookieDomain: string | undefined = undefined; // Por defecto, usar el dominio actual
  let cookieSecure = !isDevEnv; // En producción, siempre seguro
  let cookieSameSite: boolean | 'lax' | 'strict' | 'none' = 'lax'; // Valor por defecto más seguro
  
  if (isDevEnv) {
    // En desarrollo, no necesitamos dominio específico ni cookies seguras
    cookieDomain = undefined; // Usar el dominio actual
    cookieSecure = false; // No requiere HTTPS
    cookieSameSite = 'lax';
    
    if (isReplit) {
      // En Replit, podemos necesitar cookies seguras si usa HTTPS
      cookieSecure = true;
      cookieSameSite = 'none'; // Para permitir credenciales en CORS
    }
  } else {
    // En producción, usar configuración para subdominios
    cookieDomain = '.midominio.com';
    cookieSecure = true;
    cookieSameSite = 'none';
  }
  
  // Configuración de sesión con la configuración específica requerida
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    name: 'mediconnect.sid',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // Una semana
      path: '/',
      domain: cookieDomain,
      sameSite: cookieSameSite,
      secure: cookieSecure,
      httpOnly: true
    }
  };
  
  console.log('Configuración de cookie de sesión:', {
    domain: sessionSettings.cookie?.domain,
    secure: sessionSettings.cookie?.secure,
    sameSite: sessionSettings.cookie?.sameSite,
    isDevEnv,
    isReplit
  });

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado" });
      }

      // Create the user with a hashed password
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // If the user is a patient, create a patient profile
      if (user.userType === UserType.PATIENT) {
        await storage.createPatientProfile({
          userId: user.id,
          dateOfBirth: new Date(req.body.dateOfBirth || "2000-01-01"),
          gender: req.body.gender || "Prefiero no decirlo",
          bloodType: req.body.bloodType,
          allergies: req.body.allergies,
          chronicConditions: req.body.chronicConditions,
        });
      }
      
      // If the user is a doctor, create a doctor profile
      if (user.userType === UserType.DOCTOR) {
        try {
          console.log("[Auth] Creando perfil de doctor con ID:", user.id);
          
          // Datos básicos garantizados sin campo professionalType que causa problemas
          const doctorProfileData = {
            userId: user.id,
            specialtyId: req.body.specialtyId || 1,
            licenseNumber: req.body.licenseNumber || "",
            consultationFee: req.body.consultationFee || 500,
            biography: req.body.biography || "Médico profesional",
            education: req.body.education || "Universidad Nacional",
            experience: req.body.experience || 5,
            availableHours: req.body.availableHours || {
              monday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
              tuesday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
              wednesday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
              thursday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
              friday: ["09:00", "10:00", "11:00", "16:00", "17:00"],
            },
            verificationStatus: "pending",
            licenseVerified: false,
          };
          
          // Solo agregar professionalType si está en el esquema
          // Esto es para compatibilidad entre diferentes versiones
          if (req.body.professionalType) {
            console.log("[Auth] Intentando agregar professionalType:", req.body.professionalType);
            try {
              // @ts-ignore - Ignorar error de tipo para permitir compatibilidad
              doctorProfileData.professionalType = req.body.professionalType || "médico";
            } catch (err) {
              console.warn("[Auth] Error al agregar professionalType, continuando sin él:", err);
            }
          }
          
          await storage.createDoctorProfile(doctorProfileData);
          console.log("[Auth] Perfil de doctor creado exitosamente");
        } catch (err) {
          console.error("[Auth] Error al crear perfil de doctor:", err);
          throw new Error("Error al crear perfil de doctor: " + err.message);
        }
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
