import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Check,
  X,
  Stethoscope,
  Info,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SymptomEntry } from '../../types';

export const OfflineSyncPage: React.FC = () => {
  const {
    symptoms,
    isOfflineSimulated,
    toggleOfflineSimulation,
    syncOfflineEntries,
    resolveSymptomConflict,
  } = useClinic();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    success: boolean;
    syncedCount: number;
    conflictCount: number;
  } | null>(null);

  const unsyncedEntries = symptoms.filter(s => s.syncStatus === 'pending');
  const conflictEntries = symptoms.filter(s => s.syncStatus === 'conflict');
  const syncedEntries = symptoms.filter(s => s.syncStatus === 'synced');

  const handleSyncNow = () => {
    setIsSyncing(true);
    setSyncFeedback(null);

    // Simulate 1.2s network transport sync
    setTimeout(() => {
      const res = syncOfflineEntries();
      setIsSyncing(false);
      setSyncFeedback({
        success: true,
        syncedCount: res.syncedCount,
        conflictCount: res.conflictCount,
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Offline Symptom Synchronisation Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Local browser storage cache, client UUID deduplication, and conflict resolution (FR-26, FR-27, Journey 7)
          </p>
        </div>

        {/* Toggle Simulation Button */}
        <button
          onClick={toggleOfflineSimulation}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${
            isOfflineSimulated
              ? 'bg-amber-500 text-amber-950 border-amber-400 ring-2 ring-amber-400/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isOfflineSimulated ? (
            <>
              <WifiOff className="w-4 h-4 text-amber-950" />
              <span>Simulated Disconnected (Offline)</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span>Simulated Online Network</span>
            </>
          )}
        </button>
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Sync Queue</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{unsyncedEntries.length}</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Stored in local cache</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Flagged Conflicts</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{conflictEntries.length}</h3>
            <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Requires manual review</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Synchronised Entries</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{syncedEntries.length}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Acknowledged by server</p>
          </div>
        </div>
      </div>

      {/* Sync Action Callout */}
      <div className="bg-gradient-to-r from-slate-900 to-navy-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold">Synchronise Local Clinical Data</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Transmit all locally cached symptom recordings using atomic client UUIDs.
            Prevents duplicate entries even if network drops during handshake (FR-27).
          </p>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={isSyncing || (unsyncedEntries.length === 0 && conflictEntries.length === 0)}
          className={`px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 ${
            isSyncing || (unsyncedEntries.length === 0 && conflictEntries.length === 0)
              ? 'bg-white/20 text-white/50 cursor-not-allowed shadow-none'
              : 'bg-brand-500 hover:bg-brand-400 text-white shadow-brand-500/30'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Synchronising with Server...' : 'Sync Now'}</span>
        </button>
      </div>

      {syncFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Sync Completed Successfully</p>
            <p className="text-[11px] mt-0.5">
              Synced {syncFeedback.syncedCount} offline record(s). Flagged {syncFeedback.conflictCount} conflict(s) for review.
            </p>
          </div>
        </div>
      )}

      {/* Conflicted Entries Review Section */}
      {conflictEntries.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-card border border-rose-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-rose-100 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold">Manual Conflict Review Required ({conflictEntries.length})</h3>
          </div>

          <div className="space-y-3">
            {conflictEntries.map(item => (
              <div key={item.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.patientName}</span>
                  <span className="font-mono text-[10px] text-slate-400">{item.clientEntryId}</span>
                </div>
                <p className="text-rose-800 font-semibold">{item.conflictDetails}</p>
                <p className="text-slate-600">Recorded: {item.symptoms.join(', ')} • {item.observations}</p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200/40">
                  <button
                    onClick={() => resolveSymptomConflict(item.id, 'overwrite_server')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    Merge with Server Record
                  </button>
                  <button
                    onClick={() => resolveSymptomConflict(item.id, 'accept_client')}
                    className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-xs"
                  >
                    Accept Local Client Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unsynchronized Queue Table */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Offline Queue Inventory</h3>
          <span className="text-xs text-slate-400">{unsyncedEntries.length} items awaiting transmission</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Client UUID (Deduplication)</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Symptoms Recorded</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Local Timestamp</th>
                <th className="py-3 px-4 text-right">Sync Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unsyncedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No unsynchronised offline records in cache.
                  </td>
                </tr>
              ) : (
                unsyncedEntries.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 font-semibold">
                      {item.clientEntryId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.patientName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.symptoms.join(', ')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.severity === 'Critical' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{item.enteredAt}</td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status="pending" size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
