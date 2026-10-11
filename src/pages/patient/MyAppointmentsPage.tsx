import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Phone,
  FileText,
  CalendarPlus,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';
import { Appointment, AppointmentStatus } from '../../types';
import { Link } from 'react-router-dom';

export const MyAppointmentsPage: React.FC = () => {
  const { appointments, cancelAppointment, config, patients } = useClinic();
  const { currentUser } = useAuth();

  const currentPatient =
    patients.find(p => p.id === currentUser?.patientId || p.email === currentUser?.email) ||
    patients[0];

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cancellation Modal State
  const [targetAppointment, setTargetAppointment] = useState<Appointment | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancelFeedback, setCancelFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Filter patient's appointments
  const patientAppointments = appointments.filter(a => a.patientId === currentPatient.id);

  const filteredAppointments = patientAppointments.filter(apt => {
    // Tab filter
    if (activeTab === 'active' && apt.status !== 'Pending Approval' && apt.status !== 'Confirmed') {
      return false;
    }
    if (activeTab === 'completed' && apt.status !== 'Completed') return false;
    if (activeTab === 'cancelled' && apt.status !== 'Cancelled' && apt.status !== 'Rejected') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        apt.id.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.departmentName.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate if appointment is inside the 2-hour cut-off
  const isInsideCutOff = (apt: Appointment): boolean => {
    try {
      const startTimeStr = apt.timeSlot.split('-')[0].trim();
      const aptDateTime = new Date(`${apt.date} ${startTimeStr}`);
      const now = new Date();
      const diffHours = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours < config.cancellationCutOffHours && diffHours >= 0;
    } catch {
      return false;
    }
  };

  const handleOpenCancel = (apt: Appointment) => {
    setTargetAppointment(apt);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = (reason?: string) => {
    if (!targetAppointment) return;

    const res = cancelAppointment(
      targetAppointment.id,
      reason || 'Patient self-cancellation online',
      'Patient',
      false,
      currentPatient.fullName
    );

    setIsCancelModalOpen(false);

    if (res.success) {
      setCancelFeedback({
        success: true,
        msg: `Appointment ${targetAppointment.id} has been successfully cancelled and the slot has been released. Refund status: ${res.refundEligibility}`,
      });
    } else {
      setCancelFeedback({
        success: false,
        msg: res.error || 'Failed to cancel appointment.',
      });
    }

    setTargetAppointment(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your consultations, booking statuses, and manage schedules (FR-14, FR-15)
          </p>
        </div>
        <Link
          to="/patient/book"
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book New Slot</span>
        </Link>
      </div>

      {cancelFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
            cancelFeedback.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {cancelFeedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{cancelFeedback.msg}</span>
          </div>
          <button
            onClick={() => setCancelFeedback(null)}
            className="text-xs font-bold underline ml-4 hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl shadow-card border border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Appointments ({patientAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Upcoming & Pending ({patientAppointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending Approval').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed ({patientAppointments.filter(a => a.status === 'Completed').length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'cancelled'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cancelled / Rejected ({patientAppointments.filter(a => a.status === 'Cancelled' || a.status === 'Rejected').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search doctor or ID..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-slate-200/80">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no appointments matching your selected filter or search criteria.
            </p>
          </div>
        ) : (
          filteredAppointments.map(apt => {
            const insideCutOff = isInsideCutOff(apt);
            const canCancel = (apt.status === 'Pending Approval' || apt.status === 'Confirmed') && !insideCutOff;

            return (
              <div
                key={apt.id}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/80 hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                      {apt.id}
                    </span>
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                      {apt.departmentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Doctor Info */}
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Consulting Doctor</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{apt.doctorName}</h4>
                    <p className="text-slate-500 text-[11px]">{apt.doctorSpecialty}</p>
                  </div>

                  {/* Schedule Info */}
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Schedule Time</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      <span>{formatDateDisplay(apt.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px] mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.timeSlot}</span>
                    </div>
                  </div>

                  {/* Fee & Booking Charge Info */}
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Charges (Offline Collection)</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-slate-600">Fee: {formatCurrency(apt.consultationFee)}</span>
                      <span className="font-bold text-brand-700">Deposit: {formatCurrency(apt.bookingCharge)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Status: {apt.chargeStatus}</span>
                  </div>
                </div>

                {/* Reason & Notes */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">Reason for visit: </span>
                  <span className="text-slate-600">{apt.reason}</span>

                  {apt.cancelReason && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-rose-700">
                      <strong>Cancellation Reason:</strong> {apt.cancelReason}
                      {apt.refundEligibility && (
                        <div className="text-[11px] text-slate-600 mt-0.5 italic">
                          Refund Policy: {apt.refundEligibility}
                        </div>
                      )}
                    </div>
                  )}

                  {apt.rejectionReason && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-rose-700">
                      <strong>Rejection Reason:</strong> {apt.rejectionReason}
                    </div>
                  )}

                  {apt.diagnosis && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-emerald-800">
                      <strong>Doctor Diagnosis:</strong> {apt.diagnosis}
                      {apt.notes && <p className="text-[11px] text-slate-600 mt-0.5">{apt.notes}</p>}
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    {insideCutOff && (apt.status === 'Confirmed' || apt.status === 'Pending Approval') && (
                      <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        Within {config.cancellationCutOffHours}-hour cut-off. Self-cancellation disabled (FR-15). Contact reception for emergency.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        onClick={() => handleOpenCancel(apt)}
                        className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cancel Appointment</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Patient Cancellation */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel appointment ${targetAppointment?.id} with ${targetAppointment?.doctorName} on ${targetAppointment?.date}? Your slot will be released immediately.`}
        confirmLabel="Confirm Cancellation"
        isDanger={true}
        requireReason={true}
        reasonPlaceholder="Please state your reason for cancellation..."
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setTargetAppointment(null);
        }}
      />
    </div>
  );
};
