import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  FileText,
  CalendarPlus,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  HeartPulse,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';

export const PatientDashboard: React.FC = () => {
  const { appointments, notifications, config, patients, medicalRecords } = useClinic();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Find current patient data
  const patient = patients.find(p => p.id === currentUser?.patientId || p.email === currentUser?.email) || patients[0];

  // Patient appointments
  const myAppointments = appointments.filter(a => a.patientId === patient.id);
  const upcomingAppointment = myAppointments.find(
    a => (a.status === 'Confirmed' || a.status === 'Pending Approval') && a.date >= new Date().toISOString().split('T')[0]
  );

  const completedCount = myAppointments.filter(a => a.status === 'Completed').length;
  const recentRecords = medicalRecords.filter(r => r.patientId === patient.id);
  const patientNotifs = notifications.filter(
    n => n.recipientRole === 'patient' || (n.recipientUserId && n.recipientUserId === currentUser?.id)
  ).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Patient Health Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {patient.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Track appointments, clinical consultations, authorized prescriptions, and medical history.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/patient/book"
              className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
            <Link
              to="/patient/appointments"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
            >
              My Appointments ({myAppointments.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Appointment & Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Scheduled Appointment Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-card border border-slate-200/80">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Next Upcoming Appointment</h3>
                <p className="text-xs text-slate-400">Scheduled clinical consultation</p>
              </div>
            </div>
            {upcomingAppointment && <StatusBadge status={upcomingAppointment.status} />}
          </div>

          {upcomingAppointment ? (
            <div className="space-y-4">
              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                      {upcomingAppointment.departmentName}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                      {upcomingAppointment.doctorName}
                    </h4>
                    <p className="text-xs text-slate-500">{upcomingAppointment.doctorSpecialty}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="flex items-center sm:justify-end gap-1.5 text-slate-700 text-xs font-semibold">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <span>{formatDateDisplay(upcomingAppointment.date)}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-1.5 text-slate-500 text-xs mt-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{upcomingAppointment.timeSlot}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Consultation Fee:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(upcomingAppointment.consultationFee)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Booking Deposit ({upcomingAppointment.bookingChargePercentage}%):</span>
                    <span className="font-bold text-slate-900">{formatCurrency(upcomingAppointment.bookingCharge)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Charge Status:</span>
                    <span className="font-semibold text-brand-700">{upcomingAppointment.chargeStatus}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400 italic">
                  * Cancellation permitted up to {config.cancellationCutOffHours} hours before start time.
                </p>
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
                >
                  Manage Booking <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <CalendarPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No active appointment scheduled</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Need to see a cardiologist, pediatrician, or general physician? Book a slot with our specialists.
              </p>
              <Link
                to="/patient/book"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs hover:bg-brand-700 transition-colors"
              >
                Request Appointment Now
              </Link>
            </div>
          )}
        </div>

        {/* Medical History Completion & Quick Stats */}
        <div className="space-y-6">
          {/* Medical History Indicator (FR-13) */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Medical History Status</h3>
            <div className="mt-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Diagnosis History Profile Verified</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Your baseline chronic conditions and drug allergies are on record for attending physicians.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-slate-800">{patient.bloodGroup}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Completed Consultations:</span>
                <span className="font-bold text-slate-800">{completedCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-bold text-slate-800">{patient.emergencyContact?.name}</span>
              </div>
            </div>

            <Link
              to="/patient/medical-history"
              className="mt-4 block text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold transition-colors"
            >
              Update Medical History
            </Link>
          </div>

          {/* Booking Charge Information Notice (FR-12) */}
          <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <span>Clinic Booking Policy (TBD-4)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Appointments incur a configurable {config.bookingChargePercentage}% reservation charge.
              All payments are transacted in-person at the front reception desk; no online banking gateway is used.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Notifications & Recent Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Alerts & Updates</h3>
            <span className="text-xs text-slate-400">{patientNotifs.length} alerts</span>
          </div>
          <div className="space-y-3">
            {patientNotifs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent notifications</p>
            ) : (
              patientNotifs.map(n => (
                <div key={n.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">{n.title}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Doctor Consultation History */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Clinical Notes</h3>
            <Link to="/patient/reports" className="text-xs font-bold text-brand-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No consultation records yet</p>
            ) : (
              recentRecords.map(r => (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{r.doctorName}</span>
                    <span className="text-[11px] text-slate-400">{formatDateDisplay(r.consultationDate)}</span>
                  </div>
                  <p className="text-xs font-semibold text-brand-700">Diagnosis: {r.diagnosis}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{r.clinicalNotes}</p>
                  {r.prescriptions && r.prescriptions.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {r.prescriptions.map((p, idx) => (
                        <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                          💊 {p.medication} ({p.dosage})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
