import React, { useState } from 'react';
import { CalendarCheck2, Search, Filter, Clock, FileText } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';

export const AdminAppointmentsPage: React.FC = () => {
  const { appointments } = useClinic();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = appointments.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.id.toLowerCase().includes(q) ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.departmentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Appointments Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-level visibility into all clinic consultations, fees, and deposit recordings
          </p>
        </div>
        <div className="bg-brand-50 text-brand-800 border border-brand-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold">
          {appointments.length} Total Appointments
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-card border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search appointment ID, patient, doctor..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold"
        >
          <option value="all">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rejected">Rejected</option>
          <option value="No-show">No-show</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Apt ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Department & Doctor</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Consultation Fee</th>
                <th className="py-3 px-4">Deposit ({appointments[0]?.bookingChargePercentage || 10}%)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{apt.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{apt.patientName}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{apt.doctorName}</span>
                    <span className="text-[10px] text-brand-600 block">{apt.departmentName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-800">{formatDateDisplay(apt.date)}</span>
                    <span className="text-[10px] text-slate-400 block">{apt.timeSlot}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(apt.consultationFee)}</td>
                  <td className="py-3.5 px-4 font-bold text-brand-700">{formatCurrency(apt.bookingCharge)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <StatusBadge status={apt.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
