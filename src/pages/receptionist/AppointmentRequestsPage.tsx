import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Check,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';
import { Appointment } from '../../types';

export const AppointmentRequestsPage: React.FC = () => {
  const { appointments, approveAppointment, rejectAppointment } = useClinic();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const [rejectTarget, setRejectTarget] = useState<Appointment | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const pendingRequests = appointments.filter(a => a.status === 'Pending Approval');

  const filtered = pendingRequests.filter(req => {
    if (deptFilter !== 'all' && req.departmentId !== deptFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        req.id.toLowerCase().includes(q) ||
        req.patientName.toLowerCase().includes(q) ||
        req.doctorName.toLowerCase().includes(q) ||
        req.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (req: Appointment) => {
    const res = approveAppointment(req.id, 'Receptionist Marco');
    if (res.success) {
      setFeedback({
        success: true,
        msg: `Appointment ${req.id} for ${req.patientName} has been approved and confirmed. Doctor & patient notified!`,
      });
    } else {
      setFeedback({
        success: false,
        msg: res.error || 'Failed to approve request.',
      });
    }
  };

  const handleConfirmReject = (reason?: string) => {
    if (!rejectTarget) return;
    const res = rejectAppointment(rejectTarget.id, reason || 'Doctor unavailable at selected time slot', 'Receptionist Marco');
    setIsRejectModalOpen(false);
    if (res.success) {
      setFeedback({
        success: true,
        msg: `Request ${rejectTarget.id} declined. Slot has been freed for new bookings.`,
      });
    } else {
      setFeedback({
        success: false,
        msg: res.error || 'Failed to reject request.',
      });
    }
    setRejectTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pending Appointment Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review slot allocations, approve confirmed bookings, or decline with mandatory reason (FR-09, Journey 2)
          </p>
        </div>
        <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>{pendingRequests.length} Requests Holding Slots</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
            feedback.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline ml-4 hover:opacity-75">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl shadow-card border border-slate-200/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient name, ID, or doctor..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Requests Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-slate-200/80">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">All requests are processed</h3>
            <p className="text-xs text-slate-400 mt-1">There are no pending booking requests at this moment.</p>
          </div>
        ) : (
          filtered.map(req => (
            <div
              key={req.id}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/80 hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    {req.id}
                  </span>
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                    {req.departmentName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Booked by {req.bookedBy} • {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {/* Patient Information */}
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Patient Information</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{req.patientName}</h4>
                  <p className="text-slate-500 text-[11px]">{req.patientPhone} • {req.patientAge}y, {req.patientGender}</p>
                </div>

                {/* Consulting Doctor */}
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Consulting Doctor</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{req.doctorName}</h4>
                  <p className="text-slate-500 text-[11px]">{req.doctorSpecialty}</p>
                </div>

                {/* Date & Time Slot */}
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Requested Slot</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>{formatDateDisplay(req.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px] mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.timeSlot}</span>
                  </div>
                </div>

                {/* Financials (FR-12) */}
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Fees & Deposit</span>
                  <p className="font-bold text-slate-900 mt-0.5">{formatCurrency(req.consultationFee)} Total Fee</p>
                  <p className="text-brand-700 text-[11px] font-semibold">
                    {formatCurrency(req.bookingCharge)} ({req.bookingChargePercentage}% Deposit)
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">Reported Symptoms / Reason: </span>
                <span className="text-slate-600">{req.reason}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Approving will confirm the reservation and notify the patient. Rejecting releases the slot immediately.
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setRejectTarget(req);
                      setIsRejectModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4 text-rose-600" />
                    <span>Reject Request</span>
                  </button>

                  <button
                    onClick={() => handleApprove(req)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>Approve & Confirm</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mandatory Rejection Reason Dialog (FR-09) */}
      <ConfirmationModal
        isOpen={isRejectModalOpen}
        title="Reject Appointment Request"
        message={`Please provide a mandatory reason for declining ${rejectTarget?.patientName}'s request for ${rejectTarget?.doctorName}. This explanation will be sent to the patient.`}
        confirmLabel="Confirm Rejection"
        isDanger={true}
        requireReason={true}
        reasonPlaceholder="e.g., Doctor is called for emergency surgery, please rebook for afternoon shift..."
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setIsRejectModalOpen(false);
          setRejectTarget(null);
        }}
      />
    </div>
  );
};
