import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Calendar,
  Clock,
  User,
  Building2,
  Stethoscope,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';

const SHIFT_1_SLOTS = [
  '08:30 AM - 09:00 AM',
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '11:30 AM - 12:00 PM',
  '12:00 PM - 12:30 PM',
  '12:30 PM - 01:00 PM',
];

export const BookForPatientPage: React.FC = () => {
  const {
    patients,
    departments,
    doctors,
    appointments,
    requestAppointment,
    approveAppointment,
    registerPatient,
    config,
  } = useClinic();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  const [bookingType, setBookingType] = useState<'existing' | 'walkin'>('existing');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');

  // Walk-in new patient fields
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('+91 ');
  const [walkinEmail, setWalkinEmail] = useState('');
  const [walkinAge, setWalkinAge] = useState(30);
  const [walkinGender, setWalkinGender] = useState<'Male' | 'Female' | 'Other'>('Female');

  // Appointment details
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlot, setSelectedSlot] = useState(SHIFT_1_SLOTS[0]);
  const [reason, setReason] = useState('Front desk walk-in / phone consultation booking');
  const [autoConfirm, setAutoConfirm] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableDoctors = doctors.filter(
    d => d.departmentId === selectedDeptId && d.status === 'Active'
  );

  const activeDoctor = doctors.find(d => d.id === selectedDoctorId);
  const fee = activeDoctor?.consultationFee || 0;
  const deposit = Math.round((fee * config.bookingChargePercentage) / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    let finalPatientId = selectedPatientId;

    if (bookingType === 'walkin') {
      if (!walkinName.trim() || !walkinPhone.trim()) {
        setError('Please enter patient name and contact phone.');
        return;
      }
      const regRes = registerPatient({
        userId: `USR-${Date.now().toString().slice(-4)}`,
        fullName: walkinName,
        email: walkinEmail || `walkin.${Date.now()}@clinic.demo`,
        primaryPhone: walkinPhone,
        age: Number(walkinAge),
        dob: '1995-01-01',
        gender: walkinGender,
        bloodGroup: 'B+',
        address: 'Bengaluru Clinic Walk-in',
        emergencyContact: { name: 'Self', relationship: 'Self', phone: walkinPhone },
        diagnosisHistoryCompleted: true,
      });

      if (!regRes.success || !regRes.patient) {
        setError(regRes.error || 'Failed to register walk-in patient.');
        return;
      }
      finalPatientId = regRes.patient.id;
    }

    const reqRes = requestAppointment({
      patientId: finalPatientId,
      doctorId: selectedDoctorId,
      date: selectedDate,
      timeSlot: selectedSlot,
      reason,
      bookedBy: 'Receptionist',
    });

    if (!reqRes.success || !reqRes.appointment) {
      setError(reqRes.error || 'Failed to reserve appointment slot.');
      return;
    }

    if (autoConfirm) {
      approveAppointment(reqRes.appointment.id, 'Receptionist Marco');
      setSuccess(
        `Appointment ${reqRes.appointment.id} booked and confirmed directly for ${reqRes.appointment.patientName}!`
      );
    } else {
      setSuccess(
        `Appointment ${reqRes.appointment.id} created as Pending Approval for ${reqRes.appointment.patientName}.`
      );
    }

    setTimeout(() => {
      navigate('/receptionist/appointments');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book on Behalf of Patient</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Schedule consultations for phone enquiries or walk-in arrivals (SRS FR-11, UC-05)
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
        {/* Step 1: Patient Type */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Select Patient Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setBookingType('existing')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center gap-2.5 ${
                bookingType === 'existing'
                  ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4 text-brand-600" />
              <span>Existing Registered Patient</span>
            </button>

            <button
              type="button"
              onClick={() => setBookingType('walkin')}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center gap-2.5 ${
                bookingType === 'walkin'
                  ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-4 h-4 text-teal-600" />
              <span>New Walk-in / Phone Patient</span>
            </button>
          </div>
        </div>

        {/* Existing vs Walkin Form Fields */}
        {bookingType === 'existing' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Patient from Directory</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.id}) — {p.primaryPhone}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">New Walk-In Patient Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={walkinName}
                  onChange={e => setWalkinName(e.target.value)}
                  placeholder="e.g. Ramesh Verma"
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  value={walkinPhone}
                  onChange={e => setWalkinPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={walkinAge}
                  onChange={e => setWalkinAge(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={walkinGender}
                  onChange={e => setWalkinGender(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={walkinEmail}
                  onChange={e => setWalkinEmail(e.target.value)}
                  placeholder="walkin@example.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Department and Doctor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
            <select
              value={selectedDeptId}
              onChange={e => {
                setSelectedDeptId(e.target.value);
                const firstDoc = doctors.find(d => d.departmentId === e.target.value);
                if (firstDoc) setSelectedDoctorId(firstDoc.id);
              }}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Doctor</label>
            <select
              value={selectedDoctorId}
              onChange={e => setSelectedDoctorId(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
            >
              {availableDoctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.fullName} ({formatCurrency(doc.consultationFee)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Date & Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Time Slot</label>
            <select
              value={selectedSlot}
              onChange={e => setSelectedSlot(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
            >
              {SHIFT_1_SLOTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reason for Visit</label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            required
            className="w-full text-xs p-3 rounded-xl border border-slate-200"
          />
        </div>

        <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">Instant Confirmation by Reception</span>
            <span className="text-slate-500 text-[11px]">Directly confirm without pending queue</span>
          </div>
          <input
            type="checkbox"
            checked={autoConfirm}
            onChange={e => setAutoConfirm(e.target.checked)}
            className="w-4 h-4 accent-brand-600 rounded"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-slate-900">
            Total Fee: {formatCurrency(fee)} (Deposit: {formatCurrency(deposit)})
          </span>
          <button
            type="submit"
            className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <span>Confirm Booking for Patient</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
