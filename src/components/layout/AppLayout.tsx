import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { useClinic } from '../../context/ClinicContext';
import { WifiOff } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { isOfflineSimulated, toggleOfflineSimulation, symptoms } = useClinic();

  const pendingOffline = symptoms.filter(s => s.syncStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop & Drawer for Mobile */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Backdrop for Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Offline Simulation Banner if active */}
        {isOfflineSimulated && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-950 shrink-0" />
              <span>
                Simulated Offline Mode Active (SRS FR-26/FR-27). New symptom entries are stored locally.
                {pendingOffline > 0 ? ` (${pendingOffline} entries pending sync)` : ''}
              </span>
            </div>
            <button
              onClick={toggleOfflineSimulation}
              className="bg-amber-900 text-amber-100 hover:bg-amber-950 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors"
            >
              Go Online
            </button>
          </div>
        )}

        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};
