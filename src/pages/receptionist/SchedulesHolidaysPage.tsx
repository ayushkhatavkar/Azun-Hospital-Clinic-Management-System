import React, { useState } from 'react';
import {
  CalendarRange,
  Calendar,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Clock,
  User,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { formatDateDisplay } from '../../utils/formatters';

export const SchedulesHolidaysPage: React.FC = () => {
  const { leaves, addDoctorLeave, doctors, appointments } = useClinic();

  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Attending National Cardiology Summit');

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === doctorId);
    if (!doc) return;

    const res = addDoctorLeave({
      doctorId: doc.id,
      doctorName: doc.fullName,
      startDate,
      endDate,
      reason,
    });

    setIsAddLeaveOpen(false);
    setFeedback(
      `Leave scheduled for ${doc.fullName} (${startDate} to ${endDate}). ${res.affectedAppointmentsCount} appointment(s) flagged for review.`
    );
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Schedules & Planned Holidays</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure planned leave periods and clinic closure holidays (SRS FR-20, FR-21)
          </p>
        </div>
        <button
          onClick={() => setIsAddLeaveOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Doctor Leave / Holiday</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Planned Holidays / Leaves Table */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recorded Planned Doctor Leaves</h3>
          <span className="text-xs text-slate-400">{leaves.length} records active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Leave ID</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date Range</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Affected Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map(leave => {
                const affected = appointments.filter(
                  a =>
                    a.doctorId === leave.doctorId &&
                    a.date >= leave.startDate &&
                    a.date <= leave.endDate &&
                    (a.status === 'Confirmed' || a.status === 'Pending Approval')
                ).length;

                return (
                  <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{leave.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{leave.doctorName}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        <span>{formatDateDisplay(leave.startDate)} to {formatDateDisplay(leave.endDate)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{leave.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {affected > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> {affected} Appointments Flagged
                        </span>
                      ) : (
                        <span className="text-slate-400">0 Affected</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Leave Dialog */}
      {isAddLeaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleCreateLeave} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Schedule Doctor Leave / Holiday</h3>
            <p className="text-xs text-slate-500">Slots during this date range will be marked unavailable for new bookings.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor</label>
                <select
                  value={doctorId}
                  onChange={e => setDoctorId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.fullName} ({d.departmentName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Absence</label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  placeholder="e.g. CME Conference, Emergency Medical Leave..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddLeaveOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
              >
                Schedule Leave
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
