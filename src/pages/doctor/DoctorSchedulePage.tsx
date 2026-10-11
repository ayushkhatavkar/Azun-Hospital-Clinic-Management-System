import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Building2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDateDisplay } from '../../utils/formatters';

export const DoctorSchedulePage: React.FC = () => {
  const { doctors, schedules, appointments } = useClinic();
  const { currentUser } = useAuth();

  const currentDoctor =
    doctors.find(d => d.id === currentUser?.doctorId || d.userId === currentUser?.id) || doctors[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Doctor schedule on selected date
  const doctorSchedule = schedules.find(
    s => s.doctorId === currentDoctor.id && s.date === selectedDate
  );

  const shiftName = doctorSchedule ? doctorSchedule.shift : currentDoctor.shiftDefault;
  const roomName = doctorSchedule ? doctorSchedule.roomNumber : currentDoctor.roomAssigned;
  const isHoliday = doctorSchedule ? doctorSchedule.isHoliday : false;

  // Appointments on selected date
  const dateAppointments = appointments.filter(
    a => a.doctorId === currentDoctor.id && a.date === selectedDate
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Clinical Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily roster, room allocations, and patient appointments (SRS Section 8.B)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xs px-3.5 py-2 rounded-2xl border border-slate-200 bg-white font-bold"
          />
        </div>
      </div>

      {/* Roster Information Card (Read-Only per Section 8.B) */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Roster for {formatDateDisplay(selectedDate)}
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {shiftName} • {roomName}
            </h3>
            <p className="text-xs text-slate-500">{currentDoctor.departmentName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Rosters and duty shifts are maintained by Clinic Reception & Administration (Read-Only).</span>
        </div>
      </div>

      {/* Appointment Slots Table */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Consultations Scheduled ({dateAppointments.length})
          </h3>
          <span className="text-xs text-slate-400">{formatDateDisplay(selectedDate)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Consultation Reason</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dateAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No consultations booked for this date.
                  </td>
                </tr>
              ) : (
                dateAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {apt.timeSlot}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{apt.patientName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{apt.patientPhone}</td>
                    <td className="py-3.5 px-4 text-slate-700">{apt.patientAge}y, {apt.patientGender}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">{apt.reason}</td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={apt.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
