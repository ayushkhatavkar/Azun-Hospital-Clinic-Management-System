import React, { useState } from 'react';
import {
  FolderLock,
  FileText,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Search,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/formatters';
import { MedicalFile } from '../../types';

export const DoctorMedicalFilesPage: React.FC = () => {
  const { medicalFiles, doctors, doctorPatientMaps, viewMedicalFileAuthorized } = useClinic();
  const { currentUser } = useAuth();

  const currentDoctor =
    doctors.find(d => d.id === currentUser?.doctorId || d.userId === currentUser?.id) || doctors[0];

  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<MedicalFile | null>(null);
  const [decryptedView, setDecryptedView] = useState<{
    authorized: boolean;
    content?: string;
    reason?: string;
  } | null>(null);

  // Mapped patient IDs (FR-28)
  const mappedPatientIds = doctorPatientMaps
    .filter(m => m.doctorId === currentDoctor.id && m.active)
    .map(m => m.patientId);

  // Assigned files vs other clinic files (for testing authorized vs unauthorized access in Journey 6 / TC-09)
  const assignedFiles = medicalFiles.filter(f => mappedPatientIds.includes(f.patientId));
  const otherFiles = medicalFiles.filter(f => !mappedPatientIds.includes(f.patientId));

  const handleOpenDecryptedFile = (file: MedicalFile) => {
    setSelectedFile(file);
    const result = viewMedicalFileAuthorized(file.id, currentDoctor.id, currentDoctor.fullName);
    setDecryptedView(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Authorized Medical File Viewer</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-authorized cryptographic decryption for assigned patient diagnostics (FR-31, FR-32, Journey 6, TC-09)
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Licensed Physician: {currentDoctor.fullName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Patient Files */}
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Assigned Patient Records ({assignedFiles.length})</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Authorized (FR-31)
              </span>
            </div>

            <div className="space-y-2.5">
              {assignedFiles.map(file => {
                const isSelected = selectedFile?.id === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => handleOpenDecryptedFile(file)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{file.fileName}</h4>
                      <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[11px] text-brand-700 font-semibold mt-1">
                      Patient: {file.patientName} ({file.category})
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100">
                      <span>{formatBytes(file.sizeBytes)}</span>
                      <span>{file.uploadDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Unauthorized Access Box (Journey 6 & TC-08/TC-09 verification) */}
          {otherFiles.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-card border border-rose-200/80 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-rose-100 text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold">Unassigned Patient File Test (FR-32)</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Clicking an unassigned file tests denial auditing: doctor has no assignment mapping to this patient.
              </p>
              {otherFiles.slice(0, 2).map(file => (
                <button
                  key={file.id}
                  onClick={() => handleOpenDecryptedFile(file)}
                  className="w-full text-left p-2.5 rounded-xl bg-rose-50/60 hover:bg-rose-100/60 border border-rose-200/60 text-xs font-semibold text-rose-900 flex items-center justify-between"
                >
                  <span className="truncate">{file.fileName} ({file.patientName})</span>
                  <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Decrypted Content Viewer */}
        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedFile.fileName}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Doc ID: {selectedFile.id} • Patient: {selectedFile.patientName} ({selectedFile.patientId})
                  </p>
                </div>
                {decryptedView?.authorized ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Unlock className="w-3.5 h-3.5" /> Decrypted & Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <Lock className="w-3.5 h-3.5" /> Access Denied
                  </span>
                )}
              </div>

              {/* Decrypted Payload */}
              {decryptedView?.authorized ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-900 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Access audit confirmed: Dr. {currentDoctor.fullName} verified against patient mapping {selectedFile.patientId} (FR-31).
                    </span>
                  </div>

                  <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
                    {decryptedView.content}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                    <span>* Encrypted AES-256 in production repository; displayed in authorized viewer.</span>
                    <button
                      onClick={() => alert('Mock document downloaded to clinical review cache.')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Secure Copy</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 px-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Access Restricted by Clinical RBAC</h4>
                  <p className="text-xs text-rose-700 max-w-md mx-auto leading-relaxed">
                    {decryptedView?.reason || 'You are not assigned to this patient. Direct access strictly forbidden.'}
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    Security violation event logged to administrative audit log (TC-08 / FR-32).
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center shadow-card border border-slate-200/80">
              <FolderLock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">Select an Assigned Medical File</h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose a patient document from your caseload to initiate authorized decryption.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
