import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, User, Search, ShieldCheck } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { formatBytes } from '../../utils/formatters';

export const PatientReportsPage: React.FC = () => {
  const { medicalFiles, patients } = useClinic();
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<typeof medicalFiles[0] | null>(null);

  const currentPatient =
    patients.find(p => p.id === currentUser?.patientId || p.email === currentUser?.email) ||
    patients[0];

  const myFiles = medicalFiles.filter(f => f.patientId === currentPatient.id);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Clinical Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Access diagnostic lab reports, imaging scans, and summaries associated with your profile (FR-35)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="md:col-span-2 space-y-3">
          {myFiles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-slate-200/80">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No digital reports uploaded</h3>
              <p className="text-xs text-slate-400 mt-1">
                Any lab tests or diagnostic files uploaded by clinic staff will appear here.
              </p>
            </div>
          ) : (
            myFiles.map(file => {
              const isSelected = selectedFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer bg-white shadow-card flex items-center justify-between ${
                    isSelected
                      ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/20'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{file.fileName}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                          {file.category}
                        </span>
                        <span>• {formatBytes(file.sizeBytes)}</span>
                        <span>• Uploaded: {file.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-brand-600 hover:text-brand-700 p-2 rounded-xl hover:bg-slate-100 flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Inspect</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Report Preview */}
        <div>
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Diagnostic Summary Preview
            </h3>

            {selectedFile ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Document:</span>
                  <p className="font-bold text-slate-900 break-words">{selectedFile.fileName}</p>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800">{selectedFile.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Uploaded Date:</span>
                  <span className="text-slate-800">{selectedFile.uploadDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Verification:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Laboratory
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 text-[11px] block mb-1">Diagnostic Report Body:</span>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {selectedFile.mockDecryptedContent || 'Diagnostic overview available upon physician consultation.'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-10 text-center">
                Select a report from the list to preview its diagnostic details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
