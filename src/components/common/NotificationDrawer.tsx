import React, { useState } from 'react';
import { Bell, CheckCheck, X, Calendar, Clock, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useClinic();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  // Filter notifications relevant to current role / user
  const relevantNotifs = notifications.filter(n => {
    if (n.recipientRole === 'all') return true;
    if (n.recipientUserId && currentUser?.id) {
      return n.recipientUserId === currentUser.id;
    }
    return n.recipientRole === currentUser?.role;
  });

  const displayedNotifs = filter === 'unread'
    ? relevantNotifs.filter(n => !n.read)
    : relevantNotifs;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment_request':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'approval':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'rejection':
      case 'cancellation':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'schedule_change':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleClickItem = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.appointmentId) {
      if (currentUser?.role === 'patient') {
        navigate('/patient/appointments');
      } else if (currentUser?.role === 'receptionist') {
        navigate('/receptionist/appointments');
      } else if (currentUser?.role === 'doctor') {
        navigate('/doctor/consultations');
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Notifications</h2>
                <p className="text-xs text-slate-500">Real-time alerts & clinical events</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsAsRead}
                title="Mark all as read"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-white">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({relevantNotifs.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread ({relevantNotifs.filter(n => !n.read).length})
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {displayedNotifs.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No notifications found</p>
                <p className="text-xs text-slate-400 mt-1">You are all caught up!</p>
              </div>
            ) : (
              displayedNotifs.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleClickItem(notif)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all hover:bg-slate-50 flex items-start gap-3 my-1 ${
                    !notif.read ? 'bg-brand-50/40 border border-brand-100/60' : 'bg-white'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-100/80 mt-0.5 shrink-0">
                    {getCategoryIcon(notif.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${!notif.read ? 'text-brand-950 font-bold' : 'text-slate-800'}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1.5 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
