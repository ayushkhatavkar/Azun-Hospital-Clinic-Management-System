import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Lock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { exportToCsv } from '../../utils/exportCsv';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useClinic();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (roleFilter !== 'all' && log.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.id.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'User', 'Role', 'Action', 'Entity', 'Entity ID', 'Result', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      l.userName,
      l.role,
      l.action,
      l.entity,
      l.entityId,
      l.result,
      l.details,
    ]);
    exportToCsv('CMS_System_Audit_Log', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Log (Read-Only)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable clinical trail of security authentications, approvals, cancellations, and file access attempts (FR-37)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-brand-600" />
            <span>Export Audit Trail</span>
          </button>
          <div className="bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Tamper-Resistant Log</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-card border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by action, user, entity ID, or description..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold"
          >
            <option value="all">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="APPOINTMENT_REQUEST">APPOINTMENT_REQUEST</option>
            <option value="APPOINTMENT_APPROVED">APPOINTMENT_APPROVED</option>
            <option value="APPOINTMENT_REJECTED">APPOINTMENT_REJECTED</option>
            <option value="APPOINTMENT_CANCELLED">APPOINTMENT_CANCELLED</option>
            <option value="EMERGENCY_CANCELLATION">EMERGENCY_CANCELLATION</option>
            <option value="FILE_UPLOADED">FILE_UPLOADED</option>
            <option value="FILE_ACCESS_AUTHORIZED">FILE_ACCESS_AUTHORIZED</option>
            <option value="FILE_ACCESS_DENIED">FILE_ACCESS_DENIED</option>
            <option value="SYMPTOM_OFFLINE_SYNC">SYMPTOM_OFFLINE_SYNC</option>
            <option value="CONFIG_UPDATED">CONFIG_UPDATED</option>
          </select>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold"
          >
            <option value="all">All Roles</option>
            <option value="receptionist">Receptionist</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table (Strictly read-only per Section 9.G & FR-37) */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.id}</td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="font-bold text-slate-900 block">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{log.role}</span>
                  </td>
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-800">{log.action}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-mono text-[10px]">
                      {log.entity}:{log.entityId}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.result === 'SUCCESS'
                        ? 'bg-emerald-50 text-emerald-700'
                        : log.result === 'DENIED'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {log.result}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-600 max-w-sm leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
