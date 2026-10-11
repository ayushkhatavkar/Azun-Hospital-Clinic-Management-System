import React, { useState } from 'react';
import {
  Layers,
  Building2,
  Stethoscope,
  Plus,
  Edit,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  Clock,
  DollarSign,
  X,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { formatCurrency } from '../../utils/formatters';
import { Doctor, Room } from '../../types';

export const DoctorRoomManagementPage: React.FC = () => {
  const { doctors, departments, rooms, updateDoctor, addDoctor, addRoom, updateRoom } = useClinic();

  const [activeTab, setActiveTab] = useState<'doctors' | 'rooms'>('doctors');

  // Edit doctor modal
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('');
  const [docDeptId, setDocDeptId] = useState('');
  const [docRoom, setDocRoom] = useState('');
  const [docShift, setDocShift] = useState<'Shift 1' | 'Shift 2' | 'Both'>('Shift 1');
  const [docFee, setDocFee] = useState(800);

  // Add room modal
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [roomNum, setRoomNum] = useState('');
  const [roomDeptId, setRoomDeptId] = useState(departments[0]?.id || '');
  const [roomType, setRoomType] = useState<'Consultation' | 'Examination' | 'Procedure'>('Consultation');

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDocName(doc.fullName);
    setDocSpecialty(doc.specialty);
    setDocDeptId(doc.departmentId);
    setDocRoom(doc.roomAssigned);
    setDocShift(doc.shiftDefault);
    setDocFee(doc.consultationFee);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    const dept = departments.find(d => d.id === docDeptId);
    updateDoctor(editingDoctor.id, {
      fullName: docName,
      specialty: docSpecialty,
      departmentId: docDeptId,
      departmentName: dept?.name || editingDoctor.departmentName,
      roomAssigned: docRoom,
      shiftDefault: docShift,
      consultationFee: Number(docFee),
    });

    setEditingDoctor(null);
    setFeedback(`Doctor profile for ${docName} updated.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNum.trim()) return;
    const dept = departments.find(d => d.id === roomDeptId);

    addRoom({
      roomNumber: roomNum,
      departmentId: roomDeptId,
      departmentName: dept?.name || 'General',
      type: roomType,
      status: 'Available',
    });

    setIsAddRoomOpen(false);
    setRoomNum('');
    setFeedback(`Room "${roomNum}" added to clinic registry.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doctors & Consultation Rooms</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain physician profiles, departmental mappings, and room capacities (Section 9.D, TBD-8)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'doctors'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Doctors ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors ${
              activeTab === 'rooms'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Rooms ({rooms.length})
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {activeTab === 'doctors' ? (
        /* Doctors Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <img
                    src={doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'}
                    alt={doc.fullName}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/20"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{doc.fullName}</h3>
                    <p className="text-xs text-brand-700 font-semibold truncate">{doc.departmentName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{doc.phone}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Specialty:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-xs">{doc.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Room Assigned (FR-23):</span>
                    <span className="font-bold text-slate-800">{doc.roomAssigned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duty Shift:</span>
                    <span className="font-semibold text-slate-800">{doc.shiftDefault}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consultation Fee:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(doc.consultationFee)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleOpenEditDoctor(doc)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Rooms Grid */
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddRoomOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Consultation Room</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rooms.map(room => (
              <div
                key={room.id}
                className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">{room.roomNumber}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {room.status}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-slate-500">Unit: <strong className="text-slate-800">{room.departmentName}</strong></p>
                  <p className="text-slate-500">Type: <strong className="text-slate-800">{room.type}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Doctor Dialog */}
      {editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSaveDoctor} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Doctor: {editingDoctor.fullName}</h3>
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
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
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty Description</label>
                <input
                  type="text"
                  value={docSpecialty}
                  onChange={e => setDocSpecialty(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={docDeptId}
                    onChange={e => setDocDeptId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Assigned</label>
                  <select
                    value={docRoom}
                    onChange={e => setDocRoom(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.roomNumber}>{r.roomNumber}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Shift</label>
                  <select
                    value={docShift}
                    onChange={e => setDocShift(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Shift 1">Shift 1</option>
                    <option value="Shift 2">Shift 2</option>
                    <option value="Both">Both Shifts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (INR)</label>
                  <input
                    type="number"
                    value={docFee}
                    onChange={e => setDocFee(Number(e.target.value))}
                    required
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Room Dialog */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleCreateRoom} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Consultation Room</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number (e.g. Room 205)</label>
                <input
                  type="text"
                  value={roomNum}
                  onChange={e => setRoomNum(e.target.value)}
                  required
                  placeholder="e.g. Room 205"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={roomDeptId}
                  onChange={e => setRoomDeptId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type</label>
                <select
                  value={roomType}
                  onChange={e => setRoomType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Examination">Examination</option>
                  <option value="Procedure">Procedure</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddRoomOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
              >
                Add Room
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
