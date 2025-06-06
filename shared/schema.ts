import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Types
export const UserType = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
  LABORATORY: "laboratory",
} as const;

export type UserTypeValues = typeof UserType[keyof typeof UserType];

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  userType: text("user_type").$type<UserTypeValues>().notNull(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Specialties
export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  isPopular: boolean("is_popular").default(false),
  category: text("category").default("médica"),
  displayOrder: integer("display_order").default(999),
});

export const insertSpecialtySchema = createInsertSchema(specialties).omit({
  id: true,
});

// Tipo de profesional médico
export const ProfessionalType = {
  MEDICO: "médico",
  DENTISTA: "dentista",
  PSICOLOGO: "psicólogo",
  NUTRIOLOGO: "nutriólogo",
  FISIOTERAPEUTA: "fisioterapeuta",
  OPTOMETRISTA: "optometrista",
  OTRO: "otro"
} as const;

export type ProfessionalTypeValues = typeof ProfessionalType[keyof typeof ProfessionalType];

// Doctor Profiles
export const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  specialtyId: integer("specialty_id").notNull(),
  professionalType: text("professional_type").$type<ProfessionalTypeValues>().default("médico").notNull(),
  licenseNumber: text("license_number").notNull(),
  consultationFee: integer("consultation_fee").notNull(),
  biography: text("biography").notNull(),
  education: text("education").notNull(),
  experience: integer("experience").notNull(), // Years of experience
  availableHours: jsonb("available_hours").notNull(), // JSON object with available hours
  verificationStatus: text("verification_status").$type<"pending" | "approved" | "rejected">().default("pending").notNull(),
  profileImage: text("profile_image"),
  phone: text("phone"),
  address: text("address"),
  licenseVerified: boolean("license_verified").default(false).notNull(),
});

export const insertDoctorProfileSchema = createInsertSchema(doctorProfiles).omit({
  id: true,
});

// Patient Profiles
export const patientProfiles = pgTable("patient_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  bloodType: text("blood_type"),
  allergies: text("allergies"),
  chronicConditions: text("chronic_conditions"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  phone: text("phone"),
  address: text("address"),
});

export const insertPatientProfileSchema = createInsertSchema(patientProfiles).omit({
  id: true,
});

// Doctor Schedule
export const doctorSchedule = pgTable("doctor_schedule", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (domingo-sábado)
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  slotDuration: integer("slot_duration").notNull(), // minutos
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDoctorScheduleSchema = createInsertSchema(doctorSchedule).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Doctor Unavailability (vacaciones, días especiales, etc.)
export const doctorUnavailability = pgTable("doctor_unavailability", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDoctorUnavailabilitySchema = createInsertSchema(doctorUnavailability).omit({
  id: true,
  createdAt: true,
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  dateTime: timestamp("date_time").notNull(),
  // endTime removed because it's missing in the database
  status: text("status").$type<"scheduled" | "confirmed" | "completed" | "cancelled" | "no_show">().notNull().default("scheduled"),
  // type column removed because it's missing in the database
  // appointment_type can be used instead
  appointmentType: text("appointment_type").$type<"first_visit" | "follow_up" | "emergency" | "telemedicine">().default("first_visit"),
  reason: text("reason").notNull(),
  symptoms: text("symptoms"),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  recurringId: integer("recurring_id"), // referencia a cita recurrente si es parte de una serie
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  reminderSent: true,
});

// Recurring Appointments (Series)
export const recurringAppointments = pgTable("recurring_appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  frequency: text("frequency").$type<"daily" | "weekly" | "biweekly" | "monthly">().notNull(),
  dayOfWeek: integer("day_of_week"), // Para frecuencia semanal
  timeOfDay: time("time_of_day").notNull(),
  duration: integer("duration").notNull(), // minutos
  reason: text("reason").notNull(),
  status: text("status").$type<"active" | "completed" | "cancelled">().default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecurringAppointmentSchema = createInsertSchema(recurringAppointments).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Appointment Follow-ups
export const appointmentFollowUps = pgTable("appointment_follow_ups", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.id),
  recommendedDate: date("recommended_date").notNull(),
  reason: text("reason").notNull(),
  instructions: text("instructions"),
  status: text("status").$type<"pending" | "scheduled" | "cancelled">().default("pending").notNull(),
  followUpAppointmentId: integer("follow_up_appointment_id").references(() => appointments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentFollowUpSchema = createInsertSchema(appointmentFollowUps).omit({
  id: true,
  createdAt: true,
  status: true,
  followUpAppointmentId: true,
});

// Medical Records (Expediente Clínico - compliant with NOM-004-SSA3-2012)
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  appointmentId: integer("appointment_id"),
  
  // Datos de identificación del paciente (ya incluidos en patientId)
  
  // Interrogatorio - Antecedentes
  personalHistory: text("personal_history"), // Antecedentes personales patológicos
  familyHistory: text("family_history"), // Antecedentes familiares
  surgicalHistory: text("surgical_history"), // Antecedentes quirúrgicos
  allergies: text("allergies"), // Alergias y reacciones adversas
  medications: text("medications"), // Medicamentos actuales
  
  // Exploración física
  physicalExamination: text("physical_examination"), // Exploración física completa
  vitalSigns: jsonb("vital_signs"), // Signos vitales (temperatura, presión arterial, etc.)
  height: numeric("height"), // Estatura en cm
  weight: numeric("weight"), // Peso en kg
  bodyMassIndex: numeric("body_mass_index"), // IMC
  
  // Resultados de estudios
  labResults: jsonb("lab_results"), // Resultados de laboratorio
  imagingResults: jsonb("imaging_results"), // Resultados de imagenología
  
  // Diagnósticos
  diagnosis: text("diagnosis").notNull(), // Diagnóstico(s)
  diagnosticProcedures: text("diagnostic_procedures"), // Procedimientos realizados
  differentialDiagnosis: text("differential_diagnosis"), // Diagnósticos diferenciales considerados
  
  // Tratamiento
  treatment: text("treatment"), // Tratamiento general
  prescription: text("prescription"), // Prescripción médica
  medicalIndications: text("medical_indications"), // Indicaciones médicas
  
  // Evolución
  clinicalEvolution: text("clinical_evolution"), // Evolución y pronóstico
  followUpPlan: text("follow_up_plan"), // Plan de seguimiento
  prognosis: text("prognosis"), // Pronóstico

  // Otros datos
  notes: text("notes"), // Notas generales
  aiAssisted: boolean("ai_assisted").default(false),
  aiDiagnosisData: jsonb("ai_diagnosis_data"), // Stores AI analysis data
  
  // Metadatos
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  aiDiagnosisData: true,
});

// Patient Documents (Expediente Clínico - compliant with NOM-004-SSA3-2012)
export const patientDocuments = pgTable("patient_documents", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  medicalRecordId: integer("medical_record_id").references(() => medicalRecords.id),
  doctorId: integer("doctor_id").references(() => users.id), // Médico que sube o asocia el documento
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"), // pdf, jpg, png, etc.
  fileSize: integer("file_size"), // tamaño en bytes
  
  // Categoría del documento según NOM-004-SSA3-2012
  documentType: text("document_type").$type<
    "laboratory" | 
    "imaging" | 
    "prescription" | 
    "clinical_note" | 
    "informed_consent" | 
    "referral" | 
    "external_document" | 
    "vaccination" | 
    "dental_record" | 
    "pathology" |
    "other"
  >().notNull(),
  
  category: text("category"), // Subcategoría más específica
  isConfidential: boolean("is_confidential").default(false), // Documentos de acceso restringido
  tags: text("tags").array(), // Etiquetas para facilitar búsqueda
  
  // Metadatos
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  modifiedAt: timestamp("modified_at"),
  uploadedBy: integer("uploaded_by").references(() => users.id), // Quién lo subió (no siempre es el médico)
});

export const insertPatientDocumentSchema = createInsertSchema(patientDocuments).omit({
  id: true,
  uploadedAt: true,
  modifiedAt: true,
});

// Laboratories
export const laboratories = pgTable("laboratories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  address: text("address").notNull(),
  contactInfo: text("contact_info").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertLaboratorySchema = createInsertSchema(laboratories).omit({
  id: true,
});

// Lab Tests Catalog (COFEPRIS approved)
export const labTestCatalog = pgTable("lab_test_catalog", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").$type<"laboratorio" | "imagen">().notNull(),
  description: text("description"),
  normalValues: text("normal_values"),
  units: text("units"),
  preparationInstructions: text("preparation_instructions"),
  cofeprisApproved: boolean("cofepris_approved").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLabTestCatalogSchema = createInsertSchema(labTestCatalog).omit({
  id: true,
  createdAt: true,
});

// Lab Commissions
export const labCommissions = pgTable("lab_commissions", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  laboratoryId: integer("laboratory_id").notNull().references(() => laboratories.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  serviceName: text("service_name"),
  testType: text("test_type"),
  description: text("description"),
  amount: numeric("amount").notNull(), // in cents
  status: text("status").$type<"pending" | "completed" | "cancelled">().notNull().default("pending"),
  urgency: text("urgency").$type<"normal" | "urgent" | "immediate">().default("normal"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLabCommissionSchema = createInsertSchema(labCommissions).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Medical Prescriptions - Medicamentos del catálogo COFEPRIS
export const medicationCatalog = pgTable("medication_catalog", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  activeIngredient: text("active_ingredient").notNull(),
  concentration: text("concentration"),
  pharmaceuticalForm: text("pharmaceutical_form"), // Tableta, cápsula, solución, etc.
  presentation: text("presentation"), // Caja con 30 tabletas, frasco 120ml, etc.
  manufacturer: text("manufacturer"),
  category: text("category"), // Analgésico, antibiótico, antihipertensivo, etc.
  requiresPrescription: boolean("requires_prescription").default(true).notNull(),
  cofeprisRegistration: text("cofepris_registration"),
  isControlled: boolean("is_controlled").default(false).notNull(), // Grupo I, II, III, IV
  controlledGroup: text("controlled_group"), // Para medicamentos controlados
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicationCatalogSchema = createInsertSchema(medicationCatalog).omit({
  id: true,
  createdAt: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;

export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type InsertDoctorProfile = z.infer<typeof insertDoctorProfileSchema>;

export type PatientProfile = typeof patientProfiles.$inferSelect;
export type InsertPatientProfile = z.infer<typeof insertPatientProfileSchema>;

export type DoctorSchedule = typeof doctorSchedule.$inferSelect;
export type InsertDoctorSchedule = z.infer<typeof insertDoctorScheduleSchema>;

export type DoctorUnavailability = typeof doctorUnavailability.$inferSelect;
export type InsertDoctorUnavailability = z.infer<typeof insertDoctorUnavailabilitySchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type RecurringAppointment = typeof recurringAppointments.$inferSelect;
export type InsertRecurringAppointment = z.infer<typeof insertRecurringAppointmentSchema>;

export type AppointmentFollowUp = typeof appointmentFollowUps.$inferSelect;
export type InsertAppointmentFollowUp = z.infer<typeof insertAppointmentFollowUpSchema>;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;

export type PatientDocument = typeof patientDocuments.$inferSelect;
export type InsertPatientDocument = z.infer<typeof insertPatientDocumentSchema>;

export type Laboratory = typeof laboratories.$inferSelect;
export type InsertLaboratory = z.infer<typeof insertLaboratorySchema>;

export type LabTestCatalog = typeof labTestCatalog.$inferSelect;
export type InsertLabTestCatalog = z.infer<typeof insertLabTestCatalogSchema>;

export type LabCommission = typeof labCommissions.$inferSelect;
export type InsertLabCommission = z.infer<typeof insertLabCommissionSchema>;

// Medicamentos ya está definido anteriormente
export type MedicationCatalog = typeof medicationCatalog.$inferSelect;
export type InsertMedicationCatalog = z.infer<typeof insertMedicationCatalogSchema>;

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  price: numeric("price").notNull(), // Monthly price
  features: jsonb("features").default('[]').notNull(), // Array of features
  maxAppointments: integer("max_appointments").notNull(),
  durationDays: integer("duration_days").notNull(),
  includesLabTests: boolean("includes_lab_tests").default(false).notNull(),
  includesSpecialists: boolean("includes_specialists").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

// User Subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  planId: integer("plan_id").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("active"), // active, cancelled, expired
  autoRenew: boolean("auto_renew").default(true).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  status: true,
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

// Medical Prescriptions

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment").notNull(),
  medicationDosage: text("medication_dosage").notNull(),
  instructions: text("instructions"),
  notes: text("notes"),
  fileUrl: text("file_url"), // URL del PDF generado
  medicalRecordId: integer("medical_record_id").references(() => medicalRecords.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  expirationDate: timestamp("expiration_date"), // Fecha de caducidad de la receta
  isDigitallySigned: boolean("is_digitally_signed").default(false),
  status: text("status").$type<"active" | "filled" | "expired" | "cancelled">().default("active"),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

// Lab Test Results
export const labTestResults = pgTable("lab_test_results", {
  id: serial("id").primaryKey(),
  commissionId: integer("commission_id").notNull().references(() => labCommissions.id),
  resultDate: timestamp("result_date").defaultNow().notNull(),
  resultStatus: text("result_status").$type<"normal" | "abnormal" | "critical">().notNull(),
  resultFileUrl: text("result_file_url").notNull(),
  technician: text("technician").notNull(),
  comments: text("comments"),
  isRead: boolean("is_read").default(false).notNull(),
  reviewedByDoctorId: integer("reviewed_by_doctor_id").references(() => users.id),
  reviewDate: timestamp("review_date"),
  doctorComments: text("doctor_comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLabTestResultSchema = createInsertSchema(labTestResults).omit({
  id: true,
  createdAt: true,
  isRead: true,
  reviewedByDoctorId: true,
  reviewDate: true,
  doctorComments: true,
});

export type LabTestResult = typeof labTestResults.$inferSelect;
export type InsertLabTestResult = z.infer<typeof insertLabTestResultSchema>;

// Health Metrics
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  metricDate: date("metric_date").notNull().defaultNow(),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  heartRate: integer("heart_rate"),
  temperature: numeric("temperature"),
  weight: numeric("weight"),
  oxygenSaturation: integer("oxygen_saturation"),
  glucose: integer("glucose"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
  createdAt: true,
});

export type HealthMetric = typeof healthMetrics.$inferSelect;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;

// Doctor Verification Documents
export const doctorVerificationDocuments = pgTable("doctor_verification_documents", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  documentType: text("document_type").$type<"license" | "id" | "specialty_cert" | "specialty_diploma" | "additional">().notNull(),
  fileUrl: text("file_url").notNull(),
  status: text("status").$type<"pending" | "approved" | "rejected">().default("pending").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewerId: integer("reviewer_id").references(() => users.id),
  notes: text("notes"),
});

export const insertDoctorVerificationDocumentSchema = createInsertSchema(doctorVerificationDocuments).omit({
  id: true,
  status: true,
  submittedAt: true,
  reviewedAt: true,
  reviewerId: true,
});

export type DoctorVerificationDocument = typeof doctorVerificationDocuments.$inferSelect;
export type InsertDoctorVerificationDocument = z.infer<typeof insertDoctorVerificationDocumentSchema>;

// Doctor Verification History
export const doctorVerificationHistory = pgTable("doctor_verification_history", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  status: text("status").$type<"pending" | "approved" | "rejected">().notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDoctorVerificationHistorySchema = createInsertSchema(doctorVerificationHistory).omit({
  id: true,
  updatedAt: true,
});

export type DoctorVerificationHistory = typeof doctorVerificationHistory.$inferSelect;
export type InsertDoctorVerificationHistory = z.infer<typeof insertDoctorVerificationHistorySchema>;

// Chat Conversations
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  status: text("status").$type<"active" | "archived">().default("active").notNull(),
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
  status: true,
});

// Chat Messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  messageType: text("message_type").$type<"text" | "image" | "file">().default("text").notNull(),
  content: text("content").notNull(),
  fileUrl: text("file_url"), // URL for image or file, if applicable
  fileName: text("file_name"), // Original filename for uploaded files
  fileSize: integer("file_size"), // Size in bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  isDelivered: boolean("is_delivered").default(false).notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  isRead: true,
  isDelivered: true,
});

// Chat Notifications
export const chatNotifications = pgTable("chat_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id), // Recipient of the notification
  messageId: integer("message_id").notNull().references(() => chatMessages.id),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatNotificationSchema = createInsertSchema(chatNotifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ChatNotification = typeof chatNotifications.$inferSelect;
export type InsertChatNotification = z.infer<typeof insertChatNotificationSchema>;

// UserType is already declared at the top of the file

// RED SOCIAL MÉDICA

// Tabla de contactos (amigos/relaciones entre usuarios)
export const userContacts = pgTable("user_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contactId: integer("contact_id").notNull().references(() => users.id),
  status: text("status").$type<"pending" | "accepted" | "rejected" | "blocked">().default("pending").notNull(),
  source: text("source").$type<"manual" | "phone" | "social_media" | "email">().default("manual").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  sharedMedicalInfo: boolean("shared_medical_info").default(false).notNull(), // Determina si se comparte info médica con este contacto
});

export const insertUserContactSchema = createInsertSchema(userContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabla de recomendaciones de médicos entre contactos
export const doctorRecommendations = pgTable("doctor_recommendations", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
});

export const insertDoctorRecommendationSchema = createInsertSchema(doctorRecommendations).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Tabla de reseñas de médicos
export const doctorReviews = pgTable("doctor_reviews", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => users.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 estrellas
  comment: text("comment"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isVisible: boolean("is_visible").default(true).notNull(), // Para moderar contenido inapropiado
  hasAppointmentVerified: boolean("has_appointment_verified").default(false).notNull(), // Verifica si el paciente realmente tuvo una cita con el médico
});

export const insertDoctorReviewSchema = createInsertSchema(doctorReviews).omit({
  id: true,
  createdAt: true,
});

// Tabla para importación de contactos (registro temporal durante el proceso de importación)
export const contactImports = pgTable("contact_imports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  source: text("source").$type<"phone" | "social_media" | "email">().notNull(),
  importData: jsonb("import_data").notNull(), // Datos importados en formato JSON
  importedAt: timestamp("imported_at").defaultNow().notNull(),
  status: text("status").$type<"pending" | "processing" | "completed" | "failed">().default("pending").notNull(),
  processedContacts: integer("processed_contacts").default(0).notNull(),
  totalContacts: integer("total_contacts").default(0).notNull(),
});

export const insertContactImportSchema = createInsertSchema(contactImports).omit({
  id: true,
  importedAt: true,
});

// Tabla para notificaciones de la red social
export const socialNotifications = pgTable("social_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").$type<"contact_request" | "recommendation" | "review" | "recommendation_accepted">().notNull(),
  referenceId: integer("reference_id").notNull(), // ID de la entidad relacionada (contacto, recomendación, etc.)
  isRead: boolean("is_read").default(false).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSocialNotificationSchema = createInsertSchema(socialNotifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Tipos exportados
export type UserContact = typeof userContacts.$inferSelect;
export type InsertUserContact = z.infer<typeof insertUserContactSchema>;

export type DoctorRecommendation = typeof doctorRecommendations.$inferSelect;
export type InsertDoctorRecommendation = z.infer<typeof insertDoctorRecommendationSchema>;

export type DoctorReview = typeof doctorReviews.$inferSelect;
export type InsertDoctorReview = z.infer<typeof insertDoctorReviewSchema>;

export type ContactImport = typeof contactImports.$inferSelect;
export type InsertContactImport = z.infer<typeof insertContactImportSchema>;

export type SocialNotification = typeof socialNotifications.$inferSelect;
export type InsertSocialNotification = z.infer<typeof insertSocialNotificationSchema>;
