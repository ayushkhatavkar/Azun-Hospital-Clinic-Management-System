import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Stethoscope,
  Calendar,
  AlertTriangle,
  UserX,
  TrendingUp,
  ShieldCheck,
  Settings,
  ClipboardList,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const {
    patients,
    doctors,
    departments,
    appointments,
    rooms,
    auditLogs,
    config,
  } = useClinic();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  const totalApts = appointments.length;
  const cancelledApts = appointments.filter(a => a.status === 'Cancelled').length;
  const noShowApts = appointments.filter(a => a.status === 'No-show').length;

  const cancellationRate = totalApts > 0 ? ((cancelledApts / totalApts) * 100).toFixed(1) : '0';
  const noShowRate = totalApts > 0 ? ((noShowApts / totalApts) * 100).toFixed(1) : '0';

  // Volume chart
  const volumeData = [
    { day: 'Mon', count: 18 },
    { day: 'Tue', count: 24 },
    { day: 'Wed', count: 21 },
    { day: 'Thu', count: 28 },
    { day: 'Fri', count: 32 },
    { day: 'Sat', count: 42 },
    { day: 'Sun', count: 15 },
  ];

  // Department Distribution data
  const deptDistData = departments.map((d, idx) => {
    const count = appointments.filter(a => a.departmentId === d.id).length;
    const colors = ['#0284c7', '#0d9488', '#f59e0b', '#ec4899', '#6366f1', '#10b981'];
    return {
      name: d.name,
      value: count > 0 ? count : 1,
      color: colors[idx % colors.length],
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Management & Executive Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational metrics, department loads, audit events, and clinical governance (SRS Section 9.A)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4 text-brand-600" />
            <span>Operational Reports</span>
          </Link>
          <Link
            to="/admin/config"
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            <span>System Configuration ({config.bookingChargePercentage}%)</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{patients.length}</h3>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">+12 this month</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Doctors</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{doctors.length}</h3>
          <span className="text-[11px] text-brand-600 font-semibold mt-1 block">Across 6 Depts</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Departments</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{departments.length}</h3>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">{rooms.length} Rooms active</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Visits</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{todayAppointments.length}</h3>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Scheduled on roster</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cancellation Rate</span>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{cancellationRate}%</h3>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">{cancelledApts} total</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">No-Show Rate</span>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{noShowRate}%</h3>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">{noShowApts} recorded</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Appointment Trajectory</h3>
              <p className="text-xs text-slate-400">Total appointments booked across clinic shifts</p>
            </div>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-xl">
              Current Week Peak
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="count" stroke="#0284c7" strokeWidth={3} dot={{ fill: '#0284c7', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Department Caseload</h3>
            <p className="text-xs text-slate-400">Appointment spread by clinical specialty</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4}>
                  {deptDistData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
            {deptDistData.slice(0, 6).map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Events Section */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Audit Log Snapshot</h3>
            <p className="text-xs text-slate-400">Read-only governance event stream (SRS FR-37)</p>
          </div>
          <Link to="/admin/audit" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            View All Logs ({auditLogs.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  log.result === 'DENIED' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                      {log.entity}:{log.entityId}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{log.details}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    By {log.userName} ({log.role}) • {log.timestamp}
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                log.result === 'SUCCESS'
                  ? 'bg-emerald-50 text-emerald-700'
                  : log.result === 'DENIED'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {log.result}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
