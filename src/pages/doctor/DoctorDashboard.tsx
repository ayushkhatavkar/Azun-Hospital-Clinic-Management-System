import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  Stethoscope,
  TrendingUp,
  FolderLock,
  ChevronRight,
  Activity,
  ArrowRight,
  Check,
  X,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDateDisplay } from '../../utils/formatters';

export const DoctorDashboard: React.FC = () => {
  const { doctors, appointments, patients, doctorPatientMaps, approveAppointment, rejectAppointment } = useClinic();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Find active logged-in doctor (defaults to DOC-001 Dr. Caroline Hutomo or mapped doc)
  const currentDoctor = doctors.find(d => d.id === currentUser?.doctorId || d.userId === currentUser?.id) || doctors[0];

  const todayStr = new Date().toISOString().split('T')[0];

  // Assigned patients mapped to this doctor (FR-28)
  const mappedPatientIds = doctorPatientMaps
    .filter(m => m.doctorId === currentDoctor.id && m.active)
    .map(m => m.patientId);

  // Doctor's appointments
  const doctorAppointments = appointments.filter(a => a.doctorId === currentDoctor.id);
  const todayApts = doctorAppointments.filter(a => a.date === todayStr);
  const upcomingApts = doctorAppointments.filter(a => a.status === 'Confirmed' && a.date >= todayStr);
  const completedApts = doctorAppointments.filter(a => a.status === 'Completed');
  const pendingRequests = doctorAppointments.filter(a => a.status === 'Pending Approval');

  // Mini sparkline data for treatment card (matching Image 2)
  const sparkData = [
    { name: 'W1', value: 30 },
    { name: 'W2', value: 45 },
    { name: 'W3', value: 40 },
    { name: 'W4', value: 65 },
    { name: 'W5', value: 50 },
    { name: 'W6', value: 85 },
  ];

  const lineData = [
    { name: '03-07', val: 12 },
    { name: '10-14', val: 19 },
    { name: '17-21', val: 15 },
    { name: '24-28', val: 28 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Title (Styled exactly like Image 2 "Welcome back, Dr.Alvis!") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Welcome back, {currentDoctor.fullName}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentDoctor.specialty} • {currentDoctor.departmentName} ({currentDoctor.roomAssigned})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/doctor/schedule"
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>My Schedule</span>
          </Link>
          <Link
            to="/doctor/consultations"
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Consultation Workspace</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards (Directly replicating Image 2 layout!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Top Treatment */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <Activity className="w-4 h-4 text-brand-600" /> Top Treatment
              </span>
              <span className="text-slate-400 text-[11px]">Monthly</span>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold text-slate-900">459</span>
              <span className="text-xs font-bold text-emerald-600">+24%</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5 text-[10px] text-slate-500 font-medium">
              <span className="bg-slate-100 px-2 py-0.5 rounded-full">• Consultation</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-full">• Diagnosis</span>
            </div>
          </div>
          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sparkData}>
                <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Satisfaction Rate */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-teal-600" /> Satisfaction Rate
              </span>
              <span className="text-slate-400 text-[11px]">Reviews</span>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold text-slate-900">98%</span>
              <span className="text-xs font-bold text-emerald-600">+4.9 Rating</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Based on patient feedback surveys across {completedApts.length} consultations.
            </p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: '98%' }} />
          </div>
        </div>

        {/* Card 3: Total Assigned Patients */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <Users className="w-4 h-4 text-indigo-600" /> Assigned Patients
              </span>
              <Link to="/doctor/patients" className="text-brand-600 text-[11px] font-bold hover:underline">
                View all
              </Link>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{mappedPatientIds.length}</span>
              <span className="text-xs font-bold text-emerald-600">Active</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
              <div>
                <span className="block text-[10px] text-slate-400">Regular</span>
                <strong className="text-slate-800">{mappedPatientIds.length}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">Reviews</span>
                <strong className="text-slate-800">{completedApts.length}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">New</span>
                <strong className="text-slate-800">2</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Total Appointments Trend */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <Calendar className="w-4 h-4 text-sky-600" /> Total Appointments
              </span>
              <span className="text-slate-400 text-[11px]">All-time</span>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-extrabold text-slate-900">{doctorAppointments.length}</span>
              <span className="text-xs font-bold text-emerald-600">+{todayApts.length} today</span>
            </div>
          </div>
          <div className="h-10 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <Line type="monotone" dataKey="val" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Large Columns (Replicating Image 2: Upcoming Appointments on Left, Appoint Request on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Appointments Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Upcoming Consultations</h3>
              <p className="text-xs text-slate-400">Confirmed patient schedule for today and tomorrow</p>
            </div>
            <Link to="/doctor/schedule" className="text-xs font-bold text-brand-600 hover:underline">
              View Schedule
            </Link>
          </div>

          {upcomingApts.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">No confirmed consultations pending today</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingApts.slice(0, 5).map(apt => (
                <div key={apt.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
                      alt={apt.patientName}
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{apt.patientName}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{apt.reason}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900">{formatDateDisplay(apt.date)}</div>
                    <span className="text-[11px] text-slate-500">{apt.timeSlot}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={apt.status} size="sm" />
                    <button
                      onClick={() => navigate('/doctor/consultations')}
                      className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <span>Start</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Appointment Requests (Matching Image 2 Appoint Request cards) */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Appointment Requests</h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {pendingRequests.length} Pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center italic">
              No pending requests awaiting approval for your shifts.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{req.patientName}</h4>
                      <p className="text-[11px] text-slate-500">Individual consultation</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => rejectAppointment(req.id, 'Declined by doctor schedule', currentDoctor.fullName)}
                        title="Decline"
                        className="w-7 h-7 rounded-full bg-slate-200 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => approveAppointment(req.id, currentDoctor.fullName)}
                        title="Approve"
                        className="w-7 h-7 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>{formatDateDisplay(req.date)}</span>
                    <span className="font-semibold text-slate-700">{req.timeSlot}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
