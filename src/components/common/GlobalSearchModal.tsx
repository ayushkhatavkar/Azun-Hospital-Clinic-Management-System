import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { appointments, patients, doctors, medicalRecords } = useClinic();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle if needed
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Role scoped search results:
  // 1. Appointments
  const filteredAppointments = q ? appointments.filter(a => {
    if (currentUser?.role === 'patient') {
      if (a.patientId !== currentUser.patientId) return false;
    }
    if (currentUser?.role === 'doctor') {
      if (a.doctorId !== currentUser.doctorId) return false;
    }
    return (
      a.id.toLowerCase().includes(q) ||
      a.patientName.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      a.departmentName.toLowerCase().includes(q)
    );
  }).slice(0, 5) : [];

  // 2. Patients (only Receptionist and Admin, or Doctor for mapped patients)
  const filteredPatients = q && currentUser?.role !== 'patient' ? patients.filter(p => {
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.primaryPhone.includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  }).slice(0, 4) : [];

  // 3. Doctors (visible to all)
  const filteredDoctors = q ? doctors.filter(d => {
    return (
      d.fullName.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.departmentName.toLowerCase().includes(q)
    );
  }).slice(0, 3) : [];

  const handleSelectAppointment = (_aptId: string) => {
    if (currentUser?.role === 'patient') {
      navigate('/patient/appointments');
    } else if (currentUser?.role === 'receptionist') {
      navigate('/receptionist/appointments');
    } else if (currentUser?.role === 'doctor') {
      navigate('/doctor/consultations');
    } else {
      navigate('/admin/appointments');
    }
    onClose();
  };

  const handleSelectPatient = (_patId: string) => {
    if (currentUser?.role === 'receptionist') {
      navigate('/receptionist/patients');
    } else if (currentUser?.role === 'doctor') {
      navigate('/doctor/patients');
    } else {
      navigate('/admin/users');
    }
    onClose();
  };

  const totalResults = filteredAppointments.length + filteredPatients.length + filteredDoctors.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-white">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search appointments, patients, doctors, departments..."
            autoFocus
            className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100">
          {!query ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-sm font-medium">Type a name, ID, phone number, or specialty to search</p>
              <p className="text-xs text-slate-400 mt-1">Permission-scoped results for {currentUser?.role} role</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-10 text-center text-slate-500">
              <p className="text-sm font-semibold">No matching records found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching with a different term</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                    Appointments
                  </span>
                  <div className="space-y-1 mt-1">
                    {filteredAppointments.map(a => (
                      <div
                        key={a.id}
                        onClick={() => handleSelectAppointment(a.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{a.id}</span>
                              <span className="text-xs text-slate-600">{a.patientName}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">{a.doctorName} • {a.date} ({a.timeSlot})</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredPatients.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                    Patients
                  </span>
                  <div className="space-y-1 mt-1">
                    {filteredPatients.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPatient(p.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">{p.fullName}</span>
                            <p className="text-[11px] text-slate-400">{p.id} • {p.primaryPhone} • {p.email}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredDoctors.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                    Doctors & Specialists
                  </span>
                  <div className="space-y-1 mt-1">
                    {filteredDoctors.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          navigate(currentUser?.role === 'patient' ? '/patient/book' : '/receptionist/doctors');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">{d.fullName}</span>
                            <p className="text-[11px] text-slate-400">{d.specialty} • {d.departmentName}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
