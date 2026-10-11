import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck2,
  FileClock,
  FileText,
  User,
  Users,
  Calendar,
  Stethoscope,
  WifiOff,
  FolderLock,
  PhoneCall,
  Activity,
  Building2,
  Layers,
  Settings,
  ClipboardList,
  LogOut,
  Sparkles,
  Download,
  ShieldCheck,
  CalendarRange,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { currentUser, logout, switchRole } = useAuth();
  const { symptoms, appointments, notifications } = useClinic();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Pending counts
  const pendingRequestsCount = appointments.filter(a => a.status === 'Pending Approval').length;
  const pendingSyncCount = symptoms.filter(s => s.syncStatus === 'pending').length;

  const getNavLinks = () => {
    switch (currentUser?.role) {
      case 'patient':
        return [
          { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { label: 'Book Appointment', path: '/patient/book', icon: CalendarPlus },
          { label: 'My Appointments', path: '/patient/appointments', icon: CalendarCheck2 },
          { label: 'Medical History', path: '/patient/medical-history', icon: FileClock },
          { label: 'Digital Reports', path: '/patient/reports', icon: FileText },
          { label: 'My Profile', path: '/patient/profile', icon: User },
        ];
      case 'receptionist':
        return [
          { label: 'Dashboard', path: '/receptionist/dashboard', icon: LayoutDashboard },
          { label: 'Appointment Requests', path: '/receptionist/requests', icon: CalendarPlus, badge: pendingRequestsCount },
          { label: 'All Appointments', path: '/receptionist/appointments', icon: CalendarCheck2 },
          { label: 'Book for Patient', path: '/receptionist/book-patient', icon: Activity },
          { label: 'Patient Directory', path: '/receptionist/patients', icon: Users },
          { label: 'Doctor Availability', path: '/receptionist/availability', icon: Calendar },
          { label: 'Schedules & Holidays', path: '/receptionist/schedules', icon: CalendarRange },
          { label: 'Symptom Entry', path: '/receptionist/symptoms', icon: Stethoscope },
          { label: 'Offline Sync Queue', path: '/receptionist/offline-sync', icon: WifiOff, badge: pendingSyncCount, badgeDanger: pendingSyncCount > 0 },
          { label: 'Medical Files (Upload)', path: '/receptionist/files', icon: FolderLock },
          { label: 'Cancellations & Calls', path: '/receptionist/cancellations', icon: PhoneCall },
        ];
      case 'doctor':
        return [
          { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { label: 'My Schedule', path: '/doctor/schedule', icon: Calendar },
          { label: 'Assigned Patients', path: '/doctor/patients', icon: Users },
          { label: 'Consultations & Notes', path: '/doctor/consultations', icon: Stethoscope },
          { label: 'Medical Files (Encrypted)', path: '/doctor/files', icon: FolderLock },
          { label: 'Doctor Profile', path: '/doctor/profile', icon: User },
        ];
      case 'admin':
        return [
          { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'User Management', path: '/admin/users', icon: Users },
          { label: 'Departments', path: '/admin/departments', icon: Building2 },
          { label: 'Doctors & Rooms', path: '/admin/doctors-rooms', icon: Layers },
          { label: 'Doctor Schedules', path: '/admin/schedules', icon: CalendarRange },
          { label: 'Appointments Master', path: '/admin/appointments', icon: CalendarCheck2 },
          { label: 'Operational Reports', path: '/admin/reports', icon: ClipboardList },
          { label: 'System Audit Log', path: '/admin/audit', icon: ShieldCheck },
          { label: 'System Configuration', path: '/admin/config', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      {/* Brand Logo Header */}
      <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">MedHealthy</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
              CMS • v1.0
            </span>
          </div>
        </div>
      </div>

      {/* Role Navigation section */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
            {currentUser?.role === 'patient' && 'Patient Portal'}
            {currentUser?.role === 'receptionist' && 'Front Desk Operations'}
            {currentUser?.role === 'doctor' && 'Clinical Workspace'}
            {currentUser?.role === 'admin' && 'Management Console'}
          </span>
          <nav className="space-y-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        link.badgeDanger
                          ? 'bg-rose-500 text-white'
                          : 'bg-brand-100 text-brand-700'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Demo Role Quick Switcher in Sidebar */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Switch Demo Role
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => switchRole('patient')}
              className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg text-left transition-colors ${
                currentUser?.role === 'patient'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              👤 Patient
            </button>
            <button
              onClick={() => switchRole('receptionist')}
              className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg text-left transition-colors ${
                currentUser?.role === 'receptionist'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              📋 Reception
            </button>
            <button
              onClick={() => switchRole('doctor')}
              className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg text-left transition-colors ${
                currentUser?.role === 'doctor'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              🩺 Doctor
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg text-left transition-colors ${
                currentUser?.role === 'admin'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              ⚙️ Admin
            </button>
          </div>
        </div>

        {/* Mobile Promo Card inspired by Screenshot 1 */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-500 to-sky-600 text-white shadow-sm">
          <p className="text-xs font-bold leading-tight">Try Mobile App (Future Scope)</p>
          <p className="text-[10px] text-sky-100 mt-1 leading-snug">
            TBD-5: Android & iOS patient companion preview.
          </p>
          <button
            onClick={() => alert('Mobile companion app is slated for Phase 2 (SRS TBD-5).')}
            className="mt-2.5 w-full py-1.5 px-3 bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download APK
          </button>
        </div>
      </div>

      {/* Footer Log Out */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
