import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit,
  Users,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  Baby,
  Bone,
  Brain,
  Sparkles,
  X,
  Layers,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { Department } from '../../types';

export const DepartmentManagementPage: React.FC = () => {
  const { departments, doctors, addDepartment, updateDepartment, appointments } = useClinic();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [roomCount, setRoomCount] = useState(2);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description);
    setRoomCount(dept.roomCount);
    setIsAddOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name,
        code,
        description,
        roomCount: Number(roomCount),
      });
      setFeedback(`Department "${name}" updated successfully.`);
    } else {
      addDepartment({
        name,
        code: code || name.slice(0, 4).toUpperCase(),
        description,
        headDoctorId: 'DOC-001',
        headDoctorName: 'Dr. Caroline Hutomo',
        status: 'Active',
        roomCount: Number(roomCount),
        iconName: 'Building2',
      });
      setFeedback(`New department "${name}" established.`);
    }

    setIsAddOpen(false);
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleStatus = (dept: Department) => {
    const nextStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    updateDepartment(dept.id, { status: nextStatus });
    setFeedback(`Department "${dept.name}" status set to ${nextStatus}.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Departments (6 Seeded Units)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure clinical units, consultation rooms, and specialty heads (SRS FR-38, Section 9.C)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDept(null);
            setName('');
            setCode('');
            setDescription('');
            setRoomCount(2);
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Clinical Department</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 6 Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map(dept => {
          const deptDoctors = doctors.filter(d => d.departmentId === dept.id);
          const deptAppointments = appointments.filter(a => a.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-600" />
                    <span className="font-bold text-slate-900 text-sm">{dept.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dept.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {dept.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed min-h-10">
                  {dept.description}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit Code:</span>
                    <span className="font-bold font-mono text-slate-800">{dept.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Specialty Head:</span>
                    <span className="font-bold text-slate-800">{dept.headDoctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Staff Doctors:</span>
                    <span className="font-bold text-brand-700">{deptDoctors.length} Specialists</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consultation Rooms:</span>
                    <span className="font-bold text-slate-800">{dept.roomCount} Rooms</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(dept)}
                  className={`text-xs font-bold ${
                    dept.status === 'Active' ? 'text-rose-600 hover:underline' : 'text-emerald-600 hover:underline'
                  }`}
                >
                  {dept.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Department</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingDept ? `Edit Department: ${editingDept.name}` : 'Create Clinical Department'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Ophthalmology, Oncology..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. OPHT, ONCO"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Rooms</label>
                <input
                  type="number"
                  value={roomCount}
                  onChange={e => setRoomCount(Number(e.target.value))}
                  min={1}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Clinical focus, specialized equipment, scope of care..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
              >
                Save Department
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
