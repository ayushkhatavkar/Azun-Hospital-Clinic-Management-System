import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Department,
  Doctor,
  Room,
  Patient,
  DoctorSchedule,
  DoctorLeave,
  Appointment,
  MedicalRecord,
  SymptomEntry,
  MedicalFile,
  DoctorPatientMap,
  NotificationItem,
  AuditLogItem,
  SystemConfig,
  CallLogItem,
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_DEPARTMENTS,
  INITIAL_ROOMS,
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_SCHEDULES,
  INITIAL_LEAVES,
  INITIAL_APPOINTMENTS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_SYMPTOMS,
  INITIAL_MEDICAL_FILES,
  INITIAL_DOCTOR_PATIENT_MAPS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CALL_LOGS,
} from '../data/mockData';

interface ClinicContextType {
  config: SystemConfig;
  updateConfig: (newConfig: Partial<SystemConfig>) => void;
  departments: Department[];
  addDepartment: (dep: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  doctors: Doctor[];
  addDoctor: (doc: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, data: Partial<Doctor>) => void;
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  patients: Patient[];
  registerPatient: (patientData: Omit<Patient, 'id' | 'registrationDate' | 'lastVisit'>) => { success: boolean; patient?: Patient; error?: string };
  updatePatient: (id: string, data: Partial<Patient>) => void;
  schedules: DoctorSchedule[];
  leaves: DoctorLeave[];
  updateDoctorSchedule: (id: string, data: Partial<DoctorSchedule>) => { affectedAppointmentsCount: number };
  addDoctorLeave: (leave: Omit<DoctorLeave, 'id' | 'status'>) => { affectedAppointmentsCount: number };
  appointments: Appointment[];
  requestAppointment: (data: {
    patientId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    reason: string;
    bookedBy: 'Patient' | 'Receptionist';
  }) => { success: boolean; appointment?: Appointment; error?: string };
  approveAppointment: (appointmentId: string, approvedBy?: string) => { success: boolean; error?: string };
  rejectAppointment: (appointmentId: string, reason: string, rejectedBy?: string) => { success: boolean; error?: string };
  cancelAppointment: (
    appointmentId: string,
    reason: string,
    cancelledByRole: 'Patient' | 'Receptionist',
    isEmergency?: boolean,
    userName?: string
  ) => { success: boolean; error?: string; refundEligibility?: string };
  markNoShow: (appointmentId: string, notes?: string, userName?: string) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTimeSlot: string, userName?: string) => { success: boolean; error?: string };
  completeConsultation: (
    appointmentId: string,
    consultationData: {
      diagnosis: string;
      clinicalNotes: string;
      prescriptions: { medication: string; dosage: string; frequency: string; duration: string }[];
      followUpRecommendation: string;
      authorizedForPatient: boolean;
    },
    doctorName: string
  ) => void;
  medicalRecords: MedicalRecord[];
  symptoms: SymptomEntry[];
  isOfflineSimulated: boolean;
  toggleOfflineSimulation: () => void;
  addSymptomEntry: (entry: {
    patientId: string;
    appointmentId?: string;
    symptoms: string[];
    duration: string;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
    observations: string;
    enteredBy: string;
  }) => SymptomEntry;
  syncOfflineEntries: () => { syncedCount: number; conflictCount: number };
  resolveSymptomConflict: (entryId: string, resolution: 'accept_client' | 'overwrite_server') => void;
  medicalFiles: MedicalFile[];
  uploadMedicalFile: (data: {
    patientId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    category: 'Lab Report' | 'Imaging / X-Ray' | 'Prescription' | 'Discharge Summary' | 'Specialist Note';
    uploadedBy: string;
    mockDecryptedContent?: string;
  }) => MedicalFile;
  viewMedicalFileAuthorized: (fileId: string, doctorId: string, doctorName: string) => { authorized: boolean; content?: string; reason?: string };
  doctorPatientMaps: DoctorPatientMap[];
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  auditLogs: AuditLogItem[];
  addAuditLog: (log: Omit<AuditLogItem, 'id' | 'timestamp'>) => void;
  callLogs: CallLogItem[];
  logCall: (call: Omit<CallLogItem, 'id' | 'timestamp'>) => void;
  resetAllDemoData: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// LocalStorage Keys
const KEYS = {
  CONFIG: 'cms_app_config',
  DEPARTMENTS: 'cms_app_departments',
  DOCTORS: 'cms_app_doctors',
  ROOMS: 'cms_app_rooms',
  PATIENTS: 'cms_app_patients',
  SCHEDULES: 'cms_app_schedules',
  LEAVES: 'cms_app_leaves',
  APPOINTMENTS: 'cms_app_appointments',
  RECORDS: 'cms_app_records',
  SYMPTOMS: 'cms_app_symptoms',
  FILES: 'cms_app_files',
  MAPS: 'cms_app_maps',
  NOTIFS: 'cms_app_notifs',
  AUDIT: 'cms_app_audit',
  CALLS: 'cms_app_calls',
  OFFLINE_SIM: 'cms_offline_sim',
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfig>(() => getStorage(KEYS.CONFIG, INITIAL_CONFIG));
  const [departments, setDepartments] = useState<Department[]>(() => getStorage(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS));
  const [doctors, setDoctors] = useState<Doctor[]>(() => getStorage(KEYS.DOCTORS, INITIAL_DOCTORS));
  const [rooms, setRooms] = useState<Room[]>(() => getStorage(KEYS.ROOMS, INITIAL_ROOMS));
  const [patients, setPatients] = useState<Patient[]>(() => getStorage(KEYS.PATIENTS, INITIAL_PATIENTS));
  const [schedules, setSchedules] = useState<DoctorSchedule[]>(() => getStorage(KEYS.SCHEDULES, INITIAL_SCHEDULES));
  const [leaves, setLeaves] = useState<DoctorLeave[]>(() => getStorage(KEYS.LEAVES, INITIAL_LEAVES));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getStorage(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS));
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => getStorage(KEYS.RECORDS, INITIAL_MEDICAL_RECORDS));
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>(() => getStorage(KEYS.SYMPTOMS, INITIAL_SYMPTOMS));
  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>(() => getStorage(KEYS.FILES, INITIAL_MEDICAL_FILES));
  const [doctorPatientMaps, setDoctorPatientMaps] = useState<DoctorPatientMap[]>(() => getStorage(KEYS.MAPS, INITIAL_DOCTOR_PATIENT_MAPS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStorage(KEYS.NOTIFS, INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => getStorage(KEYS.AUDIT, INITIAL_AUDIT_LOGS));
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(() => getStorage(KEYS.CALLS, INITIAL_CALLS()));
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(() => getStorage(KEYS.OFFLINE_SIM, false));

  function INITIAL_CALLS(): CallLogItem[] {
    return INITIAL_CALL_LOGS;
  }

  // Persistence effects
  useEffect(() => { localStorage.setItem(KEYS.CONFIG, JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem(KEYS.DOCTORS, JSON.stringify(doctors)); }, [doctors]);
  useEffect(() => { localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem(KEYS.LEAVES, JSON.stringify(leaves)); }, [leaves]);
  useEffect(() => { localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem(KEYS.RECORDS, JSON.stringify(medicalRecords)); }, [medicalRecords]);
  useEffect(() => { localStorage.setItem(KEYS.SYMPTOMS, JSON.stringify(symptoms)); }, [symptoms]);
  useEffect(() => { localStorage.setItem(KEYS.FILES, JSON.stringify(medicalFiles)); }, [medicalFiles]);
  useEffect(() => { localStorage.setItem(KEYS.MAPS, JSON.stringify(doctorPatientMaps)); }, [doctorPatientMaps]);
  useEffect(() => { localStorage.setItem(KEYS.NOTIFS, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(KEYS.AUDIT, JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem(KEYS.CALLS, JSON.stringify(callLogs)); }, [callLogs]);
  useEffect(() => { localStorage.setItem(KEYS.OFFLINE_SIM, JSON.stringify(isOfflineSimulated)); }, [isOfflineSimulated]);

  const addAuditLog = (log: Omit<AuditLogItem, 'id' | 'timestamp'>) => {
    const newLog: AuditLogItem = {
      ...log,
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      addAuditLog({
        userId: 'USR-ADM-001',
        userName: 'Administrator',
        role: 'Admin',
        action: 'CONFIG_UPDATED',
        entity: 'Config',
        entityId: 'SYS_CONFIG',
        result: 'SUCCESS',
        details: `System configuration updated: ${Object.keys(newConfig).join(', ')} changed.`,
      });
      return updated;
    });
  };

  // Department Management
  const addDepartment = (dep: Omit<Department, 'id'>) => {
    const id = `DEP-${(departments.length + 1).toString().padStart(3, '0')}`;
    const newDep: Department = { ...dep, id };
    setDepartments(prev => [...prev, newDep]);
  };

  const updateDepartment = (id: string, data: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...data } : d)));
  };

  // Doctor Management
  const addDoctor = (doc: Omit<Doctor, 'id'>) => {
    const id = `DOC-${(doctors.length + 1).toString().padStart(3, '0')}`;
    const newDoc: Doctor = { ...doc, id };
    setDoctors(prev => [...prev, newDoc]);
  };

  const updateDoctor = (id: string, data: Partial<Doctor>) => {
    setDoctors(prev => prev.map(d => (d.id === id ? { ...d, ...data } : d)));
  };

  // Room Management
  const addRoom = (room: Omit<Room, 'id'>) => {
    const id = `RM-${Date.now().toString().slice(-4)}`;
    setRooms(prev => [...prev, { ...room, id }]);
  };

  const updateRoom = (id: string, data: Partial<Room>) => {
    setRooms(prev => prev.map(r => (r.id === id ? { ...r, ...data } : r)));
  };

  // Patient Registration & Update
  const registerPatient = (patientData: Omit<Patient, 'id' | 'registrationDate' | 'lastVisit'>) => {
    const existing = patients.find(p => p.email.toLowerCase() === patientData.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'A patient with this email address already exists in the clinic directory.' };
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const newPatient: Patient = {
      ...patientData,
      id: `PAT-${(patients.length + 1).toString().padStart(3, '0')}`,
      registrationDate: todayStr,
      lastVisit: todayStr,
    };
    setPatients(prev => [newPatient, ...prev]);
    addAuditLog({
      userId: patientData.userId || 'USR-REC-001',
      userName: patientData.fullName,
      role: 'Patient',
      action: 'LOGIN',
      entity: 'User',
      entityId: newPatient.id,
      result: 'SUCCESS',
      details: `New patient registered: ${newPatient.fullName} (${newPatient.primaryPhone}).`,
    });
    return { success: true, patient: newPatient };
  };

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
  };

  // Doctor Schedule Updates & conflict warning
  const updateDoctorSchedule = (id: string, data: Partial<DoctorSchedule>) => {
    const schedule = schedules.find(s => s.id === id);
    let affectedAppointmentsCount = 0;
    if (schedule) {
      const targetDate = data.date || schedule.date;
      affectedAppointmentsCount = appointments.filter(
        a => a.doctorId === schedule.doctorId &&
             a.date === targetDate &&
             (a.status === 'Confirmed' || a.status === 'Pending Approval')
      ).length;
    }
    setSchedules(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
    addAuditLog({
      userId: 'USR-REC-001',
      userName: 'Receptionist / Management',
      role: 'Staff',
      action: 'SCHEDULE_CHANGED',
      entity: 'Schedule',
      entityId: id,
      result: 'SUCCESS',
      details: `Schedule updated. Flagged ${affectedAppointmentsCount} active appointment(s) for review.`,
    });
    return { affectedAppointmentsCount };
  };

  const addDoctorLeave = (leave: Omit<DoctorLeave, 'id' | 'status'>) => {
    const id = `LEV-${Date.now().toString().slice(-4)}`;
    const newLeave: DoctorLeave = { ...leave, id, status: 'Approved' };
    setLeaves(prev => [...prev, newLeave]);

    const affected = appointments.filter(
      a => a.doctorId === leave.doctorId &&
           a.date >= leave.startDate &&
           a.date <= leave.endDate &&
           (a.status === 'Confirmed' || a.status === 'Pending Approval')
    ).length;

    addNotification({
      recipientRole: 'receptionist',
      title: 'Doctor Leave Scheduled',
      message: `${leave.doctorName} leave booked from ${leave.startDate} to ${leave.endDate}. ${affected} appointment(s) may need rescheduling.`,
      category: 'schedule_change',
    });

    return { affectedAppointmentsCount: affected };
  };

  // Appointment Request Flow (Journey 1, 3, FR-06, FR-07, FR-08, FR-10, FR-12)
  const requestAppointment = ({
    patientId,
    doctorId,
    date,
    timeSlot,
    reason,
    bookedBy,
  }: {
    patientId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    reason: string;
    bookedBy: 'Patient' | 'Receptionist';
  }) => {
    const patient = patients.find(p => p.id === patientId);
    const doctor = doctors.find(d => d.id === doctorId);
    const department = departments.find(dep => dep.id === doctor?.departmentId);

    if (!patient || !doctor || !department) {
      return { success: false, error: 'Invalid patient, doctor, or department specified.' };
    }

    // FR-07: Check if doctor is on holiday / leave for that date
    const isHoliday = schedules.some(s => s.doctorId === doctorId && s.date === date && s.isHoliday);
    const isLeave = leaves.some(l => l.doctorId === doctorId && l.status === 'Approved' && date >= l.startDate && date <= l.endDate);
    if (isHoliday || isLeave) {
      return { success: false, error: `Dr. ${doctor.fullName} is unavailable on ${date} due to a scheduled holiday or leave.` };
    }

    // FR-10: Double booking prevention - Pending or Confirmed holds the slot!
    const slotConflict = appointments.some(
      a => a.doctorId === doctorId &&
           a.date === date &&
           a.timeSlot === timeSlot &&
           (a.status === 'Pending Approval' || a.status === 'Confirmed')
    );

    if (slotConflict) {
      return {
        success: false,
        error: `Slot ${timeSlot} on ${date} is already reserved by another patient. Double bookings are prohibited. Please choose another slot.`,
      };
    }

    // Calculate booking charge based on current config (default 10%)
    const bookingChargePercent = config.bookingChargePercentage;
    const bookingCharge = Math.round((doctor.consultationFee * bookingChargePercent) / 100);

    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      id: `APT-${(1000 + appointments.length + 1).toString()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.primaryPhone,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      doctorSpecialty: doctor.specialty,
      departmentId: department.id,
      departmentName: department.name,
      date,
      timeSlot,
      reason,
      consultationFee: doctor.consultationFee,
      bookingCharge,
      bookingChargePercentage: bookingChargePercent,
      chargeStatus: 'Recorded (Unpaid)',
      status: 'Pending Approval', // Holds the slot immediately!
      bookedBy,
      createdAt: now,
      updatedAt: now,
    };

    setAppointments(prev => [newAppointment, ...prev]);

    // Send notifications
    addNotification({
      recipientRole: 'receptionist',
      title: 'New Appointment Request',
      message: `${patient.fullName} requested ${timeSlot} on ${date} with ${doctor.fullName}.`,
      category: 'appointment_request',
      appointmentId: newAppointment.id,
    });

    addNotification({
      recipientRole: 'patient',
      recipientUserId: patient.userId,
      title: 'Appointment Request Submitted',
      message: `Your appointment request with ${doctor.fullName} for ${date} (${timeSlot}) is Pending Approval.`,
      category: 'appointment_request',
      appointmentId: newAppointment.id,
    });

    addAuditLog({
      userId: patient.userId,
      userName: patient.fullName,
      role: bookedBy === 'Patient' ? 'Patient' : 'Receptionist',
      action: 'APPOINTMENT_REQUEST',
      entity: 'Appointment',
      entityId: newAppointment.id,
      result: 'SUCCESS',
      details: `Appointment requested for ${doctor.fullName} on ${date} at ${timeSlot}. Holding slot in Pending Approval state.`,
    });

    return { success: true, appointment: newAppointment };
  };

  // Approve Appointment (FR-09, FR-13, TC-06)
  const approveAppointment = (appointmentId: string, approvedBy = 'Receptionist Marco') => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return { success: false, error: 'Appointment not found' };

    // Recheck double booking
    const conflicting = appointments.some(
      a => a.id !== appointmentId &&
           a.doctorId === apt.doctorId &&
           a.date === apt.date &&
           a.timeSlot === apt.timeSlot &&
           a.status === 'Confirmed'
    );
    if (conflicting) {
      return { success: false, error: 'Conflict detected: Another appointment is already confirmed for this exact slot.' };
    }

    const now = new Date().toISOString();
    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? { ...a, status: 'Confirmed', chargeStatus: 'Collected at Clinic', updatedAt: now }
          : a
      )
    );

    // Ensure patient mapped to doctor (FR-28)
    setDoctorPatientMaps(prev => {
      const exists = prev.some(m => m.doctorId === apt.doctorId && m.patientId === apt.patientId);
      if (!exists) {
        return [
          ...prev,
          {
            mapId: `MAP-${Date.now().toString().slice(-4)}`,
            doctorId: apt.doctorId,
            patientId: apt.patientId,
            active: true,
            mappedAt: now.split('T')[0],
          },
        ];
      }
      return prev;
    });

    addNotification({
      recipientRole: 'patient',
      title: 'Appointment Confirmed! 🎉',
      message: `Your appointment with ${apt.doctorName} on ${apt.date} at ${apt.timeSlot} has been approved and confirmed.`,
      category: 'approval',
      appointmentId,
    });

    addNotification({
      recipientRole: 'doctor',
      title: 'New Confirmed Patient',
      message: `${apt.patientName} has been confirmed for consultation on ${apt.date} at ${apt.timeSlot}.`,
      category: 'approval',
      appointmentId,
    });

    addAuditLog({
      userId: 'USR-REC-001',
      userName: approvedBy,
      role: 'Receptionist',
      action: 'APPOINTMENT_APPROVED',
      entity: 'Appointment',
      entityId: appointmentId,
      result: 'SUCCESS',
      details: `Appointment confirmed for ${apt.patientName} with ${apt.doctorName}. Slot reserved.`,
    });

    return { success: true };
  };

  // Reject Appointment (FR-09, Releases slot!)
  const rejectAppointment = (appointmentId: string, reason: string, rejectedBy = 'Receptionist Marco') => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return { success: false, error: 'Appointment not found' };

    const now = new Date().toISOString();
    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'Rejected',
              rejectionReason: reason,
              rejectionAt: now,
              chargeStatus: 'Waived',
              updatedAt: now,
            }
          : a
      )
    );

    addNotification({
      recipientRole: 'patient',
      title: 'Appointment Request Declined',
      message: `Your request with ${apt.doctorName} for ${apt.date} was declined. Reason: ${reason}`,
      category: 'rejection',
      appointmentId,
    });

    addAuditLog({
      userId: 'USR-REC-001',
      userName: rejectedBy,
      role: 'Receptionist',
      action: 'APPOINTMENT_REJECTED',
      entity: 'Appointment',
      entityId: appointmentId,
      result: 'SUCCESS',
      details: `Appointment rejected. Reason: "${reason}". Slot released for booking.`,
    });

    return { success: true };
  };

  // Cancel Appointment (FR-14, FR-15, FR-16, FR-17, TBD-6)
  const cancelAppointment = (
    appointmentId: string,
    reason: string,
    cancelledByRole: 'Patient' | 'Receptionist',
    isEmergency = false,
    userName = 'User'
  ) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return { success: false, error: 'Appointment not found' };

    // Cut-off calculation: compare appointment date and start time to current time
    // Default cut-off is config.cancellationCutOffHours (2 hours)
    if (cancelledByRole === 'Patient') {
      const cutOffHours = config.cancellationCutOffHours;
      try {
        // Extract start time, e.g. "09:30 AM" from "09:30 AM - 10:00 AM"
        const startTimeStr = apt.timeSlot.split('-')[0].trim();
        const aptDateTime = new Date(`${apt.date} ${startTimeStr}`);
        const now = new Date();
        const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        // If today and within cutoff
        if (diffHours < cutOffHours && diffHours >= 0) {
          return {
            success: false,
            error: `Self-cancellation is strictly disabled within ${cutOffHours} hours of your scheduled appointment time. Please contact clinic reception directly at ${config.clinicPhone} for emergency review.`,
          };
        }
      } catch {
        // In case of parsing error, proceed safely
      }
    }

    const now = new Date().toISOString();
    let refundEligibility = '100% Booking Deposit Refundable (Standard cancellation policy)';
    if (isEmergency) {
      refundEligibility = `Simulated ${config.emergencyCancellationFeeRefundablePercent}% Refund under Emergency Medical Review (TBD-6 Simulation)`;
    }

    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'Cancelled',
              cancelledBy: cancelledByRole,
              cancelledAt: now,
              cancelReason: reason,
              isEmergencyCancellation: isEmergency,
              refundEligibility,
              chargeStatus: 'Waived',
              updatedAt: now,
            }
          : a
      )
    );

    addNotification({
      recipientRole: cancelledByRole === 'Patient' ? 'receptionist' : 'patient',
      title: isEmergency ? 'Emergency Cancellation Recorded' : 'Appointment Cancelled',
      message: `${apt.patientName}'s appointment on ${apt.date} (${apt.timeSlot}) was cancelled. Reason: ${reason}`,
      category: 'cancellation',
      appointmentId,
    });

    addAuditLog({
      userId: 'USR-ACT',
      userName,
      role: cancelledByRole,
      action: isEmergency ? 'EMERGENCY_CANCELLATION' : 'APPOINTMENT_CANCELLED',
      entity: 'Appointment',
      entityId: appointmentId,
      result: 'SUCCESS',
      details: `${isEmergency ? 'Emergency cancellation' : 'Cancellation'} processed. Slot released. Refund status: ${refundEligibility}.`,
    });

    return { success: true, refundEligibility };
  };

  const markNoShow = (appointmentId: string, notes = 'Patient failed to appear for appointment', userName = 'Receptionist Marco') => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;
    const now = new Date().toISOString();
    setAppointments(prev =>
      prev.map(a => (a.id === appointmentId ? { ...a, status: 'No-show', notes, updatedAt: now } : a))
    );
    addAuditLog({
      userId: 'USR-REC-001',
      userName,
      role: 'Receptionist',
      action: 'APPOINTMENT_CANCELLED',
      entity: 'Appointment',
      entityId: appointmentId,
      result: 'WARNING',
      details: `Marked appointment ${appointmentId} (${apt.patientName}) as No-show.`,
    });
  };

  const rescheduleAppointment = (appointmentId: string, newDate: string, newTimeSlot: string, userName = 'Receptionist') => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return { success: false, error: 'Appointment not found' };

    // Check conflict
    const conflict = appointments.some(
      a => a.id !== appointmentId &&
           a.doctorId === apt.doctorId &&
           a.date === newDate &&
           a.timeSlot === newTimeSlot &&
           (a.status === 'Confirmed' || a.status === 'Pending Approval')
    );
    if (conflict) {
      return { success: false, error: 'The selected slot on that date is already booked.' };
    }

    const now = new Date().toISOString();
    setAppointments(prev =>
      prev.map(a => (a.id === appointmentId ? { ...a, date: newDate, timeSlot: newTimeSlot, updatedAt: now } : a))
    );

    addNotification({
      recipientRole: 'patient',
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${apt.doctorName} has been moved to ${newDate} at ${newTimeSlot}.`,
      category: 'schedule_change',
      appointmentId,
    });

    addAuditLog({
      userId: 'USR-REC-001',
      userName,
      role: 'Staff',
      action: 'SCHEDULE_CHANGED',
      entity: 'Appointment',
      entityId: appointmentId,
      result: 'SUCCESS',
      details: `Appointment ${appointmentId} rescheduled to ${newDate} at ${newTimeSlot}.`,
    });

    return { success: true };
  };

  const completeConsultation = (
    appointmentId: string,
    consultationData: {
      diagnosis: string;
      clinicalNotes: string;
      prescriptions: { medication: string; dosage: string; frequency: string; duration: string }[];
      followUpRecommendation: string;
      authorizedForPatient: boolean;
    },
    doctorName: string
  ) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    const now = new Date().toISOString();
    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'Completed',
              diagnosis: consultationData.diagnosis,
              notes: consultationData.clinicalNotes,
              followUpRecommended: consultationData.followUpRecommendation,
              updatedAt: now,
            }
          : a
      )
    );

    const newRecord: MedicalRecord = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      patientId: apt.patientId,
      patientName: apt.patientName,
      doctorId: apt.doctorId,
      doctorName,
      appointmentId,
      consultationDate: apt.date,
      symptomsSummary: apt.reason,
      diagnosis: consultationData.diagnosis,
      prescriptions: consultationData.prescriptions,
      clinicalNotes: consultationData.clinicalNotes,
      followUpRecommendation: consultationData.followUpRecommendation,
      authorizedForPatient: consultationData.authorizedForPatient,
      createdAt: now,
    };

    setMedicalRecords(prev => [newRecord, ...prev]);

    // Update patient's last visit & mark diagnosisHistoryCompleted
    setPatients(prev =>
      prev.map(p =>
        p.id === apt.patientId
          ? { ...p, lastVisit: apt.date, diagnosisHistoryCompleted: true }
          : p
      )
    );

    addNotification({
      recipientRole: 'patient',
      title: 'Consultation Completed & Prescription Ready',
      message: `${doctorName} completed your consultation. Diagnosis: ${consultationData.diagnosis}. Digital record available.`,
      category: 'approval',
      appointmentId,
    });

    addAuditLog({
      userId: apt.doctorId,
      userName: doctorName,
      role: 'Doctor',
      action: 'APPOINTMENT_APPROVED',
      entity: 'Appointment',
      entityId: appointmentId,
      result: 'SUCCESS',
      details: `Consultation completed for ${apt.patientName}. Diagnosis: "${consultationData.diagnosis}". Medical record saved.`,
    });
  };

  // Symptoms & Offline Sync (FR-25, FR-26, FR-27, TC-10)
  const toggleOfflineSimulation = () => {
    setIsOfflineSimulated(prev => !prev);
  };

  const addSymptomEntry = (entry: {
    patientId: string;
    appointmentId?: string;
    symptoms: string[];
    duration: string;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
    observations: string;
    enteredBy: string;
  }) => {
    const patient = patients.find(p => p.id === entry.patientId);
    const clientUuid = `cli-sym-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const newEntry: SymptomEntry = {
      id: `SYM-${Date.now().toString().slice(-4)}`,
      clientEntryId: clientUuid,
      patientId: entry.patientId,
      patientName: patient ? patient.fullName : 'Unknown Patient',
      appointmentId: entry.appointmentId,
      symptoms: entry.symptoms,
      duration: entry.duration,
      severity: entry.severity,
      observations: entry.observations,
      enteredBy: entry.enteredBy,
      enteredAt: now,
      isOfflineCreated: isOfflineSimulated,
      syncStatus: isOfflineSimulated ? 'pending' : 'synced',
    };

    setSymptoms(prev => [newEntry, ...prev]);

    if (!isOfflineSimulated) {
      addAuditLog({
        userId: 'USR-REC-001',
        userName: entry.enteredBy,
        role: 'Receptionist',
        action: 'SYMPTOM_OFFLINE_SYNC',
        entity: 'Symptom',
        entityId: newEntry.id,
        result: 'SUCCESS',
        details: `Symptom entry recorded online for ${newEntry.patientName}. Severity: ${entry.severity}.`,
      });
    }

    return newEntry;
  };

  const syncOfflineEntries = () => {
    let syncedCount = 0;
    let conflictCount = 0;

    setSymptoms(prev =>
      prev.map((item, idx) => {
        if (item.syncStatus === 'pending') {
          // If severity is Critical or observation has keyword 'conflict', simulate a conflict flag for testing (Journey 7)
          if (item.severity === 'Critical' && idx % 2 === 0) {
            conflictCount++;
            return {
              ...item,
              syncStatus: 'conflict',
              conflictDetails: 'Server detected conflicting record updated simultaneously by Triage Nurse.',
            };
          }
          syncedCount++;
          return { ...item, syncStatus: 'synced', isOfflineCreated: false };
        }
        return item;
      })
    );

    addAuditLog({
      userId: 'USR-REC-001',
      userName: 'Receptionist Marco',
      role: 'Receptionist',
      action: 'SYMPTOM_OFFLINE_SYNC',
      entity: 'Symptom',
      entityId: 'BATCH_SYNC',
      result: conflictCount > 0 ? 'CONFLICT' : 'SUCCESS',
      details: `Offline symptom synchronisation completed: ${syncedCount} entries synced successfully, ${conflictCount} conflicts flagged.`,
    });

    return { syncedCount, conflictCount };
  };

  const resolveSymptomConflict = (entryId: string, resolution: 'accept_client' | 'overwrite_server') => {
    setSymptoms(prev =>
      prev.map(item =>
        item.id === entryId
          ? {
              ...item,
              syncStatus: 'synced',
              conflictDetails: undefined,
              observations: `${item.observations} [Resolved via ${resolution === 'accept_client' ? 'Client Override' : 'Server Merge'}]`,
            }
          : item
      )
    );
  };

  // Encrypted Medical File Handling (FR-29, FR-30, FR-31, FR-32, TC-08, TC-09)
  const uploadMedicalFile = (data: {
    patientId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    category: 'Lab Report' | 'Imaging / X-Ray' | 'Prescription' | 'Discharge Summary' | 'Specialist Note';
    uploadedBy: string;
    mockDecryptedContent?: string;
  }) => {
    const patient = patients.find(p => p.id === data.patientId);
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const newFile: MedicalFile = {
      id: `FILE-${Date.now().toString().slice(-4)}`,
      patientId: data.patientId,
      patientName: patient ? patient.fullName : 'Unknown Patient',
      fileName: data.fileName,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      category: data.category,
      uploadDate: now,
      uploadedBy: data.uploadedBy,
      encryptionStatus: 'Encrypted (AES-256 Mock)',
      accessLevel: 'Doctor Only (Assigned)',
      mockDecryptedContent: data.mockDecryptedContent || `[CONFIDENTIAL MEDICAL DATA - DECRYPTED STREAM]
File: ${data.fileName}
Patient: ${patient?.fullName} (ID: ${data.patientId})
Category: ${data.category}
Verified by Clinical Diagnostics.`,
    };

    setMedicalFiles(prev => [newFile, ...prev]);

    addAuditLog({
      userId: 'USR-REC-001',
      userName: data.uploadedBy,
      role: 'Receptionist',
      action: 'FILE_UPLOADED',
      entity: 'MedicalFile',
      entityId: newFile.id,
      result: 'SUCCESS',
      details: `File "${data.fileName}" uploaded. Content restricted. Receptionist access strictly restricted to metadata.`,
    });

    return newFile;
  };

  const viewMedicalFileAuthorized = (fileId: string, doctorId: string, doctorName: string) => {
    const file = medicalFiles.find(f => f.id === fileId);
    if (!file) return { authorized: false, reason: 'File not found' };

    // Check doctor-patient mapping (FR-28, FR-31, FR-32)
    const isMapped = doctorPatientMaps.some(
      m => m.doctorId === doctorId && m.patientId === file.patientId && m.active
    );

    if (!isMapped) {
      addAuditLog({
        userId: doctorId,
        userName: doctorName,
        role: 'Doctor',
        action: 'FILE_ACCESS_DENIED',
        entity: 'MedicalFile',
        entityId: fileId,
        result: 'DENIED',
        details: `Access denied to file ${file.fileName}. Doctor ${doctorName} is not mapped to patient ${file.patientName}.`,
      });
      return {
        authorized: false,
        reason: `Access Denied: You are not assigned to patient ${file.patientName}. Patient-doctor mapping is strictly required.`,
      };
    }

    addAuditLog({
      userId: doctorId,
      userName: doctorName,
      role: 'Doctor',
      action: 'FILE_ACCESS_AUTHORIZED',
      entity: 'MedicalFile',
      entityId: fileId,
      result: 'SUCCESS',
      details: `Authorized decrypted view of file "${file.fileName}" for mapped patient ${file.patientName}.`,
    });

    return {
      authorized: true,
      content: file.mockDecryptedContent,
    };
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Calls
  const logCall = (call: Omit<CallLogItem, 'id' | 'timestamp'>) => {
    const newCall: CallLogItem = {
      ...call,
      id: `CALL-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };
    setCallLogs(prev => [newCall, ...prev]);
  };

  // Reset Demo Data
  const resetAllDemoData = () => {
    localStorage.removeItem(KEYS.CONFIG);
    localStorage.removeItem(KEYS.DEPARTMENTS);
    localStorage.removeItem(KEYS.DOCTORS);
    localStorage.removeItem(KEYS.ROOMS);
    localStorage.removeItem(KEYS.PATIENTS);
    localStorage.removeItem(KEYS.SCHEDULES);
    localStorage.removeItem(KEYS.LEAVES);
    localStorage.removeItem(KEYS.APPOINTMENTS);
    localStorage.removeItem(KEYS.RECORDS);
    localStorage.removeItem(KEYS.SYMPTOMS);
    localStorage.removeItem(KEYS.FILES);
    localStorage.removeItem(KEYS.MAPS);
    localStorage.removeItem(KEYS.NOTIFS);
    localStorage.removeItem(KEYS.AUDIT);
    localStorage.removeItem(KEYS.CALLS);
    localStorage.removeItem(KEYS.OFFLINE_SIM);

    setConfig(INITIAL_CONFIG);
    setDepartments(INITIAL_DEPARTMENTS);
    setDoctors(INITIAL_DOCTORS);
    setRooms(INITIAL_ROOMS);
    setPatients(INITIAL_PATIENTS);
    setSchedules(INITIAL_SCHEDULES);
    setLeaves(INITIAL_LEAVES);
    setAppointments(INITIAL_APPOINTMENTS);
    setMedicalRecords(INITIAL_MEDICAL_RECORDS);
    setSymptoms(INITIAL_SYMPTOMS);
    setMedicalFiles(INITIAL_MEDICAL_FILES);
    setDoctorPatientMaps(INITIAL_DOCTOR_PATIENT_MAPS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCallLogs(INITIAL_CALL_LOGS);
    setIsOfflineSimulated(false);
  };

  return (
    <ClinicContext.Provider
      value={{
        config,
        updateConfig,
        departments,
        addDepartment,
        updateDepartment,
        doctors,
        addDoctor,
        updateDoctor,
        rooms,
        addRoom,
        updateRoom,
        patients,
        registerPatient,
        updatePatient,
        schedules,
        leaves,
        updateDoctorSchedule,
        addDoctorLeave,
        appointments,
        requestAppointment,
        approveAppointment,
        rejectAppointment,
        cancelAppointment,
        markNoShow,
        rescheduleAppointment,
        completeConsultation,
        medicalRecords,
        symptoms,
        isOfflineSimulated,
        toggleOfflineSimulation,
        addSymptomEntry,
        syncOfflineEntries,
        resolveSymptomConflict,
        medicalFiles,
        uploadMedicalFile,
        viewMedicalFileAuthorized,
        doctorPatientMaps,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        auditLogs,
        addAuditLog,
        callLogs,
        logCall,
        resetAllDemoData,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
