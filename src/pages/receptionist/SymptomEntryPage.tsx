import React, { useState } from 'react';
import {
  Stethoscope,
  Wifi,
  WifiOff,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Save,
  Activity,
  Calendar,
  Layers,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Link } from 'react-router-dom';

const COMMON_SYMPTOMS = [
  'Chest pain / tightness',
  'Palpitations',
  'Shortness of breath',
  'High fever',
  'Dry cough',
  'Severe headache / Migraine',
  'Joint stiffness',
  'Dizziness / Vertigo',
  'Skin rash / Itching',
  'Fatigue / Weakness',
];

export const SymptomEntryPage: React.FC = () => {
  const {
    patients,
    appointments,
    symptoms,
    addSymptomEntry,
    isOfflineSimulated,
    toggleOfflineSimulation,
  } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Palpitations']);
  const [customSymptom, setCustomSymptom] = useState('');
  const [duration, setDuration] = useState('Past 3 days');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Critical'>('Moderate');
  const [observations, setObservations] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);

  // Appointments for selected patient
  const patientAppointments = appointments.filter(a => a.patientId === selectedPatientId);

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleAddCustom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom.');
      return;
    }

    const entry = addSymptomEntry({
      patientId: selectedPatientId,
      appointmentId: selectedAppointmentId || undefined,
      symptoms: selectedSymptoms,
      duration,
      severity,
      observations,
      enteredBy: 'Reception Desk 1 (Marco R)',
    });

    if (isOfflineSimulated) {
      setFeedback(
        `Entry saved LOCALLY in offline queue with Client UUID: ${entry.clientEntryId}. It will sync once connection is restored (FR-26).`
      );
    } else {
      setFeedback(`Symptom intake entry ${entry.id} saved and synced to clinical database.`);
    }

    setObservations('');
    setTimeout(() => setFeedback(null), 6000);
  };

  const unsyncedCount = symptoms.filter(s => s.syncStatus === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Symptom Intake Entry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record triage symptoms, severity, and clinical observations (SRS FR-25, FR-26)
          </p>
        </div>

        {/* Offline Simulation Toggle Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleOfflineSimulation}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 ${
              isOfflineSimulated
                ? 'bg-amber-500 text-amber-950 border-amber-400 ring-2 ring-amber-400/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-950" />
                <span>Simulated Offline Mode ACTIVE</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>Connected Online</span>
              </>
            )}
          </button>

          {unsyncedCount > 0 && (
            <Link
              to="/receptionist/offline-sync"
              className="px-3.5 py-2 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              Sync Queue ({unsyncedCount})
            </Link>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
          isOfflineSimulated ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {isOfflineSimulated ? (
              <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline ml-4 hover:opacity-75">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Patient *</label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id}) — {p.primaryPhone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Link to Appointment (Optional)</label>
              <select
                value={selectedAppointmentId}
                onChange={e => setSelectedAppointmentId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">None / General Intake</option>
                {patientAppointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.id} • {a.doctorName} ({a.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Common Symptoms Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Symptoms ({selectedSymptoms.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map(sym => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    type="button"
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>

            {/* Custom Symptom Input */}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customSymptom}
                onChange={e => setCustomSymptom(e.target.value)}
                placeholder="Type additional clinical symptom..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Add Symptom
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. Past 3 days, 1 week..."
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Severity Level</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical (Immediate Triage)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Clinical Observations & Front Desk Notes
            </label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={3}
              placeholder="e.g. Measured vitals: BP 120/80 mmHg, SpO2 98%, Pulse 72 bpm. Patient is ambulatory..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>
              {isOfflineSimulated ? 'Save in Offline Queue (FR-26)' : 'Submit & Synchronise Symptom Entry'}
            </span>
          </button>
        </form>

        {/* History List */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Recent Intake Log ({symptoms.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {symptoms.slice(0, 5).map(sym => (
                <div key={sym.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{sym.patientName}</span>
                    <StatusBadge status={sym.syncStatus} size="sm" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sym.symptoms.map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Severity: <strong className="text-slate-700">{sym.severity}</strong></span>
                    <span>{sym.enteredAt}</span>
                  </div>
                  {sym.clientEntryId && (
                    <span className="text-[9px] font-mono text-slate-400 block truncate">
                      UUID: {sym.clientEntryId}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
