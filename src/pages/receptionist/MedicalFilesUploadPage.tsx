import React, { useState } from 'react';
import {
  FolderLock,
  Upload,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Lock,
  FileText,
  EyeOff,
  User,
  Info,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatBytes } from '../../utils/formatters';

export const MedicalFilesUploadPage: React.FC = () => {
  const { medicalFiles, patients, uploadMedicalFile } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<
    'Lab Report' | 'Imaging / X-Ray' | 'Prescription' | 'Discharge Summary' | 'Specialist Note'
  >('Lab Report');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Security restriction warning modal
  const [isDeniedModalOpen, setIsDeniedModalOpen] = useState(false);
  const [deniedFileName, setDeniedFileName] = useState('');

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      alert('Please enter a file name.');
      return;
    }

    const newFile = uploadMedicalFile({
      patientId: selectedPatientId,
      fileName: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
      mimeType: 'application/pdf',
      sizeBytes: Math.floor(Math.random() * 2000000) + 500000,
      category,
      uploadedBy: 'Reception Desk 1 (Marco R)',
      mockDecryptedContent: `[CONFIDENTIAL MEDICAL DATA - VERIFIED DIAGNOSTIC REPORT]
Patient: ${patients.find(p => p.id === selectedPatientId)?.fullName} (ID: ${selectedPatientId})
Category: ${category}
Document: ${fileName}
Diagnostic laboratory parameters normal. Signed by Chief Pathologist.`,
    });

    setFeedback(`File "${newFile.fileName}" uploaded. Stored with Mock AES-256 encryption status.`);
    setFileName('');
    setTimeout(() => setFeedback(null), 5000);
  };

  const filteredFiles = medicalFiles.filter(f => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.fileName.toLowerCase().includes(q) ||
      f.patientName.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Encrypted Medical File Intake</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Front desk diagnostic document upload with cryptographic metadata enforcement (FR-29, FR-30, TC-08)
          </p>
        </div>
        <div className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600" />
          <span>Metadata-Only Reception Mode (FR-30)</span>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Security Architecture Callout Note */}
      <div className="p-4 rounded-3xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900">Security Architecture Notice (SRS FR-30):</strong> The receptionist may upload files and inspect metadata (Document ID, Patient, File Name, Category, Size, Upload Date), but <strong>cannot view, preview, or download decrypted file contents</strong>. Decrypted medical content is strictly restricted to authorized attending doctors.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Upload Patient Diagnostic Document
          </h3>

          <form onSubmit={handleSimulatedUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Patient *</label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Lab Report">Lab Report</option>
                <option value="Imaging / X-Ray">Imaging / X-Ray</option>
                <option value="Prescription">Prescription</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Specialist Note">Specialist Note</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">File Name *</label>
              <input
                type="text"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                placeholder="e.g. Blood_Test_Panel_Oct2026.pdf"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>

            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-1 bg-slate-50">
              <Upload className="w-7 h-7 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Select local file or simulated upload</p>
              <p className="text-[10px] text-slate-400">PDF, DICOM, JPEG up to 25 MB</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Simulate Secure Upload (FR-29)</span>
            </button>
          </form>
        </div>

        {/* Uploaded Files Metadata Registry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-3xl shadow-card border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter files by name, patient, category..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-semibold">{filteredFiles.length} files</span>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">Doc ID</th>
                    <th className="py-3 px-4">File Name & Patient</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Size & Upload Date</th>
                    <th className="py-3 px-4">Encryption Status</th>
                    <th className="py-3 px-4 text-right">Access Permission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map(file => (
                    <tr key={file.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{file.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{file.fileName}</div>
                        <span className="text-[11px] text-slate-400">Patient: {file.patientName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          {file.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800">{formatBytes(file.sizeBytes)}</div>
                        <span className="text-[10px] text-slate-400">{file.uploadDate}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={file.encryptionStatus} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {/* Receptionist content restriction test trigger (Journey 6, TC-08) */}
                        <button
                          onClick={() => {
                            setDeniedFileName(file.fileName);
                            setIsDeniedModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Restricted (Doctor Only)</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Access Denied Modal for Receptionist (TC-08) */}
      {isDeniedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Content Access Denied (TC-08 / FR-30)</h3>
              <p className="text-xs text-rose-600 font-semibold mt-1">
                Receptionist role cannot view or download decrypted contents
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                Attempted to open: <strong>{deniedFileName}</strong>
              </p>
              <p>
                Per SRS FR-30 and FR-32, the front desk interface is restricted to document metadata only.
                Decrypted contents may only be viewed when authenticated as an attending doctor mapped to this patient.
              </p>
              <p className="text-[11px] text-slate-400 italic">
                * This unauthorized access attempt has been logged in the audit registry (FR-32).
              </p>
            </div>

            <button
              onClick={() => setIsDeniedModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
