import { 
  users,
  User,
  InsertUser,
  specialties,
  Specialty,
  InsertSpecialty,
  doctorProfiles,
  DoctorProfile,
  InsertDoctorProfile,
  doctorVerificationDocuments,
  DoctorVerificationDocument,
  InsertDoctorVerificationDocument,
  doctorVerificationHistory,
  DoctorVerificationHistory,
  InsertDoctorVerificationHistory,
  patientProfiles,
  PatientProfile,
  InsertPatientProfile,
  appointments,
  Appointment,
  InsertAppointment,
  medicalRecords,
  MedicalRecord,
  InsertMedicalRecord,
  patientDocuments,
  PatientDocument,
  InsertPatientDocument,
  laboratories,
  Laboratory,
  InsertLaboratory,
  labTestCatalog,
  LabTestCatalog,
  InsertLabTestCatalog,
  labCommissions,
  LabCommission,
  InsertLabCommission,
  subscriptionPlans,
  SubscriptionPlan,
  InsertSubscriptionPlan,
  userSubscriptions,
  UserSubscription,
  InsertUserSubscription,
  prescriptions,
  Prescription,
  InsertPrescription,
  labTestResults,
  LabTestResult,
  InsertLabTestResult,
  healthMetrics,
  HealthMetric,
  InsertHealthMetric,
  doctorVerificationDocuments,
  DoctorVerificationDocument,
  InsertDoctorVerificationDocument,
  doctorVerificationHistory,
  DoctorVerificationHistory,
  InsertDoctorVerificationHistory,
  chatConversations,
  ChatConversation,
  InsertChatConversation,
  chatMessages,
  ChatMessage,
  InsertChatMessage,
  chatNotifications,
  ChatNotification,
  InsertChatNotification,
  UserType 
} from "@shared/schema";
import session from "express-session";
// Exportación de DatabaseStorage
export { DatabaseStorage } from './databaseStorage';
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define Storage Interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsersByType(userType: string): Promise<User[]>;
  
  // Specialty operations
  getSpecialty(id: number): Promise<Specialty | undefined>;
  getSpecialtyByName(name: string): Promise<Specialty | undefined>;
  getAllSpecialties(): Promise<Specialty[]>;
  createSpecialty(specialty: InsertSpecialty): Promise<Specialty>;
  
  // Doctor Profile operations
  getDoctorProfile(id: number): Promise<DoctorProfile | undefined>;
  getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined>;
  getAllDoctorProfiles(): Promise<DoctorProfile[]>;
  createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile>;
  updateDoctorProfile(id: number, profile: Partial<DoctorProfile>): Promise<DoctorProfile | undefined>;
  
  // Patient Profile operations
  getPatientProfile(id: number): Promise<PatientProfile | undefined>;
  getPatientProfileByUserId(userId: number): Promise<PatientProfile | undefined>;
  createPatientProfile(profile: InsertPatientProfile): Promise<PatientProfile>;
  updatePatientProfile(id: number, profile: Partial<PatientProfile>): Promise<PatientProfile | undefined>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  getAppointmentsByDoctorAndPatient(doctorId: number, patientId: number): Promise<Appointment[]>;
  getAppointmentsBetweenUsers(doctorId: number, patientId: number, status?: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Medical Record operations
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  
  // Patient Document operations
  getPatientDocument(id: number): Promise<PatientDocument | undefined>;
  getPatientDocumentsByPatient(patientId: number): Promise<PatientDocument[]>;
  createPatientDocument(document: InsertPatientDocument): Promise<PatientDocument>;
  
  // Laboratory operations
  getLaboratory(id: number): Promise<Laboratory | undefined>;
  getAllLaboratories(): Promise<Laboratory[]>;
  createLaboratory(laboratory: InsertLaboratory): Promise<Laboratory>;
  updateLaboratory(id: number, laboratory: Partial<Laboratory>): Promise<Laboratory | undefined>;
  
  // Lab Test Catalog operations
  getLabTest(id: number): Promise<LabTestCatalog | undefined>;
  getLabTestByName(name: string): Promise<LabTestCatalog | undefined>;
  getAllLabTests(): Promise<LabTestCatalog[]>;
  getLabTestsByCategory(category: string): Promise<LabTestCatalog[]>;
  createLabTest(test: InsertLabTestCatalog): Promise<LabTestCatalog>;
  updateLabTest(id: number, test: Partial<LabTestCatalog>): Promise<LabTestCatalog | undefined>;
  
  // Lab Commission operations
  getLabCommission(id: number): Promise<LabCommission | undefined>;
  getLabCommissionsByDoctor(doctorId: number): Promise<LabCommission[]>;
  createLabCommission(commission: InsertLabCommission): Promise<LabCommission>;
  updateLabCommissionStatus(id: number, status: string): Promise<LabCommission | undefined>;
  
  // Subscription Plan operations
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  
  // User Subscription operations
  getUserSubscription(id: number): Promise<UserSubscription | undefined>;
  getUserSubscriptionByUserId(userId: number): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: number, subscription: Partial<UserSubscription>): Promise<UserSubscription | undefined>;
  cancelUserSubscription(id: number): Promise<UserSubscription | undefined>;
  
  // Prescription operations
  getPrescription(id: number): Promise<Prescription | undefined>;
  getPrescriptionsByDoctor(doctorId: number): Promise<Prescription[]>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescriptionData: Partial<Prescription>): Promise<Prescription | undefined>;
  
  // Medication Catalog operations
  getMedication(id: number): Promise<MedicationCatalog | undefined>;
  getMedicationByName(name: string): Promise<MedicationCatalog | undefined>;
  searchMedicationsByName(searchTerm: string): Promise<MedicationCatalog[]>;
  searchMedicationsByActiveIngredient(searchTerm: string): Promise<MedicationCatalog[]>;
  getAllMedications(limit?: number, offset?: number): Promise<MedicationCatalog[]>;
  getMedicationsByCategory(category: string): Promise<MedicationCatalog[]>;
  createMedication(medication: InsertMedicationCatalog): Promise<MedicationCatalog>;
  updateMedication(id: number, medicationData: Partial<MedicationCatalog>): Promise<MedicationCatalog | undefined>;
  seedMedicationCatalog(): Promise<void>;
  
  // Lab Test Result operations
  getLabTestResult(id: number): Promise<LabTestResult | undefined>;
  getLabTestResultsByCommission(commissionId: number): Promise<LabTestResult[]>;
  getLabTestResultsForDoctor(doctorId: number): Promise<LabTestResult[]>;
  getLabTestResultsForPatient(patientId: number): Promise<LabTestResult[]>;
  createLabTestResult(result: InsertLabTestResult): Promise<LabTestResult>;
  getLabTestResultById(id: number): Promise<LabTestResult | undefined>;
  updateLabTestResultReview(id: number, reviewData: any): Promise<LabTestResult | undefined>;
  
  // Operaciones adicionales para el módulo de laboratorio
  getLabTests(category?: string): Promise<LabTestCatalog[]>;
  getLabTestById(id: number): Promise<LabTestCatalog | undefined>;
  getLaboratories(onlyActive?: boolean): Promise<Laboratory[]>;
  getLaboratoryById(id: number): Promise<Laboratory | undefined>;
  getLabCommissionById(id: number): Promise<any>;
  getLabCommissionsByPatient(patientId: number): Promise<any[]>;
  markLabTestResultAsRead(id: number): Promise<LabTestResult | undefined>;
  addDoctorReviewToLabTestResult(id: number, doctorId: number, comments: string): Promise<LabTestResult | undefined>;
  
  // Health Metrics operations
  getHealthMetric(id: number): Promise<HealthMetric | undefined>;
  getHealthMetricsByPatient(patientId: number): Promise<HealthMetric[]>;
  getHealthMetricsByPatientAndType(patientId: number, metricType: string): Promise<HealthMetric[]>;
  createHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  
  // Doctor Verification operations
  getDoctorVerificationDocuments(doctorId: number): Promise<DoctorVerificationDocument[]>;
  createDoctorVerificationDocument(document: InsertDoctorVerificationDocument): Promise<DoctorVerificationDocument>;
  updateDoctorVerificationDocument(id: number, isVerified: boolean, notes?: string | null): Promise<DoctorVerificationDocument | undefined>;
  updateDoctorVerificationStatus(doctorId: number, status: "pending" | "approved" | "rejected", reviewerId?: number, comments?: string): Promise<DoctorProfile | undefined>;
  getDoctorVerificationHistory(doctorId: number): Promise<DoctorVerificationHistory[]>;
  createDoctorVerificationHistory(history: InsertDoctorVerificationHistory): Promise<DoctorVerificationHistory>;
  
  // Chat Conversations operations
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  getChatConversationsByDoctor(doctorId: number): Promise<ChatConversation[]>;
  getChatConversationsByPatient(patientId: number): Promise<ChatConversation[]>;
  getChatConversationByUsers(doctorId: number, patientId: number): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(id: number, conversation: Partial<ChatConversation>): Promise<ChatConversation | undefined>;
  
  // Chat Messages operations
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  getChatMessagesByConversation(conversationId: number, limit?: number, before?: Date): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateChatMessage(id: number, message: Partial<ChatMessage>): Promise<ChatMessage | undefined>;
  getUnreadMessagesCount(conversationId: number, userId: number): Promise<number>;
  
  // Chat Notifications operations
  getChatNotification(id: number): Promise<ChatNotification | undefined>;
  getChatNotificationsByUser(userId: number): Promise<ChatNotification[]>;
  createChatNotification(notification: InsertChatNotification): Promise<ChatNotification>;
  markChatNotificationAsRead(messageId: number, userId: number): Promise<ChatNotification | undefined>;
  getUnreadNotificationsCount(userId: number): Promise<number>;

  // Session store
  sessionStore: any; // sessionStore puede ser de cualquier tipo que implemente la interfaz básica
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private specialties: Map<number, Specialty>;
  private doctorProfiles: Map<number, DoctorProfile>;
  private patientProfiles: Map<number, PatientProfile>;
  private appointments: Map<number, Appointment>;
  private medicalRecords: Map<number, MedicalRecord>;
  private patientDocuments: Map<number, PatientDocument>;
  private laboratories: Map<number, Laboratory>;
  private labTests: Map<number, LabTestCatalog>;
  private labCommissions: Map<number, LabCommission>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private userSubscriptions: Map<number, UserSubscription>;
  private prescriptions: Map<number, Prescription>;
  private labTestResults: Map<number, LabTestResult>;
  private healthMetrics: Map<number, HealthMetric>;
  private doctorVerificationDocuments: Map<number, DoctorVerificationDocument>;
  private doctorVerificationHistory: Map<number, DoctorVerificationHistory>;
  private chatConversations: Map<number, ChatConversation>;
  private chatMessages: Map<number, ChatMessage>;
  private chatNotifications: Map<number, ChatNotification>;
  
  sessionStore: any;
  
  // ID counters for generating IDs
  currentUserId: number;
  currentSpecialtyId: number;
  currentDoctorProfileId: number;
  currentPatientProfileId: number;
  currentAppointmentId: number;
  currentMedicalRecordId: number;
  currentPatientDocumentId: number;
  currentLaboratoryId: number;
  currentLabTestId: number;
  currentLabCommissionId: number;
  currentSubscriptionPlanId: number;
  currentUserSubscriptionId: number;
  currentPrescriptionId: number;
  currentLabTestResultId: number;
  currentHealthMetricId: number;
  currentDoctorVerificationDocumentId: number;
  currentDoctorVerificationHistoryId: number;
  currentChatConversationId: number;
  currentChatMessageId: number;
  currentChatNotificationId: number;

  constructor() {
    this.users = new Map();
    this.specialties = new Map();
    this.doctorProfiles = new Map();
    this.patientProfiles = new Map();
    this.appointments = new Map();
    this.medicalRecords = new Map();
    this.patientDocuments = new Map();
    this.laboratories = new Map();
    this.labTests = new Map();
    this.labCommissions = new Map();
    this.subscriptionPlans = new Map();
    this.userSubscriptions = new Map();
    this.prescriptions = new Map();
    this.labTestResults = new Map();
    this.healthMetrics = new Map();
    this.doctorVerificationDocuments = new Map();
    this.doctorVerificationHistory = new Map();
    this.chatConversations = new Map();
    this.chatMessages = new Map();
    this.chatNotifications = new Map();
    
    this.currentUserId = 1;
    this.currentSpecialtyId = 1;
    this.currentDoctorProfileId = 1;
    this.currentPatientProfileId = 1;
    this.currentAppointmentId = 1;
    this.currentMedicalRecordId = 1;
    this.currentPatientDocumentId = 1;
    this.currentLaboratoryId = 1;
    this.currentLabTestId = 1;
    this.currentLabCommissionId = 1;
    this.currentSubscriptionPlanId = 1;
    this.currentUserSubscriptionId = 1;
    this.currentPrescriptionId = 1;
    this.currentLabTestResultId = 1;
    this.currentHealthMetricId = 1;
    this.currentDoctorVerificationDocumentId = 1;
    this.currentDoctorVerificationHistoryId = 1;
    this.currentChatConversationId = 1;
    this.currentChatMessageId = 1;
    this.currentChatNotificationId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with default data
    this.seedSpecialties();
    this.seedLaboratories();
    this.seedLabTests();
  }
  
  // Seed lab tests with COFEPRIS approved tests
  private seedLabTests() {
    const labTests = [
      {
        name: "Biometría Hemática Completa",
        category: "laboratorio",
        description: "Análisis de células sanguíneas",
        normalValues: "Varía según el parámetro",
        units: "Varios",
        preparationInstructions: "Ayuno de 8 horas",
        cofeprisApproved: true
      },
      {
        name: "Química Sanguínea",
        category: "laboratorio",
        description: "Evaluación de glucosa, colesterol, triglicéridos y más",
        normalValues: "Varía según el parámetro",
        units: "mg/dL",
        preparationInstructions: "Ayuno de 12 horas",
        cofeprisApproved: true
      },
      {
        name: "Perfil Tiroideo",
        category: "laboratorio",
        description: "Análisis de hormonas tiroideas",
        normalValues: "T3: 80-200 ng/dL, T4: 5.0-12.0 µg/dL, TSH: 0.3-5.0 µU/mL",
        units: "Varios",
        preparationInstructions: "No requiere ayuno",
        cofeprisApproved: true
      },
      {
        name: "Perfil Hepático",
        category: "laboratorio",
        description: "Evaluación de la función del hígado",
        normalValues: "Varía según el parámetro",
        units: "U/L, mg/dL",
        preparationInstructions: "Ayuno de 8 horas",
        cofeprisApproved: true
      },
      {
        name: "Perfil Renal",
        category: "laboratorio",
        description: "Evaluación de la función renal",
        normalValues: "Creatinina: 0.7-1.3 mg/dL, Urea: 15-45 mg/dL",
        units: "mg/dL",
        preparationInstructions: "Ayuno de 8 horas",
        cofeprisApproved: true
      },
      {
        name: "Radiografía de Tórax",
        category: "imagen",
        description: "Imagen de los pulmones, corazón y costillas",
        normalValues: "Interpretación médica",
        units: "N/A",
        preparationInstructions: "Remover objetos metálicos",
        cofeprisApproved: true
      },
      {
        name: "Tomografía Computarizada",
        category: "imagen",
        description: "Imagen detallada de órganos internos",
        normalValues: "Interpretación médica",
        units: "N/A",
        preparationInstructions: "Varía según la zona a examinar",
        cofeprisApproved: true
      },
      {
        name: "Ultrasonido Abdominal",
        category: "imagen",
        description: "Imagen de órganos abdominales",
        normalValues: "Interpretación médica",
        units: "N/A",
        preparationInstructions: "Ayuno de 6 horas",
        cofeprisApproved: true
      },
      {
        name: "Resonancia Magnética",
        category: "imagen",
        description: "Imagen detallada de tejidos blandos",
        normalValues: "Interpretación médica",
        units: "N/A",
        preparationInstructions: "Remover objetos metálicos",
        cofeprisApproved: true
      }
    ];
    
    labTests.forEach((test) => {
      this.createLabTest(test);
    });
  }

  // Seed some initial data
  private seedSpecialties() {
    const specialties = [
      { name: "Cardiología", description: "Especialistas en el corazón y sistema circulatorio" },
      { name: "Dermatología", description: "Especialistas en la piel" },
      { name: "Neurología", description: "Especialistas en el sistema nervioso" },
      { name: "Pediatría", description: "Especialistas en la salud de los niños" },
      { name: "Psiquiatría", description: "Especialistas en salud mental" },
      { name: "Oftalmología", description: "Especialistas en la visión y los ojos" },
      { name: "Medicina General", description: "Atención médica general" }
    ];
    
    specialties.forEach((spec) => {
      this.createSpecialty(spec);
    });
  }
  
  private seedLaboratories() {
    const labs = [
      { name: "Laboratorio Clínico Nacional", address: "Av. Principal 123", contactInfo: "contacto@labclinico.com" },
      { name: "Diagnósticos Médicos", address: "Calle Central 456", contactInfo: "info@diagmed.com" },
      { name: "Centro de Análisis Médicos", address: "Plaza Mayor 789", contactInfo: "centro@analisismedicos.com" }
    ];
    
    labs.forEach((lab) => {
      this.createLaboratory(lab);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now, isActive: true };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      return undefined;
    }
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getUsersByType(userType: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.userType === userType && user.isActive
    );
  }

  // Specialty methods
  async getSpecialty(id: number): Promise<Specialty | undefined> {
    return this.specialties.get(id);
  }
  
  async getSpecialtyByName(name: string): Promise<Specialty | undefined> {
    return Array.from(this.specialties.values()).find(
      (specialty) => specialty.name === name
    );
  }
  
  async getAllSpecialties(): Promise<Specialty[]> {
    return Array.from(this.specialties.values());
  }
  
  async createSpecialty(insertSpecialty: InsertSpecialty): Promise<Specialty> {
    const id = this.currentSpecialtyId++;
    const specialty: Specialty = { ...insertSpecialty, id };
    this.specialties.set(id, specialty);
    return specialty;
  }

  // Doctor Profile methods
  async getDoctorProfile(id: number): Promise<DoctorProfile | undefined> {
    return this.doctorProfiles.get(id);
  }
  
  async getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined> {
    return Array.from(this.doctorProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async getAllDoctorProfiles(): Promise<DoctorProfile[]> {
    return Array.from(this.doctorProfiles.values());
  }
  
  async createDoctorProfile(insertProfile: InsertDoctorProfile): Promise<DoctorProfile> {
    const id = this.currentDoctorProfileId++;
    const profile: DoctorProfile = { ...insertProfile, id };
    this.doctorProfiles.set(id, profile);
    return profile;
  }
  
  async updateDoctorProfile(id: number, profileData: Partial<DoctorProfile>): Promise<DoctorProfile | undefined> {
    const existingProfile = await this.getDoctorProfile(id);
    if (!existingProfile) {
      return undefined;
    }
    
    const updatedProfile = { ...existingProfile, ...profileData };
    this.doctorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Patient Profile methods
  async getPatientProfile(id: number): Promise<PatientProfile | undefined> {
    return this.patientProfiles.get(id);
  }
  
  async getPatientProfileByUserId(userId: number): Promise<PatientProfile | undefined> {
    return Array.from(this.patientProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async createPatientProfile(insertProfile: InsertPatientProfile): Promise<PatientProfile> {
    const id = this.currentPatientProfileId++;
    const profile: PatientProfile = { ...insertProfile, id };
    this.patientProfiles.set(id, profile);
    return profile;
  }
  
  async updatePatientProfile(id: number, profileData: Partial<PatientProfile>): Promise<PatientProfile | undefined> {
    const existingProfile = await this.getPatientProfile(id);
    if (!existingProfile) {
      return undefined;
    }
    
    const updatedProfile = { ...existingProfile, ...profileData };
    this.patientProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId
    );
  }
  
  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId
    );
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const now = new Date();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      status: "scheduled", 
      createdAt: now 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const existingAppointment = await this.getAppointment(id);
    if (!existingAppointment) {
      return undefined;
    }
    
    const updatedAppointment = { ...existingAppointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Medical Record methods
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }
  
  async getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(
      (record) => record.patientId === patientId
    );
  }
  
  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.currentMedicalRecordId++;
    const now = new Date();
    const record: MedicalRecord = { ...insertRecord, id, createdAt: now };
    this.medicalRecords.set(id, record);
    return record;
  }

  // Patient Document methods
  async getPatientDocument(id: number): Promise<PatientDocument | undefined> {
    return this.patientDocuments.get(id);
  }
  
  async getPatientDocumentsByPatient(patientId: number): Promise<PatientDocument[]> {
    return Array.from(this.patientDocuments.values()).filter(
      (document) => document.patientId === patientId
    );
  }
  
  async createPatientDocument(insertDocument: InsertPatientDocument): Promise<PatientDocument> {
    const id = this.currentPatientDocumentId++;
    const now = new Date();
    const document: PatientDocument = { ...insertDocument, id, uploadedAt: now };
    this.patientDocuments.set(id, document);
    return document;
  }

  // Laboratory methods
  async getLaboratory(id: number): Promise<Laboratory | undefined> {
    return this.laboratories.get(id);
  }
  
  async getAllLaboratories(): Promise<Laboratory[]> {
    return Array.from(this.laboratories.values());
  }
  
  async createLaboratory(insertLaboratory: InsertLaboratory): Promise<Laboratory> {
    const id = this.currentLaboratoryId++;
    const laboratory: Laboratory = { ...insertLaboratory, id, isActive: true };
    this.laboratories.set(id, laboratory);
    return laboratory;
  }
  
  async updateLaboratory(id: number, laboratoryData: Partial<Laboratory>): Promise<Laboratory | undefined> {
    const existingLaboratory = await this.getLaboratory(id);
    if (!existingLaboratory) {
      return undefined;
    }
    
    const updatedLaboratory = { ...existingLaboratory, ...laboratoryData };
    this.laboratories.set(id, updatedLaboratory);
    return updatedLaboratory;
  }
  
  // Lab Test Catalog methods
  async getLabTest(id: number): Promise<LabTestCatalog | undefined> {
    return this.labTests.get(id);
  }
  
  async getLabTestByName(name: string): Promise<LabTestCatalog | undefined> {
    return Array.from(this.labTests.values()).find(
      (test) => test.name === name
    );
  }
  
  async getAllLabTests(): Promise<LabTestCatalog[]> {
    return Array.from(this.labTests.values()).filter(
      (test) => test.isActive
    );
  }
  
  async getLabTestsByCategory(category: string): Promise<LabTestCatalog[]> {
    return Array.from(this.labTests.values()).filter(
      (test) => test.category === category && test.isActive
    );
  }
  
  async createLabTest(test: InsertLabTestCatalog): Promise<LabTestCatalog> {
    const id = this.currentLabTestId++;
    const now = new Date();
    const labTest: LabTestCatalog = { 
      ...test, 
      id, 
      isActive: true, 
      createdAt: now 
    };
    this.labTests.set(id, labTest);
    return labTest;
  }
  
  async updateLabTest(id: number, testData: Partial<LabTestCatalog>): Promise<LabTestCatalog | undefined> {
    const existingTest = await this.getLabTest(id);
    if (!existingTest) {
      return undefined;
    }
    
    const updatedTest = { ...existingTest, ...testData };
    this.labTests.set(id, updatedTest);
    return updatedTest;
  }

  // Lab Commission methods
  async getLabCommission(id: number): Promise<LabCommission | undefined> {
    return this.labCommissions.get(id);
  }
  
  async getLabCommissionsByDoctor(doctorId: number): Promise<LabCommission[]> {
    return Array.from(this.labCommissions.values()).filter(
      (commission) => commission.doctorId === doctorId
    );
  }
  
  async createLabCommission(insertCommission: InsertLabCommission): Promise<LabCommission> {
    const id = this.currentLabCommissionId++;
    const now = new Date();
    const commission: LabCommission = { 
      ...insertCommission, 
      id, 
      status: "pending", 
      createdAt: now 
    };
    this.labCommissions.set(id, commission);
    return commission;
  }
  
  async updateLabCommissionStatus(id: number, status: string): Promise<LabCommission | undefined> {
    const existingCommission = await this.getLabCommission(id);
    if (!existingCommission) {
      return undefined;
    }
    
    const updatedCommission = { ...existingCommission, status };
    this.labCommissions.set(id, updatedCommission);
    return updatedCommission;
  }
  
  // Subscription Plan methods
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }
  
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }
  
  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values()).filter(
      (plan) => plan.isActive
    );
  }
  
  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentSubscriptionPlanId++;
    const subscriptionPlan: SubscriptionPlan = { 
      ...plan, 
      id,
      isActive: true
    };
    this.subscriptionPlans.set(id, subscriptionPlan);
    return subscriptionPlan;
  }
  
  async updateSubscriptionPlan(id: number, planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const existingPlan = await this.getSubscriptionPlan(id);
    if (!existingPlan) {
      return undefined;
    }
    
    const updatedPlan = { ...existingPlan, ...planData };
    this.subscriptionPlans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  // User Subscription methods
  async getUserSubscription(id: number): Promise<UserSubscription | undefined> {
    return this.userSubscriptions.get(id);
  }
  
  async getUserSubscriptionByUserId(userId: number): Promise<UserSubscription | undefined> {
    return Array.from(this.userSubscriptions.values()).find(
      (subscription) => subscription.userId === userId && subscription.status === "active"
    );
  }
  
  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const id = this.currentUserSubscriptionId++;
    const userSubscription: UserSubscription = { 
      ...subscription, 
      id,
      status: "active"
    };
    this.userSubscriptions.set(id, userSubscription);
    return userSubscription;
  }
  
  async updateUserSubscription(id: number, subscriptionData: Partial<UserSubscription>): Promise<UserSubscription | undefined> {
    const existingSubscription = await this.getUserSubscription(id);
    if (!existingSubscription) {
      return undefined;
    }
    
    const updatedSubscription = { ...existingSubscription, ...subscriptionData };
    this.userSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  async cancelUserSubscription(id: number): Promise<UserSubscription | undefined> {
    const existingSubscription = await this.getUserSubscription(id);
    if (!existingSubscription) {
      return undefined;
    }
    
    const updatedSubscription = { 
      ...existingSubscription, 
      status: "cancelled",
      autoRenew: false
    };
    this.userSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Prescription methods
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }
  
  async getPrescriptionsByDoctor(doctorId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(
      (prescription) => prescription.doctorId === doctorId
    );
  }
  
  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(
      (prescription) => prescription.patientId === patientId
    );
  }
  
  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = this.currentPrescriptionId++;
    const now = new Date();
    const prescription: Prescription = { 
      ...insertPrescription, 
      id, 
      createdAt: now 
    };
    this.prescriptions.set(id, prescription);
    return prescription;
  }
  
  // Lab Test Result methods
  async getLabTestResult(id: number): Promise<LabTestResult | undefined> {
    return this.labTestResults.get(id);
  }
  
  async getLabTestResultsByCommission(commissionId: number): Promise<LabTestResult[]> {
    return Array.from(this.labTestResults.values()).filter(
      (result) => result.commissionId === commissionId
    );
  }
  
  async getLabTestResultsForDoctor(doctorId: number): Promise<LabTestResult[]> {
    // Primero obtenemos todas las órdenes de laboratorio asociadas con este doctor
    const doctorCommissions = await this.getLabCommissionsByDoctor(doctorId);
    const commissionIds = doctorCommissions.map(commission => commission.id);
    
    // Luego filtramos los resultados por esas órdenes
    return Array.from(this.labTestResults.values()).filter(
      (result) => commissionIds.includes(result.commissionId)
    );
  }
  
  async getLabTestResultsForPatient(patientId: number): Promise<LabTestResult[]> {
    // Primero obtenemos todas las órdenes de laboratorio asociadas con este paciente
    const commissions = Array.from(this.labCommissions.values()).filter(
      (commission) => commission.patientId === patientId
    );
    const commissionIds = commissions.map(commission => commission.id);
    
    // Luego filtramos los resultados por esas órdenes
    return Array.from(this.labTestResults.values()).filter(
      (result) => commissionIds.includes(result.commissionId)
    );
  }
  
  async createLabTestResult(insertResult: InsertLabTestResult): Promise<LabTestResult> {
    const id = this.currentLabTestResultId++;
    const now = new Date();
    const result: LabTestResult = { 
      ...insertResult, 
      id, 
      createdAt: now,
      isRead: false,
      reviewedByDoctorId: null,
      reviewDate: null,
      doctorComments: null
    };
    this.labTestResults.set(id, result);
    return result;
  }
  
  async markLabTestResultAsRead(id: number): Promise<LabTestResult | undefined> {
    const existingResult = await this.getLabTestResult(id);
    if (!existingResult) {
      return undefined;
    }
    
    const updatedResult = { ...existingResult, isRead: true };
    this.labTestResults.set(id, updatedResult);
    return updatedResult;
  }
  
  async addDoctorReviewToLabTestResult(id: number, doctorId: number, comments: string): Promise<LabTestResult | undefined> {
    const existingResult = await this.getLabTestResult(id);
    if (!existingResult) {
      return undefined;
    }
    
    const now = new Date();
    const updatedResult = { 
      ...existingResult, 
      reviewedByDoctorId: doctorId,
      reviewDate: now,
      doctorComments: comments,
      isRead: true
    };
    this.labTestResults.set(id, updatedResult);
    return updatedResult;
  }

  // Health Metrics methods
  private healthMetrics: Map<number, HealthMetric> = new Map();
  private currentHealthMetricId: number = 1;
  
  async getHealthMetric(id: number): Promise<HealthMetric | undefined> {
    return this.healthMetrics.get(id);
  }
  
  async getHealthMetricsByPatient(patientId: number): Promise<HealthMetric[]> {
    return Array.from(this.healthMetrics.values()).filter(
      (metric) => metric.patientId === patientId
    );
  }
  
  async getHealthMetricsByPatientAndType(patientId: number, metricType: string): Promise<HealthMetric[]> {
    // metricType puede ser 'bloodPressure', 'heartRate', 'temperature', 'weight', 'oxygenSaturation', 'glucose'
    return Array.from(this.healthMetrics.values()).filter(
      (metric) => metric.patientId === patientId && 
      ((metricType === 'bloodPressure' && (metric.bloodPressureSystolic || metric.bloodPressureDiastolic)) ||
      (metricType === 'heartRate' && metric.heartRate) ||
      (metricType === 'temperature' && metric.temperature) ||
      (metricType === 'weight' && metric.weight) ||
      (metricType === 'oxygenSaturation' && metric.oxygenSaturation) ||
      (metricType === 'glucose' && metric.glucose))
    );
  }
  
  async createHealthMetric(insertMetric: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.currentHealthMetricId++;
    const now = new Date();
    const metric: HealthMetric = { 
      ...insertMetric, 
      id, 
      createdAt: now
    };
    this.healthMetrics.set(id, metric);
    return metric;
  }

  // Doctor Verification Document methods
  async getDoctorVerificationDocuments(doctorId: number): Promise<DoctorVerificationDocument[]> {
    return Array.from(this.doctorVerificationDocuments.values()).filter(
      (document) => document.doctorId === doctorId
    );
  }
  
  async createDoctorVerificationDocument(insertDocument: InsertDoctorVerificationDocument): Promise<DoctorVerificationDocument> {
    const id = this.currentDoctorVerificationDocumentId++;
    const now = new Date();
    const document: DoctorVerificationDocument = { 
      ...insertDocument, 
      id, 
      submittedAt: now,
      status: "pending",
      reviewedAt: null,
      reviewerId: null,
      notes: insertDocument.notes || null 
    };
    this.doctorVerificationDocuments.set(id, document);
    return document;
  }
  
  async updateDoctorVerificationDocument(id: number, status: "pending" | "approved" | "rejected", reviewerId?: number, notes?: string | null): Promise<DoctorVerificationDocument | undefined> {
    const existingDocument = this.doctorVerificationDocuments.get(id);
    if (!existingDocument) {
      return undefined;
    }
    
    const now = new Date();
    const updatedDocument = { 
      ...existingDocument, 
      status,
      reviewedAt: now,
      reviewerId: reviewerId || null,
      notes: notes || existingDocument.notes
    };
    this.doctorVerificationDocuments.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async updateDoctorVerificationStatus(doctorId: number, status: "pending" | "approved" | "rejected", reviewerId?: number, comments?: string): Promise<DoctorProfile | undefined> {
    const doctorProfile = await this.getDoctorProfileByUserId(doctorId);
    if (!doctorProfile) {
      return undefined;
    }
    
    const updatedProfile = { 
      ...doctorProfile, 
      verificationStatus: status
    };
    this.doctorProfiles.set(doctorProfile.id, updatedProfile);
    
    // Create verification history entry
    const history: InsertDoctorVerificationHistory = {
      doctorId,
      status,
      reviewerId: reviewerId || null,
      comments: comments || null
    };
    await this.createDoctorVerificationHistory(history);
    
    return updatedProfile;
  }
  
  async getDoctorVerificationHistory(doctorId: number): Promise<DoctorVerificationHistory[]> {
    return Array.from(this.doctorVerificationHistory.values())
      .filter(entry => entry.doctorId === doctorId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  
  async createDoctorVerificationHistory(insertHistory: InsertDoctorVerificationHistory): Promise<DoctorVerificationHistory> {
    const id = this.currentDoctorVerificationHistoryId++;
    const now = new Date();
    const history: DoctorVerificationHistory = { 
      ...insertHistory, 
      id, 
      updatedAt: now
    };
    this.doctorVerificationHistory.set(id, history);
    return history;
  }

  // Chat Conversation methods
  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    return this.chatConversations.get(id);
  }

  async getChatConversationsByDoctor(doctorId: number): Promise<ChatConversation[]> {
    return Array.from(this.chatConversations.values()).filter(
      (conversation) => conversation.doctorId === doctorId
    );
  }

  async getChatConversationsByPatient(patientId: number): Promise<ChatConversation[]> {
    return Array.from(this.chatConversations.values()).filter(
      (conversation) => conversation.patientId === patientId
    );
  }

  async getChatConversationByUsers(doctorId: number, patientId: number): Promise<ChatConversation | undefined> {
    return Array.from(this.chatConversations.values()).find(
      (conversation) => conversation.doctorId === doctorId && conversation.patientId === patientId
    );
  }

  async createChatConversation(insertConversation: InsertChatConversation): Promise<ChatConversation> {
    const id = this.currentChatConversationId++;
    const now = new Date();
    const conversation: ChatConversation = { 
      ...insertConversation, 
      id, 
      createdAt: now, 
      updatedAt: now,
      lastMessageAt: now
    };
    this.chatConversations.set(id, conversation);
    return conversation;
  }

  async updateChatConversation(id: number, conversationData: Partial<ChatConversation>): Promise<ChatConversation | undefined> {
    const existingConversation = await this.getChatConversation(id);
    if (!existingConversation) {
      return undefined;
    }
    
    const updatedConversation = { ...existingConversation, ...conversationData };
    this.chatConversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Chat Message methods
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }

  async getChatMessagesByConversation(conversationId: number, limit: number = 50, before?: Date): Promise<ChatMessage[]> {
    let messages = Array.from(this.chatMessages.values()).filter(
      (message) => message.conversationId === conversationId
    );
    
    if (before) {
      messages = messages.filter(message => message.createdAt < before);
    }
    
    // Sort by createdAt in descending order (newest first)
    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Apply limit
    if (messages.length > limit) {
      messages = messages.slice(0, limit);
    }
    
    return messages;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const now = new Date();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      createdAt: now,
      isRead: false,
      isDelivered: false
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async updateChatMessage(id: number, messageData: Partial<ChatMessage>): Promise<ChatMessage | undefined> {
    const existingMessage = await this.getChatMessage(id);
    if (!existingMessage) {
      return undefined;
    }
    
    const updatedMessage = { ...existingMessage, ...messageData };
    this.chatMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getUnreadMessagesCount(conversationId: number, userId: number): Promise<number> {
    const messages = Array.from(this.chatMessages.values()).filter(
      (message) => message.conversationId === conversationId && 
                   message.senderId !== userId && 
                   !message.isRead
    );
    
    return messages.length;
  }

  // Chat Notification methods
  async getChatNotification(id: number): Promise<ChatNotification | undefined> {
    return this.chatNotifications.get(id);
  }

  async getChatNotificationsByUser(userId: number): Promise<ChatNotification[]> {
    return Array.from(this.chatNotifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }

  async createChatNotification(insertNotification: InsertChatNotification): Promise<ChatNotification> {
    const id = this.currentChatNotificationId++;
    const now = new Date();
    const notification: ChatNotification = { 
      ...insertNotification, 
      id, 
      createdAt: now,
      isRead: false
    };
    this.chatNotifications.set(id, notification);
    return notification;
  }

  async markChatNotificationAsRead(messageId: number, userId: number): Promise<ChatNotification | undefined> {
    const notification = Array.from(this.chatNotifications.values()).find(
      (notification) => notification.messageId === messageId && notification.userId === userId
    );
    
    if (!notification) {
      return undefined;
    }
    
    const updatedNotification = { ...notification, isRead: true };
    this.chatNotifications.set(notification.id, updatedNotification);
    return updatedNotification;
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const notifications = Array.from(this.chatNotifications.values()).filter(
      (notification) => notification.userId === userId && !notification.isRead
    );
    
    return notifications.length;
  }
}

import { DatabaseStorage } from "./databaseStorage";

// Cambia entre almacenamiento en memoria y base de datos
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
