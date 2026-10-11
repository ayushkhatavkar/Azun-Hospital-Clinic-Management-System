import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Edit,
  Mail,
  Phone,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { UserAccount, UserRole } from '../../types';

export const UserManagementPage: React.FC = () => {
  const { users, toggleUserStatus, addUser } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Add User State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('receptionist');
  const [newPhone, setNewPhone] = useState('+91 98');

  // Deactivate confirmation modal
  const [targetUser, setTargetUser] = useState<UserAccount | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleStatus = (u: UserAccount) => {
    setTargetUser(u);
    setIsConfirmOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!targetUser) return;
    toggleUserStatus(targetUser.id);
    setIsConfirmOpen(false);
    setFeedback(`Account status for ${targetUser.fullName} updated to ${targetUser.status === 'active' ? 'Inactive' : 'Active'}.`);
    setTargetUser(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    addUser({
      username: newEmail,
      email: newEmail,
      role: newRole,
      fullName: newFullName,
      status: 'active',
      phone: newPhone,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    });

    setIsAddUserOpen(false);
    setNewFullName('');
    setNewEmail('');
    setFeedback(`Created new ${newRole} account for ${newFullName}.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="bg-amber-50 text-amber-700 border-amber-200 border px-2 py-0.5 rounded-full text-[10px] font-bold">Admin</span>;
      case 'doctor':
        return <span className="bg-indigo-50 text-indigo-700 border-indigo-200 border px-2 py-0.5 rounded-full text-[10px] font-bold">Doctor</span>;
      case 'receptionist':
        return <span className="bg-teal-50 text-teal-700 border-teal-200 border px-2 py-0.5 rounded-full text-[10px] font-bold">Receptionist</span>;
      default:
        return <span className="bg-brand-50 text-brand-700 border-brand-200 border px-2 py-0.5 rounded-full text-[10px] font-bold">Patient</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System User & Role Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer role-based authentication permissions, account provisioning, and access statuses (FR-03)
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-card border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search user by name, email, or role..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="receptionist">Receptionists</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email / Login ID</th>
                <th className="py-3 px-4">Role Assignment</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{user.fullName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{user.email}</td>
                  <td className="py-3.5 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-3.5 px-4 text-slate-600">{user.phone || '-'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      user.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {user.status === 'active' ? 'Active Account' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      title={user.status === 'active' ? 'Deactivate Account' : 'Reactivate Account'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        user.status === 'active'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleCreateUser} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Provision User Account</h3>
            <p className="text-xs text-slate-500">Create login credentials with role-based access level.</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  required
                  placeholder="e.g. Dr. Rajesh Kulkarni"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Username *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                  placeholder="name@clinic.demo"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Assignment (FR-03)</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="receptionist">Receptionist (Front Desk)</option>
                  <option value="doctor">Doctor (Attending Physician)</option>
                  <option value="patient">Patient</option>
                  <option value="admin">Management / Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal for Account Status Toggle */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title={`${targetUser?.status === 'active' ? 'Deactivate' : 'Reactivate'} Account`}
        message={`Are you sure you want to ${targetUser?.status === 'active' ? 'deactivate' : 'reactivate'} the account for ${targetUser?.fullName} (${targetUser?.email})? Inactive accounts cannot sign in.`}
        confirmLabel={targetUser?.status === 'active' ? 'Deactivate Account' : 'Reactivate Account'}
        isDanger={targetUser?.status === 'active'}
        onConfirm={handleConfirmToggle}
        onCancel={() => {
          setIsConfirmOpen(false);
          setTargetUser(null);
        }}
      />
    </div>
  );
};
