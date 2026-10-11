import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Eye,
  CalendarPlus,
  RotateCcw,
  UserX,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Stethoscope,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';
import { Appointment, AppointmentStatus } from '../../types';

export const AllAppointmentsPage: React.FC = () => {
  const {
    appointments,
    departments,
    doctors,
    cancelAppointment,
    markNoShow,
    rescheduleAppointment,
  } = useClinic();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');

  // Modals state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Reschedule state
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('');

  // Cancel state
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isEmergencyCancel, setIsEmergencyCancel] = useState(false);

  // No-show state
  const [isNoShowOpen, setIsNoShowOpen] = useState(false);

  const [actionFeedback, setActionFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    if (deptFilter !== 'all' && apt.departmentId !== deptFilter) return false;
    if (doctorFilter !== 'all' && apt.doctorId !== doctorFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        apt.id.toLowerCase().includes(q) ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q) ||
        apt.departmentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmCancel = (reason?: string) => {
    if (!selectedAppointment) return;
    const res = cancelAppointment(
      selectedAppointment.id,
      reason || (isEmergencyCancel ? 'Emergency cancellation by clinic' : 'Receptionist cancellation'),
      'Receptionist',
      isEmergencyCancel,
      'Receptionist Marco'
    );
    setIsCancelOpen(false);
    if (res.success) {
      setActionFeedback({
        success: true,
        msg: `Appointment ${selectedAppointment.id} cancelled. ${res.refundEligibility}`,
      });
    } else {
      setActionFeedback({ success: false, msg: res.error || 'Cancellation failed.' });
    }
    setSelectedAppointment(null);
  };

  const handleConfirmNoShow = () => {
    if (!selectedAppointment) return;
    markNoShow(selectedAppointment.id, 'Patient failed to appear without notification.', 'Receptionist Marco');
    setIsNoShowOpen(false);
    setActionFeedback({
      success: true,
      msg: `Appointment ${selectedAppointment.id} marked as No-show. Status updated in reports.`,
    });
    setSelectedAppointment(null);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !newDate || !newSlot) return;
    const res = rescheduleAppointment(selectedAppointment.id, newDate, newSlot, 'Receptionist Marco');
    setIsRescheduleOpen(false);
    if (res.success) {
      setActionFeedback({
        success: true,
        msg: `Appointment ${selectedAppointment.id} successfully rescheduled to ${newDate} at ${newSlot}.`,
      });
    } else {
      setActionFeedback({ success: false, msg: res.error || 'Rescheduling failed.' });
    }
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Appointments Master Table</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full operational registry across all departments, doctors, and appointment lifecycles (Section 7.B)
          </p>
        </div>
        <Link
          to="/receptionist/book-patient"
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Book for Patient</span>
        </Link>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
            actionFeedback.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{actionFeedback.msg}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-xs font-bold underline ml-4 hover:opacity-75">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-card border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient, doctor, ID..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
              <option value="No-show">No-show</option>
            </select>
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="all">All Doctors</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.fullName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3.5 px-4">Apt ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Department & Doctor</th>
                <th className="py-3.5 px-4">Date & Slot</th>
                <th className="py-3.5 px-4">Fee / Deposit</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {apt.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{apt.patientName}</div>
                      <span className="text-[11px] text-slate-400">{apt.patientPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                      <span className="text-[11px] text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded font-medium">
                        {apt.departmentName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{formatDateDisplay(apt.date)}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{apt.timeSlot}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{formatCurrency(apt.consultationFee)}</div>
                      <div className="text-[11px] text-slate-500">
                        Dep: {formatCurrency(apt.bookingCharge)} ({apt.bookingChargePercentage}%)
                      </div>
                      <span className="text-[10px] text-slate-400">{apt.chargeStatus}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={apt.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setIsDetailsOpen(true);
                          }}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(apt.status === 'Confirmed' || apt.status === 'Pending Approval') && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setNewDate(apt.date);
                                setNewSlot(apt.timeSlot);
                                setIsRescheduleOpen(true);
                              }}
                              title="Reschedule Appointment"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setIsEmergencyCancel(false);
                                setIsCancelOpen(true);
                              }}
                              title="Cancel Appointment"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {apt.status === 'Confirmed' && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsNoShowOpen(true);
                            }}
                            title="Mark No-Show"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Appointment Record: {selectedAppointment.id}</h3>
                <p className="text-xs text-slate-400">Created: {new Date(selectedAppointment.createdAt).toLocaleString()}</p>
              </div>
              <StatusBadge status={selectedAppointment.status} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patient Details</span>
                <p className="font-bold text-slate-900">{selectedAppointment.patientName} ({selectedAppointment.patientPhone})</p>
                <p className="text-slate-500">{selectedAppointment.patientAge} years • {selectedAppointment.patientGender}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinical Assignment</span>
                <p className="font-bold text-slate-900">{selectedAppointment.doctorName}</p>
                <p className="text-slate-500">{selectedAppointment.doctorSpecialty} • {selectedAppointment.departmentName}</p>
                <p className="font-semibold text-brand-700 mt-1">
                  {formatDateDisplay(selectedAppointment.date)} ({selectedAppointment.timeSlot})
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Financial Record (Offline)</span>
                <div className="flex justify-between">
                  <span>Consultation Fee:</span>
                  <span className="font-bold">{formatCurrency(selectedAppointment.consultationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking Deposit:</span>
                  <span className="font-bold text-brand-700">
                    {formatCurrency(selectedAppointment.bookingCharge)} ({selectedAppointment.bookingChargePercentage}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Charge Status:</span>
                  <span className="font-semibold">{selectedAppointment.chargeStatus}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patient's Reason</span>
                <p className="text-slate-700 mt-0.5">{selectedAppointment.reason}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleConfirmReschedule} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reschedule {selectedAppointment.id}</h3>
            <p className="text-xs text-slate-500">
              Move {selectedAppointment.patientName}'s appointment with {selectedAppointment.doctorName}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Time Slot</label>
                <input
                  type="text"
                  value={newSlot}
                  onChange={e => setNewSlot(e.target.value)}
                  placeholder="e.g. 11:00 AM - 11:30 AM"
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
              >
                Confirm Reschedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancellation Modal */}
      <ConfirmationModal
        isOpen={isCancelOpen}
        title="Cancel Appointment"
        message={`Are you cancelling appointment ${selectedAppointment?.id} for ${selectedAppointment?.patientName}? This action releases the reserved slot.`}
        confirmLabel="Confirm Cancellation"
        isDanger={true}
        requireReason={true}
        reasonPlaceholder="Mandatory cancellation reason..."
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelOpen(false)}
      />

      {/* Mark No-Show Modal */}
      <ConfirmationModal
        isOpen={isNoShowOpen}
        title="Mark Appointment as No-Show"
        message={`Confirm marking appointment ${selectedAppointment?.id} (${selectedAppointment?.patientName}) as No-show? This records that the patient missed the confirmed consultation.`}
        confirmLabel="Confirm No-Show"
        isDanger={true}
        onConfirm={handleConfirmNoShow}
        onCancel={() => setIsNoShowOpen(false)}
      />
    </div>
  );
};
