import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Percent,
  Shield,
  CreditCard,
  Database,
  Cloud,
  RotateCcw,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const SystemConfigurationPage: React.FC = () => {
  const { config, updateConfig, resetAllDemoData } = useClinic();

  const [bookingChargePercentage, setBookingChargePercentage] = useState(config.bookingChargePercentage);
  const [cancellationCutOffHours, setCancellationCutOffHours] = useState(config.cancellationCutOffHours);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(config.sessionTimeoutMinutes);
  const [clinicName, setClinicName] = useState(config.clinicName);
  const [clinicPhone, setClinicPhone] = useState(config.clinicPhone);
  const [clinicAddress, setClinicAddress] = useState(config.clinicAddress);
  const [clinicEmail, setClinicEmail] = useState(config.clinicEmail);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(config.slotDurationMinutes);
  const [shift1Timing, setShift1Timing] = useState(config.shift1Timing);
  const [shift2Timing, setShift2Timing] = useState(config.shift2Timing);
  const [emergencyRefundPercent, setEmergencyRefundPercent] = useState(config.emergencyCancellationFeeRefundablePercent);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      bookingChargePercentage: Number(bookingChargePercentage),
      cancellationCutOffHours: Number(cancellationCutOffHours),
      sessionTimeoutMinutes: Number(sessionTimeoutMinutes),
      clinicName,
      clinicPhone,
      clinicAddress,
      clinicEmail,
      slotDurationMinutes: Number(slotDurationMinutes),
      shift1Timing,
      shift2Timing,
      emergencyCancellationFeeRefundablePercent: Number(emergencyRefundPercent),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Global Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify booking deposit rates, cancellation cut-off policies, and clinical defaults (Section 9.E, Journey 8)
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save System Parameters</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Configuration saved successfully! Changes to booking deposit % and cancellation cut-off are immediately active across all portals.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Financial & Policy Settings (Journey 8) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Percent className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Financial Booking Deposit & Cancellation Rules</h3>
              <p className="text-[11px] text-slate-400">Directly impacts patient booking calculations (SRS FR-12, FR-14, FR-38)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Booking Charge Percentage (%) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bookingChargePercentage}
                  onChange={e => setBookingChargePercentage(Number(e.target.value))}
                  min={0}
                  max={100}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 font-bold"
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Prototype default: 10% (15% also discussed in client notes TBD-4).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Cancellation Cut-Off Window (Hours) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={cancellationCutOffHours}
                  onChange={e => setCancellationCutOffHours(Number(e.target.value))}
                  min={1}
                  max={72}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 font-bold"
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">Hours</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Default: 2 hours prior to appointment start time (SRS FR-14, TBD-6).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emergency Cancellation Refundable Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={emergencyRefundPercent}
                  onChange={e => setEmergencyRefundPercent(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-bold"
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Discretionary simulated refund under emergency clauses (TBD-6).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Inactivity Session Timeout (Minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={sessionTimeoutMinutes}
                  onChange={e => setSessionTimeoutMinutes(Number(e.target.value))}
                  min={5}
                  max={120}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 font-bold"
                />
                <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">Mins</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Simulated session expiry threshold (SRS FR-04, TBD-3).
              </p>
            </div>
          </div>
        </div>

        {/* Clinic Identity & Hours */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Clinic Identity & Operating Shifts</h3>
              <p className="text-[11px] text-slate-400">Branding details and clinical shift slots</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Name</label>
              <input
                type="text"
                value={clinicName}
                onChange={e => setClinicName(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={clinicPhone}
                onChange={e => setClinicPhone(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift 1 Timing Label (FR-20)</label>
              <input
                type="text"
                value={shift1Timing}
                onChange={e => setShift1Timing(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift 2 Timing Label (FR-20)</label>
              <input
                type="text"
                value={shift2Timing}
                onChange={e => setShift2Timing(e.target.value)}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={clinicAddress}
              onChange={e => setClinicAddress(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        {/* Infrastructure & Security Placeholders (TBD-11, TBD-12) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Cloud className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Infrastructure & Backup Architecture (Placeholders)</h3>
              <p className="text-[11px] text-slate-400">Specifications pending final client confirmation (SRS TBD-11, TBD-12)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="font-bold text-slate-800 block">Cloud Hosting Environment (TBD-12)</span>
              <p className="text-slate-500 text-[11px]">
                AWS Cloud External Server (Budget: Rs 5,000 - 6,000/mo discussed). Local server 50-100 GB alternative under review.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="font-bold text-slate-800 block">Encryption & Backup Policy (TBD-11)</span>
              <p className="text-slate-500 text-[11px]">
                AES-256 Mock Simulation. Automated Daily Cloud Snapshot at 02:00 AM IST.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save and Apply Configuration</span>
        </button>
      </form>
    </div>
  );
};
