import { 
  users, User, InsertUser,
  specialties, Specialty, InsertSpecialty,
  doctorProfiles, DoctorProfile, InsertDoctorProfile,
  patientProfiles, PatientProfile, InsertPatientProfile,
  appointments, Appointment, InsertAppointment,
  doctorSchedule, DoctorSchedule, InsertDoctorSchedule,
  doctorUnavailability, DoctorUnavailability, InsertDoctorUnavailability,
  recurringAppointments, RecurringAppointment, InsertRecurringAppointment,
  appointmentFollowUps, AppointmentFollowUp, InsertAppointmentFollowUp,
  medicalRecords, MedicalRecord, InsertMedicalRecord,
  patientDocuments, PatientDocument, InsertPatientDocument,
  laboratories, Laboratory, InsertLaboratory,
  labTestCatalog, LabTestCatalog, InsertLabTestCatalog,
  labCommissions, LabCommission, InsertLabCommission,
  subscriptionPlans, SubscriptionPlan, InsertSubscriptionPlan,
  userSubscriptions, UserSubscription, InsertUserSubscription,
  prescriptions, Prescription, InsertPrescription,
  medicationCatalog, MedicationCatalog, InsertMedicationCatalog,
  labTestResults, LabTestResult, InsertLabTestResult,
  healthMetrics, HealthMetric, InsertHealthMetric,
  doctorVerificationDocuments, DoctorVerificationDocument, InsertDoctorVerificationDocument,
  doctorVerificationHistory, DoctorVerificationHistory, InsertDoctorVerificationHistory,
  chatConversations, ChatConversation, InsertChatConversation,
  chatMessages, ChatMessage, InsertChatMessage,
  chatNotifications, ChatNotification, InsertChatNotification,
  // Red social médica
  userContacts, UserContact, InsertUserContact,
  doctorRecommendations, DoctorRecommendation, InsertDoctorRecommendation,
  doctorReviews, DoctorReview, InsertDoctorReview,
  contactImports, ContactImport, InsertContactImport,
  socialNotifications, SocialNotification, InsertSocialNotification,
  UserType
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, SQL, inArray, desc } from "drizzle-orm";
import pg from "pg";
import session from "express-session";
import connectPg from "connect-pg-simple";
import postgres from "postgres";

// Database connection for session store
const connectionString = process.env.DATABASE_URL!;

// Usar un objecto de configuración básico para pg
const pgConfig = {
  // connectionString,
    host: 'ep-ancient-brook-a6zhun0x.us-west-2.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_PYrkFJnM62Da',
  database: 'neondb',
  ssl: { rejectUnauthorized: false },
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false

};
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any; // session.Store

  constructor() {
    // Initialize session store with PostgreSQL
    this.sessionStore = new PostgresSessionStore({
      conObject: pgConfig,
      createTableIfMissing: true
    });
    
    // Seed initial data if needed
    this.seedInitialData();
  }

  private async seedInitialData() {
    // Check if we need to seed specialties
    const existingSpecialties = await db.select().from(specialties);
    if (existingSpecialties.length === 0) {
      await this.seedSpecialties();
    }
    
    // Check if we need to seed laboratories
    const existingLaboratories = await db.select().from(laboratories);
    if (existingLaboratories.length === 0) {
      await this.seedLaboratories();
    }
    
    // Check if we need to seed lab tests
    const existingLabTests = await db.select().from(labTestCatalog);
    if (existingLabTests.length === 0) {
      await this.seedLabTests();
    }
    
    // Check if we need to seed medication catalog
    const existingMedications = await db.select().from(medicationCatalog);
    if (existingMedications.length === 0) {
      await this.seedMedicationCatalog();
    }
  }

  private async seedSpecialties() {
    const specialtiesData = [
      { name: "Cardiología", description: "Especialistas en el corazón y sistema circulatorio" },
      { name: "Dermatología", description: "Especialistas en la piel" },
      { name: "Neurología", description: "Especialistas en el sistema nervioso" },
      { name: "Pediatría", description: "Especialistas en la salud de los niños" },
      { name: "Psiquiatría", description: "Especialistas en salud mental" },
      { name: "Oftalmología", description: "Especialistas en la visión y los ojos" },
      { name: "Medicina General", description: "Atención médica general" }
    ];
    
    for (const specialty of specialtiesData) {
      await db.insert(specialties).values(specialty);
    }
  }
  
  private async seedLaboratories() {
    const laboratoriesData = [
      { name: "Laboratorio Clínico Nacional", address: "Av. Principal 123", contactInfo: "contacto@labclinico.com", isActive: true },
      { name: "Diagnósticos Médicos", address: "Calle Central 456", contactInfo: "info@diagmed.com", isActive: true },
      { name: "Centro de Análisis Médicos", address: "Plaza Mayor 789", contactInfo: "centro@analisismedicos.com", isActive: true }
    ];
    
    for (const laboratory of laboratoriesData) {
      await db.insert(laboratories).values(laboratory);
    }
  }
  
  private async seedLabTests() {
    const labTestsData = [
      {
        name: "Biometría Hemática Completa",
        category: "laboratorio",
        description: "Análisis de células sanguíneas",
        normalValues: "Varía según el parámetro",
        units: "Varios",
        preparationInstructions: "Ayuno de 8 horas",
        cofeprisApproved: true,
        isActive: true
      },
      {
        name: "Química Sanguínea",
        category: "laboratorio",
        description: "Evaluación de glucosa, colesterol, triglicéridos y más",
        normalValues: "Varía según el parámetro",
        units: "mg/dL",
        preparationInstructions: "Ayuno de 12 horas",
        cofeprisApproved: true,
        isActive: true
      },
      {
        name: "Perfil Tiroideo",
        category: "laboratorio",
        description: "Análisis de hormonas tiroideas",
        normalValues: "T3: 80-200 ng/dL, T4: 5.0-12.0 µg/dL, TSH: 0.3-5.0 µU/mL",
        units: "Varios",
        preparationInstructions: "No requiere ayuno",
        cofeprisApproved: true,
        isActive: true
      },
      {
        name: "Perfil Hepático",
        category: "laboratorio",
        description: "Evaluación de la función del hígado",
        normalValues: "Varía según el parámetro",
        units: "U/L, mg/dL",
        preparationInstructions: "Ayuno de 8 horas",
        cofeprisApproved: true,
        isActive: true
      },
      {
        name: "Perfil Renal",
        category: "laboratorio",
        description: "Evaluación de la función renal",
        normalValues: "Creatinina: 0.7-1.3 mg/dL, Urea: 15-45 mg/dL",
        units: "mg/dL",
        preparationInstructions: "Ayuno de 8 horas",
        cofeprisApproved: true,
        isActive: true
      },
      {
        name: "Radiografía de Tórax",
        category: "imagen",
        description: "Imagen de los pulmones, corazón y costillas",
        normalValues: "Interpretación médica",
        units: "N/A",
        preparationInstructions: "Remover objetos metálicos",
        cofeprisApproved: true,
        isActive: true
      },
      {
        name: "Tomografía Computarizada",
        category: "imagen",
        description: "Imagen detallada de órganos internos",
        normalValues: "Interpretación médica",
        units: "N/A",
        preparationInstructions: "Varía según la zona a examinar",
        cofeprisApproved: true,
        isActive: true
      },
      {
        name: "Ultrasonido Abdominal",
        category: "imagen",
        description: "Imagen de órganos abdominales",
        normalValues: "Interpretación médica",
        units: "N/A",
        preparationInstructions: "Ayuno de 6 horas",
        cofeprisApproved: true,
        isActive: true
      },
      {
        name: "Resonancia Magnética",
        category: "imagen",
        description: "Imagen detallada de tejidos blandos",
        normalValues: "Interpretación médica",
        units: "N/A",
        preparationInstructions: "Remover objetos metálicos",
        cofeprisApproved: true,
        isActive: true
      }
    ];
    
    for (const test of labTestsData) {
      await db.insert(labTestCatalog).values(test);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Usar método seguro para comparación insensible a mayúsculas
    username = username.toLowerCase();
    const allUsers = await db.select().from(users);
    const foundUser = allUsers.find(user => user.username.toLowerCase() === username);
    return foundUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Usar método seguro para comparación insensible a mayúsculas
    email = email.toLowerCase();
    const allUsers = await db.select().from(users);
    const foundUser = allUsers.find(user => user.email.toLowerCase() === email);
    return foundUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Aseguramos que userType tenga un valor válido antes de insertarlo
    const userTypeValue = insertUser.userType as any;
    
    // Realizamos la inserción con gestión de tipos segura
    const result = await db.insert(users).values({
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      userType: userTypeValue,
      profileImage: insertUser.profileImage || null,
      isActive: true
    }).returning();
    
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getUsersByType(userType: string): Promise<User[]> {
    // Comprobar si es un valor válido de user type
    const validUserTypes = ["patient", "doctor", "admin"];
    if (validUserTypes.includes(userType)) {
      return await db.select().from(users)
        .where(and(
          eq(users.userType as any, userType as any),
          eq(users.isActive, true)
        ));
    }
    return [];
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }
  
  async getSpecialty(id: number): Promise<Specialty | undefined> {
    const result = await db.select().from(specialties).where(eq(specialties.id, id));
    return result[0];
  }
  
  async getSpecialtyByName(name: string): Promise<Specialty | undefined> {
    const result = await db.select().from(specialties).where(eq(specialties.name, name));
    return result[0];
  }
  
  async getAllSpecialties(): Promise<Specialty[]> {
    return await db.select().from(specialties);
  }
  
  async createSpecialty(insertSpecialty: InsertSpecialty): Promise<Specialty> {
    const result = await db.insert(specialties).values(insertSpecialty).returning();
    return result[0];
  }
  
  async updateSpecialty(id: number, specialtyData: Partial<Specialty>): Promise<Specialty | undefined> {
    const result = await db
      .update(specialties)
      .set(specialtyData)
      .where(eq(specialties.id, id))
      .returning();
    return result[0];
  }
  
  async deleteSpecialty(id: number): Promise<void> {
    await db.delete(specialties).where(eq(specialties.id, id));
  }
  
  async getDoctorsBySpecialty(specialtyId: number): Promise<any[]> {
    // Primero obtener los perfiles de doctores con esta especialidad
    const profiles = await db
      .select()
      .from(doctorProfiles)
      .where(eq(doctorProfiles.specialtyId, specialtyId));
    
    if (profiles.length === 0) {
      return [];
    }
    
    // Luego obtener la información de usuarios correspondiente
    const userIds = profiles.map(profile => profile.userId);
    
    const doctors = await db
      .select()
      .from(users)
      .where(inArray(users.id, userIds));
    
    // Obtener la especialidad
    const specialty = await this.getSpecialty(specialtyId);
    
    // Combinar la información
    const doctorsWithProfiles = doctors.map(doctor => {
      const profile = profiles.find(p => p.userId === doctor.id);
      return {
        ...doctor,
        profile,
        specialtyName: specialty ? specialty.name : null
      };
    });
    
    return doctorsWithProfiles;
  }
  
  async getDoctorProfile(id: number): Promise<DoctorProfile | undefined> {
    const result = await db.select().from(doctorProfiles).where(eq(doctorProfiles.id, id));
    return result[0];
  }
  
  async getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined> {
    const result = await db.select().from(doctorProfiles).where(eq(doctorProfiles.userId, userId));
    return result[0];
  }
  
  async getAllDoctorProfiles(): Promise<DoctorProfile[]> {
    return await db.select().from(doctorProfiles);
  }
  
  async createDoctorProfile(insertProfile: InsertDoctorProfile): Promise<DoctorProfile> {
    const result = await db.insert(doctorProfiles).values(insertProfile).returning();
    return result[0];
  }
  
  async updateDoctorProfile(id: number, profileData: Partial<DoctorProfile>): Promise<DoctorProfile | undefined> {
    const result = await db.update(doctorProfiles)
      .set(profileData)
      .where(eq(doctorProfiles.id, id))
      .returning();
    return result[0];
  }
  
  async getPatientProfile(id: number): Promise<PatientProfile | undefined> {
    const result = await db.select().from(patientProfiles).where(eq(patientProfiles.id, id));
    return result[0];
  }
  
  async getPatientProfileByUserId(userId: number): Promise<PatientProfile | undefined> {
    const result = await db.select().from(patientProfiles).where(eq(patientProfiles.userId, userId));
    return result[0];
  }
  
  async createPatientProfile(insertProfile: InsertPatientProfile): Promise<PatientProfile> {
    const result = await db.insert(patientProfiles).values(insertProfile).returning();
    return result[0];
  }
  
  async updatePatientProfile(id: number, profileData: Partial<PatientProfile>): Promise<PatientProfile | undefined> {
    const result = await db.update(patientProfiles)
      .set(profileData)
      .where(eq(patientProfiles.id, id))
      .returning();
    return result[0];
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }
  
  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.doctorId, doctorId));
  }
  
  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.patientId, patientId));
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointmentData = {
      ...insertAppointment,
      status: "scheduled"
    };
    const result = await db.insert(appointments).values(appointmentData).returning();
    return result[0];
  }
  
  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const result = await db.update(appointments)
      .set(appointmentData)
      .where(eq(appointments.id, id))
      .returning();
    return result[0];
  }
  
  // Doctor Schedule methods
  async getDoctorSchedule(id: number): Promise<DoctorSchedule | undefined> {
    const result = await db.select().from(doctorSchedule).where(eq(doctorSchedule.id, id));
    return result[0];
  }
  
  async getDoctorScheduleByDoctor(doctorId: number): Promise<DoctorSchedule[]> {
    return await db.select().from(doctorSchedule).where(eq(doctorSchedule.doctorId, doctorId));
  }
  
  async createDoctorSchedule(insertSchedule: InsertDoctorSchedule): Promise<DoctorSchedule> {
    const result = await db.insert(doctorSchedule).values(insertSchedule).returning();
    return result[0];
  }
  
  async updateDoctorSchedule(id: number, scheduleData: Partial<DoctorSchedule>): Promise<DoctorSchedule | undefined> {
    const result = await db.update(doctorSchedule)
      .set(scheduleData)
      .where(eq(doctorSchedule.id, id))
      .returning();
    return result[0];
  }
  
  async deleteDoctorSchedule(id: number): Promise<void> {
    await db.delete(doctorSchedule).where(eq(doctorSchedule.id, id));
  }
  
  // Doctor Unavailability methods
  async getDoctorUnavailability(id: number): Promise<DoctorUnavailability | undefined> {
    const result = await db.select().from(doctorUnavailability).where(eq(doctorUnavailability.id, id));
    return result[0];
  }
  
  async getDoctorUnavailabilityByDoctor(doctorId: number): Promise<DoctorUnavailability[]> {
    return await db.select().from(doctorUnavailability).where(eq(doctorUnavailability.doctorId, doctorId));
  }
  
  async createDoctorUnavailability(insertUnavailability: InsertDoctorUnavailability): Promise<DoctorUnavailability> {
    const result = await db.insert(doctorUnavailability).values(insertUnavailability).returning();
    return result[0];
  }
  
  async updateDoctorUnavailability(id: number, unavailabilityData: Partial<DoctorUnavailability>): Promise<DoctorUnavailability | undefined> {
    const result = await db.update(doctorUnavailability)
      .set(unavailabilityData)
      .where(eq(doctorUnavailability.id, id))
      .returning();
    return result[0];
  }
  
  async deleteDoctorUnavailability(id: number): Promise<void> {
    await db.delete(doctorUnavailability).where(eq(doctorUnavailability.id, id));
  }
  
  // Recurring appointments methods
  async getRecurringAppointment(id: number): Promise<RecurringAppointment | undefined> {
    const result = await db.select().from(recurringAppointments).where(eq(recurringAppointments.id, id));
    return result[0];
  }
  
  async getRecurringAppointmentsByDoctor(doctorId: number): Promise<RecurringAppointment[]> {
    return await db.select().from(recurringAppointments).where(eq(recurringAppointments.doctorId, doctorId));
  }
  
  async getRecurringAppointmentsByPatient(patientId: number): Promise<RecurringAppointment[]> {
    return await db.select().from(recurringAppointments).where(eq(recurringAppointments.patientId, patientId));
  }
  
  async createRecurringAppointment(insertRecurring: InsertRecurringAppointment): Promise<RecurringAppointment> {
    const result = await db.insert(recurringAppointments).values(insertRecurring).returning();
    return result[0];
  }
  
  async updateRecurringAppointment(id: number, recurringData: Partial<RecurringAppointment>): Promise<RecurringAppointment | undefined> {
    const result = await db.update(recurringAppointments)
      .set(recurringData)
      .where(eq(recurringAppointments.id, id))
      .returning();
    return result[0];
  }
  
  // Appointment follow-ups methods
  async getAppointmentFollowUp(id: number): Promise<AppointmentFollowUp | undefined> {
    const result = await db.select().from(appointmentFollowUps).where(eq(appointmentFollowUps.id, id));
    return result[0];
  }
  
  async getAppointmentFollowUpsByAppointment(appointmentId: number): Promise<AppointmentFollowUp[]> {
    return await db.select().from(appointmentFollowUps).where(eq(appointmentFollowUps.appointmentId, appointmentId));
  }
  
  async createAppointmentFollowUp(insertFollowUp: InsertAppointmentFollowUp): Promise<AppointmentFollowUp> {
    const result = await db.insert(appointmentFollowUps).values(insertFollowUp).returning();
    return result[0];
  }
  
  async updateAppointmentFollowUp(id: number, followUpData: Partial<AppointmentFollowUp>): Promise<AppointmentFollowUp | undefined> {
    const result = await db.update(appointmentFollowUps)
      .set(followUpData)
      .where(eq(appointmentFollowUps.id, id))
      .returning();
    return result[0];
  }
  
  // Métodos especializados para el sistema de agendamiento
  async getAvailableSlots(doctorId: number, date: Date): Promise<any[]> {
    // 1. Obtener el horario del doctor para el día de la semana
    const dayOfWeek = date.getDay(); // 0-6
    const schedules = await this.getDoctorScheduleByDoctor(doctorId);
    const daySchedule = schedules.find(s => s.dayOfWeek === dayOfWeek);
    
    if (!daySchedule || !daySchedule.isAvailable) {
      return [];
    }
    
    // 2. Obtener indisponibilidades específicas
    const unavailabilities = await this.getDoctorUnavailabilityByDoctor(doctorId);
    const dateUnavailabilities = unavailabilities.filter(u => {
      const startDate = new Date(u.startDateTime);
      const endDate = new Date(u.endDateTime);
      return (
        startDate.toDateString() === date.toDateString() || 
        endDate.toDateString() === date.toDateString() ||
        (startDate < date && endDate > date)
      );
    });
    
    if (dateUnavailabilities.length > 0 && dateUnavailabilities.some(u => {
      const startDate = new Date(u.startDateTime);
      const endDate = new Date(u.endDateTime);
      return startDate.getHours() === 0 && endDate.getHours() === 23; // Todo el día
    })) {
      return []; // El doctor no está disponible todo el día
    }
    
    // 3. Obtener citas existentes para ese día
    const existingAppointments = await this.getAppointmentsByDoctor(doctorId);
    const dateAppointments = existingAppointments.filter(a => {
      const appDate = new Date(a.dateTime);
      return appDate.toDateString() === date.toDateString();
    });
    
    // 4. Generar slots disponibles
    const startTime = new Date(date);
    const endTime = new Date(date);
    
    // Configurar las horas según el horario del médico
    const [startHour, startMinute] = daySchedule.startTime.toString().split(':').map(Number);
    const [endHour, endMinute] = daySchedule.endTime.toString().split(':').map(Number);
    
    startTime.setHours(startHour, startMinute, 0, 0);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const slotDuration = daySchedule.slotDuration; // minutos
    const slots = [];
    
    let currentSlot = new Date(startTime);
    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(currentSlot.getMinutes() + slotDuration);
      
      // Verificar si el slot está disponible
      const isInUnavailability = dateUnavailabilities.some(u => {
        const uStart = new Date(u.startDateTime);
        const uEnd = new Date(u.endDateTime);
        return (currentSlot >= uStart && currentSlot < uEnd) ||
               (slotEnd > uStart && slotEnd <= uEnd) ||
               (currentSlot <= uStart && slotEnd >= uEnd);
      });
      
      const isInExistingAppointment = dateAppointments.some(a => {
        const aStart = new Date(a.dateTime);
        const aEnd = new Date(a.endTime);
        return (currentSlot >= aStart && currentSlot < aEnd) ||
               (slotEnd > aStart && slotEnd <= aEnd) ||
               (currentSlot <= aStart && slotEnd >= aEnd);
      });
      
      if (!isInUnavailability && !isInExistingAppointment) {
        slots.push({
          start: new Date(currentSlot),
          end: new Date(slotEnd),
        });
      }
      
      // Avanzar al siguiente slot
      currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
    }
    
    return slots;
  }
  
  async scheduleAppointment(appointmentData: InsertAppointment, isFollowUp: boolean = false): Promise<Appointment> {
    // Crear la cita
    const appointment = await this.createAppointment(appointmentData);
    
    // Si es una cita de seguimiento, actualizar el follow-up relacionado
    if (isFollowUp && appointmentData.recurringId) {
      const followUps = await this.getAppointmentFollowUpsByAppointment(appointmentData.recurringId);
      if (followUps.length > 0) {
        const followUp = followUps[0];
        await this.updateAppointmentFollowUp(followUp.id, {
          status: "scheduled",
          followUpAppointmentId: appointment.id
        });
      }
    }
    
    return appointment;
  }
  
  async getUpcomingAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    const now = new Date();
    const allAppointments = await this.getAppointmentsByDoctor(doctorId);
    return allAppointments.filter(a => {
      const appointmentDate = new Date(a.dateTime);
      return appointmentDate > now && a.status !== "cancelled";
    }).sort((a, b) => {
      const dateA = new Date(a.dateTime);
      const dateB = new Date(b.dateTime);
      return dateA.getTime() - dateB.getTime();
    });
  }
  
  async getUpcomingAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    const now = new Date();
    const allAppointments = await this.getAppointmentsByPatient(patientId);
    return allAppointments.filter(a => {
      const appointmentDate = new Date(a.dateTime);
      return appointmentDate > now && a.status !== "cancelled";
    }).sort((a, b) => {
      const dateA = new Date(a.dateTime);
      const dateB = new Date(b.dateTime);
      return dateA.getTime() - dateB.getTime();
    });
  }
  
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    const result = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return result[0];
  }
  
  async getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return await db.select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(desc(medicalRecords.createdAt));
  }
  
  async getMedicalRecordsByPatientId(patientId: number): Promise<MedicalRecord[]> {
    return await db.select()
      .from(medicalRecords)
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(desc(medicalRecords.createdAt));
  }
  
  async getMedicalRecordsByDoctor(doctorId: number): Promise<MedicalRecord[]> {
    return await db.select()
      .from(medicalRecords)
      .where(eq(medicalRecords.doctorId, doctorId))
      .orderBy(desc(medicalRecords.createdAt));
  }
  
  async getAppointmentsByDoctorAndPatient(doctorId: number, patientId: number): Promise<Appointment[]> {
    return await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.patientId, patientId)
        )
      );
  }
  
  async getAppointmentsBetweenUsers(doctorId: number, patientId: number, status?: string): Promise<Appointment[]> {
    let query = db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.patientId, patientId)
        )
      );
    
    // Si se proporciona un status, filtrar por él
    if (status) {
      query = query.where(eq(appointments.status, status));
    }
    
    return await query;
  }
  
  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const result = await db.insert(medicalRecords).values({
      ...insertRecord,
      updatedAt: new Date()
    }).returning();
    return result[0];
  }
  
  async updateMedicalRecord(id: number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord | undefined> {
    const result = await db.update(medicalRecords)
      .set({
        ...recordData,
        updatedAt: new Date()
      })
      .where(eq(medicalRecords.id, id))
      .returning();
    return result[0];
  }
  
  async getPatientDocument(id: number): Promise<PatientDocument | undefined> {
    const result = await db.select().from(patientDocuments).where(eq(patientDocuments.id, id));
    return result[0];
  }
  
  async getPatientDocumentsByPatient(patientId: number): Promise<PatientDocument[]> {
    return await db.select()
      .from(patientDocuments)
      .where(eq(patientDocuments.patientId, patientId))
      .orderBy(desc(patientDocuments.uploadedAt));
  }
  
  async getPatientDocumentsByPatientId(patientId: number): Promise<PatientDocument[]> {
    return await db.select()
      .from(patientDocuments)
      .where(eq(patientDocuments.patientId, patientId))
      .orderBy(desc(patientDocuments.uploadedAt));
  }
  
  async getPatientDocumentsByMedicalRecordId(medicalRecordId: number): Promise<PatientDocument[]> {
    return await db.select()
      .from(patientDocuments)
      .where(eq(patientDocuments.medicalRecordId, medicalRecordId))
      .orderBy(desc(patientDocuments.uploadedAt));
  }
  
  async createPatientDocument(insertDocument: InsertPatientDocument): Promise<PatientDocument> {
    const result = await db.insert(patientDocuments).values({
      ...insertDocument,
      modifiedAt: new Date()
    }).returning();
    return result[0];
  }
  
  async updatePatientDocument(id: number, documentData: Partial<PatientDocument>): Promise<PatientDocument | undefined> {
    const result = await db.update(patientDocuments)
      .set({
        ...documentData,
        modifiedAt: new Date()
      })
      .where(eq(patientDocuments.id, id))
      .returning();
    return result[0];
  }
  
  async getLaboratory(id: number): Promise<Laboratory | undefined> {
    const result = await db.select().from(laboratories).where(eq(laboratories.id, id));
    return result[0];
  }
  
  async getAllLaboratories(): Promise<Laboratory[]> {
    return await db.select().from(laboratories);
  }
  
  async createLaboratory(insertLaboratory: InsertLaboratory): Promise<Laboratory> {
    const laboratoryData = {
      ...insertLaboratory,
      isActive: true
    };
    const result = await db.insert(laboratories).values(laboratoryData).returning();
    return result[0];
  }
  
  async updateLaboratory(id: number, laboratoryData: Partial<Laboratory>): Promise<Laboratory | undefined> {
    const result = await db.update(laboratories)
      .set(laboratoryData)
      .where(eq(laboratories.id, id))
      .returning();
    return result[0];
  }
  
  // Lab Test Catalog methods
  async getLabTest(id: number): Promise<LabTestCatalog | undefined> {
    const result = await db.select().from(labTestCatalog).where(eq(labTestCatalog.id, id));
    return result[0];
  }
  
  async getLabTestByName(name: string): Promise<LabTestCatalog | undefined> {
    const result = await db.select().from(labTestCatalog).where(eq(labTestCatalog.name, name));
    return result[0];
  }
  
  async getAllLabTests(): Promise<LabTestCatalog[]> {
    return await db.select().from(labTestCatalog).where(eq(labTestCatalog.isActive, true));
  }
  
  async getLabTestsByCategory(category: string): Promise<LabTestCatalog[]> {
    const validCategories = ["laboratorio", "imagen"];
    if (!validCategories.includes(category)) {
      return [];
    }
    
    return await db.select()
      .from(labTestCatalog)
      .where(
        and(
          eq(labTestCatalog.category as any, category as any),
          eq(labTestCatalog.isActive, true)
        )
      );
  }
  
  async createLabTest(test: InsertLabTestCatalog): Promise<LabTestCatalog> {
    const testData = {
      ...test,
      isActive: true,
      description: test.description || null,
      normalValues: test.normalValues || null,
      units: test.units || null,
      preparationInstructions: test.preparationInstructions || null,
      cofeprisApproved: test.cofeprisApproved || false
    };
    
    const result = await db.insert(labTestCatalog).values(testData).returning();
    return result[0];
  }
  
  async updateLabTest(id: number, testData: Partial<LabTestCatalog>): Promise<LabTestCatalog | undefined> {
    const result = await db.update(labTestCatalog)
      .set(testData)
      .where(eq(labTestCatalog.id, id))
      .returning();
    return result[0];
  }
  
  async getLabCommission(id: number): Promise<LabCommission | undefined> {
    const result = await db.select().from(labCommissions).where(eq(labCommissions.id, id));
    return result[0];
  }
  
  async getLabCommissionsByDoctor(doctorId: number): Promise<LabCommission[]> {
    return await db.select().from(labCommissions).where(eq(labCommissions.doctorId, doctorId));
  }
  
  async createLabCommission(insertCommission: InsertLabCommission): Promise<LabCommission> {
    // Creamos un objeto con solo los campos de inserción necesarios
    // y nos aseguramos de que sean del tipo correcto
    const commissionData = {
      patientId: insertCommission.patientId,
      doctorId: insertCommission.doctorId,
      laboratoryId: insertCommission.laboratoryId,
      amount: insertCommission.amount,
      status: "pending" as const,
      serviceName: insertCommission.serviceName || null,
      testType: insertCommission.testType || null,
      description: insertCommission.description || null,
      notes: insertCommission.notes || null,
      urgency: (insertCommission.urgency || "normal") as "normal" | "urgent" | "immediate"
    };
    
    const result = await db.insert(labCommissions).values(commissionData).returning();
    return result[0];
  }
  
  async updateLabCommissionStatus(id: number, status: "pending" | "completed" | "cancelled"): Promise<LabCommission | undefined> {
    const result = await db.update(labCommissions)
      .set({ status })
      .where(eq(labCommissions.id, id))
      .returning();
    return result[0];
  }

  // Subscription Plan methods
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return result[0];
  }
  
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans);
  }
  
  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true));
  }
  
  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const planData = {
      ...plan,
      isActive: true
    };
    const result = await db.insert(subscriptionPlans).values(planData).returning();
    return result[0];
  }
  
  async updateSubscriptionPlan(id: number, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const result = await db.update(subscriptionPlans)
      .set(plan)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return result[0];
  }
  
  // User Subscription methods
  async getUserSubscription(id: number): Promise<UserSubscription | undefined> {
    const result = await db.select().from(userSubscriptions).where(eq(userSubscriptions.id, id));
    return result[0];
  }
  
  async getUserSubscriptionByUserId(userId: number): Promise<UserSubscription | undefined> {
    const result = await db.select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active")
        )
      );
    return result[0];
  }
  
  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const subscriptionData = {
      ...subscription,
      status: "active"
    };
    const result = await db.insert(userSubscriptions).values(subscriptionData).returning();
    return result[0];
  }
  
  async updateUserSubscription(id: number, subscription: Partial<UserSubscription>): Promise<UserSubscription | undefined> {
    const result = await db.update(userSubscriptions)
      .set(subscription)
      .where(eq(userSubscriptions.id, id))
      .returning();
    return result[0];
  }
  
  async cancelUserSubscription(id: number): Promise<UserSubscription | undefined> {
    const result = await db.update(userSubscriptions)
      .set({ 
        status: "cancelled",
        autoRenew: false
      })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return result[0];
  }

  // Prescription methods
  async getPrescription(id: number): Promise<Prescription | undefined> {
    const result = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    return result[0];
  }
  
  async getPrescriptionsByDoctor(doctorId: number): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(eq(prescriptions.doctorId, doctorId));
  }
  
  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId));
  }
  
  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const result = await db.insert(prescriptions).values(insertPrescription).returning();
    return result[0];
  }
  
  async updatePrescription(id: number, prescriptionData: Partial<Prescription>): Promise<Prescription | undefined> {
    const result = await db
      .update(prescriptions)
      .set(prescriptionData)
      .where(eq(prescriptions.id, id))
      .returning();
    return result[0];
  }
  
  // Medication Catalog methods
  async getMedication(id: number): Promise<MedicationCatalog | undefined> {
    const result = await db.select().from(medicationCatalog).where(eq(medicationCatalog.id, id));
    return result[0];
  }
  
  async getMedicationByName(name: string): Promise<MedicationCatalog | undefined> {
    const result = await db.select().from(medicationCatalog).where(eq(medicationCatalog.name, name));
    return result[0];
  }
  
  async searchMedicationsByName(searchTerm: string): Promise<MedicationCatalog[]> {
    // Usamos ILIKE para búsqueda case-insensitive que contenga el término de búsqueda
    const result = await db.select().from(medicationCatalog)
      .where(SQL`${medicationCatalog.name} ILIKE ${`%${searchTerm}%`}`)
      .limit(10); // Limitamos a 10 resultados por razones de rendimiento
    return result;
  }
  
  async searchMedicationsByActiveIngredient(searchTerm: string): Promise<MedicationCatalog[]> {
    const result = await db.select().from(medicationCatalog)
      .where(SQL`${medicationCatalog.activeIngredient} ILIKE ${`%${searchTerm}%`}`)
      .limit(10); // Limitamos a 10 resultados por razones de rendimiento
    return result;
  }
  
  async getAllMedications(limit: number = 100, offset: number = 0): Promise<MedicationCatalog[]> {
    return await db.select().from(medicationCatalog)
      .where(eq(medicationCatalog.isActive, true))
      .limit(limit)
      .offset(offset);
  }
  
  async getMedicationsByCategory(category: string): Promise<MedicationCatalog[]> {
    return await db.select().from(medicationCatalog)
      .where(and(
        eq(medicationCatalog.category, category),
        eq(medicationCatalog.isActive, true)
      ));
  }
  
  async createMedication(medication: InsertMedicationCatalog): Promise<MedicationCatalog> {
    const result = await db.insert(medicationCatalog).values(medication).returning();
    return result[0];
  }
  
  async updateMedication(id: number, medicationData: Partial<MedicationCatalog>): Promise<MedicationCatalog | undefined> {
    const result = await db
      .update(medicationCatalog)
      .set(medicationData)
      .where(eq(medicationCatalog.id, id))
      .returning();
    return result[0];
  }
  
  // Método para inicializar el catálogo de medicamentos con datos de COFEPRIS
  async seedMedicationCatalog() {
    const existingMedications = await db.select().from(medicationCatalog);
    if (existingMedications.length === 0) {
      const medicationsData = [
        {
          name: "Paracetamol 500mg",
          activeIngredient: "Paracetamol",
          concentration: "500mg",
          pharmaceuticalForm: "Tableta",
          presentation: "Caja con 20 tabletas",
          manufacturer: "Laboratorios Sophia",
          category: "Analgésico",
          requiresPrescription: false,
          cofeprisRegistration: "REG-123456-COFEPRIS",
          isControlled: false,
          isActive: true
        },
        {
          name: "Ibuprofeno 400mg",
          activeIngredient: "Ibuprofeno",
          concentration: "400mg",
          pharmaceuticalForm: "Tableta",
          presentation: "Caja con 10 tabletas",
          manufacturer: "Pfizer",
          category: "Antiinflamatorio",
          requiresPrescription: false,
          cofeprisRegistration: "REG-234567-COFEPRIS",
          isControlled: false,
          isActive: true
        },
        {
          name: "Amoxicilina 500mg",
          activeIngredient: "Amoxicilina",
          concentration: "500mg",
          pharmaceuticalForm: "Cápsula",
          presentation: "Frasco con 15 cápsulas",
          manufacturer: "Bayer",
          category: "Antibiótico",
          requiresPrescription: true,
          cofeprisRegistration: "REG-345678-COFEPRIS",
          isControlled: false,
          isActive: true
        },
        {
          name: "Omeprazol 20mg",
          activeIngredient: "Omeprazol",
          concentration: "20mg",
          pharmaceuticalForm: "Cápsula",
          presentation: "Caja con 14 cápsulas",
          manufacturer: "Genomma Lab",
          category: "Antiácido",
          requiresPrescription: false,
          cofeprisRegistration: "REG-456789-COFEPRIS",
          isControlled: false,
          isActive: true
        },
        {
          name: "Loratadina 10mg",
          activeIngredient: "Loratadina",
          concentration: "10mg",
          pharmaceuticalForm: "Tableta",
          presentation: "Caja con 10 tabletas",
          manufacturer: "Sanfer",
          category: "Antihistamínico",
          requiresPrescription: false,
          cofeprisRegistration: "REG-567890-COFEPRIS",
          isControlled: false,
          isActive: true
        },
        {
          name: "Ciprofloxacino 500mg",
          activeIngredient: "Ciprofloxacino",
          concentration: "500mg",
          pharmaceuticalForm: "Tableta",
          presentation: "Caja con 8 tabletas",
          manufacturer: "Pisa",
          category: "Antibiótico",
          requiresPrescription: true,
          cofeprisRegistration: "REG-678901-COFEPRIS",
          isControlled: false,
          isActive: true
        },
        {
          name: "Metformina 850mg",
          activeIngredient: "Metformina",
          concentration: "850mg",
          pharmaceuticalForm: "Tableta",
          presentation: "Caja con 30 tabletas",
          manufacturer: "Merck",
          category: "Antidiabético",
          requiresPrescription: true,
          cofeprisRegistration: "REG-789012-COFEPRIS",
          isControlled: false,
          isActive: true
        },
        {
          name: "Atorvastatina 20mg",
          activeIngredient: "Atorvastatina",
          concentration: "20mg",
          pharmaceuticalForm: "Tableta",
          presentation: "Caja con 10 tabletas",
          manufacturer: "Servier",
          category: "Hipolipemiante",
          requiresPrescription: true,
          cofeprisRegistration: "REG-890123-COFEPRIS",
          isControlled: false,
          isActive: true
        },
        {
          name: "Losartán 50mg",
          activeIngredient: "Losartán",
          concentration: "50mg",
          pharmaceuticalForm: "Tableta",
          presentation: "Caja con 30 tabletas",
          manufacturer: "Novartis",
          category: "Antihipertensivo",
          requiresPrescription: true,
          cofeprisRegistration: "REG-901234-COFEPRIS",
          isControlled: false,
          isActive: true
        },
        {
          name: "Alprazolam 0.5mg",
          activeIngredient: "Alprazolam",
          concentration: "0.5mg",
          pharmaceuticalForm: "Tableta",
          presentation: "Caja con 30 tabletas",
          manufacturer: "Laboratorios Liomont",
          category: "Ansiolítico",
          requiresPrescription: true,
          cofeprisRegistration: "REG-012345-COFEPRIS",
          isControlled: true,
          controlledGroup: "IV",
          isActive: true
        }
      ];
      
      for (const medication of medicationsData) {
        await db.insert(medicationCatalog).values(medication);
      }
    }
  }

  // Lab Test Result methods
  async getLabTestResult(id: number): Promise<LabTestResult | undefined> {
    const result = await db.select().from(labTestResults).where(eq(labTestResults.id, id));
    return result[0];
  }
  
  async getLabTestResultsByCommission(commissionId: number): Promise<LabTestResult[]> {
    return await db.select().from(labTestResults).where(eq(labTestResults.commissionId, commissionId));
  }
  
  async getLabTestResultsForDoctor(doctorId: number): Promise<LabTestResult[]> {
    // Primero obtenemos todas las comisiones del doctor
    const commissions = await this.getLabCommissionsByDoctor(doctorId);
    
    // Si no hay comisiones, retornamos un array vacío
    if (commissions.length === 0) {
      return [];
    }
    
    // Extraemos los IDs de las comisiones
    const commissionIds = commissions.map(commission => commission.id);
    
    // Buscamos todos los resultados de laboratorio asociados a esas comisiones
    let results: LabTestResult[] = [];
    for (const commissionId of commissionIds) {
      const commissionResults = await this.getLabTestResultsByCommission(commissionId);
      results = [...results, ...commissionResults];
    }
    
    return results;
  }
  
  async getLabTestResultsForPatient(patientId: number): Promise<LabTestResult[]> {
    // Obtenemos todas las comisiones del paciente
    const commissions = await db.select()
      .from(labCommissions)
      .where(eq(labCommissions.patientId, patientId));
    
    // Si no hay comisiones, retornamos un array vacío
    if (commissions.length === 0) {
      return [];
    }
    
    // Extraemos los IDs de las comisiones
    const commissionIds = commissions.map(commission => commission.id);
    
    // Buscamos todos los resultados de laboratorio asociados a esas comisiones
    let results: LabTestResult[] = [];
    for (const commissionId of commissionIds) {
      const commissionResults = await this.getLabTestResultsByCommission(commissionId);
      results = [...results, ...commissionResults];
    }
    
    return results;
  }
  
  async createLabTestResult(result: InsertLabTestResult): Promise<LabTestResult> {
    // Preparamos los datos asegurando que los valores obligatorios estén presentes
    // y convertimos los enums a sus valores apropiados
    const resultData = {
      commissionId: result.commissionId,
      resultStatus: result.resultStatus as "normal" | "abnormal" | "critical",
      resultFileUrl: result.resultFileUrl,
      technician: result.technician,
      resultDate: result.resultDate || new Date(),
      comments: result.comments || null,
      // Estos valores son manejados por el sistema
      isRead: false,
      reviewedByDoctorId: null,
      reviewDate: null,
      doctorComments: null
    };
    
    const insertedResult = await db.insert(labTestResults).values(resultData).returning();
    return insertedResult[0];
  }
  
  async markLabTestResultAsRead(id: number): Promise<LabTestResult | undefined> {
    const result = await db.update(labTestResults)
      .set({ isRead: true })
      .where(eq(labTestResults.id, id))
      .returning();
    return result[0];
  }
  
  async addDoctorReviewToLabTestResult(id: number, doctorId: number, comments: string): Promise<LabTestResult | undefined> {
    const now = new Date();
    const result = await db.update(labTestResults)
      .set({ 
        reviewedByDoctorId: doctorId,
        reviewDate: now,
        doctorComments: comments
      })
      .where(eq(labTestResults.id, id))
      .returning();
    return result[0];
  }

  // Health Metrics methods
  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    const result = await db.select().from(healthMetrics).where(eq(healthMetrics.id, id));
    return result[0];
  }

  async getHealthMetricsByPatient(patientId: number): Promise<HealthMetric[]> {
    return await db.select().from(healthMetrics).where(eq(healthMetrics.patientId, patientId));
  }

  async getHealthMetricsByPatientAndType(patientId: number, metricType: string): Promise<HealthMetric[]> {
    // Para este método, no tenemos un campo metricType explícito, así que necesitamos
    // determinar qué campo específico verificar (esto es un enfoque simplificado)
    const metrics = await db.select().from(healthMetrics).where(eq(healthMetrics.patientId, patientId));
    
    // Filtramos los resultados basados en el tipo de métrica
    // Por ejemplo, si metricType es "bloodPressure", devolvemos métricas donde bloodPressureSystolic o bloodPressureDiastolic no sean nulos
    if (metricType === "bloodPressure") {
      return metrics.filter(m => m.bloodPressureSystolic !== null || m.bloodPressureDiastolic !== null);
    } else if (metricType === "heartRate") {
      return metrics.filter(m => m.heartRate !== null);
    } else if (metricType === "temperature") {
      return metrics.filter(m => m.temperature !== null);
    } else if (metricType === "weight") {
      return metrics.filter(m => m.weight !== null);
    } else if (metricType === "oxygenSaturation") {
      return metrics.filter(m => m.oxygenSaturation !== null);
    } else if (metricType === "glucose") {
      return metrics.filter(m => m.glucose !== null);
    }
    
    // Si el tipo no coincide con ninguno conocido, devolver un array vacío
    return [];
  }

  async createHealthMetric(insertMetric: InsertHealthMetric): Promise<HealthMetric> {
    const result = await db.insert(healthMetrics).values(insertMetric).returning();
    return result[0];
  }

  // Doctor Verification Methods
  async getDoctorVerificationDocuments(doctorId: number): Promise<DoctorVerificationDocument[]> {
    return await db.select()
      .from(doctorVerificationDocuments)
      .where(eq(doctorVerificationDocuments.doctorId, doctorId));
  }

  async createDoctorVerificationDocument(document: InsertDoctorVerificationDocument): Promise<DoctorVerificationDocument> {
    const result = await db.insert(doctorVerificationDocuments).values(document).returning();
    return result[0];
  }

  async updateDoctorVerificationDocument(
    id: number, 
    status: "pending" | "approved" | "rejected", 
    reviewerId?: number, 
    notes?: string | null
  ): Promise<DoctorVerificationDocument | undefined> {
    const result = await db.update(doctorVerificationDocuments)
      .set({ 
        status, 
        reviewerId: reviewerId || null,
        reviewedAt: new Date(),
        notes: notes || null 
      })
      .where(eq(doctorVerificationDocuments.id, id))
      .returning();
    return result[0];
  }

  async updateDoctorVerificationStatus(doctorId: number, status: "pending" | "approved" | "rejected", reviewerId?: number, comments?: string): Promise<DoctorProfile | undefined> {
    // Primero obtenemos el perfil del doctor
    const doctorProfile = await this.getDoctorProfileByUserId(doctorId);
    if (!doctorProfile) {
      return undefined;
    }

    // Creamos un registro en el historial de verificaciones
    await this.createDoctorVerificationHistory({
      doctorId,
      status,
      reviewerId: reviewerId || null,
      comments: comments || null
    });

    // Actualizamos el estado de verificación del doctor
    const result = await db.update(doctorProfiles)
      .set({ verificationStatus: status })
      .where(eq(doctorProfiles.userId, doctorId))
      .returning();
    return result[0];
  }

  async getDoctorVerificationHistory(doctorId: number): Promise<DoctorVerificationHistory[]> {
    return await db.select()
      .from(doctorVerificationHistory)
      .where(eq(doctorVerificationHistory.doctorId, doctorId));
  }

  async createDoctorVerificationHistory(history: InsertDoctorVerificationHistory): Promise<DoctorVerificationHistory> {
    const result = await db.insert(doctorVerificationHistory).values(history).returning();
    return result[0];
  }

  // Chat Conversation methods
  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    const result = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return result[0];
  }

  async getChatConversationsByDoctor(doctorId: number): Promise<ChatConversation[]> {
    return await db.select().from(chatConversations).where(eq(chatConversations.doctorId, doctorId));
  }

  async getChatConversationsByPatient(patientId: number): Promise<ChatConversation[]> {
    return await db.select().from(chatConversations).where(eq(chatConversations.patientId, patientId));
  }

  async getChatConversationByUsers(doctorId: number, patientId: number): Promise<ChatConversation | undefined> {
    const result = await db.select().from(chatConversations).where(
      and(
        eq(chatConversations.doctorId, doctorId),
        eq(chatConversations.patientId, patientId)
      )
    );
    return result[0];
  }

  async createChatConversation(insertConversation: InsertChatConversation): Promise<ChatConversation> {
    const now = new Date();
    const conversationData = {
      ...insertConversation,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now
    };
    const result = await db.insert(chatConversations).values(conversationData).returning();
    return result[0];
  }

  async updateChatConversation(id: number, conversationData: Partial<ChatConversation>): Promise<ChatConversation | undefined> {
    const result = await db.update(chatConversations)
      .set(conversationData)
      .where(eq(chatConversations.id, id))
      .returning();
    return result[0];
  }

  // Chat Message methods
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    const result = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return result[0];
  }

  async getChatMessagesByConversation(conversationId: number, limit: number = 50, before?: Date): Promise<ChatMessage[]> {
    let query = db.select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId));
    
    if (before) {
      query = query.where(
        SQL`${chatMessages.createdAt} < ${before}`
      );
    }
    
    // Order by createdAt in descending order (newest first)
    query = query.orderBy(SQL`${chatMessages.createdAt} DESC`);
    
    // Apply limit
    query = query.limit(limit);
    
    return await query;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const messageData = {
      ...insertMessage,
      isRead: false,
      isDelivered: false
    };
    const result = await db.insert(chatMessages).values(messageData).returning();
    return result[0];
  }

  async updateChatMessage(id: number, messageData: Partial<ChatMessage>): Promise<ChatMessage | undefined> {
    const result = await db.update(chatMessages)
      .set(messageData)
      .where(eq(chatMessages.id, id))
      .returning();
    return result[0];
  }

  async getUnreadMessagesCount(conversationId: number, userId: number): Promise<number> {
    const messages = await db.select().from(chatMessages).where(
      and(
        eq(chatMessages.conversationId, conversationId),
        SQL`${chatMessages.senderId} != ${userId}`,
        eq(chatMessages.isRead, false)
      )
    );
    
    return messages.length;
  }

  // Chat Notification methods
  async getChatNotification(id: number): Promise<ChatNotification | undefined> {
    const result = await db.select().from(chatNotifications).where(eq(chatNotifications.id, id));
    return result[0];
  }

  async getChatNotificationsByUser(userId: number): Promise<ChatNotification[]> {
    return await db.select().from(chatNotifications).where(eq(chatNotifications.userId, userId));
  }

  async createChatNotification(insertNotification: InsertChatNotification): Promise<ChatNotification> {
    const notificationData = {
      ...insertNotification,
      isRead: false
    };
    const result = await db.insert(chatNotifications).values(notificationData).returning();
    return result[0];
  }

  async markChatNotificationAsRead(messageId: number, userId: number): Promise<ChatNotification | undefined> {
    const notification = await db.select()
      .from(chatNotifications)
      .where(
        and(
          eq(chatNotifications.messageId, messageId),
          eq(chatNotifications.userId, userId)
        )
      );
    
    if (notification.length === 0) {
      return undefined;
    }
    
    const result = await db.update(chatNotifications)
      .set({ isRead: true })
      .where(eq(chatNotifications.id, notification[0].id))
      .returning();
    
    return result[0];
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const notifications = await db.select().from(chatNotifications).where(
      and(
        eq(chatNotifications.userId, userId),
        eq(chatNotifications.isRead, false)
      )
    );
    
    return notifications.length;
  }
  
  // === MÉTODOS PARA RED SOCIAL MÉDICA ===
  
  // Contactos de usuario
  async getUserContacts(userId: number): Promise<UserContact[]> {
    return await db.select().from(userContacts).where(eq(userContacts.userId, userId));
  }
  
  async getContactRequests(userId: number): Promise<UserContact[]> {
    return await db.select().from(userContacts).where(
      and(
        eq(userContacts.contactId, userId),
        eq(userContacts.status, "pending")
      )
    );
  }
  
  async createUserContact(contact: InsertUserContact): Promise<UserContact> {
    const [result] = await db.insert(userContacts).values(contact).returning();
    return result;
  }
  
  async updateUserContactStatus(id: number, status: "pending" | "accepted" | "rejected" | "blocked"): Promise<UserContact | undefined> {
    const [result] = await db.update(userContacts)
      .set({ status, updatedAt: new Date() })
      .where(eq(userContacts.id, id))
      .returning();
    return result;
  }
  
  async toggleSharedMedicalInfo(id: number, share: boolean): Promise<UserContact | undefined> {
    const [result] = await db.update(userContacts)
      .set({ sharedMedicalInfo: share, updatedAt: new Date() })
      .where(eq(userContacts.id, id))
      .returning();
    return result;
  }
  
  // Recomendaciones de médicos
  async getDoctorRecommendations(userId: number): Promise<DoctorRecommendation[]> {
    return await db.select().from(doctorRecommendations)
      .where(eq(doctorRecommendations.toUserId, userId));
  }
  
  async getRecommendationsSent(userId: number): Promise<DoctorRecommendation[]> {
    return await db.select().from(doctorRecommendations)
      .where(eq(doctorRecommendations.fromUserId, userId));
  }
  
  async createDoctorRecommendation(recommendation: InsertDoctorRecommendation): Promise<DoctorRecommendation> {
    const [result] = await db.insert(doctorRecommendations)
      .values(recommendation)
      .returning();
    return result;
  }
  
  async markRecommendationAsRead(id: number): Promise<DoctorRecommendation | undefined> {
    const [result] = await db.update(doctorRecommendations)
      .set({ isRead: true })
      .where(eq(doctorRecommendations.id, id))
      .returning();
    return result;
  }
  
  // Reseñas de médicos
  async getDoctorReviews(doctorId: number): Promise<DoctorReview[]> {
    return await db.select().from(doctorReviews)
      .where(
        and(
          eq(doctorReviews.doctorId, doctorId),
          eq(doctorReviews.isVisible, true)
        )
      );
  }
  
  async getReviewsByPatient(patientId: number): Promise<DoctorReview[]> {
    return await db.select().from(doctorReviews)
      .where(eq(doctorReviews.patientId, patientId));
  }
  
  async createDoctorReview(review: InsertDoctorReview): Promise<DoctorReview> {
    const [result] = await db.insert(doctorReviews)
      .values(review)
      .returning();
    return result;
  }
  
  async updateDoctorReviewVisibility(id: number, isVisible: boolean): Promise<DoctorReview | undefined> {
    const [result] = await db.update(doctorReviews)
      .set({ isVisible })
      .where(eq(doctorReviews.id, id))
      .returning();
    return result;
  }
  
  async verifyDoctorReviewAppointment(id: number): Promise<DoctorReview | undefined> {
    const [result] = await db.update(doctorReviews)
      .set({ hasAppointmentVerified: true })
      .where(eq(doctorReviews.id, id))
      .returning();
    return result;
  }
  
  // Importación de contactos
  async createContactImport(importData: InsertContactImport): Promise<ContactImport> {
    const [result] = await db.insert(contactImports)
      .values(importData)
      .returning();
    return result;
  }
  
  async getContactImports(userId: number): Promise<ContactImport[]> {
    return await db.select().from(contactImports)
      .where(eq(contactImports.userId, userId))
      .orderBy(desc(contactImports.importedAt));
  }
  
  async updateContactImportStatus(id: number, status: string, processedContacts: number): Promise<ContactImport | undefined> {
    const [result] = await db.update(contactImports)
      .set({ status, processedContacts })
      .where(eq(contactImports.id, id))
      .returning();
    return result;
  }
  
  // Notificaciones sociales
  async createSocialNotification(notification: InsertSocialNotification): Promise<SocialNotification> {
    const [result] = await db.insert(socialNotifications)
      .values(notification)
      .returning();
    return result;
  }
  
  async getUserSocialNotifications(userId: number): Promise<SocialNotification[]> {
    return await db.select().from(socialNotifications)
      .where(eq(socialNotifications.userId, userId))
      .orderBy(desc(socialNotifications.createdAt));
  }
  
  async markSocialNotificationAsRead(id: number): Promise<SocialNotification | undefined> {
    const [result] = await db.update(socialNotifications)
      .set({ isRead: true })
      .where(eq(socialNotifications.id, id))
      .returning();
    return result;
  }
  
  async getUnreadSocialNotificationsCount(userId: number): Promise<number> {
    const result = await db.select().from(socialNotifications)
      .where(
        and(
          eq(socialNotifications.userId, userId),
          eq(socialNotifications.isRead, false)
        )
      );
    
    return result.length;
  }

  // =========================== MÓDULO DE LABORATORIO ===========================
  
  // Catálogo de pruebas de laboratorio
  async getLabTests(category?: string): Promise<LabTestCatalog[]> {
    if (category) {
      return await db.select().from(labTestCatalog)
        .where(
          and(
            eq(labTestCatalog.category, category as any),
            eq(labTestCatalog.isActive, true)
          )
        )
        .orderBy(labTestCatalog.name);
    }
    
    return await db.select().from(labTestCatalog)
      .where(eq(labTestCatalog.isActive, true))
      .orderBy(labTestCatalog.name);
  }
  
  async getLabTestById(id: number): Promise<LabTestCatalog | undefined> {
    const [result] = await db.select().from(labTestCatalog)
      .where(eq(labTestCatalog.id, id));
    return result;
  }
  
  async createLabTest(test: InsertLabTestCatalog): Promise<LabTestCatalog> {
    const [result] = await db.insert(labTestCatalog)
      .values(test)
      .returning();
    return result;
  }
  
  // Laboratorios
  async getLaboratories(onlyActive: boolean = true): Promise<Laboratory[]> {
    if (onlyActive) {
      return await db.select().from(laboratories)
        .where(eq(laboratories.isActive, true))
        .orderBy(laboratories.name);
    }
    
    return await db.select().from(laboratories)
      .orderBy(laboratories.name);
  }
  
  async getLaboratoryById(id: number): Promise<Laboratory | undefined> {
    const [result] = await db.select().from(laboratories)
      .where(eq(laboratories.id, id));
    return result;
  }
  
  async createLaboratory(lab: InsertLaboratory): Promise<Laboratory> {
    const [result] = await db.insert(laboratories)
      .values(lab)
      .returning();
    return result;
  }
  
  // Comisiones de laboratorio
  async createLabCommission(commission: any): Promise<any> {
    const { testIds, ...commissionData } = commission;
    
    // Iniciar una transacción para crear la comisión y asociar los tests
    const labCommission = await db.transaction(async (tx) => {
      // Crear la comisión
      const [newCommission] = await tx.insert(labCommissions)
        .values(commissionData)
        .returning();
      
      // Si hay tests asociados, crear relaciones
      if (testIds && testIds.length > 0) {
        // Aquí asumo que hay una tabla de relación entre comisiones y tests
        // Si no existe, se puede manejar de otra manera o crear la tabla
        for (const testId of testIds) {
          // Esto es un ejemplo, adaptar según la estructura real
          await tx.execute(
            sql`INSERT INTO lab_commission_tests (commission_id, test_id) 
                VALUES (${newCommission.id}, ${testId})`
          );
        }
      }
      
      return newCommission;
    });
    
    return labCommission;
  }
  
  async getLabCommissionById(id: number): Promise<any> {
    // Obtener la comisión
    const [commission] = await db.select().from(labCommissions)
      .where(eq(labCommissions.id, id));
    
    if (!commission) {
      return undefined;
    }
    
    // Obtener el laboratorio
    const [laboratory] = await db.select().from(laboratories)
      .where(eq(laboratories.id, commission.laboratoryId));
    
    // Obtener el médico
    const [doctor] = await db.select().from(users)
      .where(eq(users.id, commission.doctorId));
    
    // Obtener los tests asociados
    const tests = await db.execute(
      sql`SELECT lt.* FROM lab_test_catalog lt
          JOIN lab_commission_tests lct ON lt.id = lct.test_id
          WHERE lct.commission_id = ${commission.id}`
    );
    
    // Obtener los resultados
    const results = await db.select().from(labTestResults)
      .where(eq(labTestResults.commissionId, commission.id));
    
    return {
      ...commission,
      laboratory: laboratory ? {
        id: laboratory.id,
        name: laboratory.name
      } : null,
      doctor: doctor ? {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName
      } : null,
      tests: tests.rows,
      results
    };
  }
  
  async getLabCommissionsByPatient(patientId: number): Promise<any[]> {
    // Obtener todas las comisiones del paciente
    const commissions = await db.select().from(labCommissions)
      .where(eq(labCommissions.patientId, patientId))
      .orderBy(desc(labCommissions.createdAt));
    
    // Para cada comisión, obtener información adicional
    const result = [];
    
    for (const commission of commissions) {
      // Obtener el laboratorio
      const [laboratory] = await db.select().from(laboratories)
        .where(eq(laboratories.id, commission.laboratoryId));
      
      // Obtener el médico
      const [doctor] = await db.select().from(users)
        .where(eq(users.id, commission.doctorId));
      
      // Obtener los tests asociados
      const tests = await db.execute(
        sql`SELECT lt.* FROM lab_test_catalog lt
            JOIN lab_commission_tests lct ON lt.id = lct.test_id
            WHERE lct.commission_id = ${commission.id}`
      );
      
      // Obtener los resultados
      const results = await db.select().from(labTestResults)
        .where(eq(labTestResults.commissionId, commission.id));
      
      result.push({
        ...commission,
        laboratory: laboratory ? {
          id: laboratory.id,
          name: laboratory.name
        } : null,
        doctor: doctor ? {
          id: doctor.id,
          firstName: doctor.firstName,
          lastName: doctor.lastName
        } : null,
        tests: tests.rows,
        results
      });
    }
    
    return result;
  }
  
  async updateLabCommissionStatus(id: number, status: string): Promise<any> {
    const [result] = await db.update(labCommissions)
      .set({ status })
      .where(eq(labCommissions.id, id))
      .returning();
    
    return result;
  }
  
  // Resultados de laboratorio
  async createLabTestResult(result: InsertLabTestResult): Promise<LabTestResult> {
    const [newResult] = await db.insert(labTestResults)
      .values(result)
      .returning();
    
    return newResult;
  }
  
  async getLabTestResultById(id: number): Promise<LabTestResult | undefined> {
    const [result] = await db.select().from(labTestResults)
      .where(eq(labTestResults.id, id));
    
    return result;
  }
  
  async getLabTestResultsByCommission(commissionId: number): Promise<LabTestResult[]> {
    return await db.select().from(labTestResults)
      .where(eq(labTestResults.commissionId, commissionId))
      .orderBy(desc(labTestResults.resultDate));
  }
  
  async updateLabTestResultReview(id: number, reviewData: any): Promise<LabTestResult | undefined> {
    const [result] = await db.update(labTestResults)
      .set(reviewData)
      .where(eq(labTestResults.id, id))
      .returning();
    
    return result;
  }
}