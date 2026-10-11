# CareSync / MedHealthy - Clinic Management System (CMS) Frontend

A modern, responsive, role-based Clinic Management System (CMS) frontend built to IEEE Std 830-1998 Software Requirements Specifications (SRS).

---

## 🏥 Project Overview

- **Project:** Clinic Management System (CMS)
- **Version:** 1.0 (Frontend-First Prototype)
- **Design Inspiration:** Modern healthcare SaaS aesthetic matching the *MedHealthy* & *MediCare* operational dashboards.
- **Technology Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS, Lucide React, Recharts, date-fns.
- **State & Data Layer:** Fully interactive mock data with persistent browser `localStorage` and one-click demo data reset.

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js (v18+ recommended; tested on v24.21.0)
- npm (v9+; tested on v11.19.0)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or the port specified by Vite).

### 3. Production Build
```bash
npm run build
```
Verify production build via:
```bash
npm run preview
```

---

## 👥 Demo Login Credentials (All 4 User Roles)

The application provides a quick demo switcher on both the **Sign-In page** and in the **Header / Profile Dropdown**, allowing instant switching between roles without re-typing passwords.

| Role | Demo Account Email | Mock Password | Primary Landing Page |
| :--- | :--- | :--- | :--- |
| **Receptionist** (Primary) | `reception@clinic.demo` | `password123` | `/receptionist/dashboard` |
| **Patient** | `patient@clinic.demo` | `password123` | `/patient/dashboard` |
| **Doctor** | `doctor@clinic.demo` | `password123` | `/doctor/dashboard` |
| **Administrator** | `admin@clinic.demo` | `password123` | `/admin/dashboard` |

> *Note: Alternative doctor demo: `doctor.alvis@clinic.demo` (General Surgery / Medicine).*

---

## 🧭 Role-Based Navigation & Implemented Screens

### 1. Patient Portal
- **Dashboard (`/patient/dashboard`):** Active upcoming consultation, booking charge breakdown, medical profile readiness, recent alerts.
- **Book Appointment (`/patient/book`):** Department filtering across 6 departments, doctor selection, holiday exclusion, live slot availability, dynamic 10% booking charge calculation, zero-double-booking guarantee holding slots in `Pending Approval`.
- **My Appointments (`/patient/appointments`):** Filter by status (Upcoming, Pending, Completed, Cancelled). Strict 2-hour cancellation cut-off validation (FR-14, FR-15).
- **Medical History (`/patient/medical-history`):** Self-service chronic conditions and allergy management, past diagnoses, authorized physician notes.
- **Digital Reports (`/patient/reports`):** Lab results and diagnostic reports.
- **Demographic Profile (`/patient/profile`):** Update primary and secondary contact numbers (FR-01), emergency contact, and address.

### 2. Receptionist Portal (Primary Operations Desk)
- **Dashboard (`/receptionist/dashboard`):** Today's appointments, pending queue, doctor availability roster, patient activity bar chart.
- **Appointment Requests (`/receptionist/requests`):** Review pending bookings, approve slots (transfers to Confirmed), or reject with mandatory reason (releases slot in real time).
- **All Appointments (`/receptionist/appointments`):** Full searchable table, reschedule slots, cancel, mark No-show (FR-18).
- **Book for Patient (`/receptionist/book-patient`):** Book for existing patients or intake walk-ins/phone enquiries (FR-11).
- **Patient Directory (`/receptionist/patients`):** Demographic records, age/contact, visit tallies, intake history.
- **Doctor Availability (`/receptionist/availability`):** Daily/weekly doctor roster, shift assignments (Shift 1 & 2), room mappings (FR-23), schedule conflict warnings (FR-21).
- **Schedules & Holidays (`/receptionist/schedules`):** Schedule doctor CME leaves and clinic closure holidays with affected-appointment indicators.
- **Symptom Entry (`/receptionist/symptoms`):** Front desk triage recording with symptom tags, severity levels, duration, and local caching.
- **Offline Sync Center (`/receptionist/offline-sync`):** Offline-first simulation with online/offline toggle, client-side UUID generation for duplicate prevention (FR-27), "Sync Now" handshake, and conflict resolution modal.
- **Medical File Intake (`/receptionist/files`):** Upload diagnostic documents. **Strict security check:** Receptionists can view metadata only; content viewing or downloading is restricted to doctors (FR-30, TC-08).
- **Cancellations & Follow-up (`/receptionist/cancellations`):** Emergency cancellation review, policy cut-off explanation, simulated refund eligibility, and telephone call logs.

### 3. Doctor Portal
- **Doctor Dashboard (`/doctor/dashboard`):** Designed matching MediCare aesthetics: satisfaction gauge, treatment statistics, upcoming consultation roster, and incoming appointment requests.
- **My Schedule (`/doctor/schedule`):** Read-only shift roster (Section 8.B), room allocation, patient consultation times.
- **Assigned Patients (`/doctor/patients`):** Strict doctor-patient mapping (FR-28). Displays only patients mapped to the attending doctor with timelines, history, and allergies.
- **Consultation Workspace (`/doctor/consultations`):** Review triage symptoms, record clinical examination notes, formulate diagnosis, prescribe medications with dosage/frequency/duration, set follow-up advice, mark consultation Completed.
- **Authorized File Viewer (`/doctor/files`):** View decrypted diagnostic reports for assigned patients. Unauthorized attempts on unmapped patients are blocked and audited (FR-31, FR-32, TC-09).
- **Doctor Profile (`/doctor/profile`):** Credentials, specialties, room assignment, fee structure.

### 4. Management / Administrator Portal
- **Admin Dashboard (`/admin/dashboard`):** High-level KPIs, cancellation rates, no-show rates, weekly consultation trajectory, department distribution pie chart.
- **User Management (`/admin/users`):** Provision users, toggle active/inactive status with confirmation dialogs, manage role assignments.
- **Department Management (`/admin/departments`):** 6 seeded clinic departments (Cardiology, General Medicine, Pediatrics, Orthopedics, Neurology, Dermatology), edit room capacities, unit codes, specialty heads.
- **Doctor & Room Management (`/admin/doctors-rooms`):** Doctor profiles, fees, shift settings, consultation rooms.
- **Operational Reports (`/admin/reports`):** Daily, department-wise, physician utilization, cancellation/refund logs, and booking charge records with **instant CSV export**.
- **Audit Log (`/admin/audit`):** Read-only, tamper-resistant trail of all logins, file access attempts, schedule updates, cancellations, and config modifications (FR-37).
- **System Configuration (`/admin/config`):** Editable booking charge % (default 10%), cancellation cut-off window (default 2h), session timeouts, clinic contact parameters.

---

## 🧪 Acceptance Journeys Verified

1. **Journey 1: Patient Books an Appointment**
   - Selects department & doctor -> chooses available slot -> sees fee and calculated 10% booking charge -> submits -> status set to `Pending Approval` holding doctor slot.
2. **Journey 2: Receptionist Approves the Appointment**
   - Receptionist reviews pending queue -> approves -> slot marked `Confirmed` -> patient & doctor receive notifications. Alternatively, rejects with mandatory reason -> slot is released immediately.
3. **Journey 3: Double-Booking Prevention**
   - Active slots held by `Pending Approval` or `Confirmed` cannot be rebooked; conflicting booking attempts return validation errors (FR-10, TC-05).
4. **Journey 4: Cancellation Policy & Cut-off**
   - Prior to 2 hours before start time: self-cancellation permitted with 100% simulated refund eligibility -> slot released.
   - Within 2-hour cut-off: self-cancellation blocked (FR-15); emergency cancellation handled via reception desk with mandatory reason (FR-16).
5. **Journey 5: Doctor Consultation**
   - Doctor opens consultation workspace -> inspects intake symptoms -> enters diagnosis & prescription -> concludes visit -> appointment marked `Completed` -> medical history updated.
6. **Journey 6: Medical File Restrictions**
   - Receptionist uploads document -> sees metadata only -> content viewing blocked (TC-08). Doctor opens file for assigned patient -> authorized decryption rendered and audited (TC-09).
7. **Journey 7: Offline Symptom Entry & Sync**
   - Receptionist switches to Simulated Offline -> records symptoms -> saved locally with client UUID -> goes online -> clicks "Sync Now" -> entries synchronized without duplicates.
8. **Journey 8: System Configuration**
   - Administrator changes booking charge percentage from 10% to 15% -> booking forms update calculation dynamically across the application.

---

## 🔒 Scope Boundaries & Mocked Implementations

Per prompt Section 14 and the SRS:
- **Authentication:** Simulated client-side session using demo accounts and `localStorage`. No actual JWT/OAuth server.
- **File Encryption:** Simulated with metadata tags ("Encrypted AES-256 Mock") and role-based decryption mock view. No physical crypto keys.
- **Payment & Refunds:** Simulated booking charge calculation and refund eligibility status. No external payment gateway or actual banking transactions.
- **Telephony & SMS:** Simulated follow-up call logs and in-app notification center. No physical SMS or voice calls.
- **Database:** Browser storage (`localStorage`) layer with prototype reset utility. Ready to connect to REST/JSON backend APIs in Phase 2.

---

## 🛠️ Build and Verification Status

- **TypeScript Compilation (`tsc`):** ✅ Passed with 0 errors.
- **Vite Production Bundler:** ✅ Passed with 0 errors (`dist/` generated).
- **Responsive Layout:** ✅ Fully responsive across Mobile, Tablet, and Desktop.
