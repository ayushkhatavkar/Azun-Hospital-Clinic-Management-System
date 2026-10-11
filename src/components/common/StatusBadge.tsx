import React from 'react';
import { AppointmentStatus } from '../../types';

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Confirmed':
      case 'Active':
      case 'synced':
      case 'Available':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'Pending Approval':
      case 'pending':
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
      case 'Rejected':
      case 'conflict':
      case 'Inactive':
        return 'bg-red-50 text-red-700 border-red-200 ring-red-500/20';
      case 'No-show':
      case 'Maintenance':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20';
      case 'Encrypted (AES-256 Mock)':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Confirmed':
      case 'Active':
      case 'synced':
      case 'Available':
      case 'Completed':
        return 'bg-emerald-500';
      case 'Pending Approval':
      case 'pending':
      case 'Pending':
        return 'bg-amber-500';
      case 'Cancelled':
        return 'bg-rose-500';
      case 'Rejected':
      case 'conflict':
      case 'Inactive':
        return 'bg-red-500';
      case 'No-show':
      case 'Maintenance':
        return 'bg-slate-400';
      case 'Encrypted (AES-256 Mock)':
        return 'bg-indigo-500';
      default:
        return 'bg-slate-400';
    }
  };

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs ${padding} ${getBadgeStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`}></span>
      {status}
    </span>
  );
};
