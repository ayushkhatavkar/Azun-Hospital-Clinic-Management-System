import React, { useState } from 'react';
import {
  PhoneCall,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  Plus,
  CheckCircle2,
  Phone,
  FileText,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';

export const CancellationsFollowUpPage: React.FC = () => {
  const { appointments, callLogs, logCall, config } = useClinic();

  const [search, setSearch] = useState('');
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState('');
  const [callType, setCallType] = useState<'Cancellation Notice' | 'Reschedule Assistance' | 'Follow-up Check'>('Cancellation Notice');
  const [callNotes, setCallNotes] = useState('');
  const [callStatus, setCallStatus] = useState<'Completed' | 'Unreachable' | 'Left Voicemail'>('Completed');

  const cancelledAppointments = appointments.filter(
    a => a.status === 'Cancelled' || a.status === 'No-show'
  );

  const handleRecordCall = (e: React.FormEvent) => {
    e.preventDefault();
    const apt = appointments.find(a => a.id === selectedAptId);
    if (!apt) return;

    logCall({
      appointmentId: apt.id,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      callType,
      notes: callNotes,
      callStatus,
      loggedBy: 'Marco Rodriguez (Chief Receptionist)',
    });

    setIsLogCallOpen(false);
    setCallNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cancellations & Patient Follow-Up Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor emergency cancellation flags, simulated refund claims, and phone logs (Section 7.H, FR-16, TBD-6)
          </p>
        </div>

        <button
          onClick={() => {
            if (cancelledAppointments.length > 0) {
              setSelectedAptId(cancelledAppointments[0].id);
            }
            setIsLogCallOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Log Patient Call Record</span>
        </button>
      </div>

      {/* Cancellation Policy Banner */}
      <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <span>Clinic Cancellation & Refund Policy Rules (SRS FR-14, FR-16, TBD-6)</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Standard cancellation cut-off is configured at <strong>{config.cancellationCutOffHours} hours</strong> before appointment time.
          Cancellations prior to cut-off receive 100% simulated deposit refund. Inside the cut-off window, self-cancellation is blocked; emergency cancellations logged by reception carry a simulated {config.emergencyCancellationFeeRefundablePercent}% discretionary refund.
          (Note: All refund records are simulated in prototype without payment gateway connectivity).
        </p>
      </div>

      {/* Grid: Recent Cancellations Table & Call Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cancellation Records */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Cancelled & Missed Appointments</h3>
              <span className="text-xs text-slate-400">{cancelledAppointments.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">Apt ID</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Cancellation Type</th>
                    <th className="py-3 px-4">Reason Given</th>
                    <th className="py-3 px-4 text-right">Refund Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cancelledAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{apt.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{apt.patientName}</div>
                        <span className="text-[11px] text-slate-400">{apt.patientPhone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800">{formatDateDisplay(apt.date)}</div>
                        <span className="text-[10px] text-slate-400">{apt.timeSlot}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {apt.isEmergencyCancellation ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Emergency Cancel
                          </span>
                        ) : apt.status === 'No-show' ? (
                          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                            Patient No-show
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Standard Cancel
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        {apt.cancelReason || apt.notes || 'No reason specified'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[11px] font-semibold text-slate-700 block">
                          {apt.refundEligibility || 'Non-refundable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Call Records */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Simulated Call Registry</h3>
              <span className="text-xs text-slate-400">{callLogs.length} calls</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {callLogs.map(log => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.patientName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {log.callStatus}
                    </span>
                  </div>
                  <p className="text-brand-700 font-semibold text-[11px]">{log.callType} ({log.appointmentId})</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.notes}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">{log.timestamp} • {log.loggedBy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log Call Modal */}
      {isLogCallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleRecordCall} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Record Patient Phone Follow-Up</h3>
            <p className="text-xs text-slate-500">Document verbal discussion for audit compliance (Section 7.H)</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Cancelled Appointment</label>
                <select
                  value={selectedAptId}
                  onChange={e => setSelectedAptId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {cancelledAppointments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.id} • {a.patientName} ({a.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Call Type</label>
                <select
                  value={callType}
                  onChange={e => setCallType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Cancellation Notice">Cancellation Notice</option>
                  <option value="Reschedule Assistance">Reschedule Assistance</option>
                  <option value="Follow-up Check">Follow-up Check</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Call Outcome</label>
                <select
                  value={callStatus}
                  onChange={e => setCallStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Completed">Completed</option>
                  <option value="Unreachable">Unreachable</option>
                  <option value="Left Voicemail">Left Voicemail</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discussion Notes *</label>
                <textarea
                  value={callNotes}
                  onChange={e => setCallNotes(e.target.value)}
                  required
                  rows={3}
                  placeholder="Summarize conversation with patient regarding cancellation/rescheduling..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLogCallOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
              >
                Save Call Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
