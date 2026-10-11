import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  requireReason = false,
  reasonPlaceholder = 'Please enter reason...',
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('A mandatory reason is required to proceed.');
      return;
    }
    setError('');
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDanger ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600'
              }`}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-2">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

          {requireReason && (
            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Mandatory Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                rows={3}
                placeholder={reasonPlaceholder}
                className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-400"
              />
              {error && <p className="text-xs text-rose-600 mt-1 font-medium">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-xs transition-colors ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
                : 'bg-brand-600 hover:bg-brand-700 focus:ring-brand-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
