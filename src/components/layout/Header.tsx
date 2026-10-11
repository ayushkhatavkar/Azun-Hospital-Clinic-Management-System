import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Wifi,
  WifiOff,
  RotateCcw,
  ChevronDown,
  User,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenSearch,
  onOpenNotifications,
}) => {
  const { currentUser, logout, switchRole } = useAuth();
  const {
    notifications,
    isOfflineSimulated,
    toggleOfflineSimulation,
    resetAllDemoData,
    symptoms,
  } = useClinic();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const unreadCount = notifications.filter(n => {
    if (n.read) return false;
    if (n.recipientRole === 'all') return true;
    if (n.recipientUserId && currentUser?.id) return n.recipientUserId === currentUser.id;
    return n.recipientRole === currentUser?.role;
  }).length;

  const pendingOfflineCount = symptoms.filter(s => s.syncStatus === 'pending').length;

  const handleResetData = () => {
    resetAllDemoData();
    setIsResetConfirmOpen(false);
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
        {/* Left Section: Mobile Menu & Search */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger matching Image 1 ("What are you Search ...." design) */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-400 text-xs w-64 md:w-80 transition-all text-left shadow-2xs group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="flex-1 truncate">What are you Search ....</span>
            <kbd className="hidden lg:inline-block text-[10px] bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* Offline Mode Simulation Pill */}
          <button
            onClick={toggleOfflineSimulation}
            title="Click to toggle offline mode simulation (FR-26/FR-27)"
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isOfflineSimulated
                ? 'bg-amber-500/10 text-amber-700 border-amber-300 ring-2 ring-amber-400/20 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulated Offline</span>
                {pendingOfflineCount > 0 && (
                  <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {pendingOfflineCount} unsynced
                  </span>
                )}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Online</span>
              </>
            )}
          </button>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Reset Data Button */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            title="Reset All Demo Data (FR Prototype Reset)"
            className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-slate-100 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden xl:inline">Reset Demo Data</span>
          </button>

          {/* Search Mobile button */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Bell matching screenshot badges */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile matching Image 1: Marco R / Kang Jaga malam or Doctor avatar */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <img
                src={
                  currentUser?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                }
                alt={currentUser?.fullName}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/20 shadow-xs"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.fullName}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  {currentUser?.role === 'doctor'
                    ? 'Attending Doctor'
                    : currentUser?.role === 'receptionist'
                    ? 'Chief Receptionist'
                    : currentUser?.role === 'admin'
                    ? 'Clinical Director'
                    : 'Registered Patient'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Menu Dropdown */}
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser?.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                </div>

                <div className="py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 py-1 block">
                    Switch Active Role
                  </span>
                  <button
                    onClick={() => switchRole('patient')}
                    className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>👤 Patient Portal</span>
                  </button>
                  <button
                    onClick={() => switchRole('receptionist')}
                    className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>📋 Receptionist Desk</span>
                  </button>
                  <button
                    onClick={() => switchRole('doctor')}
                    className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>🩺 Doctor Workspace</span>
                  </button>
                  <button
                    onClick={() => switchRole('admin')}
                    className="w-full text-left px-4 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>⚙️ Administrator</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Resetting Demo Data */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Reset Demo Data"
        message="This will reset all appointments, schedules, patients, notifications, and system settings back to original factory demo state. This is useful for restarting acceptance journey tests."
        confirmLabel="Reset Everything"
        isDanger={true}
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </>
  );
};
