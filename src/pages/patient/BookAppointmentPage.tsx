import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  HeartPulse,
  Stethoscope,
  Info,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
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
  '01:00 PM - 01:30 PM',
];

const SHIFT_2_SLOTS = [
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '03:30 PM - 04:00 PM',
  '04:00 PM - 04:30 PM',
  '04:30 PM - 05:00 PM',
  '05:00 PM - 05:30 PM',
  '05:30 PM - 06:00 PM',
  '06:00 PM - 06:30 PM',
  '06:30 PM - 07:00 PM',
  '07:00 PM - 07:30 PM',
];

export const BookAppointmentPage: React.FC = () => {
  const {
    departments,
    doctors,
    appointments,
    schedules,
    leaves,
    config,
    patients,
    requestAppointment,
  } = useClinic();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const currentPatient =
    patients.find(p => p.id === currentUser?.patientId || p.email === currentUser?.email) ||
    patients[0];

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'DEP-001');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [newAppointmentId, setNewAppointmentId] = useState<string>('');

  // Filter doctors by selected department
  const availableDoctors = useMemo(() => {
    return doctors.filter(d => d.departmentId === selectedDeptId && d.status === 'Active');
  }, [doctors, selectedDeptId]);

  // Set default doctor when department changes
  React.useEffect(() => {
    if (availableDoctors.length > 0) {
      if (!availableDoctors.some(d => d.id === selectedDoctorId)) {
        setSelectedDoctorId(availableDoctors[0].id);
        setSelectedSlot('');
      }
    } else {
      setSelectedDoctorId('');
      setSelectedSlot('');
    }
  }, [availableDoctors, selectedDoctorId]);

  const activeDoctor = doctors.find(d => d.id === selectedDoctorId);

  // Check if doctor is on holiday or leave on selected date
  const isDoctorOnHoliday = useMemo(() => {
    if (!selectedDoctorId || !selectedDate) return false;
    const isHoliday = schedules.some(
      s => s.doctorId === selectedDoctorId && s.date === selectedDate && s.isHoliday
    );
    const isLeave = leaves.some(
      l =>
        l.doctorId === selectedDoctorId &&
        l.status === 'Approved' &&
        selectedDate >= l.startDate &&
        selectedDate <= l.endDate
    );
    return isHoliday || isLeave;
  }, [selectedDoctorId, selectedDate, schedules, leaves]);

  // Determine which shift doctor works on selected date
  const doctorShift: 'Shift 1' | 'Shift 2' | 'Both' = useMemo(() => {
    if (!activeDoctor) return 'Shift 1';
    const sched = schedules.find(s => s.doctorId === activeDoctor.id && s.date === selectedDate);
    if (sched) return sched.shift;
    return activeDoctor.shiftDefault;
  }, [activeDoctor, schedules, selectedDate]);

  // Available slots for selected doctor and date
  const slotOptions = useMemo(() => {
    if (!activeDoctor || isDoctorOnHoliday) return [];
    const baseSlots =
      doctorShift === 'Shift 2'
        ? SHIFT_2_SLOTS
        : doctorShift === 'Both'
        ? [...SHIFT_1_SLOTS, ...SHIFT_2_SLOTS]
        : SHIFT_1_SLOTS;

    // Check which slots are already held (Pending Approval or Confirmed)
    return baseSlots.map(slot => {
      const isTaken = appointments.some(
        a =>
          a.doctorId === activeDoctor.id &&
          a.date === selectedDate &&
          a.timeSlot === slot &&
          (a.status === 'Pending Approval' || a.status === 'Confirmed')
      );
      return {
        slot,
        isTaken,
      };
    });
  }, [activeDoctor, isDoctorOnHoliday, doctorShift, appointments, selectedDate]);

  // Pricing calculations
  const fee = activeDoctor?.consultationFee || 0;
  const bookingChargePercent = config.bookingChargePercentage;
  const bookingCharge = Math.round((fee * bookingChargePercent) / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId) {
      setError('Please select an active doctor for consultation.');
      return;
    }

    if (!selectedSlot) {
      setError('Please select an available consultation time slot.');
      return;
    }

    if (!reason.trim()) {
      setError('Please enter the reason or clinical symptoms for your visit.');
      return;
    }

    const res = requestAppointment({
      patientId: currentPatient.id,
      doctorId: selectedDoctorId,
      date: selectedDate,
      timeSlot: selectedSlot,
      reason,
      bookedBy: 'Patient',
    });

    if (res.success && res.appointment) {
      setNewAppointmentId(res.appointment.id);
      setIsSuccess(true);
    } else {
      setError(res.error || 'Unable to book appointment slot.');
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Request Submitted!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Reference ID: <span className="font-mono font-bold text-brand-600">{newAppointmentId}</span>
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-left space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-bold text-slate-900">{activeDoctor?.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Department:</span>
              <span className="font-bold text-slate-900">{activeDoctor?.departmentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Date & Slot:</span>
              <span className="font-bold text-slate-900">{formatDateDisplay(selectedDate)} at {selectedSlot}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-amber-600">Pending Approval (Slot Held)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Booking Deposit:</span>
              <span className="font-bold text-slate-900">{formatCurrency(bookingCharge)} ({bookingChargePercent}%)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            Your slot has been immediately reserved. The reception staff will review your request shortly.
            You will receive a notification once approved.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/patient/appointments')}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
            >
              View My Appointments
            </button>
            <button
              onClick={() => {
                setIsSuccess(false);
                setSelectedSlot('');
                setReason('');
              }}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Request an Appointment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a speciality, consulting doctor, and open slot (SRS FR-06, FR-07, FR-12)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
          <User className="w-4 h-4 text-brand-600" />
          <span>Patient: <strong className="text-slate-900">{currentPatient.fullName}</strong></span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold">Booking Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Selections */}
        <div className="lg:col-span-2 space-y-5 bg-white p-6 rounded-3xl shadow-card border border-slate-200/80">
          {/* Step 1: Select Department */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              1. Select Department ({departments.length} Specialities)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {departments.map(dep => {
                const isSelected = dep.id === selectedDeptId;
                return (
                  <button
                    type="button"
                    key={dep.id}
                    onClick={() => {
                      setSelectedDeptId(dep.id);
                      setSelectedSlot('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 text-brand-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                      <span className="text-xs truncate">{dep.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Head: {dep.headDoctorName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Doctor */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              2. Select Doctor
            </label>
            {availableDoctors.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                No active doctors available in this department currently.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableDoctors.map(doc => {
                  const isSelected = doc.id === selectedDoctorId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setSelectedSlot('');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <img
                        src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'}
                        alt={doc.fullName}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-brand-500/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{doc.fullName}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{doc.specialty}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[11px] font-bold text-brand-700">
                            {formatCurrency(doc.consultationFee)}
                          </span>
                          <span className="text-[10px] text-slate-400">{doc.roomAssigned}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Date & Time Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                3. Consultation Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot('');
                  }}
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Assigned Shift & Room
              </label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>{doctorShift} ({doctorShift === 'Shift 1' ? config.shift1Timing : config.shift2Timing})</span>
                <span className="font-bold text-slate-900">{activeDoctor?.roomAssigned}</span>
              </div>
            </div>
          </div>

          {/* Time Slot Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Select Available Time Slot
              </label>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Open
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Booked / Held
                </span>
              </div>
            </div>

            {isDoctorOnHoliday ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Dr. {activeDoctor?.fullName} is on leave/holiday on this date. Please pick another date.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slotOptions.map(({ slot, isTaken }) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={isTaken}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        isTaken
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-brand-500 hover:bg-brand-50/40'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Reason for Consultation & Symptoms <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Please describe symptoms, duration, and medical history context..."
              required
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right Column: Pricing Summary & Confirm Button */}
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Consultation & Fee Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Speciality:</span>
                <span className="font-semibold text-slate-900">{activeDoctor?.departmentName || '-'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Physician:</span>
                <span className="font-semibold text-slate-900">{activeDoctor?.fullName || '-'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Date:</span>
                <span className="font-semibold text-slate-900">{formatDateDisplay(selectedDate)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Slot:</span>
                <span className="font-semibold text-slate-900">{selectedSlot || 'Not chosen'}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-slate-700">
                <span>Doctor Consultation Fee:</span>
                <span className="font-bold text-slate-900">{formatCurrency(fee)}</span>
              </div>

              {/* Booking Charge calculation per FR-12 */}
              <div className="flex justify-between text-brand-700 font-semibold p-2.5 rounded-xl bg-brand-50 border border-brand-100">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider">Booking Deposit ({bookingChargePercent}%):</span>
                  <span className="text-[10px] text-brand-600 font-normal">SRS FR-12 / Configurable</span>
                </div>
                <span className="text-base font-extrabold">{formatCurrency(bookingCharge)}</span>
              </div>
            </div>

            {/* Offline Collection Notice (FR-12, TBD-4) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
              <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>
                <strong>Offline Billing Policy:</strong> Charges are collected directly at clinic reception desk upon check-in. No online payment gateway is connected.
              </span>
            </div>

            <button
              type="submit"
              disabled={!selectedSlot || isDoctorOnHoliday}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                !selectedSlot || isDoctorOnHoliday
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25'
              }`}
            >
              <span>Submit Appointment Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Double-Booking Guarantee Card */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">Zero Double-Booking Guarantee</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                As soon as your request is submitted, the slot is locked into <strong>Pending Approval</strong> state to guarantee no two patients overlap (FR-08, FR-10).
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
