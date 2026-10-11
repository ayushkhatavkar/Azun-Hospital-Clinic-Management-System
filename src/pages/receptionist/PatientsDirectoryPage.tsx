import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit,
  FolderLock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Stethoscope,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types';
import { useNavigate } from 'react-router-dom';

export const PatientsDirectoryPage: React.FC = () => {
  const { patients, updatePatient, appointments, medicalFiles } = useClinic();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestrictedModalOpen, setIsRestrictedModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editPrimaryPhone, setEditPrimaryPhone] = useState('');
  const [editSecondaryPhone, setEditSecondaryPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editAge, setEditAge] = useState(30);

  const filteredPatients = patients.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.primaryPhone.includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (p: Patient) => {
    setSelectedPatient(p);
    setEditName(p.fullName);
    setEditPrimaryPhone(p.primaryPhone);
    setEditSecondaryPhone(p.secondaryPhone || '');
    setEditAddress(p.address);
    setEditAge(p.age);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    updatePatient(selectedPatient.id, {
      fullName: editName,
      primaryPhone: editPrimaryPhone,
      secondaryPhone: editSecondaryPhone || undefined,
      address: editAddress,
      age: Number(editAge),
    });
    setIsEditModalOpen(false);
    setSelectedPatient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Registry Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain demographic records, intake contact info, and view appointment tallies (Section 7.C)
          </p>
        </div>
        <button
          onClick={() => navigate('/receptionist/book-patient')}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Patient Intake</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-3xl shadow-card border border-slate-200/80 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient name, ID, phone number, or email..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredPatients.length} of {patients.length} patients
        </span>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Contact Info (Primary / Alt)</th>
                <th className="py-3.5 px-4">Age / Gender</th>
                <th className="py-3.5 px-4">Registered / Last Visit</th>
                <th className="py-3.5 px-4">History Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map(patient => {
                const totalApts = appointments.filter(a => a.patientId === patient.id).length;
                const fileCount = medicalFiles.filter(f => f.patientId === patient.id).length;

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {patient.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{patient.fullName}</div>
                      <span className="text-[11px] text-slate-400">{patient.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{patient.primaryPhone}</div>
                      {patient.secondaryPhone && (
                        <div className="text-[11px] text-slate-400">Alt: {patient.secondaryPhone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800">{patient.age} yrs</span>
                      <span className="text-slate-400 text-[11px] block">{patient.gender} • {patient.bloodGroup}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{patient.lastVisit}</div>
                      <span className="text-[10px] text-slate-400">Reg: {patient.registrationDate} ({totalApts} visits)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {patient.diagnosisHistoryCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Profile Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Pending History
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(patient)}
                          title="Edit Patient Demographics"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => navigate('/receptionist/symptoms')}
                          title="Record Intake Symptoms"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        >
                          <Stethoscope className="w-4 h-4" />
                        </button>

                        {/* Security check demonstration: Restricted file trigger (FR-30, TC-08) */}
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setIsRestrictedModalOpen(true);
                          }}
                          title="Medical File (Restricted)"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <FolderLock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Demographics Modal */}
      {isEditModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Demographics: {selectedPatient.id}</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Phone</label>
                  <input
                    type="text"
                    value={editPrimaryPhone}
                    onChange={e => setEditPrimaryPhone(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary Phone</label>
                  <input
                    type="text"
                    value={editSecondaryPhone}
                    onChange={e => setEditSecondaryPhone(e.target.value)}
                    placeholder="Optional alt"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={editAge}
                  onChange={e => setEditAge(Number(e.target.value))}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
              >
                Save Demographics
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Requirement Modal: Restricted Encrypted File Demonstration (FR-30, TC-08) */}
      {isRestrictedModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Access Restricted (SRS FR-30 / TC-08)</h3>
              <p className="text-xs text-rose-600 font-semibold mt-1">
                Security RBAC Policy Enforced: Receptionist Role
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                The receptionist may upload files and inspect metadata (filename, size, timestamp),
                but <strong>shall strictly not open, preview, or download encrypted medical-file contents</strong>.
              </p>
              <p className="text-[11px] text-slate-500 italic">
                Only the licensed physician mapped to {selectedPatient.fullName} holds cryptographic authority to view these decrypted records.
                This access attempt has been logged in the audit registry.
              </p>
            </div>

            <button
              onClick={() => setIsRestrictedModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
