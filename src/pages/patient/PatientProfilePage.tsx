import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';

export const PatientProfilePage: React.FC = () => {
  const { patients, updatePatient } = useClinic();
  const { currentUser } = useAuth();

  const currentPatient =
    patients.find(p => p.id === currentUser?.patientId || p.email === currentUser?.email) ||
    patients[0];

  const [fullName, setFullName] = useState(currentPatient.fullName);
  const [primaryPhone, setPrimaryPhone] = useState(currentPatient.primaryPhone);
  const [secondaryPhone, setSecondaryPhone] = useState(currentPatient.secondaryPhone || '');
  const [address, setAddress] = useState(currentPatient.address);
  const [emergencyName, setEmergencyName] = useState(currentPatient.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentPatient.emergencyContact?.phone || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient(currentPatient.id, {
      fullName,
      primaryPhone,
      secondaryPhone: secondaryPhone || undefined,
      address,
      emergencyContact: {
        name: emergencyName,
        relationship: currentPatient.emergencyContact?.relationship || 'Family',
        phone: emergencyPhone,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Demographic Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Update primary and secondary contact numbers, residence address, and emergency details (FR-01)
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile changes updated successfully in clinic records!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
            alt={fullName}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-500/20"
          />
          <div>
            <h3 className="text-base font-bold text-slate-900">{currentPatient.fullName}</h3>
            <p className="text-xs text-slate-500 font-mono">Patient Record: {currentPatient.id}</p>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
              Registration Date: {currentPatient.registrationDate}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email (Username)</label>
            <input
              type="email"
              value={currentPatient.email}
              disabled
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Phone Number *</label>
            <input
              type="text"
              value={primaryPhone}
              onChange={e => setPrimaryPhone(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Secondary Contact Number (FR-01)</label>
            <input
              type="text"
              value={secondaryPhone}
              onChange={e => setSecondaryPhone(e.target.value)}
              placeholder="Optional alternate mobile"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Residential Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Emergency Contact Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Name</label>
              <input
                type="text"
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Information</span>
        </button>
      </form>
    </div>
  );
};
