import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarPlus,
  Stethoscope,
  WifiOff,
  FolderLock,
  ArrowRight,
  TrendingUp,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Activity,
  Layers,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';

export const ReceptionistDashboard: React.FC = () => {
  const { appointments, doctors, patients, symptoms, schedules, config, isOfflineSimulated } = useClinic();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];

  // Core metrics
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const pendingRequests = appointments.filter(a => a.status === 'Pending Approval');
  const confirmedToday = todayAppointments.filter(a => a.status === 'Confirmed');
  const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled');
  const noShowCount = appointments.filter(a => a.status === 'No-show').length;
  const unsyncedSymptoms = symptoms.filter(s => s.syncStatus === 'pending');

  // Mini calendar state
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayStr);

  // Doctors on shift today
  const activeSchedulesToday = schedules.filter(s => s.date === todayStr && !s.isHoliday);

  // Chart data: Monthly patient volume
  const activityData = [
    { month: 'Jan', appointments: 240 },
    { month: 'Feb', appointments: 340 },
    { month: 'Mar', appointments: 280 },
    { month: 'Apr', appointments: 190 },
    { month: 'May', appointments: 230 },
    { month: 'Jun', appointments: 310 },
    { month: 'Jul', appointments: 380 },
    { month: 'Aug', appointments: 420 },
    { month: 'Sep', appointments: 390 },
    { month: 'Oct', appointments: 450 },
  ];

  // Appointment Status distribution data for pie chart
  const statusPieData = [
    { name: 'Confirmed', value: appointments.filter(a => a.status === 'Confirmed').length, color: '#10b981' },
    { name: 'Pending', value: pendingRequests.length, color: '#f59e0b' },
    { name: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: '#0ea5e9' },
    { name: 'Cancelled', value: cancelledAppointments.length, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Front Desk Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time appointment triage, doctor room schedules, and clinical intake (MedHealthy Operations)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/receptionist/requests"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Pending Requests ({pendingRequests.length})</span>
          </Link>
          <Link
            to="/receptionist/book-patient"
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book for Walk-in</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Metric Cards (Styled per Image 1 MedHealthy card aesthetic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Approval */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex items-center gap-4 transition-all hover:shadow-card-hover">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Approval</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{pendingRequests.length}</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Hold active slots</p>
          </div>
        </div>

        {/* Metric 2: Today's Appointments */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex items-center gap-4 transition-all hover:shadow-card-hover">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Total</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{todayAppointments.length}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{confirmedToday.length} confirmed</p>
          </div>
        </div>

        {/* Metric 3: Total Patients */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex items-center gap-4 transition-all hover:shadow-card-hover">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Patients</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{patients.length}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Directory baseline</p>
          </div>
        </div>

        {/* Metric 4: Offline Queue / Rooms */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex items-center gap-4 transition-all hover:shadow-card-hover">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            unsyncedSymptoms.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
          }`}>
            <WifiOff className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offline Sync Queue</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{unsyncedSymptoms.length}</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {isOfflineSimulated ? 'Offline simulation ON' : 'Ready to sync'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Today's Schedule strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Chart & Status Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Activity Bar Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Patient Consultation Volume</h3>
                <p className="text-xs text-slate-400">Monthly clinic visits across all 6 departments</p>
              </div>
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-xl">
                2026 Trends
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="appointments" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Pending Requests Table */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Urgent Pending Requests</h3>
                <p className="text-xs text-slate-400">Review doctor availability and approve slots (FR-09)</p>
              </div>
              <Link to="/receptionist/requests" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
                View All ({pendingRequests.length}) <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {pendingRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center italic">
                All appointment requests have been processed! No pending slots holding queue.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingRequests.slice(0, 3).map(req => (
                  <div key={req.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{req.patientName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({req.id})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {req.doctorName} • {formatDateDisplay(req.date)} ({req.timeSlot})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/receptionist/requests')}
                        className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Doctor's Appointment strip inspired by Image 1 */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Today's Duty Roster</h3>
              <span className="text-xs font-bold text-slate-500">{formatDateDisplay(todayStr)}</span>
            </div>

            <div className="space-y-3">
              {doctors.slice(0, 4).map((doc, idx) => {
                const colors = [
                  { bg: 'bg-rose-50', text: 'text-rose-600', activeBg: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' },
                  { bg: 'bg-blue-50', text: 'text-blue-600', activeBg: 'bg-gradient-to-r from-blue-500 to-sky-600 text-white' },
                  { bg: 'bg-teal-50', text: 'text-teal-600', activeBg: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white' },
                  { bg: 'bg-indigo-50', text: 'text-indigo-600', activeBg: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' },
                ];
                const color = colors[idx % colors.length];

                return (
                  <div
                    key={doc.id}
                    onClick={() => navigate('/receptionist/availability')}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${color.bg} ${color.text} flex items-center justify-center shrink-0`}>
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                          {doc.departmentName}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{doc.fullName}</h4>
                        <span className="text-[11px] text-slate-500">{doc.roomAssigned} • {doc.shiftDefault}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-800 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>

            <Link
              to="/receptionist/availability"
              className="block text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold transition-colors mt-2"
            >
              View Full Availability Grid
            </Link>
          </div>

          {/* Quick Front Desk Shortcuts */}
          <div className="bg-gradient-to-br from-slate-900 to-navy-900 rounded-3xl p-6 text-white shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Front Desk Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/receptionist/symptoms"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span>Enter Symptoms</span>
              </Link>
              <Link
                to="/receptionist/files"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold flex items-center gap-2"
              >
                <FolderLock className="w-4 h-4 text-sky-400" />
                <span>Upload File</span>
              </Link>
              <Link
                to="/receptionist/cancellations"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>Follow-up Calls</span>
              </Link>
              <Link
                to="/receptionist/offline-sync"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold flex items-center gap-2"
              >
                <WifiOff className="w-4 h-4 text-rose-400" />
                <span>Offline Center</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
