import React from 'react';
import { Stethoscope, Phone, Mail, Award, MapPin, Building2, Clock, Star, DollarSign } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

export const DoctorProfilePage: React.FC = () => {
  const { doctors } = useClinic();
  const { currentUser } = useAuth();

  const currentDoctor =
    doctors.find(d => d.id === currentUser?.doctorId || d.userId === currentUser?.id) || doctors[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Physician Credential Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Licensed specialist credentials, clinic consultation room, and duty parameters
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
          <img
            src={currentDoctor.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'}
            alt={currentDoctor.fullName}
            className="w-20 h-20 rounded-3xl object-cover ring-4 ring-brand-500/20 shadow-md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentDoctor.fullName}</h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active Staff
              </span>
            </div>
            <p className="text-xs text-brand-700 font-semibold mt-0.5">{currentDoctor.specialty}</p>
            <p className="text-xs text-slate-500 mt-1">{currentDoctor.qualifications}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-brand-600" />
            <div>
              <span className="text-slate-400 text-[11px] block">Department</span>
              <strong className="text-slate-900 text-sm">{currentDoctor.departmentName}</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-teal-600" />
            <div>
              <span className="text-slate-400 text-[11px] block">Assigned Consultation Room (FR-23)</span>
              <strong className="text-slate-900 text-sm">{currentDoctor.roomAssigned}</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-600" />
            <div>
              <span className="text-slate-400 text-[11px] block">Default Duty Shift</span>
              <strong className="text-slate-900 text-sm">{currentDoctor.shiftDefault}</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-slate-400 text-[11px] block">Standard Consultation Fee</span>
              <strong className="text-slate-900 text-sm">{formatCurrency(currentDoctor.consultationFee)}</strong>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
          <h4 className="font-bold text-slate-800">Direct Contact & Verification</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
            <div>Phone: <strong className="text-slate-900">{currentDoctor.phone}</strong></div>
            <div>Email: <strong className="text-slate-900">{currentDoctor.email}</strong></div>
            <div>Experience: <strong className="text-slate-900">{currentDoctor.experienceYears} Years</strong></div>
            <div>Clinical Rating: <strong className="text-slate-900">{currentDoctor.rating} / 5.0</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
