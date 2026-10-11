export type UserRole = 'patient' | 'receptionist' | 'doctor' | 'admin';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  status: 'active' | 'inactive';
  avatar?: string;
  phone?: string;
  departmentId?: string;
  patientId?: string;
  doctorId?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  primaryPhone: string;
  secondaryPhone?: string;
  age: number;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  registrationDate: string;
  lastVisit: string;
  diagnosisHistoryCompleted: boolean;
  chronicConditions?: string[];
  allergies?: string[];
}

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  departmentId: string;
  departmentName: string;
  roomAssigned: string;
  shiftDefault: 'Shift 1' | 'Shift 2' | 'Both';
  consultationFee: number; // in INR
  experienceYears: number;
  rating: number;
  qualifications: string;
  status: 'Active' | 'On Leave';
  avatar?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headDoctorId: string;
  headDoctorName: string;
  status: 'Active' | 'Inactive';
  roomCount: number;
  iconName: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  departmentId: string;
  departmentName: string;
  type: 'Consultation' | 'Examination' | 'Procedure';
  status: 'Available' | 'Occupied' | 'Maintenance';
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  shift: 'Shift 1' | 'Shift 2';
  roomNumber: string;
  isHoliday: boolean;
  holidayReason?: string;
}

export interface DoctorLeave {
  id: string;
  doctorId: string;
  doctorName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending';
}

export type AppointmentStatus = 
  | 'Pending Approval' 
  | 'Confirmed' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Rejected' 
  | 'No-show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  departmentId: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 AM - 10:00 AM"
  reason: string;
  consultationFee: number;
  bookingCharge: number;
  bookingChargePercentage: number;
  chargeStatus: 'Recorded (Unpaid)' | 'Collected at Clinic' | 'Waived';
  status: AppointmentStatus;
  bookedBy: 'Patient' | 'Receptionist';
  isEmergencyCancellation?: boolean;
  cancelReason?: string;
  cancelledBy?: 'Patient' | 'Receptionist';
  cancelledAt?: string;
  rejectionReason?: string;
  rejectionAt?: string;
  refundEligibility?: string;
  notes?: string;
  followUpRecommended?: string;
  diagnosis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  consultationDate: string;
  symptomsSummary: string;
  diagnosis: string;
  prescriptions: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  clinicalNotes: string;
  followUpRecommendation: string;
  authorizedForPatient: boolean;
  createdAt: string;
}

export interface SymptomEntry {
  id: string;
  clientEntryId: string; // client UUID for offline deduping
  patientId: string;
  patientName: string;
  appointmentId?: string;
  symptoms: string[];
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  observations: string;
  enteredBy: string;
  enteredAt: string;
  isOfflineCreated?: boolean;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'failed';
  conflictDetails?: string;
}

export interface MedicalFile {
  id: string;
  patientId: string;
  patientName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category: 'Lab Report' | 'Imaging / X-Ray' | 'Prescription' | 'Discharge Summary' | 'Specialist Note';
  uploadDate: string;
  uploadedBy: string;
  encryptionStatus: 'Encrypted (AES-256 Mock)';
  accessLevel: 'Doctor Only (Assigned)';
  mockDecryptedContent?: string;
}

export interface DoctorPatientMap {
  mapId: string;
  doctorId: string;
  patientId: string;
  active: boolean;
  mappedAt: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: UserRole | 'all';
  recipientUserId?: string;
  title: string;
  message: string;
  category: 'appointment_request' | 'approval' | 'rejection' | 'cancellation' | 'schedule_change' | 'system';
  appointmentId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: 
    | 'LOGIN' 
    | 'LOGOUT' 
    | 'APPOINTMENT_REQUEST' 
    | 'APPOINTMENT_APPROVED' 
    | 'APPOINTMENT_REJECTED' 
    | 'APPOINTMENT_CANCELLED' 
    | 'EMERGENCY_CANCELLATION' 
    | 'SCHEDULE_CHANGED' 
    | 'FILE_UPLOADED' 
    | 'FILE_ACCESS_AUTHORIZED' 
    | 'FILE_ACCESS_DENIED' 
    | 'SYMPTOM_OFFLINE_SYNC' 
    | 'CONFIG_UPDATED' 
    | 'USER_STATUS_CHANGE';
  entity: 'Appointment' | 'MedicalFile' | 'Schedule' | 'Config' | 'User' | 'Symptom' | 'Auth';
  entityId: string;
  result: 'SUCCESS' | 'DENIED' | 'CONFLICT' | 'WARNING';
  details: string;
}

export interface SystemConfig {
  bookingChargePercentage: number;
  cancellationCutOffHours: number;
  sessionTimeoutMinutes: number;
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
  clinicEmail: string;
  operatingHours: string;
  slotDurationMinutes: number;
  shift1Timing: string;
  shift2Timing: string;
  emergencyCancellationFeeRefundablePercent: number;
  backupPolicy: string;
}

export interface CallLogItem {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  callType: 'Cancellation Notice' | 'Reschedule Assistance' | 'Follow-up Check';
  notes: string;
  callStatus: 'Completed' | 'Unreachable' | 'Left Voicemail';
  loggedBy: string;
  timestamp: string;
}
