import React, { useState } from 'react';
import { CalendarRange, Calendar, Clock, Stethoscope, Search, Building2 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { formatDateDisplay } from '../../utils/formatters';

export const AdminSchedulesPage: React.FC = () => {
  const { schedules, doctors, departments } = useClinic();
  const [search, setSearch] = useState('');

  const filtered = schedules.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.doctorName.toLowerCase().includes(q) || s.roomNumber.toLowerCase().includes(q) || s.date.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Doctor Schedules & Shifts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Executive overview of monthly shifts, room assignments, and pre-planned holidays (FR-20, FR-21)
          </p>
        </div>
        <div className="bg-brand-50 text-brand-800 border border-brand-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold">
          {schedules.length} Shift Records Active
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-card border border-slate-200/80 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by doctor name, room number, or date..."
          className="w-full text-xs border-none focus:outline-hidden"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Schedule ID</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Room (FR-23)</th>
                <th className="py-3 px-4 text-right">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{s.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.doctorName}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{formatDateDisplay(s.date)}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{s.shift}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">{s.roomNumber}</td>
                  <td className="py-3.5 px-4 text-right">
                    {s.isHoliday ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Holiday: {s.holidayReason || 'Leave'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        On Duty
                      </span>
                    )}
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
