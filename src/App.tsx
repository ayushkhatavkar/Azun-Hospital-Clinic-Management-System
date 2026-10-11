import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { BookAppointmentPage } from './pages/patient/BookAppointmentPage';
import { MyAppointmentsPage } from './pages/patient/MyAppointmentsPage';
import { PatientMedicalHistoryPage } from './pages/patient/PatientMedicalHistoryPage';
import { PatientReportsPage } from './pages/patient/PatientReportsPage';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';

// Receptionist Pages
import { ReceptionistDashboard } from './pages/receptionist/ReceptionistDashboard';
import { AppointmentRequestsPage } from './pages/receptionist/AppointmentRequestsPage';
import { AllAppointmentsPage } from './pages/receptionist/AllAppointmentsPage';
import { BookForPatientPage } from './pages/receptionist/BookForPatientPage';
import { PatientsDirectoryPage } from './pages/receptionist/PatientsDirectoryPage';
import { DoctorAvailabilityPage } from './pages/receptionist/DoctorAvailabilityPage';
import { SchedulesHolidaysPage } from './pages/receptionist/SchedulesHolidaysPage';
import { SymptomEntryPage } from './pages/receptionist/SymptomEntryPage';
import { OfflineSyncPage } from './pages/receptionist/OfflineSyncPage';
import { MedicalFilesUploadPage } from './pages/receptionist/MedicalFilesUploadPage';
import { CancellationsFollowUpPage } from './pages/receptionist/CancellationsFollowUpPage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorSchedulePage } from './pages/doctor/DoctorSchedulePage';
import { DoctorAssignedPatientsPage } from './pages/doctor/DoctorAssignedPatientsPage';
import { DoctorConsultationPage } from './pages/doctor/DoctorConsultationPage';
import { DoctorMedicalFilesPage } from './pages/doctor/DoctorMedicalFilesPage';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { DepartmentManagementPage } from './pages/admin/DepartmentManagementPage';
import { DoctorRoomManagementPage } from './pages/admin/DoctorRoomManagementPage';
import { AdminSchedulesPage } from './pages/admin/AdminSchedulesPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { OperationalReportsPage } from './pages/admin/OperationalReportsPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { SystemConfigurationPage } from './pages/admin/SystemConfigurationPage';

// Helper Root Redirector
const RootRedirect: React.FC = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;

  switch (currentUser.role) {
    case 'patient':
      return <Navigate to="/patient/dashboard" replace />;
    case 'receptionist':
      return <Navigate to="/receptionist/dashboard" replace />;
    case 'doctor':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClinicProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Root Route Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Authenticated Application Shell */}
            <Route element={<AppLayout />}>
              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/book" element={<BookAppointmentPage />} />
              <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
              <Route path="/patient/medical-history" element={<PatientMedicalHistoryPage />} />
              <Route path="/patient/reports" element={<PatientReportsPage />} />
              <Route path="/patient/profile" element={<PatientProfilePage />} />

              {/* Receptionist Routes */}
              <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
              <Route path="/receptionist/requests" element={<AppointmentRequestsPage />} />
              <Route path="/receptionist/appointments" element={<AllAppointmentsPage />} />
              <Route path="/receptionist/book-patient" element={<BookForPatientPage />} />
              <Route path="/receptionist/patients" element={<PatientsDirectoryPage />} />
              <Route path="/receptionist/availability" element={<DoctorAvailabilityPage />} />
              <Route path="/receptionist/schedules" element={<SchedulesHolidaysPage />} />
              <Route path="/receptionist/symptoms" element={<SymptomEntryPage />} />
              <Route path="/receptionist/offline-sync" element={<OfflineSyncPage />} />
              <Route path="/receptionist/files" element={<MedicalFilesUploadPage />} />
              <Route path="/receptionist/cancellations" element={<CancellationsFollowUpPage />} />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/schedule" element={<DoctorSchedulePage />} />
              <Route path="/doctor/patients" element={<DoctorAssignedPatientsPage />} />
              <Route path="/doctor/consultations" element={<DoctorConsultationPage />} />
              <Route path="/doctor/files" element={<DoctorMedicalFilesPage />} />
              <Route path="/doctor/profile" element={<DoctorProfilePage />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/departments" element={<DepartmentManagementPage />} />
              <Route path="/admin/doctors-rooms" element={<DoctorRoomManagementPage />} />
              <Route path="/admin/schedules" element={<AdminSchedulesPage />} />
              <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
              <Route path="/admin/reports" element={<OperationalReportsPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />
              <Route path="/admin/config" element={<SystemConfigurationPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </ClinicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
