import type { Express } from "express";
import { createServer, type Server } from "http";
import * as path from "path";
import * as express from "express";
import * as fs from "fs";
import multer from "multer";
import { WebSocketServer } from "ws";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import passport from "passport";
import { 
  insertAppointmentSchema, 
  insertPatientDocumentSchema, 
  insertMedicalRecordSchema, 
  insertLabCommissionSchema,
  insertSubscriptionPlanSchema,
  insertUserSubscriptionSchema,
  insertPrescriptionSchema,
  insertLabTestResultSchema,
  insertSpecialtySchema,
  insertHealthMetricSchema,
  insertDoctorVerificationDocumentSchema,
  insertDoctorVerificationHistorySchema,
  insertDoctorScheduleSchema,
  insertDoctorUnavailabilitySchema,
  insertRecurringAppointmentSchema,
  insertAppointmentFollowUpSchema,
  insertMedicationCatalogSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // Rutas adicionales para compatibilidad con el formato esperado
  // Implementar /api/auth/login directamente sin redirección
  app.post("/api/auth/login", (req, res) => {
    console.log("[API] Recibida petición en /api/auth/login");
    
    // Crear el mismo comportamiento que /api/login
    req.body.username = req.body.username || '';
    req.body.password = req.body.password || '';

    // Utilizar passport directamente en lugar de redirigir
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error("[Auth] Error de autenticación:", err);
        return res.status(500).json({message: "Error interno de autenticación"});
      }
      
      if (!user) {
        console.log("[Auth] Credenciales incorrectas");
        return res.status(401).json({message: "Credenciales incorrectas"});
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("[Auth] Error en login:", err);
          return res.status(500).json({message: "Error al iniciar sesión"});
        }
        console.log("[Auth] Usuario autenticado:", user.id);
        return res.status(200).json(user);
      });
    })(req, res);
  });
  
  // Implementar /api/auth/register directamente sin redirección
  app.post("/api/auth/register", async (req, res) => {
    console.log("[API] Recibida petición en /api/auth/register");
    
    try {
      // Verificar si el usuario ya existe
      const existingUserByUsername = await storage.getUserByUsername(req.body.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado" });
      }

      // Crear el usuario con contraseña encriptada
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Iniciar sesión automáticamente
      req.login(user, (err) => {
        if (err) {
          console.error("[Auth] Error al iniciar sesión tras registro:", err);
          return res.status(500).json({ message: "Error al iniciar sesión automáticamente" });
        }
        return res.status(201).json(user);
      });
    } catch (error) {
      console.error("[Auth] Error al registrar usuario:", error);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  });
  
  // Implementar /api/auth/logout directamente sin redirección
  app.post("/api/auth/logout", (req, res) => {
    console.log("[API] Recibida petición en /api/auth/logout");
    
    if (!req.isAuthenticated()) {
      return res.status(200).json({ message: "No hay sesión activa" });
    }
    
    req.logout((err) => {
      if (err) {
        console.error("[Auth] Error al cerrar sesión:", err);
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.status(200).json({ message: "Sesión cerrada correctamente" });
    });
  });
  
  // Servir archivos estáticos desde la carpeta uploads
  app.use('/uploads', express.static(path.join(path.dirname(new URL(import.meta.url).pathname), '../uploads')));
  
  // Profile API
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    try {
      const userId = req.user.id;
      const userType = req.user.userType;
      
      let profile;
      if (userType === "doctor") {
        profile = await storage.getDoctorProfileByUserId(userId);
        
        // Si no existe un perfil, crear uno básico
        if (!profile) {
          profile = await storage.createDoctorProfile({
            userId,
            biography: "",
            education: "",
            experience: "",
            licenseNumber: "",
            specialtyId: null,
            consultationFee: 0,
            address: "",
            phone: "",
            verificationStatus: "pending"
          });
        }
      } else if (userType === "patient") {
        profile = await storage.getPatientProfileByUserId(userId);
        
        // Si no existe un perfil, crear uno básico
        if (!profile) {
          profile = await storage.createPatientProfile({
            userId,
            birthDate: null,
            gender: "",
            phone: "",
            address: "",
            emergencyContact: "",
            emergencyPhone: "",
            bloodType: "",
            allergies: "",
            chronicDiseases: ""
          });
        }
      } else {
        // Para admin u otros tipos de usuario
        profile = {
          userId,
          phone: "",
          address: ""
        };
      }
      
      res.json({
        ...profile,
        success: true
      });
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    try {
      const userId = req.user.id;
      const userType = req.user.userType;
      const { firstName, lastName, email, bio, phone, address, specialtyId } = req.body;
      
      // Actualizar la información del usuario
      await storage.updateUser(userId, {
        firstName,
        lastName,
        email
      });
      
      // Actualizar el perfil según el tipo de usuario
      if (userType === "doctor") {
        const doctorProfile = await storage.getDoctorProfileByUserId(userId);
        
        if (doctorProfile) {
          await storage.updateDoctorProfile(doctorProfile.id, {
            biography: bio,
            phone,
            address,
            specialtyId: specialtyId ? parseInt(specialtyId) : null
          });
        }
      } else if (userType === "patient") {
        const patientProfile = await storage.getPatientProfileByUserId(userId);
        
        if (patientProfile) {
          await storage.updatePatientProfile(patientProfile.id, {
            phone,
            address
          });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Configuración de almacenamiento para imágenes de perfil
  const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadsDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../uploads/profiles');
      
      // Crear el directorio si no existe
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      // Usar userId + timestamp + extensión original para evitar colisiones
      const userId = req.user?.id || 'unknown';
      const fileExt = path.extname(file.originalname);
      const filename = `${userId}_${Date.now()}${fileExt}`;
      cb(null, filename);
    }
  });
  
  const profileUpload = multer({ 
    storage: profileStorage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: function (req, file, cb) {
      // Aceptar solo imágenes
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Solo se permiten imágenes'));
      }
      cb(null, true);
    }
  });
  
  app.post("/api/profile/upload-image", profileUpload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se ha subido ningún archivo" });
      }
      
      const userId = req.user.id;
      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      
      // Actualizar la URL de la imagen en el perfil del usuario
      await storage.updateUser(userId, {
        profileImage: imageUrl
      });
      
      res.json({ 
        success: true, 
        imageUrl 
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.delete("/api/profile/delete-image/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    try {
      const userId = parseInt(req.params.userId);
      
      // Verificar que el usuario esté eliminando su propia imagen
      if (req.user.id !== userId && req.user.userType !== "admin") {
        return res.status(403).json({ error: "No autorizado" });
      }
      
      // Obtener la URL de la imagen actual
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      
      const currentImageUrl = user.profileImage;
      
      if (currentImageUrl) {
        // Construir la ruta del archivo
        const imagePath = path.join(
          path.dirname(new URL(import.meta.url).pathname), 
          '..',
          currentImageUrl
        );
        
        // Eliminar el archivo si existe
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
        
        // Actualizar el perfil del usuario
        await storage.updateUser(userId, {
          profileImage: null
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Specialties
  app.get("/api/specialties", async (req, res) => {
    const specialties = await storage.getAllSpecialties();
    res.json(specialties);
  });
  
  // API pública para todas las especialidades
  app.get("/api/public/specialties", async (req, res) => {
    try {
      const specialties = await storage.getAllSpecialties();
      res.json(specialties);
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // API pública para doctores por especialidad
  app.get("/api/specialties/:id/doctors", async (req, res) => {
    try {
      const specialtyId = parseInt(req.params.id);
      if (isNaN(specialtyId)) {
        return res.status(400).json({ error: "ID de especialidad inválido" });
      }
      
      const doctors = await storage.getDoctorsBySpecialty(specialtyId);
      res.json(doctors);
    } catch (error) {
      console.error("Error al obtener médicos por especialidad:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // API pública para doctores por especialidad, versión pública
  app.get("/api/public/doctors/specialty/:id", async (req, res) => {
    try {
      const specialtyId = parseInt(req.params.id);
      if (isNaN(specialtyId)) {
        return res.status(400).json({ error: "ID de especialidad inválido" });
      }
      
      const doctors = await storage.getDoctorsBySpecialty(specialtyId);
      // Filtrar para mostrar solo doctores verificados
      const verifiedDoctors = doctors.filter(doctor => doctor.verificationStatus === "approved");
      res.json(verifiedDoctors);
    } catch (error) {
      console.error("Error al obtener médicos por especialidad:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // API pública para obtener perfil de doctor por ID
  app.get("/api/public/doctors/:id", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de doctor inválido" });
      }
      
      // Obtener información del usuario (doctor)
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.userType !== "doctor") {
        return res.status(404).json({ error: "Doctor no encontrado" });
      }
      
      // Obtener el perfil completo del doctor
      const doctorProfile = await storage.getDoctorProfileByUserId(doctorId);
      if (!doctorProfile) {
        return res.status(404).json({ error: "Perfil de doctor no encontrado" });
      }
      
      // Verificar que el doctor esté aprobado
      if (doctorProfile.verificationStatus !== "approved") {
        return res.status(404).json({ error: "Doctor no disponible" });
      }
      
      // Obtener la especialidad
      const specialty = await storage.getSpecialty(doctorProfile.specialtyId);
      
      // Construir objeto de respuesta con los datos necesarios
      const doctorData = {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        profileImage: doctor.profileImage,
        specialty: specialty ? specialty.name : null,
        specialtyId: doctorProfile.specialtyId,
        licenseNumber: doctorProfile.licenseNumber,
        biography: doctorProfile.biography,
        education: doctorProfile.education,
        experience: doctorProfile.experience,
        address: doctorProfile.address,
        consultationFee: doctorProfile.consultationFee,
        verificationStatus: doctorProfile.verificationStatus
      };
      
      res.json(doctorData);
    } catch (error) {
      console.error("Error al obtener perfil de doctor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post("/api/specialties", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "No tienes permisos para crear especialidades" });
    }
    
    try {
      const validatedData = insertSpecialtySchema.parse(req.body);
      const specialty = await storage.createSpecialty(validatedData);
      res.status(201).json(specialty);
    } catch (error) {
      console.error("Error al crear especialidad:", error);
      res.status(400).json({ message: "Error al crear la especialidad", error: error.message });
    }
  });

  app.get("/api/specialties/:id", async (req, res) => {
    try {
      const specialty = await storage.getSpecialty(parseInt(req.params.id));
      if (!specialty) {
        return res.status(404).json({ message: "Especialidad no encontrada" });
      }
      res.json(specialty);
    } catch (error) {
      console.error("Error al obtener especialidad:", error);
      res.status(500).json({ message: "Error al obtener la especialidad", error: error.message });
    }
  });

  app.put("/api/specialties/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "No tienes permisos para actualizar especialidades" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const specialty = await storage.getSpecialty(id);
      if (!specialty) {
        return res.status(404).json({ message: "Especialidad no encontrada" });
      }
      
      const validatedData = insertSpecialtySchema.parse(req.body);
      const updatedSpecialty = await storage.updateSpecialty(id, validatedData);
      res.json(updatedSpecialty);
    } catch (error) {
      console.error("Error al actualizar especialidad:", error);
      res.status(400).json({ message: "Error al actualizar la especialidad", error: error.message });
    }
  });

  app.delete("/api/specialties/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "No tienes permisos para eliminar especialidades" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const specialty = await storage.getSpecialty(id);
      if (!specialty) {
        return res.status(404).json({ message: "Especialidad no encontrada" });
      }
      
      // Verificar si hay doctores usando esta especialidad
      const doctorsWithSpecialty = await storage.getDoctorsBySpecialty(id);
      if (doctorsWithSpecialty.length > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar la especialidad porque está siendo utilizada por doctores",
          doctorsCount: doctorsWithSpecialty.length
        });
      }
      
      await storage.deleteSpecialty(id);
      res.json({ message: "Especialidad eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar especialidad:", error);
      res.status(500).json({ message: "Error al eliminar la especialidad", error: error.message });
    }
  });

  // Doctors
  app.get("/api/doctors", async (req, res) => {
    const doctors = await storage.getUsersByType("doctor");
    res.json(doctors);
  });
  
  // Pacientes - solo para médicos, filtrados por citas previas
  app.get("/api/patients", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      if (req.user.userType !== "doctor") {
        return res.status(403).json({ error: "Acceso no autorizado" });
      }
      
      // Obtener las citas del médico actual
      const doctorId = req.user.id;
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      
      // Extraer los IDs únicos de pacientes
      const patientIds = [...new Set(appointments.map(app => app.patientId))];
      
      if (patientIds.length === 0) {
        return res.json([]);
      }
      
      // Obtener todos los pacientes
      const allPatients = await storage.getUsersByType("patient");
      
      // Filtrar solo los pacientes que han tenido citas con este médico
      const patients = allPatients.filter(patient => patientIds.includes(patient.id));
      
      res.json(patients);
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Paciente específico - solo para médicos
  app.get("/api/patients/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      if (req.user.userType !== "doctor") {
        return res.status(403).json({ error: "Acceso no autorizado" });
      }
      
      const patientId = parseInt(req.params.id, 10);
      
      // Obtener el paciente
      const patient = await storage.getUser(patientId);
      
      if (!patient || patient.userType !== "patient") {
        return res.status(404).json({ error: "Paciente no encontrado" });
      }
      
      res.json(patient);
    } catch (error) {
      console.error("Error al obtener el paciente:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Expediente médico completo - solo para médicos
  app.get("/api/expediente/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      if (req.user.userType !== "doctor") {
        return res.status(403).json({ error: "Acceso no autorizado" });
      }
      
      const patientId = parseInt(req.params.id, 10);
      
      // Verificar que el paciente existe
      const patient = await storage.getUser(patientId);
      
      if (!patient || patient.userType !== "patient") {
        return res.status(404).json({ error: "Paciente no encontrado" });
      }
      
      // Obtener el perfil del paciente
      const patientProfile = await storage.getPatientProfileByUserId(patientId);
      
      if (!patientProfile) {
        return res.status(404).json({ error: "Perfil de paciente no encontrado" });
      }
      
      // Combinar la información del usuario y el perfil
      const expediente = {
        ...patient,
        ...patientProfile
      };
      
      res.json(expediente);
    } catch (error) {
      console.error("Error al obtener el expediente:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Notas médicas de un paciente - solo para médicos
  app.get("/api/medical-records/:patientId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      if (req.user.userType !== "doctor") {
        return res.status(403).json({ error: "Acceso no autorizado" });
      }
      
      const patientId = parseInt(req.params.patientId, 10);
      
      // Obtener todos los registros médicos del paciente
      const records = await storage.getMedicalRecordsByPatient(patientId);
      
      // Para cada registro, obtener el nombre del médico
      const recordsWithDoctorNames = await Promise.all(
        records.map(async (record) => {
          const doctor = await storage.getUser(record.doctorId);
          return {
            ...record,
            doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico desconocido"
          };
        })
      );
      
      res.json(recordsWithDoctorNames);
    } catch (error) {
      console.error("Error al obtener registros médicos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.get("/api/doctors/:id", async (req, res) => {
    const doctor = await storage.getUser(parseInt(req.params.id));
    if (!doctor || doctor.userType !== "doctor") {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    
    const profile = await storage.getDoctorProfileByUserId(doctor.id);
    if (!profile) {
      return res.status(404).json({ message: "Perfil de doctor no encontrado" });
    }
    
    const specialty = await storage.getSpecialty(profile.specialtyId);
    
    res.json({
      ...doctor,
      profile,
      specialty
    });
  });
  
  // RUTAS DE SISTEMA DE AGENDAMIENTO
  
  // Rutas para horarios de médicos
  app.get("/api/doctor-schedule/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de doctor inválido" });
      }
      
      const schedules = await storage.getDoctorScheduleByDoctor(doctorId);
      res.json(schedules);
    } catch (error) {
      console.error("Error al obtener horarios del doctor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.post("/api/doctor-schedule", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      // Solo el propio doctor o un admin pueden configurar el horario
      const isDoctor = req.user.id === req.body.doctorId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado" });
      }
      
      const validatedData = insertDoctorScheduleSchema.parse(req.body);
      const schedule = await storage.createDoctorSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error al crear horario:", error);
      res.status(400).json({ error: "Error al crear horario", details: error.message });
    }
  });
  
  app.put("/api/doctor-schedule/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const scheduleId = parseInt(req.params.id);
      const schedule = await storage.getDoctorSchedule(scheduleId);
      
      if (!schedule) {
        return res.status(404).json({ error: "Horario no encontrado" });
      }
      
      // Solo el propio doctor o un admin pueden modificar el horario
      const isDoctor = req.user.id === schedule.doctorId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado" });
      }
      
      const validatedData = insertDoctorScheduleSchema.parse(req.body);
      const updatedSchedule = await storage.updateDoctorSchedule(scheduleId, validatedData);
      res.json(updatedSchedule);
    } catch (error) {
      console.error("Error al actualizar horario:", error);
      res.status(400).json({ error: "Error al actualizar horario", details: error.message });
    }
  });
  
  app.delete("/api/doctor-schedule/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const scheduleId = parseInt(req.params.id);
      const schedule = await storage.getDoctorSchedule(scheduleId);
      
      if (!schedule) {
        return res.status(404).json({ error: "Horario no encontrado" });
      }
      
      // Solo el propio doctor o un admin pueden eliminar el horario
      const isDoctor = req.user.id === schedule.doctorId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado" });
      }
      
      await storage.deleteDoctorSchedule(scheduleId);
      res.json({ success: true, message: "Horario eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar horario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Rutas para indisponibilidad de médicos (vacaciones, etc.)
  app.get("/api/doctor-unavailability/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de doctor inválido" });
      }
      
      const unavailabilities = await storage.getDoctorUnavailabilityByDoctor(doctorId);
      res.json(unavailabilities);
    } catch (error) {
      console.error("Error al obtener indisponibilidades del doctor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.post("/api/doctor-unavailability", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      // Solo el propio doctor o un admin pueden configurar indisponibilidades
      const isDoctor = req.user.id === req.body.doctorId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado" });
      }
      
      const validatedData = insertDoctorUnavailabilitySchema.parse(req.body);
      const unavailability = await storage.createDoctorUnavailability(validatedData);
      res.status(201).json(unavailability);
    } catch (error) {
      console.error("Error al crear indisponibilidad:", error);
      res.status(400).json({ error: "Error al crear indisponibilidad", details: error.message });
    }
  });
  
  app.delete("/api/doctor-unavailability/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const unavailabilityId = parseInt(req.params.id);
      const unavailability = await storage.getDoctorUnavailability(unavailabilityId);
      
      if (!unavailability) {
        return res.status(404).json({ error: "Indisponibilidad no encontrada" });
      }
      
      // Solo el propio doctor o un admin pueden eliminar indisponibilidades
      const isDoctor = req.user.id === unavailability.doctorId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado" });
      }
      
      await storage.deleteDoctorUnavailability(unavailabilityId);
      res.json({ success: true, message: "Indisponibilidad eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar indisponibilidad:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Rutas para citas
  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de doctor inválido" });
      }
      
      // Solo el propio doctor o un admin pueden ver todas las citas
      const isDoctor = req.user.id === doctorId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado" });
      }
      
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      
      // Para cada cita, obtener información del paciente
      const appointmentsWithPatientNames = await Promise.all(
        appointments.map(async (appointment) => {
          const patient = await storage.getUser(appointment.patientId);
          return {
            ...appointment,
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente desconocido"
          };
        })
      );
      
      res.json(appointmentsWithPatientNames);
    } catch (error) {
      console.error("Error al obtener citas del doctor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ error: "ID de paciente inválido" });
      }
      
      // Solo el propio paciente, su médico o un admin pueden ver las citas
      const isPatient = req.user.id === patientId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isPatient && !isAdmin) {
        // Verificar si es médico y tiene citas con este paciente
        if (req.user.userType === "doctor") {
          const doctorAppointments = await storage.getAppointmentsByDoctor(req.user.id);
          const hasAppointmentWithPatient = doctorAppointments.some(app => app.patientId === patientId);
          
          if (!hasAppointmentWithPatient) {
            return res.status(403).json({ error: "No autorizado" });
          }
        } else {
          return res.status(403).json({ error: "No autorizado" });
        }
      }
      
      const appointments = await storage.getAppointmentsByPatient(patientId);
      
      // Para cada cita, obtener información del médico
      const appointmentsWithDoctorNames = await Promise.all(
        appointments.map(async (appointment) => {
          const doctor = await storage.getUser(appointment.doctorId);
          return {
            ...appointment,
            doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico desconocido"
          };
        })
      );
      
      res.json(appointmentsWithDoctorNames);
    } catch (error) {
      console.error("Error al obtener citas del paciente:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.get("/api/appointments/upcoming/doctor/:doctorId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de doctor inválido" });
      }
      
      // Solo el propio doctor o un admin pueden ver próximas citas
      const isDoctor = req.user.id === doctorId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado" });
      }
      
      const appointments = await storage.getUpcomingAppointmentsByDoctor(doctorId);
      
      // Para cada cita, obtener información del paciente
      const appointmentsWithPatientNames = await Promise.all(
        appointments.map(async (appointment) => {
          const patient = await storage.getUser(appointment.patientId);
          return {
            ...appointment,
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente desconocido"
          };
        })
      );
      
      res.json(appointmentsWithPatientNames);
    } catch (error) {
      console.error("Error al obtener próximas citas del doctor:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.get("/api/appointments/upcoming/patient/:patientId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ error: "ID de paciente inválido" });
      }
      
      // Solo el propio paciente, su médico o un admin pueden ver próximas citas
      const isPatient = req.user.id === patientId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isPatient && !isAdmin) {
        return res.status(403).json({ error: "No autorizado" });
      }
      
      const appointments = await storage.getUpcomingAppointmentsByPatient(patientId);
      
      // Para cada cita, obtener información del médico
      const appointmentsWithDoctorNames = await Promise.all(
        appointments.map(async (appointment) => {
          const doctor = await storage.getUser(appointment.doctorId);
          return {
            ...appointment,
            doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico desconocido"
          };
        })
      );
      
      res.json(appointmentsWithDoctorNames);
    } catch (error) {
      console.error("Error al obtener próximas citas del paciente:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.get("/api/available-slots/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de doctor inválido" });
      }
      
      const dateParam = req.query.date as string;
      if (!dateParam) {
        return res.status(400).json({ error: "Se requiere la fecha para consultar disponibilidad" });
      }
      
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Formato de fecha inválido" });
      }
      
      const slots = await storage.getAvailableSlots(doctorId, date);
      res.json(slots);
    } catch (error) {
      console.error("Error al obtener slots disponibles:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.post("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      // Verificar si el usuario es paciente o médico
      const isPatient = req.user.userType === "patient";
      const isDoctor = req.user.userType === "doctor";
      const isAdmin = req.user.userType === "admin";
      
      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado para agendar citas" });
      }
      
      // Permitir que un paciente solo agende citas para sí mismo
      if (isPatient && req.body.patientId !== req.user.id) {
        return res.status(403).json({ error: "No puedes agendar citas para otros pacientes" });
      }
      
      // Validar los datos
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Verificar si el horario está disponible
      const appointmentDate = new Date(validatedData.dateTime);
      const endTime = new Date(validatedData.endTime);
      
      // Obtener slots disponibles para esa fecha
      const availableSlots = await storage.getAvailableSlots(validatedData.doctorId, appointmentDate);
      
      // Verificar si el slot seleccionado está en los disponibles
      const isAvailable = availableSlots.some(slot => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        
        // Verificar si la cita solicitada se encuentra dentro de un slot disponible
        return (
          appointmentDate.getTime() >= slotStart.getTime() &&
          endTime.getTime() <= slotEnd.getTime()
        );
      });
      
      if (!isAvailable) {
        return res.status(400).json({ error: "El horario seleccionado no está disponible" });
      }
      
      // Crear la cita
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error al crear cita:", error);
      res.status(400).json({ error: "Error al crear cita", details: error.message });
    }
  });
  
  app.put("/api/appointments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ error: "ID de cita inválido" });
      }
      
      // Obtener la cita existente
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      
      // Verificar permisos para actualizar la cita
      const isPatient = req.user.id === appointment.patientId;
      const isDoctor = req.user.id === appointment.doctorId;
      const isAdmin = req.user.userType === "admin";
      
      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado para actualizar esta cita" });
      }
      
      // Validar los datos
      const updatedData = req.body;
      
      // Actualizar la cita
      const updatedAppointment = await storage.updateAppointment(appointmentId, updatedData);
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error al actualizar cita:", error);
      res.status(400).json({ error: "Error al actualizar cita", details: error.message });
    }
  });
  
  // Rutas para citas recurrentes
  app.post("/api/recurring-appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      // Verificar si el usuario es paciente o médico
      const isPatient = req.user.userType === "patient";
      const isDoctor = req.user.userType === "doctor";
      const isAdmin = req.user.userType === "admin";
      
      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({ error: "No autorizado para agendar citas recurrentes" });
      }
      
      // Permitir que un paciente solo agende citas para sí mismo
      if (isPatient && req.body.patientId !== req.user.id) {
        return res.status(403).json({ error: "No puedes agendar citas para otros pacientes" });
      }
      
      // Validar los datos
      const validatedData = insertRecurringAppointmentSchema.parse(req.body);
      
      // Crear la cita recurrente
      const recurringAppointment = await storage.createRecurringAppointment(validatedData);
      
      // Crear las citas individuales para la serie
      // Aquí se implementaría la lógica para generar todas las citas individuales basadas en la frecuencia
      
      res.status(201).json(recurringAppointment);
    } catch (error) {
      console.error("Error al crear cita recurrente:", error);
      res.status(400).json({ error: "Error al crear cita recurrente", details: error.message });
    }
  });
  
  // Rutas para seguimiento de citas
  app.post("/api/appointment-follow-ups", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      // Solo los médicos pueden crear seguimientos
      if (req.user.userType !== "doctor") {
        return res.status(403).json({ error: "Solo los médicos pueden crear seguimientos de citas" });
      }
      
      // Validar los datos
      const validatedData = insertAppointmentFollowUpSchema.parse(req.body);
      
      // Verificar que la cita existe y pertenece al médico
      const appointment = await storage.getAppointment(validatedData.appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }
      
      if (appointment.doctorId !== req.user.id) {
        return res.status(403).json({ error: "No puedes crear seguimientos para citas de otros médicos" });
      }
      
      // Crear el seguimiento
      const followUp = await storage.createAppointmentFollowUp(validatedData);
      res.status(201).json(followUp);
    } catch (error) {
      console.error("Error al crear seguimiento de cita:", error);
      res.status(400).json({ error: "Error al crear seguimiento", details: error.message });
    }
  });

  // Laboratories
  app.get("/api/laboratories", async (req, res) => {
    const labs = await storage.getAllLaboratories();
    res.json(labs);
  });
  
  app.post("/api/laboratories", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    const lab = await storage.createLaboratory(req.body);
    res.status(201).json(lab);
  });
  
  app.patch("/api/laboratories/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    const lab = await storage.updateLaboratory(parseInt(req.params.id), req.body);
    if (!lab) {
      return res.status(404).json({ message: "Laboratorio no encontrado" });
    }
    
    res.json(lab);
  });
  
  // Rutas para catálogo de pruebas de laboratorio
  app.get("/api/lab-tests", async (req, res) => {
    try {
      const category = req.query.category as string;
      
      let labTests;
      if (category) {
        labTests = await storage.getLabTestsByCategory(category);
      } else {
        labTests = await storage.getAllLabTests();
      }
      
      res.status(200).json(labTests);
    } catch (error) {
      console.error("Error al obtener pruebas de laboratorio:", error);
      res.status(500).json({ message: "Error al obtener pruebas de laboratorio" });
    }
  });
  
  app.get("/api/lab-tests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const labTest = await storage.getLabTest(id);
      
      if (!labTest) {
        return res.status(404).json({ message: "Prueba de laboratorio no encontrada" });
      }
      
      res.status(200).json(labTest);
    } catch (error) {
      console.error("Error al obtener prueba de laboratorio:", error);
      res.status(500).json({ message: "Error al obtener prueba de laboratorio" });
    }
  });
  
  app.post("/api/lab-tests", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    try {
      const newLabTest = req.body;
      const labTest = await storage.createLabTest(newLabTest);
      res.status(201).json(labTest);
    } catch (error) {
      console.error("Error al crear prueba de laboratorio:", error);
      res.status(500).json({ message: "Error al crear prueba de laboratorio" });
    }
  });
  
  app.patch("/api/lab-tests/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedLabTest = await storage.updateLabTest(id, updateData);
      
      if (!updatedLabTest) {
        return res.status(404).json({ message: "Prueba de laboratorio no encontrada" });
      }
      
      res.status(200).json(updatedLabTest);
    } catch (error) {
      console.error("Error al actualizar prueba de laboratorio:", error);
      res.status(500).json({ message: "Error al actualizar prueba de laboratorio" });
    }
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    let appointments = [];
    if (req.user.userType === "patient") {
      appointments = await storage.getAppointmentsByPatient(req.user.id);
    } else if (req.user.userType === "doctor") {
      appointments = await storage.getAppointmentsByDoctor(req.user.id);
    } else if (req.user.userType === "admin") {
      // Admin can see all appointments
      appointments = Array.from((await storage.getAllDoctorProfiles())
        .flatMap(profile => storage.getAppointmentsByDoctor(profile.userId))
      );
    }
    
    // Enhance appointments with doctor and patient info
    const enhancedAppointments = await Promise.all(appointments.map(async (apt) => {
      const doctor = await storage.getUser(apt.doctorId);
      const patient = await storage.getUser(apt.patientId);
      return {
        ...apt,
        doctor: doctor ? { id: doctor.id, name: `${doctor.firstName} ${doctor.lastName}` } : null,
        patient: patient ? { id: patient.id, name: `${patient.firstName} ${patient.lastName}` } : null
      };
    }));
    
    res.json(enhancedAppointments);
  });
  
  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // If patient is making the request, set patientId to user id
      if (req.user.userType === "patient") {
        appointmentData.patientId = req.user.id;
      }
      
      const appointment = await storage.createAppointment(appointmentData);
      
      const doctor = await storage.getUser(appointment.doctorId);
      const patient = await storage.getUser(appointment.patientId);
      
      res.status(201).json({
        ...appointment,
        doctor: doctor ? { id: doctor.id, name: `${doctor.firstName} ${doctor.lastName}` } : null,
        patient: patient ? { id: patient.id, name: `${patient.firstName} ${patient.lastName}` } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de cita inválidos", errors: error.errors });
      }
      throw error;
    }
  });
  
  app.patch("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    const appointment = await storage.getAppointment(parseInt(req.params.id));
    if (!appointment) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    
    // Validate if the user can modify this appointment
    if (req.user.userType === "patient" && appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: "No puedes modificar esta cita" });
    }
    
    if (req.user.userType === "doctor" && appointment.doctorId !== req.user.id) {
      return res.status(403).json({ message: "No puedes modificar esta cita" });
    }
    
    const updatedAppointment = await storage.updateAppointment(appointment.id, req.body);
    
    const doctor = await storage.getUser(updatedAppointment!.doctorId);
    const patient = await storage.getUser(updatedAppointment!.patientId);
    
    res.json({
      ...updatedAppointment,
      doctor: doctor ? { id: doctor.id, name: `${doctor.firstName} ${doctor.lastName}` } : null,
      patient: patient ? { id: patient.id, name: `${patient.firstName} ${patient.lastName}` } : null
    });
  });

  // Medical Records
  app.get("/api/medical-records/:patientId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    const patientId = parseInt(req.params.patientId);
    
    // Check permissions
    if (req.user.userType === "patient" && req.user.id !== patientId) {
      return res.status(403).json({ message: "No puedes ver estos registros médicos" });
    }
    
    const records = await storage.getMedicalRecordsByPatient(patientId);
    
    // Enhance records with doctor info
    const enhancedRecords = await Promise.all(records.map(async (record) => {
      const doctor = await storage.getUser(record.doctorId);
      return {
        ...record,
        doctor: doctor ? { id: doctor.id, name: `${doctor.firstName} ${doctor.lastName}` } : null
      };
    }));
    
    res.json(enhancedRecords);
  });
  
  app.post("/api/medical-records", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(403).json({ message: "Solo médicos pueden crear registros médicos" });
    }
    
    try {
      const recordData = insertMedicalRecordSchema.parse(req.body);
      
      // Set doctorId to the current user
      recordData.doctorId = req.user.id;
      
      const record = await storage.createMedicalRecord(recordData);
      
      const doctor = await storage.getUser(record.doctorId);
      
      res.status(201).json({
        ...record,
        doctor: doctor ? { id: doctor.id, name: `${doctor.firstName} ${doctor.lastName}` } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de registro médico inválidos", errors: error.errors });
      }
      throw error;
    }
  });

  // Patient Documents
  app.get("/api/patient-documents/:patientId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    const patientId = parseInt(req.params.patientId);
    
    // Check permissions
    if (req.user.userType === "patient" && req.user.id !== patientId) {
      return res.status(403).json({ message: "No puedes ver estos documentos" });
    }
    
    const documents = await storage.getPatientDocumentsByPatient(patientId);
    res.json(documents);
  });
  
  app.post("/api/patient-documents", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      const documentData = insertPatientDocumentSchema.parse(req.body);
      
      // If patient is making the request, set patientId to user id
      if (req.user.userType === "patient") {
        documentData.patientId = req.user.id;
      }
      
      // Check permissions if a doctor or admin is uploading for a patient
      if (req.user.userType !== "patient" && documentData.patientId !== req.user.id) {
        // Allow it, they're a doctor or admin
      }
      
      const document = await storage.createPatientDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de documento inválidos", errors: error.errors });
      }
      throw error;
    }
  });

  // Lab Commissions
  app.get("/api/lab-commissions", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(403).json({ message: "Solo médicos pueden ver sus comisiones" });
    }
    
    const commissions = await storage.getLabCommissionsByDoctor(req.user.id);
    
    // Enhance commissions with lab info
    const enhancedCommissions = await Promise.all(commissions.map(async (commission) => {
      const lab = await storage.getLaboratory(commission.laboratoryId);
      const patient = await storage.getUser(commission.patientId);
      return {
        ...commission,
        laboratory: lab ? { id: lab.id, name: lab.name } : null,
        patient: patient ? { id: patient.id, name: `${patient.firstName} ${patient.lastName}` } : null
      };
    }));
    
    res.json(enhancedCommissions);
  });
  
  // Obtener una comisión específica
  app.get("/api/lab-commissions/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      const commissionId = parseInt(req.params.id);
      
      if (isNaN(commissionId)) {
        return res.status(400).json({ message: "ID de comisión inválido" });
      }
      
      const commission = await storage.getLabCommission(commissionId);
      
      if (!commission) {
        return res.status(404).json({ message: "Comisión no encontrada" });
      }
      
      // Verificar permisos
      if (req.user.userType === "doctor" && commission.doctorId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para ver esta comisión" });
      }
      
      if (req.user.userType === "patient" && commission.patientId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para ver esta comisión" });
      }
      
      // Enriquecer datos
      const lab = await storage.getLaboratory(commission.laboratoryId);
      const patient = await storage.getUser(commission.patientId);
      const doctor = await storage.getUser(commission.doctorId);
      
      const enhancedCommission = {
        ...commission,
        laboratory: lab ? { 
          id: lab.id, 
          name: lab.name,
          address: lab.address,
          phone: lab.phone,
          email: lab.email,
          discount: lab.discount
        } : null,
        patient: patient ? { 
          id: patient.id, 
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email
        } : null,
        doctor: doctor ? { 
          id: doctor.id, 
          name: `${doctor.firstName} ${doctor.lastName}`,
          email: doctor.email
        } : null
      };
      
      res.json(enhancedCommission);
    } catch (error) {
      console.error("Error al obtener la comisión:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.post("/api/lab-commissions", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(403).json({ message: "Solo médicos pueden registrar comisiones" });
    }
    
    try {
      const commissionData = insertLabCommissionSchema.parse(req.body);
      
      // Set doctorId to the current user
      commissionData.doctorId = req.user.id;
      
      const commission = await storage.createLabCommission(commissionData);
      
      const lab = await storage.getLaboratory(commission.laboratoryId);
      const patient = await storage.getUser(commission.patientId);
      
      res.status(201).json({
        ...commission,
        laboratory: lab ? { id: lab.id, name: lab.name } : null,
        patient: patient ? { id: patient.id, name: `${patient.firstName} ${patient.lastName}` } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de comisión inválidos", errors: error.errors });
      }
      throw error;
    }
  });

  // Admin User Management
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    // Get users by type if specified
    const userType = req.query.type as string | undefined;
    let users;
    
    if (userType) {
      users = await storage.getUsersByType(userType);
    } else {
      users = Array.from((await Promise.all([
        storage.getUsersByType("patient"),
        storage.getUsersByType("doctor"),
        storage.getUsersByType("admin")
      ])).flat());
    }
    
    // Remove password field
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    
    res.json(sanitizedUsers);
  });
  
  app.patch("/api/users/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive debe ser un valor booleano" });
    }
    
    const user = await storage.updateUser(parseInt(req.params.id), { isActive });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Remove password field
    const { password, ...sanitizedUser } = user;
    
    res.json(sanitizedUser);
  });

  // Subscription Plans
  app.get("/api/subscription-plans", async (req, res) => {
    const plans = await storage.getActiveSubscriptionPlans();
    res.json(plans);
  });
  
  app.get("/api/subscription-plans/all", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    const plans = await storage.getAllSubscriptionPlans();
    res.json(plans);
  });
  
  app.post("/api/subscription-plans", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    try {
      const planData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos del plan inválidos", errors: error.errors });
      }
      throw error;
    }
  });
  
  app.patch("/api/subscription-plans/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    const plan = await storage.getSubscriptionPlan(parseInt(req.params.id));
    if (!plan) {
      return res.status(404).json({ message: "Plan no encontrado" });
    }
    
    const updatedPlan = await storage.updateSubscriptionPlan(plan.id, req.body);
    res.json(updatedPlan);
  });
  
  // User Subscriptions
  app.get("/api/user-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    const subscription = await storage.getUserSubscriptionByUserId(req.user.id);
    if (!subscription) {
      return res.status(404).json({ message: "No tienes una suscripción activa" });
    }
    
    const plan = await storage.getSubscriptionPlan(subscription.planId);
    
    res.json({
      ...subscription,
      plan
    });
  });
  
  app.post("/api/user-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      // Check if user already has an active subscription
      const existingSubscription = await storage.getUserSubscriptionByUserId(req.user.id);
      if (existingSubscription) {
        return res.status(400).json({ message: "Ya tienes una suscripción activa" });
      }
      
      const subscriptionData = insertUserSubscriptionSchema.parse(req.body);
      subscriptionData.userId = req.user.id;
      
      // Validate plan exists
      const plan = await storage.getSubscriptionPlan(subscriptionData.planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan no encontrado" });
      }
      
      // Set default endDate to 1 month from now if not provided
      if (!subscriptionData.endDate) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        subscriptionData.endDate = endDate;
      }
      
      // TODO: Integrate with Stripe for payment processing
      // This is a placeholder for future Stripe integration
      
      const subscription = await storage.createUserSubscription(subscriptionData);
      
      res.status(201).json({
        ...subscription,
        plan
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de suscripción inválidos", errors: error.errors });
      }
      throw error;
    }
  });
  
  app.patch("/api/user-subscription/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    const subscription = await storage.getUserSubscription(parseInt(req.params.id));
    if (!subscription) {
      return res.status(404).json({ message: "Suscripción no encontrada" });
    }
    
    // Check if the subscription belongs to the user or user is admin
    if (subscription.userId !== req.user.id && req.user.userType !== "admin") {
      return res.status(403).json({ message: "No puedes modificar esta suscripción" });
    }
    
    const updatedSubscription = await storage.updateUserSubscription(subscription.id, req.body);
    const plan = await storage.getSubscriptionPlan(updatedSubscription!.planId);
    
    res.json({
      ...updatedSubscription,
      plan
    });
  });
  
  app.post("/api/user-subscription/:id/cancel", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    const subscription = await storage.getUserSubscription(parseInt(req.params.id));
    if (!subscription) {
      return res.status(404).json({ message: "Suscripción no encontrada" });
    }
    
    // Check if the subscription belongs to the user or user is admin
    if (subscription.userId !== req.user.id && req.user.userType !== "admin") {
      return res.status(403).json({ message: "No puedes cancelar esta suscripción" });
    }
    
    // TODO: Integrate with Stripe for subscription cancellation
    // This is a placeholder for future Stripe integration
    
    const cancelledSubscription = await storage.cancelUserSubscription(subscription.id);
    const plan = await storage.getSubscriptionPlan(cancelledSubscription!.planId);
    
    res.json({
      ...cancelledSubscription,
      plan
    });
  });
  
  // Endpoints for Stripe integration (to be implemented in the future)
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    // TODO: Implement Stripe payment intent creation
    // This endpoint will be used to initiate a payment using Stripe
    
    res.status(501).json({ message: "Funcionalidad pendiente de implementación" });
  });
  
  app.post("/api/create-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    // TODO: Implement Stripe subscription creation
    // This endpoint will be used to create a subscription using Stripe
    
    res.status(501).json({ message: "Funcionalidad pendiente de implementación" });
  });
  
  // Statistics for Admin
  app.get("/api/statistics", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    const patients = await storage.getUsersByType("patient");
    const doctors = await storage.getUsersByType("doctor");
    const appointments = Array.from((await storage.getAllDoctorProfiles())
      .flatMap(profile => storage.getAppointmentsByDoctor(profile.userId))
    );
    const documents = Array.from((await Promise.all(patients.map(p => storage.getPatientDocumentsByPatient(p.id))))
      .flat()
    );
    
    // Get active subscriptions for statistics
    const subscriptionPlans = await storage.getAllSubscriptionPlans();
    
    // Calculate appointments by status
    const appointmentsByStatus = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate documents by type
    const documentsByType = documents.reduce((acc, doc) => {
      acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      usersCount: {
        patients: patients.length,
        doctors: doctors.length,
        total: patients.length + doctors.length + 1 // +1 for the admin
      },
      appointmentsCount: {
        total: appointments.length,
        byStatus: appointmentsByStatus
      },
      documentsCount: {
        total: documents.length,
        byType: documentsByType
      },
      subscriptionsCount: {
        total: subscriptionPlans.length,
        active: subscriptionPlans.filter(plan => plan.isActive).length
      }
    });
  });

  // --- Recetas médicas ---
  // Obtener todas las recetas de un médico
  app.get("/api/prescriptions/doctor", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    try {
      const prescriptions = await storage.getPrescriptionsByDoctor(req.user.id);
      
      // Enriquecer con datos de pacientes
      const enhancedPrescriptions = await Promise.all(prescriptions.map(async (prescription) => {
        const patient = await storage.getUser(prescription.patientId);
        return {
          ...prescription,
          patient: patient ? { 
            id: patient.id, 
            name: `${patient.firstName} ${patient.lastName}` 
          } : null
        };
      }));
      
      res.json(enhancedPrescriptions);
    } catch (error) {
      console.error("Error al obtener recetas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Obtener todas las recetas de un paciente
  app.get("/api/prescriptions/patient/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    const patientId = parseInt(req.params.id, 10);
    
    // Verificar permisos - solo el paciente mismo o un médico pueden ver sus recetas
    if (req.user.userType === "patient" && req.user.id !== patientId) {
      return res.status(403).json({ message: "No puedes ver estas recetas" });
    }
    
    try {
      const prescriptions = await storage.getPrescriptionsByPatient(patientId);
      
      // Enriquecer con datos de médicos
      const enhancedPrescriptions = await Promise.all(prescriptions.map(async (prescription) => {
        const doctor = await storage.getUser(prescription.doctorId);
        return {
          ...prescription,
          doctor: doctor ? { 
            id: doctor.id, 
            name: `${doctor.firstName} ${doctor.lastName}` 
          } : null
        };
      }));
      
      res.json(enhancedPrescriptions);
    } catch (error) {
      console.error("Error al obtener recetas del paciente:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Obtener una receta específica
  app.get("/api/prescriptions/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    const prescriptionId = parseInt(req.params.id, 10);
    
    try {
      const prescription = await storage.getPrescription(prescriptionId);
      
      if (!prescription) {
        return res.status(404).json({ error: "Receta no encontrada" });
      }
      
      // Verificar permisos
      if (req.user.userType === "patient" && req.user.id !== prescription.patientId) {
        return res.status(403).json({ message: "No puedes ver esta receta" });
      }
      
      if (req.user.userType === "doctor" && req.user.id !== prescription.doctorId) {
        return res.status(403).json({ message: "No puedes ver esta receta" });
      }
      
      // Enriquecer con datos de médico y paciente
      const doctor = await storage.getUser(prescription.doctorId);
      const patient = await storage.getUser(prescription.patientId);
      
      res.json({
        ...prescription,
        doctor: doctor ? { 
          id: doctor.id, 
          name: `${doctor.firstName} ${doctor.lastName}` 
        } : null,
        patient: patient ? { 
          id: patient.id, 
          name: `${patient.firstName} ${patient.lastName}` 
        } : null
      });
    } catch (error) {
      console.error("Error al obtener receta:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Crear una nueva receta
  app.post("/api/prescriptions", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(403).json({ message: "Solo médicos pueden crear recetas" });
    }
    
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      
      // Establecer el doctorId al usuario actual
      prescriptionData.doctorId = req.user.id;
      
      const prescription = await storage.createPrescription(prescriptionData);
      
      const doctor = await storage.getUser(prescription.doctorId);
      const patient = await storage.getUser(prescription.patientId);
      
      res.status(201).json({
        ...prescription,
        doctor: doctor ? { 
          id: doctor.id, 
          name: `${doctor.firstName} ${doctor.lastName}` 
        } : null,
        patient: patient ? { 
          id: patient.id, 
          name: `${patient.firstName} ${patient.lastName}` 
        } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de receta inválidos", errors: error.errors });
      }
      console.error("Error al crear receta:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Actualizar una receta existente
  app.put("/api/prescriptions/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(403).json({ message: "Solo médicos pueden actualizar recetas" });
    }
    
    try {
      const prescriptionId = parseInt(req.params.id);
      
      // Verificar si la receta existe y pertenece al médico
      const prescription = await storage.getPrescription(prescriptionId);
      if (!prescription) {
        return res.status(404).json({ message: "Receta no encontrada" });
      }
      
      if (prescription.doctorId !== req.user.id) {
        return res.status(403).json({ message: "No autorizado para modificar esta receta" });
      }
      
      // Actualizar la receta
      const updatedPrescription = await storage.updatePrescription(prescriptionId, req.body);
      
      const doctor = await storage.getUser(updatedPrescription.doctorId);
      const patient = await storage.getUser(updatedPrescription.patientId);
      
      res.json({
        ...updatedPrescription,
        doctor: doctor ? { 
          id: doctor.id, 
          name: `${doctor.firstName} ${doctor.lastName}` 
        } : null,
        patient: patient ? { 
          id: patient.id, 
          name: `${patient.firstName} ${patient.lastName}` 
        } : null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de receta inválidos", errors: error.errors });
      }
      console.error("Error al actualizar receta:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Rutas para el catálogo de medicamentos COFEPRIS
  app.get("/api/medications", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset.toString()) : 0;
      
      const medications = await storage.getAllMedications(limit, offset);
      res.json(medications);
    } catch (error) {
      console.error("Error al obtener medicamentos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.get("/api/medications/search", async (req, res) => {
    try {
      const searchTerm = req.query.term?.toString() || '';
      const searchType = req.query.type?.toString() || 'name';
      
      if (searchTerm.length < 3) {
        return res.status(400).json({ message: "El término de búsqueda debe tener al menos 3 caracteres" });
      }
      
      let results;
      if (searchType === 'ingredient') {
        results = await storage.searchMedicationsByActiveIngredient(searchTerm);
      } else {
        results = await storage.searchMedicationsByName(searchTerm);
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error en la búsqueda de medicamentos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.get("/api/medications/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const medications = await storage.getMedicationsByCategory(category);
      res.json(medications);
    } catch (error) {
      console.error("Error al obtener medicamentos por categoría:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  app.get("/api/medications/:id", async (req, res) => {
    try {
      const medicationId = parseInt(req.params.id);
      const medication = await storage.getMedication(medicationId);
      
      if (!medication) {
        return res.status(404).json({ message: "Medicamento no encontrado" });
      }
      
      res.json(medication);
    } catch (error) {
      console.error("Error al obtener medicamento:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Ruta solo para administradores para agregar nuevos medicamentos al catálogo
  app.post("/api/medications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    if (req.user.userType !== "admin") {
      return res.status(403).json({ message: "Solo los administradores pueden agregar medicamentos al catálogo" });
    }
    
    try {
      const medicationData = req.body;
      
      // Validar con Zod
      const validatedData = insertMedicationCatalogSchema.parse(medicationData);
      
      // Crear el medicamento
      const medication = await storage.createMedication(validatedData);
      res.status(201).json(medication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de medicamento inválidos", errors: error.errors });
      }
      console.error("Error al crear medicamento:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  
  // Ruta solo para administradores para actualizar medicamentos en el catálogo
  app.put("/api/medications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    if (req.user.userType !== "admin") {
      return res.status(403).json({ message: "Solo los administradores pueden actualizar medicamentos del catálogo" });
    }
    
    try {
      const medicationId = parseInt(req.params.id);
      
      // Verificar si el medicamento existe
      const medication = await storage.getMedication(medicationId);
      if (!medication) {
        return res.status(404).json({ message: "Medicamento no encontrado" });
      }
      
      // Actualizar el medicamento
      const updatedMedication = await storage.updateMedication(medicationId, req.body);
      res.json(updatedMedication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de medicamento inválidos", errors: error.errors });
      }
      console.error("Error al actualizar medicamento:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // --- Resultados de laboratorio ---
  // Obtener resultados de laboratorio para un doctor
  app.get("/api/lab-results/doctor", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    try {
      const results = await storage.getLabTestResultsForDoctor(req.user.id);
      
      // Enriquecer con datos de pacientes y laboratorios
      const enhancedResults = await Promise.all(results.map(async (result) => {
        // Obtener la comisión asociada al resultado
        const commission = await storage.getLabCommission(result.commissionId);
        
        let patient = null;
        let laboratory = null;
        
        if (commission) {
          patient = await storage.getUser(commission.patientId);
          laboratory = await storage.getLaboratory(commission.laboratoryId);
        }
        
        return {
          ...result,
          patient: patient ? { 
            id: patient.id, 
            name: `${patient.firstName} ${patient.lastName}` 
          } : null,
          laboratory: laboratory ? {
            id: laboratory.id,
            name: laboratory.name
          } : null,
          serviceName: commission?.serviceName || null,
          testType: commission?.testType || null
        };
      }));
      
      res.json(enhancedResults);
    } catch (error) {
      console.error("Error al obtener resultados de laboratorio:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Obtener resultados de laboratorio para una comisión específica
  app.get("/api/lab-results/commission/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      const commissionId = parseInt(req.params.id);
      
      if (isNaN(commissionId)) {
        return res.status(400).json({ message: "ID de comisión inválido" });
      }
      
      // Obtener la comisión para verificar permisos
      const commission = await storage.getLabCommission(commissionId);
      
      if (!commission) {
        return res.status(404).json({ message: "Comisión no encontrada" });
      }
      
      // Verificar permisos
      if (req.user.userType === "patient" && commission.patientId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para ver estos resultados" });
      }
      
      if (req.user.userType === "doctor" && commission.doctorId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para ver estos resultados" });
      }
      
      // Obtener resultados
      const results = await storage.getLabTestResultsByCommission(commissionId);
      
      // Enriquecer datos
      const enhancedResults = await Promise.all(results.map(async (result) => {
        let patient = null;
        let doctor = null;
        let laboratory = null;
        
        patient = await storage.getUser(commission.patientId);
        doctor = await storage.getUser(commission.doctorId);
        laboratory = await storage.getLaboratory(commission.laboratoryId);
        
        return {
          ...result,
          patient: patient ? { 
            id: patient.id, 
            name: `${patient.firstName} ${patient.lastName}` 
          } : null,
          doctor: doctor ? { 
            id: doctor.id, 
            name: `${doctor.firstName} ${doctor.lastName}` 
          } : null,
          laboratory: laboratory ? {
            id: laboratory.id,
            name: laboratory.name
          } : null,
          serviceName: commission.serviceName || null,
          testType: commission.testType || null
        };
      }));
      
      res.json(enhancedResults);
    } catch (error) {
      console.error("Error al obtener resultados de laboratorio para comisión:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Obtener resultados de laboratorio para un paciente
  app.get("/api/lab-results/patient", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "patient") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    try {
      const results = await storage.getLabTestResultsForPatient(req.user.id);
      
      // Enriquecer con datos de laboratorios y médicos
      const enhancedResults = await Promise.all(results.map(async (result) => {
        // Obtener la comisión asociada al resultado
        const commission = await storage.getLabCommission(result.commissionId);
        
        let doctor = null;
        let laboratory = null;
        
        if (commission) {
          doctor = await storage.getUser(commission.doctorId);
          laboratory = await storage.getLaboratory(commission.laboratoryId);
        }
        
        return {
          ...result,
          doctor: doctor ? { 
            id: doctor.id, 
            name: `${doctor.firstName} ${doctor.lastName}` 
          } : null,
          laboratory: laboratory ? {
            id: laboratory.id,
            name: laboratory.name
          } : null,
          serviceName: commission?.serviceName || null,
          testType: commission?.testType || null
        };
      }));
      
      res.json(enhancedResults);
    } catch (error) {
      console.error("Error al obtener resultados de laboratorio:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Marcar un resultado como leído
  app.put("/api/lab-results/:id/mark-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    const resultId = parseInt(req.params.id, 10);
    
    try {
      const result = await storage.getLabTestResult(resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Resultado no encontrado" });
      }
      
      // Verificar permisos - solo el médico que ordenó la prueba o el paciente pueden marcar como leído
      const commission = await storage.getLabCommission(result.commissionId);
      
      if (!commission) {
        return res.status(404).json({ message: "Comisión asociada no encontrada" });
      }
      
      if (req.user.userType === "doctor" && req.user.id !== commission.doctorId) {
        return res.status(403).json({ message: "No tienes permiso para acceder a este resultado" });
      }
      
      if (req.user.userType === "patient" && req.user.id !== commission.patientId) {
        return res.status(403).json({ message: "No tienes permiso para acceder a este resultado" });
      }
      
      const updatedResult = await storage.markLabTestResultAsRead(resultId);
      res.json(updatedResult);
    } catch (error) {
      console.error("Error al marcar resultado como leído:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Agregar comentarios del médico a un resultado
  app.put("/api/lab-results/:id/doctor-review", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(403).json({ message: "Solo médicos pueden agregar comentarios" });
    }
    
    const resultId = parseInt(req.params.id, 10);
    const { comments } = req.body;
    
    if (!comments || typeof comments !== "string") {
      return res.status(400).json({ message: "Se requieren comentarios válidos" });
    }
    
    try {
      const result = await storage.getLabTestResult(resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Resultado no encontrado" });
      }
      
      // Verificar permisos - solo el médico que ordenó la prueba puede agregar comentarios
      const commission = await storage.getLabCommission(result.commissionId);
      
      if (!commission) {
        return res.status(404).json({ message: "Comisión asociada no encontrada" });
      }
      
      if (req.user.id !== commission.doctorId) {
        return res.status(403).json({ message: "No tienes permiso para comentar este resultado" });
      }
      
      const updatedResult = await storage.addDoctorReviewToLabTestResult(resultId, req.user.id, comments);
      res.json(updatedResult);
    } catch (error) {
      console.error("Error al agregar comentarios del médico:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Crear un nuevo resultado de laboratorio (solo para laboratorios o admin)
  app.post("/api/lab-results", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    try {
      const resultData = insertLabTestResultSchema.parse(req.body);
      
      // Verificar que la comisión existe
      const commission = await storage.getLabCommission(resultData.commissionId);
      if (!commission) {
        return res.status(404).json({ message: "Comisión no encontrada" });
      }
      
      const result = await storage.createLabTestResult(resultData);
      
      // Actualizar el estado de la comisión a "completed"
      await storage.updateLabCommissionStatus(commission.id, "completed");
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de resultado inválidos", errors: error.errors });
      }
      console.error("Error al crear resultado de laboratorio:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Health Metrics API routes
  app.get("/api/health-metrics/patient/:patientId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autorizado" });
      }
      
      const patientId = parseInt(req.params.patientId, 10);
      
      // Verificar permisos - solo el paciente puede ver sus propias métricas o médicos autorizados
      if (req.user.userType === "patient" && req.user.id !== patientId) {
        return res.status(403).json({ message: "No puedes ver estas métricas de salud" });
      }
      
      // Si es médico, verificar que tenga acceso al paciente (citas previas)
      if (req.user.userType === "doctor") {
        const appointments = await storage.getAppointmentsByDoctor(req.user.id);
        const doctorPatientIds = new Set(appointments.map(a => a.patientId));
        
        if (!doctorPatientIds.has(patientId)) {
          return res.status(403).json({ message: "No tienes acceso a este paciente" });
        }
      }
      
      const metrics = await storage.getHealthMetricsByPatient(patientId);
      
      // Ordenar métricas por fecha (más recientes primero)
      metrics.sort((a, b) => new Date(b.metricDate).getTime() - new Date(a.metricDate).getTime());
      
      res.json(metrics);
    } catch (error) {
      console.error("Error al obtener métricas de salud:", error);
      res.status(500).json({ message: "Error interno del servidor", error: String(error) });
    }
  });
  
  // Obtener métricas específicas de salud por tipo
  app.get("/api/health-metrics/patient/:patientId/type/:metricType", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autorizado" });
      }
      
      const patientId = parseInt(req.params.patientId, 10);
      const metricType = req.params.metricType;
      
      // Verificar permisos - solo el paciente puede ver sus propias métricas o médicos autorizados
      if (req.user.userType === "patient" && req.user.id !== patientId) {
        return res.status(403).json({ message: "No puedes ver estas métricas de salud" });
      }
      
      // Si es médico, verificar que tenga acceso al paciente (citas previas)
      if (req.user.userType === "doctor") {
        const appointments = await storage.getAppointmentsByDoctor(req.user.id);
        const doctorPatientIds = new Set(appointments.map(a => a.patientId));
        
        if (!doctorPatientIds.has(patientId)) {
          return res.status(403).json({ message: "No tienes acceso a este paciente" });
        }
      }
      
      // Verificar que el tipo de métrica es válido
      const validMetricTypes = ["bloodPressure", "heartRate", "temperature", "weight", "oxygenSaturation", "glucose"];
      if (!validMetricTypes.includes(metricType)) {
        return res.status(400).json({ message: "Tipo de métrica no válido" });
      }
      
      const metrics = await storage.getHealthMetricsByPatientAndType(patientId, metricType);
      
      // Ordenar métricas por fecha (más recientes primero)
      metrics.sort((a, b) => new Date(b.metricDate).getTime() - new Date(a.metricDate).getTime());
      
      res.json(metrics);
    } catch (error) {
      console.error("Error al obtener métricas de salud por tipo:", error);
      res.status(500).json({ message: "Error interno del servidor", error: String(error) });
    }
  });
  
  // Crear nueva métrica de salud
  app.post("/api/health-metrics", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autorizado" });
      }
      
      // Validar datos de entrada
      const metricData = insertHealthMetricSchema.parse(req.body);
      
      // Verificar permisos - solo paciente puede crear sus propias métricas o un médico
      if (req.user.userType === "patient" && req.user.id !== metricData.patientId) {
        return res.status(403).json({ message: "No puedes crear métricas para otro paciente" });
      }
      
      // Si es médico, verificar que tenga acceso al paciente (citas previas)
      if (req.user.userType === "doctor") {
        const appointments = await storage.getAppointmentsByDoctor(req.user.id);
        const doctorPatientIds = new Set(appointments.map(a => a.patientId));
        
        if (!doctorPatientIds.has(metricData.patientId)) {
          return res.status(403).json({ message: "No tienes acceso a este paciente" });
        }
      }
      
      // Asegurarnos de que la fecha de la métrica es válida
      if (!metricData.metricDate) {
        metricData.metricDate = new Date().toISOString();
      }
      
      const metric = await storage.createHealthMetric(metricData);
      
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de métrica de salud inválidos", errors: error.errors });
      }
      console.error("Error al crear métrica de salud:", error);
      res.status(500).json({ message: "Error interno del servidor", error: String(error) });
    }
  });

  // Rutas de verificación de médicos
  
  // Obtener documentos de verificación de un médico
  app.get("/api/doctor-verification/:doctorId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autorizado" });
      }
      
      // Verificar permisos: solo el médico dueño de los documentos o un administrador pueden verlos
      const doctorId = parseInt(req.params.doctorId);
      if (req.user.userType !== "admin" && req.user.id !== doctorId) {
        return res.status(403).json({ message: "No tienes permiso para ver estos documentos" });
      }
      
      const documents = await storage.getDoctorVerificationDocuments(doctorId);
      res.json(documents);
    } catch (error) {
      console.error("Error al obtener documentos de verificación:", error);
      res.status(500).json({ message: "Error al obtener los documentos de verificación" });
    }
  });
  
  // Subir un documento de verificación
  app.post("/api/doctor-verification", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.userType !== "doctor") {
        return res.status(403).json({ message: "Solo médicos pueden subir documentos de verificación" });
      }
      
      const documentData = insertDoctorVerificationDocumentSchema.parse(req.body);
      
      // Asegurarse de que el médico solo pueda subir documentos para sí mismo
      if (documentData.doctorId !== req.user.id) {
        return res.status(403).json({ message: "Solo puedes subir documentos para tu perfil" });
      }
      
      // Asegurarse de que el tipo de documento sea válido
      if (!["license", "id", "specialty_cert", "specialty_diploma", "additional"].includes(documentData.documentType as string)) {
        return res.status(400).json({ message: "Tipo de documento inválido" });
      }
      
      const document = await storage.createDoctorVerificationDocument(documentData);
      
      // Actualizar el estado de verificación del médico a "pending" si no lo está ya
      const doctorProfile = await storage.getDoctorProfileByUserId(req.user.id);
      if (doctorProfile && doctorProfile.verificationStatus !== "pending") {
        await storage.updateDoctorVerificationStatus(doctorProfile.id, "pending");
      }
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos de documento inválidos", errors: error.errors });
      }
      console.error("Error al crear documento de verificación:", error);
      res.status(500).json({ message: "Error al crear el documento de verificación" });
    }
  });
  
  // Revisar/Verificar documentos (solo administradores)
  app.patch("/api/doctor-verification/:documentId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.userType !== "admin") {
        return res.status(403).json({ message: "Solo administradores pueden verificar documentos" });
      }
      
      const documentId = parseInt(req.params.documentId);
      const { status, notes } = req.body;
      
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "El campo status es requerido y debe ser 'pending', 'approved' o 'rejected'" });
      }
      
      const updatedDocument = await storage.updateDoctorVerificationDocument(
        documentId, 
        status as "pending" | "approved" | "rejected",
        req.user.id,
        notes
      );
      
      if (!updatedDocument) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error al actualizar documento de verificación:", error);
      res.status(500).json({ message: "Error al actualizar el documento de verificación" });
    }
  });
  
  // Actualizar el estado de verificación de un médico (solo administradores)
  app.patch("/api/doctor-verification-status/:doctorId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.userType !== "admin") {
        return res.status(403).json({ message: "Solo administradores pueden actualizar el estado de verificación" });
      }
      
      const doctorId = parseInt(req.params.doctorId);
      const { status, comments } = req.body;
      
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "El estado debe ser 'pending', 'approved' o 'rejected'" });
      }
      
      // Tipificación del estado para asegurar compatibilidad
      const typedStatus = status as "pending" | "approved" | "rejected";
      
      const doctorProfile = await storage.updateDoctorVerificationStatus(doctorId, typedStatus, req.user.id, comments);
      
      if (!doctorProfile) {
        return res.status(404).json({ message: "Perfil de médico no encontrado" });
      }
      
      // Crear un registro en el historial de verificación
      await storage.createDoctorVerificationHistory({
        doctorId,
        status: typedStatus,
        reviewerId: req.user.id,
        comments
      });
      
      res.json(doctorProfile);
    } catch (error) {
      console.error("Error al actualizar estado de verificación:", error);
      res.status(500).json({ message: "Error al actualizar el estado de verificación" });
    }
  });
  
  // Obtener el historial de verificación de un médico
  app.get("/api/doctor-verification-history/:doctorId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autorizado" });
      }
      
      const doctorId = parseInt(req.params.doctorId);
      
      // Solo el médico propietario o un administrador pueden ver el historial
      if (req.user.userType !== "admin" && req.user.id !== doctorId) {
        return res.status(403).json({ message: "No tienes permiso para ver este historial" });
      }
      
      const history = await storage.getDoctorVerificationHistory(doctorId);
      
      // Enriquecer el historial con información del revisor
      const historyWithReviewer = await Promise.all(
        history.map(async (entry) => {
          let reviewer = null;
          if (entry.reviewerId) {
            reviewer = await storage.getUser(entry.reviewerId);
          }
          return {
            ...entry,
            reviewer: reviewer ? {
              id: reviewer.id,
              name: `${reviewer.firstName} ${reviewer.lastName}`
            } : null
          };
        })
      );
      
      res.json(historyWithReviewer);
    } catch (error) {
      console.error("Error al obtener historial de verificación:", error);
      res.status(500).json({ message: "Error al obtener el historial de verificación" });
    }
  });

  // Rutas para el perfil de usuario
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      let profile;
      if (req.user.userType === "doctor") {
        profile = await storage.getDoctorProfileByUserId(req.user.id);
      } else if (req.user.userType === "patient") {
        profile = await storage.getPatientProfileByUserId(req.user.id);
      }

      res.json(profile || {});
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({ message: "Error al obtener el perfil" });
    }
  });

  // Actualizar perfil
  app.put("/api/profile/update/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const userId = parseInt(req.params.userId);

    // Verificar que solo el propio usuario o un administrador pueden actualizar el perfil
    if (req.user.id !== userId && req.user.userType !== "admin") {
      return res.status(403).json({ message: "No tienes permiso para actualizar este perfil" });
    }

    try {
      // Actualizar información básica del usuario
      const { firstName, lastName, email, bio, phone, address, ...otherData } = req.body;
      
      const userUpdate = {
        firstName,
        lastName,
        email
      };

      const profileUpdate = {
        bio,
        phone,
        address,
        ...otherData
      };

      // Actualizar usuario
      const updatedUser = await storage.updateUser(userId, userUpdate);
      
      // Actualizar perfil específico según tipo de usuario
      let updatedProfile;
      if (req.user.userType === "doctor") {
        const doctorProfile = await storage.getDoctorProfileByUserId(userId);
        if (doctorProfile) {
          updatedProfile = await storage.updateDoctorProfile(
            doctorProfile.id,
            profileUpdate
          );
        }
      } else if (req.user.userType === "patient") {
        const patientProfile = await storage.getPatientProfileByUserId(userId);
        if (patientProfile) {
          updatedProfile = await storage.updatePatientProfile(
            patientProfile.id,
            profileUpdate
          );
        }
      }

      res.json({ user: updatedUser, profile: updatedProfile });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      res.status(500).json({ message: "Error al actualizar el perfil" });
    }
  });

  // Subir imagen de perfil
  
  // Crear el directorio uploads si no existe
  // Crear directorios para uploads si no existen
  // const uploadsPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../uploads');
  const uploadsPath = '../uploads';
  const verificationDocumentsPath = path.join(uploadsPath, 'verification');
  
  if (!fs.existsSync(uploadsPath)){
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  
  if (!fs.existsSync(verificationDocumentsPath)){
    fs.mkdirSync(verificationDocumentsPath, { recursive: true });
  }
  
  // Configurar multer para el almacenamiento de archivos
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });
  
  // Configuración para subida de imágenes de perfil
  const profileImageUpload = multer({ 
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
      // Aceptar solo imágenes
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Solo se permiten imágenes'));
      }
      cb(null, true);
    }
  });
  
  // Configuración para subida de archivos del chat (más permisiva)
  const chatFileUpload = multer({
    storage: multerStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
      // Aceptar imágenes, PDFs, y documentos comunes
      const allowedMimes = [
        'image/jpeg', 
        'image/png', 
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Tipo de archivo no permitido'));
      }
      cb(null, true);
    }
  });
  
  // Configuración para la subida de documentos de verificación médica
  const verificationDocumentsStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, verificationDocumentsPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `doc-${uniqueSuffix}${ext}`);
    }
  });
  
  const verificationDocsUpload = multer({
    storage: verificationDocumentsStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
      // Aceptar imágenes y PDFs para documentos de verificación
      const allowedMimes = [
        'image/jpeg', 
        'image/png', 
        'image/gif',
        'application/pdf'
      ];
      
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes y PDFs.'));
      }
      cb(null, true);
    }
  });
  
  app.post("/api/profile/upload-image", profileImageUpload.single('image'), async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó imagen" });
      }
      
      // Crear URL relativa del archivo subido
      const imageUrl = `/uploads/${req.file.filename}`;
      const userId = req.body.userId ? parseInt(req.body.userId) : req.user.id;
      
      const id = userId || req.user.id;
      
      // Verificar que solo el propio usuario o un administrador pueden actualizar la imagen
      if (req.user.id !== id && req.user.userType !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para actualizar este perfil" });
      }

      // Actualizar la imagen en el perfil según el tipo de usuario
      if (req.user.userType === "doctor") {
        const doctorProfile = await storage.getDoctorProfileByUserId(id);
        if (doctorProfile) {
          await storage.updateDoctorProfile(doctorProfile.id, { profileImage: imageUrl });
        }
      } else if (req.user.userType === "patient") {
        const patientProfile = await storage.getPatientProfileByUserId(id);
        if (patientProfile) {
          await storage.updatePatientProfile(patientProfile.id, { profileImage: imageUrl });
        }
      }

      res.json({ success: true, imageUrl });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      res.status(500).json({ message: "Error al subir la imagen" });
    }
  });

  // Eliminar imagen de perfil
  app.delete("/api/profile/delete-image/:userId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const userId = parseInt(req.params.userId);
      
      // Verificar que solo el propio usuario o un administrador pueden eliminar la imagen
      if (req.user.id !== userId && req.user.userType !== "admin") {
        return res.status(403).json({ message: "No tienes permiso para actualizar este perfil" });
      }

      // Eliminar la imagen según el tipo de usuario
      if (req.user.userType === "doctor") {
        const doctorProfile = await storage.getDoctorProfileByUserId(userId);
        if (doctorProfile) {
          await storage.updateDoctorProfile(doctorProfile.id, { profileImage: null });
        }
      } else if (req.user.userType === "patient") {
        const patientProfile = await storage.getPatientProfileByUserId(userId);
        if (patientProfile) {
          await storage.updatePatientProfile(patientProfile.id, { profileImage: null });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      res.status(500).json({ message: "Error al eliminar la imagen" });
    }
  });

  // Doctor profile
  app.get("/api/doctor-profile", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      // Utilizar el storage para obtener el perfil de doctor
      const profile = await storage.getDoctorProfileByUserId(req.user.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Perfil de doctor no encontrado" });
      }
      
      // Los campos ya están en camelCase gracias al mapeo de Drizzle
      
      // Obtener la especialidad si existe
      let specialtyName = null;
      if (profile.specialtyId) {
        const specialty = await storage.getSpecialty(profile.specialtyId);
        if (specialty) {
          specialtyName = specialty.name;
        }
      }
      
      // Obtener información del usuario para completar el perfil
      const user = await storage.getUser(req.user.id);
      
      res.json({ 
        ...profile, 
        specialtyName,
        fullName: user ? `${user.firstName} ${user.lastName}` : ""
      });
    } catch (error) {
      console.error("Error al obtener perfil de doctor:", error);
      res.status(500).json({ message: "Error al obtener el perfil de doctor" });
    }
  });

  // Ruta para obtener médicos verificados por especialidad
  app.get("/api/specialties/:id/doctors", async (req, res) => {
    try {
      const specialtyId = parseInt(req.params.id);
      
      // Verificar que la especialidad exista
      const specialty = await storage.getSpecialty(specialtyId);
      if (!specialty) {
        return res.status(404).json({ message: "Especialidad no encontrada" });
      }
      
      // Obtener todos los doctores para esta especialidad que estén verificados
      const doctors = await storage.getDoctorsBySpecialty(specialtyId);
      
      // Filtrar por aquellos que tienen estado de verificación aprobado
      const verifiedDoctors = doctors.filter(doctor => 
        doctor.profile && doctor.profile.verificationStatus === "approved"
      );
      
      // Devolver la información formateada
      res.json(verifiedDoctors);
    } catch (error) {
      console.error("Error al obtener médicos por especialidad:", error);
      res.status(500).json({ message: "Error al obtener los médicos", error: error.message });
    }
  });
  
  // Obtener perfil público de un médico específico
  app.get("/api/public/doctors/:id", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      
      // Obtener el usuario
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.userType !== "doctor") {
        return res.status(404).json({ message: "Médico no encontrado" });
      }
      
      // Obtener el perfil del doctor
      const profile = await storage.getDoctorProfileByUserId(doctorId);
      if (!profile || profile.verificationStatus !== "approved") {
        return res.status(404).json({ message: "Perfil de médico no encontrado o no verificado" });
      }
      
      // Obtener la especialidad
      const specialty = await storage.getSpecialty(profile.specialtyId);
      
      // Devolver la información pública del médico
      res.json({
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        profileImage: doctor.profileImage,
        specialty: specialty ? specialty.name : null,
        licenseNumber: profile.licenseNumber,
        biography: profile.biography,
        education: profile.education,
        experience: profile.experience,
        address: profile.address,
        consultationFee: profile.consultationFee
      });
    } catch (error) {
      console.error("Error al obtener perfil público del médico:", error);
      res.status(500).json({ message: "Error al obtener el perfil del médico", error: error.message });
    }
  });
  
  // Ruta para cargar archivos del chat (imágenes y documentos)
  app.post("/api/upload", chatFileUpload.single('file'), async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó archivo" });
      }
      
      // Crear URL relativa del archivo subido
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({ 
        success: true, 
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });
    } catch (error) {
      console.error("Error al subir archivo:", error);
      res.status(500).json({ message: "Error al subir el archivo" });
    }
  });
  
  // Endpoint para obtener los documentos de verificación del médico actual
  app.get("/api/doctor/verification/documents", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      // Obtener los documentos de verificación del médico
      const documents = await storage.getDoctorVerificationDocuments(req.user.id);
      
      // Obtener el perfil del médico para conocer el estado general de verificación
      const doctorProfile = await storage.getDoctorProfileByUserId(req.user.id);
      
      res.json({
        documents,
        verificationStatus: doctorProfile?.verificationStatus || "pending",
        licenseVerified: doctorProfile?.licenseVerified || false
      });
    } catch (error) {
      console.error("Error al obtener documentos de verificación:", error);
      res.status(500).json({ message: "Error al obtener los documentos de verificación" });
    }
  });
  
  // Endpoint para subir documentos de verificación de médicos
  app.post("/api/doctor/verification/upload", verificationDocsUpload.single('document'), async (req: any, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "doctor") {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se proporcionó ningún documento" });
      }
      
      const { documentType } = req.body;
      
      if (!documentType) {
        return res.status(400).json({ message: "Falta especificar el tipo de documento" });
      }
      
      // Verificar que el tipo de documento sea válido
      const validDocumentTypes = ["license", "id", "specialty_cert", "specialty_diploma", "additional"];
      if (!validDocumentTypes.includes(documentType)) {
        return res.status(400).json({ message: "Tipo de documento no válido" });
      }
      
      // Crear URL relativa del archivo subido
      const fileUrl = `/uploads/verification/${req.file.filename}`;
      
      // Guardar el documento en la base de datos
      const document = await storage.createDoctorVerificationDocument({
        doctorId: req.user.id,
        documentType,
        documentUrl: fileUrl,
        status: "pending",
        submittedAt: new Date(),
        notes: req.body.notes || null
      });
      
      // Si este era el primer documento, actualizar el doctor profile para indicar que está en proceso de verificación
      const doctorProfile = await storage.getDoctorProfileByUserId(req.user.id);
      if (doctorProfile && doctorProfile.verificationStatus === "pending") {
        await storage.updateDoctorProfile(doctorProfile.id, { 
          verificationStatus: "in_review" 
        });
        
        // Registrar el historial de verificación
        await storage.createDoctorVerificationHistory({
          doctorId: req.user.id,
          status: "in_review",
          updatedAt: new Date(),
          notes: "Documentos de verificación subidos"
        });
      }
      
      res.json({
        success: true,
        document: {
          id: document.id,
          documentType,
          documentUrl: fileUrl,
          status: document.status,
          submittedAt: document.submittedAt
        }
      });
    } catch (error) {
      console.error("Error al subir documento de verificación:", error);
      res.status(500).json({ message: "Error al subir el documento" });
    }
  });
  
  // Endpoint para ver todos los médicos con sus estados de verificación (solo para admin)
  app.get("/api/admin/doctor-verifications", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      // Obtener todos los perfiles de doctores
      const doctorProfiles = await storage.getAllDoctorProfiles();
      
      // Para cada doctor, obtener la información del usuario y especialidad
      const doctors = await Promise.all(doctorProfiles.map(async (profile) => {
        const user = await storage.getUser(profile.userId);
        const specialty = await storage.getSpecialty(profile.specialtyId);
        
        return {
          userId: profile.userId,
          doctorProfileId: profile.id,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          specialtyName: specialty?.name || "Sin especialidad",
          professionalType: profile.professionalType || "médico",
          licenseNumber: profile.licenseNumber,
          verificationStatus: profile.verificationStatus,
          licenseVerified: profile.licenseVerified,
          createdAt: user?.createdAt
        };
      }));
      
      res.json(doctors);
    } catch (error) {
      console.error("Error al obtener verificaciones de médicos:", error);
      res.status(500).json({ message: "Error al obtener las verificaciones de médicos" });
    }
  });
  
  // Endpoint para ver los documentos de verificación de un médico específico (para admin)
  app.get("/api/admin/doctor-verifications/:doctorId", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      const doctorId = parseInt(req.params.doctorId);
      
      // Verificar que el médico existe
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.userType !== "doctor") {
        return res.status(404).json({ message: "Médico no encontrado" });
      }
      
      // Obtener el perfil del médico
      const doctorProfile = await storage.getDoctorProfileByUserId(doctorId);
      if (!doctorProfile) {
        return res.status(404).json({ message: "Perfil de médico no encontrado" });
      }
      
      // Obtener los documentos de verificación
      const documents = await storage.getDoctorVerificationDocuments(doctorId);
      
      // Obtener el historial de verificación
      const verificationHistory = await storage.getDoctorVerificationHistory(doctorId);
      
      // Obtener la especialidad
      const specialty = await storage.getSpecialty(doctorProfile.specialtyId);
      
      res.json({
        doctor: {
          id: doctor.id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email,
          profileImage: doctor.profileImage,
          createdAt: doctor.createdAt
        },
        profile: {
          ...doctorProfile,
          specialtyName: specialty?.name || "Sin especialidad"
        },
        documents,
        verificationHistory
      });
    } catch (error) {
      console.error("Error al obtener verificación del médico:", error);
      res.status(500).json({ message: "Error al obtener la verificación del médico" });
    }
  });
  
  // Endpoint para actualizar el estado de verificación de un documento (para admin)
  app.put("/api/admin/doctor-verification-document/:documentId", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      const documentId = parseInt(req.params.documentId);
      const { status, notes } = req.body;
      
      // Verificar que el documento existe
      const document = await storage.getDoctorVerificationDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      
      // Actualizar el estado del documento
      const updatedDocument = await storage.updateDoctorVerificationDocument(documentId, {
        status,
        reviewedAt: new Date(),
        reviewerId: req.user.id,
        notes
      });
      
      // Si es un documento de licencia y ha sido aprobado, actualizar el estado de licencia verificada
      if (document.documentType === "license" && status === "approved") {
        const doctorProfile = await storage.getDoctorProfileByUserId(document.doctorId);
        if (doctorProfile) {
          await storage.updateDoctorProfile(doctorProfile.id, { licenseVerified: true });
        }
      }
      
      // Registrar en el historial
      await storage.createDoctorVerificationHistory({
        doctorId: document.doctorId,
        status: `document_${status}`,
        updatedAt: new Date(),
        reviewerId: req.user.id,
        notes: `Documento ${document.documentType} ${status === "approved" ? "aprobado" : "rechazado"}: ${notes || ""}`
      });
      
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error al actualizar documento de verificación:", error);
      res.status(500).json({ message: "Error al actualizar el documento de verificación" });
    }
  });
  
  // Endpoint para actualizar el estado general de verificación de un médico (para admin)
  app.put("/api/admin/doctor-verification-status/:doctorId", async (req, res) => {
    if (!req.isAuthenticated() || req.user.userType !== "admin") {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    try {
      const doctorId = parseInt(req.params.doctorId);
      const { status, notes } = req.body;
      
      // Verificar que el estado es válido
      const validStatus = ["pending", "in_review", "approved", "rejected"];
      if (!validStatus.includes(status)) {
        return res.status(400).json({ message: "Estado de verificación no válido" });
      }
      
      // Verificar que el doctor existe
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.userType !== "doctor") {
        return res.status(404).json({ message: "Médico no encontrado" });
      }
      
      // Obtener el perfil del doctor
      const doctorProfile = await storage.getDoctorProfileByUserId(doctorId);
      if (!doctorProfile) {
        return res.status(404).json({ message: "Perfil de médico no encontrado" });
      }
      
      // Actualizar el estado de verificación
      const updatedProfile = await storage.updateDoctorProfile(doctorProfile.id, { 
        verificationStatus: status 
      });
      
      // Registrar en el historial
      await storage.createDoctorVerificationHistory({
        doctorId,
        status,
        updatedAt: new Date(),
        reviewerId: req.user.id,
        notes: notes || `Estado de verificación actualizado a ${status}`
      });
      
      res.json({
        success: true,
        profile: updatedProfile
      });
    } catch (error) {
      console.error("Error al actualizar estado de verificación:", error);
      res.status(500).json({ message: "Error al actualizar el estado de verificación" });
    }
  });
  
  // Servir archivos estáticos desde la carpeta uploads
  app.use('/uploads', express.static(uploadsPath));
  
  // ===== SISTEMA DE AGENDAMIENTO DE CITAS =====
  
  // API para gestionar horarios de médicos
  app.post("/api/doctor-schedule", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      if (req.user.userType !== "doctor") {
        return res.status(403).json({ error: "Solo los médicos pueden configurar horarios" });
      }

      const validatedData = insertDoctorScheduleSchema.parse(req.body);
      const schedule = await storage.createDoctorSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error al crear horario:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/doctor-schedule/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de médico inválido" });
      }

      const schedules = await storage.getDoctorSchedulesByDoctorId(doctorId);
      res.json(schedules);
    } catch (error) {
      console.error("Error al obtener horarios:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/doctor-schedule/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const scheduleId = parseInt(req.params.id);
      if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID de horario inválido" });
      }

      // Obtener el horario para verificar que pertenezca al médico actual
      const schedule = await storage.getDoctorSchedule(scheduleId);
      if (!schedule) {
        return res.status(404).json({ error: "Horario no encontrado" });
      }

      // Verificar que el médico sea el propietario del horario
      if (schedule.doctorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ error: "No tienes permiso para eliminar este horario" });
      }

      await storage.deleteDoctorSchedule(scheduleId);
      res.json({ success: true, message: "Horario eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar horario:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API para gestionar indisponibilidades de médicos
  app.post("/api/doctor-unavailability", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      if (req.user.userType !== "doctor") {
        return res.status(403).json({ error: "Solo los médicos pueden registrar indisponibilidades" });
      }

      const validatedData = insertDoctorUnavailabilitySchema.parse(req.body);
      const unavailability = await storage.createDoctorUnavailability(validatedData);
      res.status(201).json(unavailability);
    } catch (error) {
      console.error("Error al crear indisponibilidad:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/doctor-unavailability/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de médico inválido" });
      }

      const unavailabilities = await storage.getDoctorUnavailabilitiesByDoctorId(doctorId);
      res.json(unavailabilities);
    } catch (error) {
      console.error("Error al obtener indisponibilidades:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/doctor-unavailability/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const unavailabilityId = parseInt(req.params.id);
      if (isNaN(unavailabilityId)) {
        return res.status(400).json({ error: "ID de indisponibilidad inválido" });
      }

      // Obtener la indisponibilidad para verificar que pertenezca al médico actual
      const unavailability = await storage.getDoctorUnavailability(unavailabilityId);
      if (!unavailability) {
        return res.status(404).json({ error: "Indisponibilidad no encontrada" });
      }

      // Verificar que el médico sea el propietario de la indisponibilidad
      if (unavailability.doctorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ error: "No tienes permiso para eliminar esta indisponibilidad" });
      }

      await storage.deleteDoctorUnavailability(unavailabilityId);
      res.json({ success: true, message: "Indisponibilidad eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar indisponibilidad:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API para obtener slots disponibles para citas
  app.get("/api/available-slots/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de médico inválido" });
      }

      const dateStr = req.query.date as string;
      if (!dateStr) {
        return res.status(400).json({ error: "Se requiere una fecha" });
      }

      // Parsear la fecha
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Formato de fecha inválido" });
      }

      // Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
      const dayOfWeek = date.getDay();

      // Obtener el horario del médico para ese día
      const schedules = await storage.getDoctorSchedulesByDoctorId(doctorId);
      const daySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek && s.isAvailable);

      if (!daySchedule) {
        return res.json([]);
      }

      // Obtener indisponibilidades del médico para esa fecha
      const unavailabilities = await storage.getDoctorUnavailabilitiesByDoctorId(doctorId);
      const dateOnly = dateStr.split('T')[0];
      const dayUnavailabilities = unavailabilities.filter(u => {
        const startDate = new Date(u.startDateTime);
        const endDate = new Date(u.endDateTime);
        return (
          date >= startDate && date <= endDate
        );
      });

      // Si hay una indisponibilidad para todo el día, no hay slots disponibles
      const fullDayUnavailable = dayUnavailabilities.some(u => {
        const startDate = new Date(u.startDateTime);
        const endDate = new Date(u.endDateTime);
        const startDay = new Date(startDate);
        startDay.setHours(0, 0, 0, 0);
        const endDay = new Date(endDate);
        endDay.setHours(23, 59, 59, 999);
        return startDate <= startDay && endDate >= endDay;
      });

      if (fullDayUnavailable) {
        return res.json([]);
      }

      // Obtener citas existentes para ese día
      const appointments = await storage.getAppointmentsByDoctorAndDate(doctorId, dateStr);

      // Generar slots disponibles para ese día
      const start = new Date(`${dateStr}T${daySchedule.startTime}`);
      const end = new Date(`${dateStr}T${daySchedule.endTime}`);
      const slotDuration = daySchedule.slotDuration * 60 * 1000; // Convertir minutos a milisegundos

      const slots = [];
      let currentTime = start;

      while (currentTime < end) {
        const slotEnd = new Date(currentTime.getTime() + slotDuration);

        // Verificar si el slot está dentro de un período de indisponibilidad
        const slotUnavailable = dayUnavailabilities.some(u => {
          const unavailStart = new Date(u.startDateTime);
          const unavailEnd = new Date(u.endDateTime);
          return (
            (currentTime >= unavailStart && currentTime < unavailEnd) ||
            (slotEnd > unavailStart && slotEnd <= unavailEnd) ||
            (currentTime <= unavailStart && slotEnd >= unavailEnd)
          );
        });

        // Verificar si hay una cita existente que se superponga con este slot
        const slotBooked = appointments.some(a => {
          const apptStart = new Date(a.dateTime);
          const apptEnd = new Date(a.endTime);
          return (
            (currentTime >= apptStart && currentTime < apptEnd) ||
            (slotEnd > apptStart && slotEnd <= apptEnd) ||
            (currentTime <= apptStart && slotEnd >= apptEnd)
          );
        });

        // Verificar si el slot está en el pasado
        const isPastSlot = currentTime < new Date();

        // Agregar el slot a la lista
        slots.push({
          start: currentTime.toTimeString().substring(0, 5),
          end: slotEnd.toTimeString().substring(0, 5),
          available: !slotUnavailable && !slotBooked && !isPastSlot
        });

        // Avanzar al siguiente slot
        currentTime = slotEnd;
      }

      res.json(slots);
    } catch (error) {
      console.error("Error al obtener slots disponibles:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API para gestionar citas
  app.post("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Verificar que el paciente sea el usuario actual o que sea un médico/admin creando la cita
      if (validatedData.patientId !== req.user.id && 
          req.user.userType !== "doctor" && 
          req.user.userType !== "admin") {
        return res.status(403).json({ error: "No puedes crear citas para otros pacientes" });
      }

      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error al crear cita:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ error: "ID de paciente inválido" });
      }

      // Verificar que el paciente sea el usuario actual o sea un médico/admin
      if (patientId !== req.user.id && req.user.userType !== "admin" && req.user.userType !== "doctor") {
        return res.status(403).json({ error: "No puedes ver citas de otros pacientes" });
      }

      const appointments = await storage.getAppointmentsByPatient(patientId);
      
      // Obtener nombres de médicos
      const appointmentsWithNames = await Promise.all(
        appointments.map(async (appt) => {
          const doctor = await storage.getUser(appt.doctorId);
          return {
            ...appt,
            doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Médico desconocido"
          };
        })
      );

      res.json(appointmentsWithNames);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/appointments/upcoming/patient/:patientId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ error: "ID de paciente inválido" });
      }

      // Verificar que el paciente sea el usuario actual o sea un médico/admin
      if (patientId !== req.user.id && req.user.userType !== "admin" && req.user.userType !== "doctor") {
        return res.status(403).json({ error: "No puedes ver citas de otros pacientes" });
      }

      const appointments = await storage.getUpcomingAppointmentsByPatient(patientId);
      
      // Obtener nombres de médicos
      const appointmentsWithNames = await Promise.all(
        appointments.map(async (appt) => {
          const doctor = await storage.getUser(appt.doctorId);
          return {
            ...appt,
            doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Médico desconocido"
          };
        })
      );

      res.json(appointmentsWithNames);
    } catch (error) {
      console.error("Error al obtener citas próximas:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de médico inválido" });
      }

      // Verificar que el médico sea el usuario actual o sea un admin
      if (doctorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ error: "No puedes ver citas de otros médicos" });
      }

      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      
      // Obtener nombres de pacientes
      const appointmentsWithNames = await Promise.all(
        appointments.map(async (appt) => {
          const patient = await storage.getUser(appt.patientId);
          return {
            ...appt,
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente desconocido"
          };
        })
      );

      res.json(appointmentsWithNames);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/appointments/upcoming/doctor/:doctorId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ error: "ID de médico inválido" });
      }

      // Verificar que el médico sea el usuario actual o sea un admin
      if (doctorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ error: "No puedes ver citas de otros médicos" });
      }

      const appointments = await storage.getUpcomingAppointmentsByDoctor(doctorId);
      
      // Obtener nombres de pacientes
      const appointmentsWithNames = await Promise.all(
        appointments.map(async (appt) => {
          const patient = await storage.getUser(appt.patientId);
          return {
            ...appt,
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente desconocido"
          };
        })
      );

      res.json(appointmentsWithNames);
    } catch (error) {
      console.error("Error al obtener citas próximas:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ error: "ID de cita inválido" });
      }

      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }

      // Verificar que el usuario sea el paciente, el médico o un admin
      if (appointment.patientId !== req.user.id && 
          appointment.doctorId !== req.user.id && 
          req.user.userType !== "admin") {
        return res.status(403).json({ error: "No tienes permiso para ver esta cita" });
      }

      // Obtener información adicional
      const doctor = await storage.getUser(appointment.doctorId);
      const patient = await storage.getUser(appointment.patientId);

      const appointmentWithNames = {
        ...appointment,
        doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Médico desconocido",
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente desconocido"
      };

      res.json(appointmentWithNames);
    } catch (error) {
      console.error("Error al obtener cita:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const appointmentId = parseInt(req.params.id);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ error: "ID de cita inválido" });
      }

      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }

      // Verificar permisos: 
      // - Pacientes solo pueden cancelar sus propias citas
      // - Médicos pueden actualizar estado y notas de sus citas
      // - Admins pueden hacer cualquier cambio
      if (req.user.userType === "patient" && appointment.patientId !== req.user.id) {
        return res.status(403).json({ error: "No puedes modificar citas de otros pacientes" });
      }

      if (req.user.userType === "doctor" && appointment.doctorId !== req.user.id) {
        return res.status(403).json({ error: "No puedes modificar citas de otros médicos" });
      }

      // Si es paciente, solo puede cambiar a estado "cancelled"
      if (req.user.userType === "patient" && 
          req.body.status && 
          req.body.status !== "cancelled") {
        return res.status(403).json({ error: "Los pacientes solo pueden cancelar citas" });
      }

      // Actualizar la cita
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error al actualizar cita:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // API para gestionar seguimientos de citas
  app.post("/api/appointment-follow-ups", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      if (req.user.userType !== "doctor" && req.user.userType !== "admin") {
        return res.status(403).json({ error: "Solo los médicos pueden crear seguimientos" });
      }

      const validatedData = insertAppointmentFollowUpSchema.parse(req.body);
      
      // Verificar que la cita exista
      const appointment = await storage.getAppointment(validatedData.appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }

      // Verificar que el médico sea el propietario de la cita
      if (appointment.doctorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ error: "No puedes crear seguimientos para citas de otros médicos" });
      }

      const followUp = await storage.createAppointmentFollowUp(validatedData);
      res.status(201).json(followUp);
    } catch (error) {
      console.error("Error al crear seguimiento:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/appointment-follow-ups/:appointmentId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const appointmentId = parseInt(req.params.appointmentId);
      if (isNaN(appointmentId)) {
        return res.status(400).json({ error: "ID de cita inválido" });
      }

      // Verificar que la cita exista
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }

      // Verificar que el usuario sea el paciente, el médico o un admin
      if (appointment.patientId !== req.user.id && 
          appointment.doctorId !== req.user.id && 
          req.user.userType !== "admin") {
        return res.status(403).json({ error: "No tienes permiso para ver estos seguimientos" });
      }

      const followUps = await storage.getAppointmentFollowUpsByAppointmentId(appointmentId);
      res.json(followUps);
    } catch (error) {
      console.error("Error al obtener seguimientos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/appointment-follow-ups/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const followUpId = parseInt(req.params.id);
      if (isNaN(followUpId)) {
        return res.status(400).json({ error: "ID de seguimiento inválido" });
      }

      // Obtener el seguimiento
      const followUp = await storage.getAppointmentFollowUp(followUpId);
      if (!followUp) {
        return res.status(404).json({ error: "Seguimiento no encontrado" });
      }

      // Obtener la cita relacionada
      const appointment = await storage.getAppointment(followUp.appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Cita relacionada no encontrada" });
      }

      // Verificar permisos
      if (appointment.doctorId !== req.user.id && req.user.userType !== "admin") {
        return res.status(403).json({ error: "No tienes permiso para modificar este seguimiento" });
      }

      // Actualizar el seguimiento
      const updatedFollowUp = await storage.updateAppointmentFollowUp(followUpId, req.body);
      res.json(updatedFollowUp);
    } catch (error) {
      console.error("Error al actualizar seguimiento:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ===== EXPEDIENTE CLÍNICO (NOM-004-SSA3-2012) =====

  // Configuración de almacenamiento para documentos del expediente clínico
  const medicalDocumentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadsDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../uploads/medical_documents');
      
      // Crear el directorio si no existe
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      // Generar un nombre único para evitar colisiones
      const uniqueId = nanoid(10);
      const fileExt = path.extname(file.originalname);
      const filename = `med_doc_${uniqueId}${fileExt}`;
      cb(null, filename);
    }
  });
  
  const medicalDocumentUpload = multer({ 
    storage: medicalDocumentStorage,
    limits: {
      fileSize: 20 * 1024 * 1024 // 20MB límite
    },
    fileFilter: function (req, file, cb) {
      // Aceptar solo archivos comunes en expedientes médicos
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Solo se permiten archivos PDF, imágenes y documentos de Word'));
      }
      cb(null, true);
    }
  });

  // Crear un registro médico (expediente clínico)
  app.post("/api/medical-records", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      // Solo médicos pueden crear expedientes clínicos
      if (req.user.userType !== "doctor" && req.user.userType !== "admin") {
        return res.status(403).json({ error: "No autorizado para crear expedientes clínicos" });
      }
      
      const validatedData = insertMedicalRecordSchema.parse(req.body);
      
      // Asegurar que el médico actual sea quien crea el expediente
      if (req.user.userType === "doctor" && validatedData.doctorId !== req.user.id) {
        return res.status(403).json({ error: "Solo puede crear expedientes para usted mismo" });
      }
      
      const medicalRecord = await storage.createMedicalRecord(validatedData);
      res.status(201).json(medicalRecord);
    } catch (error) {
      console.error("Error al crear expediente clínico:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Obtener expedientes de un paciente
  app.get("/api/patients/:patientId/medical-records", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ error: "ID de paciente inválido" });
      }
      
      // Verificar permisos: 
      // - El paciente solo puede ver sus propios expedientes
      // - Los médicos pueden ver expedientes de sus pacientes
      // - Admins pueden ver todos los expedientes
      if (req.user.userType === "patient" && req.user.id !== patientId) {
        return res.status(403).json({ error: "No autorizado para ver expedientes de otros pacientes" });
      }
      
      // Para médicos, verificar que el paciente tenga citas con este médico
      if (req.user.userType === "doctor") {
        const appointments = await storage.getAppointmentsByDoctorAndPatient(req.user.id, patientId);
        if (appointments.length === 0) {
          return res.status(403).json({ error: "No autorizado para ver expedientes de este paciente" });
        }
      }
      
      const medicalRecords = await storage.getMedicalRecordsByPatientId(patientId);
      res.json(medicalRecords);
    } catch (error) {
      console.error("Error al obtener expedientes clínicos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Obtener un expediente médico específico
  app.get("/api/medical-records/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) {
        return res.status(400).json({ error: "ID de expediente inválido" });
      }
      
      const medicalRecord = await storage.getMedicalRecord(recordId);
      if (!medicalRecord) {
        return res.status(404).json({ error: "Expediente no encontrado" });
      }
      
      // Verificar permisos
      if (req.user.userType === "patient" && req.user.id !== medicalRecord.patientId) {
        return res.status(403).json({ error: "No autorizado para ver este expediente" });
      }
      
      if (req.user.userType === "doctor" && req.user.id !== medicalRecord.doctorId) {
        // Verificar si el médico ha atendido al paciente
        const appointments = await storage.getAppointmentsByDoctorAndPatient(req.user.id, medicalRecord.patientId);
        if (appointments.length === 0) {
          return res.status(403).json({ error: "No autorizado para ver este expediente" });
        }
      }
      
      res.json(medicalRecord);
    } catch (error) {
      console.error("Error al obtener expediente clínico:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Actualizar un expediente médico
  app.put("/api/medical-records/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) {
        return res.status(400).json({ error: "ID de expediente inválido" });
      }
      
      const medicalRecord = await storage.getMedicalRecord(recordId);
      if (!medicalRecord) {
        return res.status(404).json({ error: "Expediente no encontrado" });
      }
      
      // Solo el médico que creó el expediente o un admin puede actualizarlo
      if (req.user.userType === "doctor" && req.user.id !== medicalRecord.doctorId) {
        return res.status(403).json({ error: "No autorizado para modificar este expediente" });
      }
      
      if (req.user.userType === "patient") {
        return res.status(403).json({ error: "Los pacientes no pueden modificar expedientes" });
      }
      
      const updatedMedicalRecord = await storage.updateMedicalRecord(recordId, req.body);
      res.json(updatedMedicalRecord);
    } catch (error) {
      console.error("Error al actualizar expediente clínico:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Subir documentos al expediente clínico
  app.post("/api/medical-records/:recordId/documents", medicalDocumentUpload.single('file'), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No se ha subido ningún archivo" });
      }
      
      const recordId = parseInt(req.params.recordId);
      if (isNaN(recordId)) {
        return res.status(400).json({ error: "ID de expediente inválido" });
      }
      
      const medicalRecord = await storage.getMedicalRecord(recordId);
      if (!medicalRecord) {
        return res.status(404).json({ error: "Expediente no encontrado" });
      }
      
      // Verificar permisos
      if (req.user.userType === "doctor" && req.user.id !== medicalRecord.doctorId) {
        return res.status(403).json({ error: "No autorizado para subir documentos a este expediente" });
      }
      
      if (req.user.userType === "patient" && req.user.id !== medicalRecord.patientId) {
        return res.status(403).json({ error: "No autorizado para subir documentos a este expediente" });
      }
      
      // Crear documento para el expediente
      const fileUrl = `/uploads/medical_documents/${req.file.filename}`;
      
      const documentData = {
        patientId: medicalRecord.patientId,
        medicalRecordId: recordId,
        doctorId: req.user.userType === "doctor" ? req.user.id : medicalRecord.doctorId,
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        documentType: req.body.documentType || "clinical_note",
        category: req.body.category || "",
        isConfidential: req.body.isConfidential === "true",
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        uploadedBy: req.user.id
      };
      
      const document = await storage.createPatientDocument(documentData);
      
      res.status(201).json({
        success: true,
        document
      });
    } catch (error) {
      console.error("Error al subir documento:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Obtener documentos de un expediente médico
  app.get("/api/medical-records/:recordId/documents", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const recordId = parseInt(req.params.recordId);
      if (isNaN(recordId)) {
        return res.status(400).json({ error: "ID de expediente inválido" });
      }
      
      const medicalRecord = await storage.getMedicalRecord(recordId);
      if (!medicalRecord) {
        return res.status(404).json({ error: "Expediente no encontrado" });
      }
      
      // Verificar permisos
      if (req.user.userType === "patient" && req.user.id !== medicalRecord.patientId) {
        return res.status(403).json({ error: "No autorizado para ver documentos de este expediente" });
      }
      
      if (req.user.userType === "doctor" && req.user.id !== medicalRecord.doctorId) {
        // Verificar si el médico ha atendido al paciente
        const appointments = await storage.getAppointmentsByDoctorAndPatient(req.user.id, medicalRecord.patientId);
        if (appointments.length === 0) {
          return res.status(403).json({ error: "No autorizado para ver documentos de este expediente" });
        }
      }
      
      const documents = await storage.getPatientDocumentsByMedicalRecordId(recordId);
      
      // Filtrar documentos confidenciales si es necesario
      const filteredDocuments = documents.filter(doc => {
        if (!doc.isConfidential) return true;
        if (req.user.userType === "admin") return true;
        if (req.user.userType === "doctor" && (doc.doctorId === req.user.id || doc.uploadedBy === req.user.id)) return true;
        return false;
      });
      
      res.json(filteredDocuments);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Obtener todos los documentos de un paciente
  app.get("/api/patients/:patientId/documents", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ error: "ID de paciente inválido" });
      }
      
      // Verificar permisos
      if (req.user.userType === "patient" && req.user.id !== patientId) {
        return res.status(403).json({ error: "No autorizado para ver documentos de otro paciente" });
      }
      
      if (req.user.userType === "doctor") {
        // Verificar si el médico ha atendido al paciente
        const appointments = await storage.getAppointmentsByDoctorAndPatient(req.user.id, patientId);
        if (appointments.length === 0) {
          return res.status(403).json({ error: "No autorizado para ver documentos de este paciente" });
        }
      }
      
      const documents = await storage.getPatientDocumentsByPatientId(patientId);
      
      // Filtrar documentos confidenciales si es necesario
      const filteredDocuments = documents.filter(doc => {
        if (!doc.isConfidential) return true;
        if (req.user.userType === "admin") return true;
        if (req.user.userType === "doctor" && (doc.doctorId === req.user.id || doc.uploadedBy === req.user.id)) return true;
        return false;
      });
      
      res.json(filteredDocuments);
    } catch (error) {
      console.error("Error al obtener documentos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server for chat
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Aumentar el intervalo de heartbeat para mantener conexiones activas
    // especialmente importante cuando se trabaja con subdominios
    clientTracking: true,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // Ver https://nodejs.org/api/zlib.html#zlib_class_options
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Otros opciones para optimizar el rendimiento
      serverNoContextTakeover: true,
      clientNoContextTakeover: true,
      serverMaxWindowBits: 10,
      concurrencyLimit: 10,
      threshold: 1024 // Tamaño mínimo para comprimir
    }
  });
  
  console.log('Servidor WebSocket configurado en la ruta /ws');
  
  // Store active connections
  const clients = new Map();

  wss.on('connection', (ws) => {
    const clientId = nanoid();
    console.log(`New WebSocket connection: ${clientId}`);
    
    // Store additional connection metadata
    let userId = null;
    let userType = null;
    
    ws.on('message', async (messageData) => {
      try {
        const message = JSON.parse(messageData.toString());
        
        // Handle authentication
        if (message.type === 'authenticate') {
          userId = message.payload.userId;
          userType = message.payload.userType;
          clients.set(clientId, { ws, userId, userType });
          console.log(`Client ${clientId} authenticated as user ${userId} (${userType})`);
          
          // Send confirmation
          ws.send(JSON.stringify({ 
            type: 'auth_success', 
            message: 'Autenticación exitosa' 
          }));
          
          return;
        }
        
        // Require authentication for all other message types
        if (!userId) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'No autenticado. Por favor autentíquese primero.' 
          }));
          return;
        }
        
        // Handle different message types
        switch (message.type) {
          case 'message': {
            // Store message in database
            const { conversationId, content, messageType = 'text', fileUrl, fileName, fileSize } = message;
            
            // Validate the user is part of the conversation
            const conversation = await storage.getChatConversation(conversationId);
            if (!conversation || (conversation.doctorId !== userId && conversation.patientId !== userId)) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'No tienes acceso a esta conversación' 
              }));
              return;
            }
            
            // Determine the recipient ID
            const recipientId = conversation.doctorId === userId ? conversation.patientId : conversation.doctorId;
            
            // Save the message to database
            const newMessage = await storage.createChatMessage({
              conversationId,
              senderId: userId,
              content,
              messageType,
              fileUrl,
              fileName,
              fileSize
            });
            
            // Update conversation's last message timestamp
            await storage.updateChatConversation(conversationId, { 
              lastMessageAt: new Date(),
              updatedAt: new Date()
            });
            
            // Create notification for recipient
            await storage.createChatNotification({
              userId: recipientId,
              messageId: newMessage.id
            });
            
            // Broadcast message to recipient if online
            for (const [_, client] of clients.entries()) {
              if (client.userId === recipientId && client.ws.readyState === 1) { // WebSocket.OPEN
                client.ws.send(JSON.stringify({
                  type: 'new_message',
                  message: {
                    ...newMessage,
                    senderName: (await storage.getUser(userId))?.firstName + ' ' + (await storage.getUser(userId))?.lastName
                  }
                }));
                
                // Mark the message as delivered
                await storage.updateChatMessage(newMessage.id, { isDelivered: true });
              }
            }
            
            // Confirm message reception to sender
            ws.send(JSON.stringify({
              type: 'message_sent',
              message: newMessage
            }));
            break;
          }
          
          case 'read_message': {
            // Mark message as read
            const { messageId } = message;
            const chatMessage = await storage.getChatMessage(messageId);
            
            if (!chatMessage) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Mensaje no encontrado' 
              }));
              return;
            }
            
            // Validate the user is the recipient
            const conversation = await storage.getChatConversation(chatMessage.conversationId);
            if (!conversation || (conversation.doctorId !== userId && conversation.patientId !== userId)) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'No tienes acceso a este mensaje' 
              }));
              return;
            }
            
            // Only mark as read if current user is the recipient (not the sender)
            if (chatMessage.senderId !== userId) {
              await storage.updateChatMessage(messageId, { isRead: true });
              
              // Update notification
              await storage.markChatNotificationAsRead(messageId, userId);
              
              // Notify the sender that the message was read
              for (const [_, client] of clients.entries()) {
                if (client.userId === chatMessage.senderId && client.ws.readyState === 1) { // WebSocket.OPEN
                  client.ws.send(JSON.stringify({
                    type: 'message_read',
                    messageId
                  }));
                }
              }
            }
            break;
          }
          
          case 'get_conversations': {
            // Fetch conversations for the current user
            let conversations;
            
            if (userType === 'patient') {
              conversations = await storage.getChatConversationsByPatient(userId);
            } else if (userType === 'doctor') {
              conversations = await storage.getChatConversationsByDoctor(userId);
            } else {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'Tipo de usuario no válido' 
              }));
              return;
            }
            
            // Enhance conversations with user info
            const enhancedConversations = await Promise.all(conversations.map(async (conv) => {
              const otherUserId = conv.doctorId === userId ? conv.patientId : conv.doctorId;
              const otherUser = await storage.getUser(otherUserId);
              
              // Get unread count for this conversation
              const unreadCount = await storage.getUnreadMessagesCount(conv.id, userId);
              
              return {
                ...conv,
                otherUser: otherUser ? {
                  id: otherUser.id,
                  name: `${otherUser.firstName} ${otherUser.lastName}`,
                  userType: otherUser.userType,
                  profileImage: otherUser.profileImage
                } : null,
                unreadCount
              };
            }));
            
            ws.send(JSON.stringify({
              type: 'conversations',
              conversations: enhancedConversations
            }));
            break;
          }
          
          case 'get_messages': {
            // Fetch messages for a conversation
            const { conversationId, limit = 50, before } = message;
            
            // Validate the user is part of the conversation
            const conversation = await storage.getChatConversation(conversationId);
            if (!conversation || (conversation.doctorId !== userId && conversation.patientId !== userId)) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'No tienes acceso a esta conversación' 
              }));
              return;
            }
            
            const messages = await storage.getChatMessagesByConversation(conversationId, limit, before);
            
            // Mark messages as read if the current user is the recipient
            const messagesToMark = messages.filter(msg => msg.senderId !== userId && !msg.isRead);
            
            if (messagesToMark.length > 0) {
              await Promise.all(messagesToMark.map(async (msg) => {
                await storage.updateChatMessage(msg.id, { isRead: true });
                await storage.markChatNotificationAsRead(msg.id, userId);
                
                // Notify senders that messages were read
                for (const [_, client] of clients.entries()) {
                  if (client.userId === msg.senderId && client.ws.readyState === 1) { // WebSocket.OPEN
                    client.ws.send(JSON.stringify({
                      type: 'message_read',
                      messageId: msg.id
                    }));
                  }
                }
              }));
            }
            
            // Enhance messages with sender info
            const enhancedMessages = await Promise.all(messages.map(async (msg) => {
              const sender = await storage.getUser(msg.senderId);
              return {
                ...msg,
                senderName: sender ? `${sender.firstName} ${sender.lastName}` : "Usuario Desconocido",
                senderType: sender?.userType,
                senderProfileImage: sender?.profileImage
              };
            }));
            
            ws.send(JSON.stringify({
              type: 'messages',
              conversationId,
              messages: enhancedMessages
            }));
            break;
          }
          
          case 'create_conversation': {
            // Create a new conversation between a doctor and a patient
            const { doctorId, patientId } = message;
            
            // Validate user types
            const doctor = await storage.getUser(doctorId);
            const patient = await storage.getUser(patientId);
            
            if (!doctor || doctor.userType !== 'doctor' || !patient || patient.userType !== 'patient') {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'IDs de usuario inválidos' 
              }));
              return;
            }
            
            // Verificar que ha habido una consulta previa entre el doctor y el paciente
            const appointments = await storage.getAppointmentsBetweenUsers(doctorId, patientId, "completed");
            
            if (!appointments || appointments.length === 0) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'No se puede iniciar un chat sin una consulta previa completada' 
              }));
              return;
            }
            
            // Check if the current user is either the doctor or the patient
            if (userId !== doctorId && userId !== patientId) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: 'No tienes permiso para crear esta conversación' 
              }));
              return;
            }
            
            // Check if a conversation already exists
            const existingConversation = await storage.getChatConversationByUsers(doctorId, patientId);
            
            if (existingConversation) {
              ws.send(JSON.stringify({
                type: 'conversation_created',
                conversation: existingConversation
              }));
              return;
            }
            
            // Create new conversation
            const newConversation = await storage.createChatConversation({
              doctorId,
              patientId
            });
            
            ws.send(JSON.stringify({
              type: 'conversation_created',
              conversation: newConversation
            }));
            break;
          }
          
          default:
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: `Tipo de mensaje desconocido: ${message.type}` 
            }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Error al procesar el mensaje: ' + error.message 
        }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log(`WebSocket connection closed: ${clientId}`);
      clients.delete(clientId);
    });
    
    // Send initial message
    ws.send(JSON.stringify({ 
      type: 'welcome', 
      message: 'Conexión establecida con el servidor de chat. Por favor autentíquese.' 
    }));
  });
  
  // APIs públicas para especialidades y perfil de médicos
  // GET /api/specialties - Obtener todas las especialidades
  app.get("/api/specialties", async (req, res) => {
    try {
      const specialties = await storage.getAllSpecialties();
      res.json(specialties);
    } catch (error) {
      console.error("Error al obtener especialidades:", error);
      res.status(500).json({ message: "Error al obtener especialidades" });
    }
  });

  // GET /api/specialties/:id - Obtener una especialidad específica
  app.get("/api/specialties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de especialidad inválido" });
      }
      
      const specialty = await storage.getSpecialty(id);
      if (!specialty) {
        return res.status(404).json({ message: "Especialidad no encontrada" });
      }
      
      res.json(specialty);
    } catch (error) {
      console.error("Error al obtener especialidad:", error);
      res.status(500).json({ message: "Error al obtener especialidad" });
    }
  });

  // GET /api/specialties/:id/doctors - Obtener médicos por especialidad
  app.get("/api/specialties/:id/doctors", async (req, res) => {
    try {
      const specialtyId = parseInt(req.params.id);
      if (isNaN(specialtyId)) {
        return res.status(400).json({ message: "ID de especialidad inválido" });
      }
      
      // Obtener médicos verificados por especialidad
      const doctors = await storage.getDoctorsBySpecialty(specialtyId);
      res.json(doctors);
    } catch (error) {
      console.error("Error al obtener médicos por especialidad:", error);
      res.status(500).json({ message: "Error al obtener médicos por especialidad" });
    }
  });

  // GET /api/public/doctors/:id - Obtener perfil público de un médico
  app.get("/api/public/doctors/:id", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: "ID de médico inválido" });
      }
      
      const doctorProfile = await storage.getDoctorProfile(doctorId);
      if (!doctorProfile) {
        return res.status(404).json({ message: "Perfil de médico no encontrado" });
      }
      
      // Verificamos si el médico está aprobado para ser mostrado públicamente
      if (doctorProfile.verificationStatus !== "approved") {
        return res.status(403).json({ message: "Este perfil no está disponible públicamente" });
      }
      
      res.json(doctorProfile);
    } catch (error) {
      console.error("Error al obtener perfil de médico:", error);
      res.status(500).json({ message: "Error al obtener perfil de médico" });
    }
  });
  
  // API para búsqueda de usuarios para chat
  app.get("/api/users/search", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const query = req.query.query as string;
      const userType = req.query.userType as string;
      
      if (!query || !userType) {
        return res.status(400).json({ 
          message: "Faltan parámetros", 
          results: [] 
        });
      }
      
      // Validar que el tipo de usuario sea válido
      if (userType !== 'doctor' && userType !== 'patient') {
        return res.status(400).json({ 
          message: "Tipo de usuario inválido", 
          results: [] 
        });
      }
      
      // Realizar la búsqueda
      const users = await storage.getUsersByType(userType);
      
      // Filtrar por nombre
      const filteredUsers = users.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query.toLowerCase())
      );
      
      // Limitar a máximo 10 resultados
      const results = filteredUsers.slice(0, 10).map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        userType: user.userType,
        profileImage: user.profileImage
      }));
      
      res.json({ results });
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      res.status(500).json({ 
        message: "Error al buscar usuarios", 
        results: [] 
      });
    }
  });
  
  // API para subir archivos para el chat
  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        // Crear directorio si no existe
        const uploadDir = path.join(process.cwd(), 'uploads', 'chat');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    }
  });
  
  app.post("/api/chat/:conversationId/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const conversationId = parseInt(req.params.conversationId);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "ID de conversación inválido" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No se recibió ningún archivo" });
      }
      
      // Verificar que el usuario tiene acceso a la conversación
      const conversation = await storage.getChatConversation(conversationId);
      if (!conversation || (conversation.doctorId !== req.user.id && conversation.patientId !== req.user.id)) {
        return res.status(403).json({ message: "No tienes acceso a esta conversación" });
      }
      
      // Construir URL del archivo
      const fileUrl = `/uploads/chat/${req.file.filename}`;
      
      res.json({
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      });
    } catch (error) {
      console.error("Error al subir archivo:", error);
      res.status(500).json({ message: "Error al subir archivo" });
    }
  });
  
  // === APIs PARA RED SOCIAL MÉDICA ===
  
  // API para obtener los contactos de un usuario
  app.get("/api/contacts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const contacts = await storage.getUserContacts(req.user.id);
      
      // Obtenemos los datos de usuario para cada contacto
      const contactDetails = [];
      for (const contact of contacts) {
        const user = await storage.getUser(contact.contactId);
        if (user) {
          contactDetails.push({
            contactId: contact.id,
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            profileImage: user.profileImage,
            userType: user.userType,
            status: contact.status,
            sharedMedicalInfo: contact.sharedMedicalInfo
          });
        }
      }
      
      res.json(contactDetails);
    } catch (error) {
      console.error("Error al obtener contactos:", error);
      res.status(500).json({ message: "Error al obtener contactos" });
    }
  });
  
  // API para obtener solicitudes de contacto pendientes
  app.get("/api/contacts/requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const requests = await storage.getContactRequests(req.user.id);
      
      // Obtenemos los datos de usuario para cada solicitud
      const requestDetails = [];
      for (const request of requests) {
        const user = await storage.getUser(request.userId);
        if (user) {
          requestDetails.push({
            requestId: request.id,
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            profileImage: user.profileImage,
            userType: user.userType
          });
        }
      }
      
      res.json(requestDetails);
    } catch (error) {
      console.error("Error al obtener solicitudes de contacto:", error);
      res.status(500).json({ message: "Error al obtener solicitudes de contacto" });
    }
  });
  
  // API para enviar solicitud de contacto
  app.post("/api/contacts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const { contactId } = req.body;
      
      if (!contactId) {
        return res.status(400).json({ message: "ID de contacto es requerido" });
      }
      
      // Verificar que el contacto existe
      const contact = await storage.getUser(contactId);
      if (!contact) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Verificar que no existe ya una solicitud o relación
      const existingContacts = await storage.getUserContacts(req.user.id);
      const alreadyConnected = existingContacts.some(c => c.contactId === contactId);
      
      if (alreadyConnected) {
        return res.status(400).json({ message: "Ya existe una relación con este usuario" });
      }
      
      // Crear solicitud de contacto
      const newContact = await storage.createUserContact({
        userId: req.user.id,
        contactId: contactId,
        status: "pending",
        source: "manual",
        sharedMedicalInfo: false
      });
      
      // Crear notificación para el contacto
      await storage.createSocialNotification({
        userId: contactId,
        type: "contact_request",
        referenceId: newContact.id,
        message: `${req.user.firstName} ${req.user.lastName} quiere conectar contigo.`
      });
      
      res.status(201).json({ message: "Solicitud de contacto enviada", contact: newContact });
    } catch (error) {
      console.error("Error al enviar solicitud de contacto:", error);
      res.status(500).json({ message: "Error al enviar solicitud de contacto" });
    }
  });
  
  // API para responder a una solicitud de contacto
  app.put("/api/contacts/:id/respond", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const contactId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(contactId) || !status) {
        return res.status(400).json({ message: "Parámetros inválidos" });
      }
      
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Estado no válido" });
      }
      
      // Verificar que la solicitud existe y es para este usuario
      const contactRequest = await storage.getUserContacts(req.user.id);
      const request = contactRequest.find(r => r.id === contactId && r.contactId === req.user.id);
      
      if (!request) {
        return res.status(404).json({ message: "Solicitud no encontrada" });
      }
      
      // Actualizar estado de la solicitud
      const updatedRequest = await storage.updateUserContactStatus(contactId, status);
      
      // Si fue aceptada, crear relación bidireccional
      if (status === "accepted") {
        // Verificar si ya existe una relación inversa
        const existingReverse = contactRequest.find(r => r.userId === request.contactId && r.contactId === request.userId);
        
        if (!existingReverse) {
          // Crear relación inversa
          await storage.createUserContact({
            userId: request.contactId,
            contactId: request.userId,
            status: "accepted",
            source: "manual",
            sharedMedicalInfo: false
          });
        } else if (existingReverse.status !== "accepted") {
          // Actualizar relación inversa existente
          await storage.updateUserContactStatus(existingReverse.id, "accepted");
        }
        
        // Crear notificación para el remitente original
        const user = await storage.getUser(request.userId);
        await storage.createSocialNotification({
          userId: request.userId,
          type: "contact_request",
          referenceId: contactId,
          message: `${req.user.firstName} ${req.user.lastName} ha aceptado tu solicitud de contacto.`
        });
      }
      
      res.json({ message: `Solicitud ${status === "accepted" ? "aceptada" : "rechazada"}`, contact: updatedRequest });
    } catch (error) {
      console.error("Error al responder solicitud de contacto:", error);
      res.status(500).json({ message: "Error al responder solicitud de contacto" });
    }
  });

  // API para ver notificaciones sociales
  app.get("/api/social/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const notifications = await storage.getUserSocialNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      res.status(500).json({ message: "Error al obtener notificaciones" });
    }
  });

  // API para marcar notificación como leída
  app.put("/api/social/notifications/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "ID de notificación inválido" });
      }
      
      const notification = await storage.markSocialNotificationAsRead(notificationId);
      res.json(notification);
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      res.status(500).json({ message: "Error al marcar notificación como leída" });
    }
  });

  // APIs para Recomendaciones de Médicos
  
  // API para recomendar un médico a un contacto
  app.post("/api/recommendations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const { toUserId, doctorId, isAnonymous, message } = req.body;
      
      if (!toUserId || !doctorId) {
        return res.status(400).json({ message: "Faltan parámetros requeridos" });
      }
      
      // Verificar que el destinatario existe y es un contacto
      const contactList = await storage.getUserContacts(req.user.id);
      const isContact = contactList.some(c => c.contactId === toUserId && c.status === "accepted");
      
      if (!isContact) {
        return res.status(403).json({ message: "Solo puedes recomendar médicos a tus contactos" });
      }
      
      // Verificar que el médico existe
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.userType !== "doctor") {
        return res.status(404).json({ message: "Médico no encontrado" });
      }
      
      // Verificar si el médico tiene perfil de doctor y está verificado
      const doctorProfile = await storage.getDoctorProfileByUserId(doctorId);
      if (!doctorProfile || doctorProfile.verificationStatus !== "approved") {
        return res.status(403).json({ message: "Solo puedes recomendar médicos verificados" });
      }
      
      // Crear recomendación
      const recommendation = await storage.createDoctorRecommendation({
        fromUserId: req.user.id,
        toUserId,
        doctorId,
        isAnonymous: !!isAnonymous,
        message: message || null
      });
      
      // Crear notificación
      const fromText = isAnonymous ? "Un contacto" : `${req.user.firstName} ${req.user.lastName}`;
      await storage.createSocialNotification({
        userId: toUserId,
        type: "recommendation",
        referenceId: recommendation.id,
        message: `${fromText} te ha recomendado a ${doctor.firstName} ${doctor.lastName}`
      });
      
      res.status(201).json({
        message: "Recomendación enviada con éxito",
        recommendation
      });
    } catch (error) {
      console.error("Error al crear recomendación:", error);
      res.status(500).json({ message: "Error al crear recomendación" });
    }
  });
  
  // API para obtener recomendaciones recibidas
  app.get("/api/recommendations/received", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const recommendations = await storage.getDoctorRecommendations(req.user.id);
      
      // Obtener información detallada
      const detailedRecommendations = [];
      for (const rec of recommendations) {
        const doctor = await storage.getUser(rec.doctorId);
        const fromUser = rec.isAnonymous ? null : await storage.getUser(rec.fromUserId);
        const doctorProfile = await storage.getDoctorProfileByUserId(rec.doctorId);
        
        if (doctor && doctorProfile) {
          const specialtyId = doctorProfile.specialtyId;
          const specialty = specialtyId ? await storage.getSpecialty(specialtyId) : null;
          
          detailedRecommendations.push({
            id: rec.id,
            doctor: {
              id: doctor.id,
              name: `${doctor.firstName} ${doctor.lastName}`,
              profileImage: doctor.profileImage,
              specialty: specialty ? specialty.name : "No especificada"
            },
            from: rec.isAnonymous ? { anonymous: true } : {
              id: fromUser.id,
              name: `${fromUser.firstName} ${fromUser.lastName}`,
              profileImage: fromUser.profileImage
            },
            message: rec.message,
            date: rec.createdAt,
            isRead: rec.isRead
          });
        }
      }
      
      res.json(detailedRecommendations);
    } catch (error) {
      console.error("Error al obtener recomendaciones:", error);
      res.status(500).json({ message: "Error al obtener recomendaciones" });
    }
  });
  
  // API para marcar recomendación como leída
  app.put("/api/recommendations/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const recommendationId = parseInt(req.params.id);
      if (isNaN(recommendationId)) {
        return res.status(400).json({ message: "ID de recomendación inválido" });
      }
      
      const recommendation = await storage.markRecommendationAsRead(recommendationId);
      res.json(recommendation);
    } catch (error) {
      console.error("Error al marcar recomendación como leída:", error);
      res.status(500).json({ message: "Error al marcar recomendación como leída" });
    }
  });
  
  // APIs para Reseñas de Médicos
  
  // API para obtener reseñas de un médico
  app.get("/api/doctors/:doctorId/reviews", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: "ID de médico inválido" });
      }
      
      // Verificar que el doctor existe
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.userType !== "doctor") {
        return res.status(404).json({ message: "Médico no encontrado" });
      }
      
      // Obtener las reseñas visibles
      const reviews = await storage.getDoctorReviews(doctorId);
      
      // Obtener información detallada
      const reviewsDetailed = [];
      for (const review of reviews) {
        // Solo incluir reseñas visibles
        if (review.isVisible) {
          const patient = await storage.getUser(review.patientId);
          if (patient) {
            reviewsDetailed.push({
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              date: review.createdAt,
              isAnonymous: review.isAnonymous,
              isVerified: review.hasAppointmentVerified,
              patient: review.isAnonymous ? 
                { anonymous: true } : 
                {
                  id: patient.id,
                  name: `${patient.firstName} ${patient.lastName}`,
                  profileImage: patient.profileImage
                }
            });
          }
        }
      }
      
      // Calcular puntuación promedio
      let averageRating = 0;
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = totalRating / reviews.length;
      }
      
      res.json({
        reviews: reviewsDetailed,
        averageRating,
        totalReviews: reviewsDetailed.length
      });
    } catch (error) {
      console.error("Error al obtener reseñas:", error);
      res.status(500).json({ message: "Error al obtener reseñas" });
    }
  });
  
  // API para crear una reseña
  app.post("/api/doctors/:doctorId/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: "ID de médico inválido" });
      }
      
      const { rating, comment, isAnonymous } = req.body;
      
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Calificación inválida" });
      }
      
      // Verificar que el doctor existe
      const doctor = await storage.getUser(doctorId);
      if (!doctor || doctor.userType !== "doctor") {
        return res.status(404).json({ message: "Médico no encontrado" });
      }
      
      // Verificar si el paciente ha tenido una cita con el doctor
      const appointments = await storage.getAppointmentsByPatient(req.user.id);
      const hadAppointment = appointments.some(a => a.doctorId === doctorId && a.status === "completed");
      
      // Verificar si ya existe una reseña de este paciente para este doctor
      const existingReviews = await storage.getReviewsByPatient(req.user.id);
      const alreadyReviewed = existingReviews.some(r => r.doctorId === doctorId);
      
      if (alreadyReviewed) {
        return res.status(400).json({ message: "Ya has dejado una reseña para este médico" });
      }
      
      // Crear la reseña
      const review = await storage.createDoctorReview({
        doctorId,
        patientId: req.user.id,
        rating,
        comment: comment || null,
        isAnonymous: !!isAnonymous,
        hasAppointmentVerified: hadAppointment,
        isVisible: true
      });
      
      // Crear notificación para el doctor
      await storage.createSocialNotification({
        userId: doctorId,
        type: "review",
        referenceId: review.id,
        message: `Has recibido una nueva reseña de ${isAnonymous ? "un paciente anónimo" : `${req.user.firstName} ${req.user.lastName}`}`
      });
      
      res.status(201).json({
        message: "Reseña publicada con éxito",
        review
      });
    } catch (error) {
      console.error("Error al crear reseña:", error);
      res.status(500).json({ message: "Error al crear reseña" });
    }
  });
  
  // API para eliminar/ocultar una reseña propia
  app.put("/api/reviews/:id/visibility", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const reviewId = parseInt(req.params.id);
      const { isVisible } = req.body;
      
      if (isNaN(reviewId) || typeof isVisible !== "boolean") {
        return res.status(400).json({ message: "Parámetros inválidos" });
      }
      
      // Obtener reseñas del usuario
      const userReviews = await storage.getReviewsByPatient(req.user.id);
      const review = userReviews.find(r => r.id === reviewId);
      
      if (!review) {
        return res.status(403).json({ message: "No puedes modificar esta reseña" });
      }
      
      // Actualizar visibilidad
      const updatedReview = await storage.updateDoctorReviewVisibility(reviewId, isVisible);
      
      res.json({
        message: isVisible ? "Reseña hecha visible" : "Reseña oculta",
        review: updatedReview
      });
    } catch (error) {
      console.error("Error al actualizar visibilidad de reseña:", error);
      res.status(500).json({ message: "Error al actualizar visibilidad de reseña" });
    }
  });
  
  // API para obtener las reseñas hechas por un paciente
  app.get("/api/patient/reviews", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      if (req.user.userType !== "patient") {
        return res.status(403).json({ message: "Acceso denegado" });
      }
      
      const reviews = await storage.getReviewsByPatient(req.user.id);
      
      // Obtener detalles del doctor para cada reseña
      const reviewsWithDetails = [];
      for (const review of reviews) {
        const doctor = await storage.getUser(review.doctorId);
        const doctorProfile = await storage.getDoctorProfileByUserId(review.doctorId);
        
        if (doctor && doctorProfile) {
          const specialty = await storage.getSpecialty(doctorProfile.specialtyId);
          
          reviewsWithDetails.push({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            date: review.createdAt,
            isAnonymous: review.isAnonymous,
            isVisible: review.isVisible,
            doctor: {
              id: doctor.id,
              name: `${doctor.firstName} ${doctor.lastName}`,
              profileImage: doctor.profileImage,
              specialty: specialty ? specialty.name : "No especificada"
            }
          });
        }
      }
      
      res.json(reviewsWithDetails);
    } catch (error) {
      console.error("Error al obtener reseñas del paciente:", error);
      res.status(500).json({ message: "Error al obtener reseñas del paciente" });
    }
  });
  
  // APIs para Importación de Contactos
  
  // API para crear una importación de contactos
  app.post("/api/contacts/import", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const { source, contactsData } = req.body;
      
      if (!source || !contactsData || !Array.isArray(contactsData)) {
        return res.status(400).json({ message: "Datos de importación inválidos" });
      }
      
      // Validar la fuente
      const validSources = ["email", "phone", "social_media"];
      if (!validSources.includes(source)) {
        return res.status(400).json({ message: "Fuente de importación inválida" });
      }
      
      // Crear registro de importación
      const contactImport = await storage.createContactImport({
        userId: req.user.id,
        source,
        importData: contactsData,
        status: "pending",
        processedContacts: 0,
        totalContacts: contactsData.length
      });
      
      // Procesar los contactos en segundo plano (inicio del proceso)
      // En un caso real, aquí se iniciaría un proceso en segundo plano
      // Por simplicidad, iniciamos el procesamiento inmediatamente
      
      // Actualizar estado a "processing"
      await storage.updateContactImportStatus(contactImport.id, "processing", 0);
      
      // Procesar contactos para encontrar coincidencias en la base de datos
      let processedCount = 0;
      const matchedUsers = [];
      
      for (const contact of contactsData) {
        // Buscar coincidencia según el tipo de fuente
        let matchedUser = null;
        
        if (source === "email" && contact.email) {
          matchedUser = await storage.getUserByEmail(contact.email);
        } else if (source === "phone" && contact.phone) {
          // Por simplificación y para evitar errores, omitimos la búsqueda por teléfono
          // En una implementación completa, esto requeriría una consulta directa SQL 
          // o un método específico en el DatabaseStorage
          matchedUser = null;
        }
        
        if (matchedUser && matchedUser.id !== req.user.id) {
          // Verificar si ya existe una relación
          const existingContacts = await storage.getUserContacts(req.user.id);
          const alreadyConnected = existingContacts.some(c => c.contactId === matchedUser.id);
          
          if (!alreadyConnected) {
            // Crear solicitud de contacto
            const newContact = await storage.createUserContact({
              userId: req.user.id,
              contactId: matchedUser.id,
              status: "pending",
              source: source,
              sharedMedicalInfo: false
            });
            
            // Crear notificación para el contacto
            await storage.createSocialNotification({
              userId: matchedUser.id,
              type: "contact_request",
              referenceId: newContact.id,
              message: `${req.user.firstName} ${req.user.lastName} te ha encontrado a través de ${source === "email" ? "correo electrónico" : source === "phone" ? "teléfono" : "redes sociales"} y quiere conectar contigo.`
            });
            
            matchedUsers.push({
              id: matchedUser.id,
              name: `${matchedUser.firstName} ${matchedUser.lastName}`,
              userType: matchedUser.userType,
              status: "pending"
            });
          }
        }
        
        processedCount++;
        // Actualizar progreso periódicamente (cada 10 contactos por ejemplo)
        if (processedCount % 10 === 0) {
          await storage.updateContactImportStatus(contactImport.id, "processing", processedCount);
        }
      }
      
      // Actualizar estado a "completed" una vez finalizado
      await storage.updateContactImportStatus(contactImport.id, "completed", processedCount);
      
      res.status(201).json({
        message: "Importación de contactos creada",
        import: contactImport,
        matchedUsers
      });
    } catch (error) {
      console.error("Error al importar contactos:", error);
      res.status(500).json({ message: "Error al importar contactos" });
    }
  });
  
  // API para obtener historial de importaciones
  app.get("/api/contacts/import/history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const imports = await storage.getContactImports(req.user.id);
      res.json(imports);
    } catch (error) {
      console.error("Error al obtener historial de importaciones:", error);
      res.status(500).json({ message: "Error al obtener historial de importaciones" });
    }
  });
  
  // Verificación de secretos (para verificar disponibilidad de API keys)
  app.post("/api/check-secrets", (req, res) => {
    const { secretKeys } = req.body;
    
    if (!Array.isArray(secretKeys) || secretKeys.length === 0) {
      return res.status(400).json({ error: "Se requiere un array de claves de secreto" });
    }
    
    // Verificar si todos los secretos existen
    const allExist = secretKeys.every(key => !!process.env[key]);
    
    res.json({ exists: allExist });
  });
  
  // Diagnóstico asistido por IA
  app.post("/api/ai/diagnosis", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "No autorizado" });
      }
      
      // Verificar si el usuario es un médico
      const user = req.user;
      if (user.userType !== "doctor") {
        return res.status(403).json({ error: "Solo los médicos pueden acceder a esta funcionalidad" });
      }
      
      // Verificar si la API key de OpenAI está configurada
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "API key de OpenAI no configurada" });
      }
      
      const { symptoms, patientHistory, vitals, patientInfo } = req.body;
      
      if (!symptoms || !patientHistory) {
        return res.status(400).json({ error: "Se requieren síntomas y antecedentes del paciente" });
      }
      
      // Importar OpenAI
      const OpenAI = require("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Construir el prompt para OpenAI
      let prompt = `Como médico especializado, proporciona un diagnóstico médico basado en la siguiente información:
      
Síntomas: ${symptoms}

Historia clínica: ${patientHistory}`;

      if (vitals) {
        prompt += `\n\nSignos vitales: ${vitals}`;
      }
      
      if (patientInfo) {
        prompt += "\n\nInformación del paciente:";
        if (patientInfo.age) prompt += `\n- Edad: ${patientInfo.age} años`;
        if (patientInfo.gender) prompt += `\n- Género: ${patientInfo.gender}`;
        if (patientInfo.bloodType) prompt += `\n- Tipo de sangre: ${patientInfo.bloodType}`;
        if (patientInfo.allergies) prompt += `\n- Alergias: ${patientInfo.allergies}`;
        if (patientInfo.chronicConditions) prompt += `\n- Condiciones crónicas: ${patientInfo.chronicConditions}`;
      }
      
      prompt += `\n\nProporciona tu diagnóstico en el siguiente formato JSON estructurado:
{
  "possibleDiagnoses": [
    {
      "name": "Nombre del diagnóstico",
      "confidence": 0.95, // Número entre 0 y 1
      "icdCode": "Código ICD-10 opcional"
    }
  ],
  "treatmentSuggestions": ["Sugerencia de tratamiento 1", "Sugerencia de tratamiento 2"],
  "differentialDiagnosis": ["Diagnóstico diferencial 1", "Diagnóstico diferencial 2"],
  "reasoningProcess": "Explicación detallada de tu razonamiento clínico, limitado a 500 palabras",
  "medicalDisclaimer": "Declaración de limitación de responsabilidad médica",
  "referencesUsed": ["Referencias médicas utilizadas (opcional)"]
}

IMPORTANTE: Tu diagnóstico debe seguir estrictamente las normas COFEPRIS 2025 sobre diagnósticos médicos asistidos por IA. Incluye siempre un proceso de razonamiento clínico sólido.`;

      // Llamar a la API de OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "system", content: "Eres un médico especializado que proporciona diagnósticos para asistir a médicos humanos siguiendo estrictamente las normas COFEPRIS 2025." }, 
                   { role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      
      // Procesar la respuesta
      const aiResponse = JSON.parse(response.choices[0].message.content);
      
      // Registrar el uso del servicio de IA (para propósitos de auditoría y facturación)
      console.log(`AI Diagnosis used by doctor ID: ${user.id}, timestamp: ${new Date().toISOString()}`);
      
      // Devolver la respuesta
      res.json(aiResponse);
      
    } catch (error) {
      console.error("Error en diagnóstico IA:", error);
      res.status(500).json({ error: "Error al generar el diagnóstico" });
    }
  });

  // ===== MÓDULO DE LABORATORIO =====
  
  // API para obtener el catálogo de estudios de laboratorio
  app.get("/api/lab-tests", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const tests = await storage.getLabTests(category);
      return res.json(tests);
    } catch (error) {
      console.error("Error al obtener catálogo de laboratorio:", error);
      return res.status(500).json({ error: "Error al obtener catálogo de laboratorio" });
    }
  });
  
  // API para obtener un estudio específico
  app.get("/api/lab-tests/:id", async (req, res) => {
    try {
      const testId = parseInt(req.params.id);
      const test = await storage.getLabTestById(testId);
      
      if (!test) {
        return res.status(404).json({ error: "Estudio no encontrado" });
      }
      
      return res.json(test);
    } catch (error) {
      console.error("Error al obtener estudio:", error);
      return res.status(500).json({ error: "Error al obtener estudio" });
    }
  });
  
  // API para obtener laboratorios disponibles
  app.get("/api/laboratories", async (req, res) => {
    try {
      const isActive = req.query.isActive === "true";
      const laboratories = await storage.getLaboratories(isActive);
      return res.json(laboratories);
    } catch (error) {
      console.error("Error al obtener laboratorios:", error);
      return res.status(500).json({ error: "Error al obtener laboratorios" });
    }
  });
  
  // API para crear una solicitud de estudios de laboratorio
  app.post("/api/lab-commissions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autorizado" });
    }
    
    try {
      const { patientId, doctorId, laboratoryId, testIds, urgency, notes } = req.body;
      
      // Validar que los IDs sean válidos
      if (!patientId || !doctorId || !laboratoryId || !testIds || testIds.length === 0) {
        return res.status(400).json({ error: "Datos incompletos o inválidos" });
      }
      
      // Crear la comisión de laboratorio
      const commission = await storage.createLabCommission({
        patientId,
        doctorId,
        laboratoryId,
        urgency: urgency || "normal",
        notes,
        testIds,
        status: "pending",
        amount: 0, // Se calcula después
      });
      
      return res.status(201).json(commission);
    } catch (error) {
      console.error("Error al crear solicitud de laboratorio:", error);
      return res.status(500).json({ error: "Error al crear solicitud de laboratorio" });
    }
  });
  
  // API para obtener solicitudes de laboratorio por paciente
  app.get("/api/patients/:id/lab-commissions", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      
      // Si es un médico o el propio paciente
      const isDoctor = req.user?.userType === "doctor";
      const isPatient = req.user?.id === patientId && req.user?.userType === "patient";
      const isAdmin = req.user?.userType === "admin";
      
      if (!isDoctor && !isPatient && !isAdmin) {
        return res.status(403).json({ error: "No tiene permiso para ver esta información" });
      }
      
      const commissions = await storage.getLabCommissionsByPatient(patientId);
      return res.json(commissions);
    } catch (error) {
      console.error("Error al obtener solicitudes de laboratorio:", error);
      return res.status(500).json({ error: "Error al obtener solicitudes de laboratorio" });
    }
  });
  
  // API para subir resultados de laboratorio
  app.post("/api/lab-results", async (req, res) => {
    try {
      const { commissionId, resultStatus, technician, comments, fileUrl } = req.body;
      
      // Validar datos
      if (!commissionId || !resultStatus || !technician || !fileUrl) {
        return res.status(400).json({ error: "Datos incompletos" });
      }
      
      // Crear el resultado
      const result = await storage.createLabTestResult({
        commissionId,
        resultStatus,
        resultFileUrl: fileUrl,
        technician,
        comments,
      });
      
      // Actualizar el estado de la comisión a completada
      await storage.updateLabCommissionStatus(commissionId, "completed");
      
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error al crear resultado de laboratorio:", error);
      return res.status(500).json({ error: "Error al crear resultado de laboratorio" });
    }
  });
  
  // API para que el médico revise un resultado
  app.patch("/api/lab-results/:id/review", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.userType !== "doctor") {
      return res.status(403).json({ error: "Solo médicos pueden revisar resultados" });
    }
    
    try {
      const resultId = parseInt(req.params.id);
      const { reviewedByDoctorId, doctorComments } = req.body;
      
      if (reviewedByDoctorId !== req.user.id) {
        return res.status(403).json({ error: "Solo el médico asignado puede revisar estos resultados" });
      }
      
      const updatedResult = await storage.updateLabTestResultReview(resultId, {
        reviewedByDoctorId,
        doctorComments,
        reviewDate: new Date(),
        isRead: true,
      });
      
      return res.json(updatedResult);
    } catch (error) {
      console.error("Error al actualizar revisión de resultados:", error);
      return res.status(500).json({ error: "Error al actualizar revisión de resultados" });
    }
  });
  
  // API para subir archivos de resultados de laboratorio
  app.post("/api/upload/lab-result", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se ha proporcionado ningún archivo" });
      }
      
      // Obtener la URL del archivo
      const fileUrl = `/uploads/${req.file.filename}`;
      
      return res.status(201).json({ fileUrl });
    } catch (error) {
      console.error("Error al subir archivo de resultados:", error);
      return res.status(500).json({ error: "Error al subir archivo de resultados" });
    }
  });

  // Solo añadir la configuración para servir estáticos en producción
  if (process.env.NODE_ENV === 'production') {
    // Servir archivos estáticos desde la carpeta dist
    const clientPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../dist");
    app.use(express.static(clientPath));
    
    // Agregar un handler para todas las rutas que caen al cliente (SPA)
    // Esto es importante para que las rutas del cliente funcionen con recarga directa
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientPath, "index.html"));
    });
  }

  return httpServer;
}
