import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Edit,
  Save,
  X,
  Stethoscope,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';
import { DoctorSchedule } from '../../types';

export const DoctorAvailabilityPage: React.FC = () => {
  const { doctors, departments, schedules, appointments, rooms, updateDoctorSchedule } = useClinic();

  const todayStr = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState(todayStr);
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Edit schedule state
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(null);
  const [editShift, setEditShift] = useState<'Shift 1' | 'Shift 2'>('Shift 1');
  const [editRoom, setEditRoom] = useState('Room 101');
  const [editIsHoliday, setEditIsHoliday] = useState(false);
  const [editHolidayReason, setEditHolidayReason] = useState('');
  const [conflictWarning, setConflictWarning] = useState<number | null>(null);

  const filteredDoctors = doctors.filter(
    d => selectedDeptId === 'all' || d.departmentId === selectedDeptId
  );

  const handleOpenEdit = (docId: string, docName: string) => {
    let sched = schedules.find(s => s.doctorId === docId && s.date === currentDate);
    if (!sched) {
      sched = {
        id: `SCH-NEW-${Date.now().toString().slice(-4)}`,
        doctorId: docId,
        doctorName: docName,
        date: currentDate,
        shift: 'Shift 1',
        roomNumber: 'Room 101',
        isHoliday: false,
      };
    }
    setEditingSchedule(sched);
    setEditShift(sched.shift);
    setEditRoom(sched.roomNumber);
    setEditIsHoliday(sched.isHoliday);
    setEditHolidayReason(sched.holidayReason || '');

    // Check how many confirmed appointments exist on this date for this doctor
    const affected = appointments.filter(
      a => a.doctorId === docId && a.date === currentDate && (a.status === 'Confirmed' || a.status === 'Pending Approval')
    ).length;
    setConflictWarning(affected > 0 ? affected : null);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    updateDoctorSchedule(editingSchedule.id, {
      shift: editShift,
      roomNumber: editRoom,
      isHoliday: editIsHoliday,
      holidayReason: editHolidayReason || undefined,
    });

    setEditingSchedule(null);
    setConflictWarning(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctor Availability & Shift Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor duty shifts (Shift 1 & 2), consultation rooms, and slot allocations (FR-20, FR-21, FR-22)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={currentDate}
            onChange={e => setCurrentDate(e.target.value)}
            className="text-xs px-3.5 py-2 rounded-2xl border border-slate-200 bg-white font-bold"
          />
        </div>
      </div>

      {/* Filter and Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl shadow-card border border-slate-200/80">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDeptId}
            onChange={e => setSelectedDeptId(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold"
          >
            <option value="all">All 6 Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Duty Shift Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Holiday / On Leave
          </span>
        </div>
      </div>

      {/* Doctors Grid for Selected Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map(doctor => {
          const schedule = schedules.find(s => s.doctorId === doctor.id && s.date === currentDate);
          const shift = schedule ? schedule.shift : doctor.shiftDefault === 'Both' ? 'Shift 1' : doctor.shiftDefault;
          const room = schedule ? schedule.roomNumber : doctor.roomAssigned;
          const isHoliday = schedule ? schedule.isHoliday : false;

          // Appointments for this doctor on current date
          const doctorApts = appointments.filter(a => a.doctorId === doctor.id && a.date === currentDate);
          const confirmedCount = doctorApts.filter(a => a.status === 'Confirmed').length;
          const pendingCount = doctorApts.filter(a => a.status === 'Pending Approval').length;

          return (
            <div
              key={doctor.id}
              className={`bg-white rounded-3xl p-5 shadow-card border transition-all ${
                isHoliday ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                  {doctor.departmentName}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isHoliday ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {isHoliday ? 'On Leave / Holiday' : 'Available on Duty'}
                </span>
              </div>

              <div className="flex items-center gap-3 my-4">
                <img
                  src={doctor.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'}
                  alt={doctor.fullName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/20"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{doctor.fullName}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{doctor.specialty}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doctor.phone}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Duty Shift:</span>
                  <span className="font-bold text-slate-800">{shift}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room Assigned (FR-23):</span>
                  <span className="font-bold text-slate-800">{room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booked Slots:</span>
                  <span className="font-bold text-slate-800">
                    {confirmedCount} Confirmed, {pendingCount} Pending
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900">
                  Fee: {formatCurrency(doctor.consultationFee)}
                </span>
                <button
                  onClick={() => handleOpenEdit(doctor.id, doctor.fullName)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Schedule</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Doctor Schedule Dialog with Conflict Warning (FR-21) */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSaveSchedule} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Schedule for {editingSchedule.doctorName}</h3>
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SRS FR-21 Warning if confirmed appointments exist */}
            {conflictWarning && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Schedule Conflict Warning (FR-21)</p>
                  <p className="mt-0.5">
                    There are <strong>{conflictWarning} active appointment(s)</strong> already booked for this doctor on {currentDate}.
                    Modifying shifts or declaring a holiday will require contacting or rescheduling affected patients.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Assignment</label>
                <select
                  value={editShift}
                  onChange={e => setEditShift(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Shift 1">Shift 1 (08:30 AM - 01:30 PM)</option>
                  <option value="Shift 2">Shift 2 (02:30 PM - 07:30 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Assignment (FR-23)</label>
                <select
                  value={editRoom}
                  onChange={e => setEditRoom(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.roomNumber}>{r.roomNumber} ({r.departmentName})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsHoliday}
                    onChange={e => setEditIsHoliday(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span>Mark as Planned Holiday / CME Leave (FR-20)</span>
                </label>

                {editIsHoliday && (
                  <input
                    type="text"
                    value={editHolidayReason}
                    onChange={e => setEditHolidayReason(e.target.value)}
                    placeholder="Enter reason (e.g. CME Conference, Personal Leave)..."
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white mt-1"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
              >
                Save Schedule Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
