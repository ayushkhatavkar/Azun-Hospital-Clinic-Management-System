import React, { useState } from 'react';
import {
  Stethoscope,
  User,
  Activity,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Pill,
  Clock,
  Calendar,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export const DoctorConsultationPage: React.FC = () => {
  const { doctors, appointments, patients, completeConsultation, symptoms } = useClinic();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const currentDoctor =
    doctors.find(d => d.id === currentUser?.doctorId || d.userId === currentUser?.id) || doctors[0];

  // Confirmed appointments for this doctor eligible for consultation
  const activeAppointments = appointments.filter(
    a => a.doctorId === currentDoctor.id && (a.status === 'Confirmed' || a.status === 'Pending Approval')
  );

  const [selectedAptId, setSelectedAptId] = useState<string>(activeAppointments[0]?.id || '');
  const activeAppointment = appointments.find(a => a.id === selectedAptId) || activeAppointments[0];
  const patient = activeAppointment
    ? patients.find(p => p.id === activeAppointment.patientId)
    : null;

  // Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpRecommendation, setFollowUpRecommendation] = useState('Review in 30 days or as needed');
  const [authorizedForPatient, setAuthorizedForPatient] = useState(true);

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medication: '', dosage: '1 Tab', frequency: 'Twice daily after meals', duration: '5 days' },
  ]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Patient symptoms
  const patientSymptoms = patient
    ? symptoms.filter(s => s.patientId === patient.id)
    : [];

  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medication: '', dosage: '1 Tab', frequency: 'Once daily', duration: '7 days' },
    ]);
  };

  const handleRemovePrescription = (idx: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const handlePrescriptionChange = (idx: number, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions(
      prescriptions.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    );
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!activeAppointment) {
      setError('Please select an active appointment to complete.');
      return;
    }

    if (!diagnosis.trim()) {
      setError('Please provide a definitive diagnosis or clinical impression.');
      return;
    }

    if (!clinicalNotes.trim()) {
      setError('Please record clinical examination notes and treatment observations.');
      return;
    }

    const validPrescriptions = prescriptions.filter(p => p.medication.trim().length > 0);

    completeConsultation(
      activeAppointment.id,
      {
        diagnosis,
        clinicalNotes,
        prescriptions: validPrescriptions,
        followUpRecommendation,
        authorizedForPatient,
      },
      currentDoctor.fullName
    );

    setIsSuccess(true);
    setTimeout(() => {
      navigate('/doctor/dashboard');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Consultation Workspace</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record findings, formulate diagnosis, issue prescriptions, and conclude encounters (Journey 5)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-brand-50 text-brand-800 border border-brand-200 px-3.5 py-1.5 rounded-2xl font-bold">
          <Stethoscope className="w-4 h-4 text-brand-600" />
          <span>Physician: {currentDoctor.fullName}</span>
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Consultation Finalized & Marked Completed</p>
            <p className="mt-0.5">
              Medical record saved to patient timeline. Prescription issued and patient notified. Redirecting...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Appointment Selector */}
      <div className="bg-white p-4 rounded-3xl shadow-card border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Select Consultation Queue:</span>
          <select
            value={activeAppointment?.id || ''}
            onChange={e => setSelectedAptId(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold"
          >
            {activeAppointments.length === 0 ? (
              <option value="">No active consultations in queue</option>
            ) : (
              activeAppointments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.patientName} ({formatDateDisplay(a.date)} at {a.timeSlot})
                </option>
              ))
            )}
          </select>
        </div>

        {activeAppointment && (
          <span className="text-xs font-bold text-slate-500">
            Status: <span className="text-brand-600">{activeAppointment.status}</span>
          </span>
        )}
      </div>

      {activeAppointment && patient ? (
        <form onSubmit={handleComplete} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Patient Intake Review & Triage Info */}
          <div className="space-y-5">
            {/* Patient Snapshot */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  {patient.fullName[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{patient.fullName}</h4>
                  <p className="text-[11px] text-slate-400">
                    {patient.id} • {patient.age}y, {patient.gender} • {patient.bloodGroup}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Booking Chief Complaint:
                  </span>
                  <p className="text-slate-800 font-semibold">{activeAppointment.reason}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Baseline Medical History:
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <p>
                      <strong>Conditions:</strong>{' '}
                      {patient.chronicConditions?.join(', ') || 'None reported'}
                    </p>
                    <p className="text-rose-700 font-semibold">
                      <strong>Allergies:</strong> {patient.allergies?.join(', ') || 'None reported'}
                    </p>
                  </div>
                </div>

                {patientSymptoms.length > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                    <span className="text-[11px] font-bold text-amber-900 uppercase block mb-1">
                      Triage Symptoms (Front Desk Intake):
                    </span>
                    <p className="text-xs font-bold text-amber-950">
                      {patientSymptoms[0].symptoms.join(', ')}
                    </p>
                    <p className="text-[11px] text-amber-800 mt-1">
                      Duration: {patientSymptoms[0].duration} • Severity: {patientSymptoms[0].severity}
                    </p>
                    {patientSymptoms[0].observations && (
                      <p className="text-[10px] text-slate-600 mt-1 italic">
                        "{patientSymptoms[0].observations}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Diagnosis, Clinical Notes, Prescriptions Form */}
          <div className="lg:col-span-2 space-y-5 bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-200/80">
            {/* Diagnosis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Clinical Diagnosis / Impression <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g. Essential Hypertension Grade 1, Sinus Tachycardia..."
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            {/* Examination Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Examination Findings & Clinical Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={clinicalNotes}
                onChange={e => setClinicalNotes(e.target.value)}
                rows={4}
                placeholder="Detailed findings (cardiovascular, respiratory, vitals, auscultation, clinical advice)..."
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 leading-relaxed"
              />
            </div>

            {/* Prescriptions Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Prescription / Medications ({prescriptions.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Drug</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {prescriptions.map((rx, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs"
                  >
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        value={rx.medication}
                        onChange={e => handlePrescriptionChange(idx, 'medication', e.target.value)}
                        placeholder="Medication name..."
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={rx.dosage}
                        onChange={e => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                        placeholder="Dosage (e.g. 50mg)"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={rx.frequency}
                        onChange={e => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                        placeholder="Frequency"
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={rx.duration}
                        onChange={e => handlePrescriptionChange(idx, 'duration', e.target.value)}
                        placeholder="Duration"
                        className="flex-1 text-xs p-2 rounded-lg border border-slate-200 bg-white"
                      />
                      {prescriptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Recommendation */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Follow-Up Recommendation
              </label>
              <input
                type="text"
                value={followUpRecommendation}
                onChange={e => setFollowUpRecommendation(e.target.value)}
                placeholder="e.g. Follow-up review after 30 days or earlier in case of symptoms..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>

            {/* Authorization Toggle */}
            <div className="p-3.5 rounded-2xl bg-brand-50/50 border border-brand-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Authorize Record for Patient Portal</span>
                <span className="text-slate-500 text-[11px]">
                  Allows patient to review diagnosis & print electronic prescription (FR-24, FR-35)
                </span>
              </div>
              <input
                type="checkbox"
                checked={authorizedForPatient}
                onChange={e => setAuthorizedForPatient(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Conclude & Mark Consultation Completed (Journey 5)</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center shadow-card border border-slate-200/80">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Active Consultation Selected</h3>
          <p className="text-xs text-slate-400 mt-1">
            Choose an appointment from your queue above to begin clinical consultation.
          </p>
        </div>
      )}
    </div>
  );
};
