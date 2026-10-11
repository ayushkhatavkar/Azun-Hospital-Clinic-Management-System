import React, { useState } from 'react';
import {
  FileText,
  Activity,
  Heart,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Pill,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateDisplay } from '../../utils/formatters';

export const PatientMedicalHistoryPage: React.FC = () => {
  const { patients, updatePatient, medicalRecords } = useClinic();
  const { currentUser } = useAuth();

  const currentPatient =
    patients.find(p => p.id === currentUser?.patientId || p.email === currentUser?.email) ||
    patients[0];

  const [chronicConditions, setChronicConditions] = useState<string[]>(
    currentPatient.chronicConditions || []
  );
  const [allergies, setAllergies] = useState<string[]>(currentPatient.allergies || []);
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Authorized doctor notes for this patient (FR-24, FR-35)
  const patientRecords = medicalRecords.filter(
    r => r.patientId === currentPatient.id && r.authorizedForPatient
  );

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setChronicConditions([...chronicConditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setChronicConditions(chronicConditions.filter((_, i) => i !== index));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updatePatient(currentPatient.id, {
      chronicConditions,
      allergies,
      diagnosisHistoryCompleted: true, // satisfies FR-13
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Medical History & Clinical Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain your health conditions, drug allergies, and review past physician diagnoses (FR-13, FR-24)
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Medical history profile updated successfully! Record timestamped.</span>
        </div>
      )}

      {/* Grid: Conditions & Allergies Editable Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chronic Conditions */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Chronic & Past Health Conditions</h3>
              <p className="text-[11px] text-slate-500">e.g. Hypertension, Diabetes, Asthma</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
              placeholder="Add condition or past surgery..."
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={handleAddCondition}
              className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {chronicConditions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No chronic conditions listed.</p>
            ) : (
              chronicConditions.map((cond, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800"
                >
                  <span className="font-semibold">{cond}</span>
                  <button
                    onClick={() => handleRemoveCondition(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Known Drug & Food Allergies */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Known Drug & Environmental Allergies</h3>
              <p className="text-[11px] text-slate-500">Critical safety data for attending physicians</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergy}
              onChange={e => setNewAllergy(e.target.value)}
              placeholder="Add allergy (e.g. Penicillin, Peanuts)..."
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={handleAddAllergy}
              className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allergies.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No known drug allergies listed.</p>
            ) : (
              allergies.map((allergy, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-rose-900"
                >
                  <span className="font-semibold">{allergy}</span>
                  <button
                    onClick={() => handleRemoveAllergy(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Authorized Doctor Diagnoses & Clinical Notes (FR-24, FR-35) */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Physician Diagnosis & Consultation History</h3>
            <p className="text-xs text-slate-500">Signed medical entries authorized by attending doctors</p>
          </div>
        </div>

        {patientRecords.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">No authorized physician records logged yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patientRecords.map(record => (
              <div key={record.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{record.doctorName}</span>
                    <span className="text-[11px] text-slate-400 ml-2">• {formatDateDisplay(record.consultationDate)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Patient Authorized
                  </span>
                </div>

                <p className="text-xs font-bold text-brand-700">Diagnosis: {record.diagnosis}</p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {record.clinicalNotes}
                </p>

                {record.prescriptions && record.prescriptions.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Prescribed Medications:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.prescriptions.map((p, i) => (
                        <div key={i} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs">
                          <Pill className="w-4 h-4 text-brand-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800">{p.medication}</span>
                            <span className="text-slate-500 block text-[11px]">
                              {p.dosage} • {p.frequency} • {p.duration}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {record.followUpRecommendation && (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Follow-up advice: {record.followUpRecommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
