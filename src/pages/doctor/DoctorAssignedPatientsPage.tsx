import React, { useState } from 'react';
import {
  Users,
  Search,
  User,
  Activity,
  Heart,
  FileText,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Pill,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateDisplay } from '../../utils/formatters';
import { Patient } from '../../types';
import { useNavigate } from 'react-router-dom';

export const DoctorAssignedPatientsPage: React.FC = () => {
  const { doctors, patients, doctorPatientMaps, medicalRecords, symptoms, appointments } = useClinic();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const currentDoctor =
    doctors.find(d => d.id === currentUser?.doctorId || d.userId === currentUser?.id) || doctors[0];

  // Strictly filter only patients mapped to this doctor (FR-28)
  const mappedPatientIds = doctorPatientMaps
    .filter(m => m.doctorId === currentDoctor.id && m.active)
    .map(m => m.patientId);

  const assignedPatients = patients.filter(p => mappedPatientIds.includes(p.id));

  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(assignedPatients[0] || null);

  const filtered = assignedPatients.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.primaryPhone.includes(q)
    );
  });

  // Selected patient details
  const patientRecords = selectedPatient
    ? medicalRecords.filter(r => r.patientId === selectedPatient.id)
    : [];

  const patientSymptoms = selectedPatient
    ? symptoms.filter(s => s.patientId === selectedPatient.id)
    : [];

  const patientAppointments = selectedPatient
    ? appointments.filter(a => a.patientId === selectedPatient.id && a.doctorId === currentDoctor.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Patients Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict role-mapped clinical caseload for {currentDoctor.fullName} (SRS FR-28)
          </p>
        </div>
        <div className="bg-brand-50 text-brand-800 border border-brand-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>{assignedPatients.length} Patients Mapped to Your Practice</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Mapped Patients List with Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search mapped patient name or ID..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center bg-white rounded-2xl border border-slate-200/80">
                No assigned patients matching search.
              </p>
            ) : (
              filtered.map(patient => {
                const isSelected = selectedPatient?.id === patient.id;
                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{patient.fullName}</h4>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {patient.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {patient.age}y • {patient.gender} • {patient.primaryPhone}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>Last: {patient.lastVisit}</span>
                      <span className="text-brand-600 font-semibold flex items-center gap-1">
                        Timeline <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Selected Patient Full Timeline & Clinical File */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Header Card */}
              <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-base">
                      {selectedPatient.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedPatient.fullName}</h3>
                      <p className="text-xs text-slate-400">
                        Patient ID: <span className="font-mono font-bold text-slate-700">{selectedPatient.id}</span> • Registered {selectedPatient.registrationDate}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/doctor/consultations')}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Open Consultation</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Age & Gender</span>
                    <strong className="text-slate-800">{selectedPatient.age} yrs, {selectedPatient.gender}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Blood Group</span>
                    <strong className="text-slate-800">{selectedPatient.bloodGroup}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Primary Phone</span>
                    <strong className="text-slate-800">{selectedPatient.primaryPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Emergency Contact</span>
                    <strong className="text-slate-800">{selectedPatient.emergencyContact?.name} ({selectedPatient.emergencyContact?.relationship})</strong>
                  </div>
                </div>

                {/* Chronic Conditions & Allergies */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Chronic Medical Conditions:</span>
                    {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedPatient.chronicConditions.map((c, i) => (
                          <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None reported</span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-rose-700 block mb-1">Known Drug Allergies:</span>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedPatient.allergies.map((a, i) => (
                          <span key={i} className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 rounded-md">
                            ⚠️ {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None reported</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Consultation Timeline & Diagnoses */}
              <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Clinical Timeline & Consultation History ({patientRecords.length})
                </h3>

                {patientRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    No completed consultations logged yet for this patient.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {patientRecords.map(rec => (
                      <div key={rec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand-700">Diagnosis: {rec.diagnosis}</span>
                          <span className="text-slate-400 text-[11px]">{formatDateDisplay(rec.consultationDate)}</span>
                        </div>
                        <p className="text-slate-600">{rec.clinicalNotes}</p>
                        {rec.prescriptions && rec.prescriptions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {rec.prescriptions.map((p, idx) => (
                              <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                                💊 {p.medication} ({p.dosage})
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block pt-1">
                          Attending Physician: {rec.doctorName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Triage Symptoms Log */}
              <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Recorded Intake Symptoms ({patientSymptoms.length})
                </h3>

                {patientSymptoms.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    No intake symptoms recorded by front desk for this patient.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {patientSymptoms.map(sym => (
                      <div key={sym.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{sym.symptoms.join(', ')}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            Severity: {sym.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{sym.observations}</p>
                        <span className="text-[10px] text-slate-400 block">{sym.enteredAt} • {sym.enteredBy}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center shadow-card border border-slate-200/80">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">Select an Assigned Patient</h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose a patient from your assigned caseload on the left to review medical history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
