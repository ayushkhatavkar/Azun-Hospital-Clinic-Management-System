import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Shield, User, Stethoscope, Users, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('reception@clinic.demo');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (res.success) {
      redirectByRole();
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const redirectByRole = () => {
    // Determine destination
    const targetEmail = email.toLowerCase();
    if (targetEmail.includes('patient')) {
      navigate('/patient/dashboard');
    } else if (targetEmail.includes('reception')) {
      navigate('/receptionist/dashboard');
    } else if (targetEmail.includes('doctor')) {
      navigate('/doctor/dashboard');
    } else if (targetEmail.includes('admin')) {
      navigate('/admin/dashboard');
    } else {
      navigate('/receptionist/dashboard');
    }
  };

  const handleQuickRole = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    switchRole(role);
    if (role === 'patient') navigate('/patient/dashboard');
    else if (role === 'receptionist') navigate('/receptionist/dashboard');
    else if (role === 'doctor') navigate('/doctor/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Left Side: Brand & Quick Demo Access */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-navy-900 to-brand-950 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">MedHealthy</h1>
                <p className="text-[11px] text-brand-300 font-medium">Clinic Management System</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-base font-semibold text-slate-100">Prototype Demo Sign-In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select any simulated persona below to test role-specific workflows instantly:
              </p>
            </div>

            {/* Quick Login Role Cards */}
            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => handleQuickRole('receptionist', 'reception@clinic.demo')}
                className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-teal-300">Receptionist (Primary)</p>
                    <p className="text-[10px] text-slate-400">reception@clinic.demo</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('patient', 'patient@clinic.demo')}
                className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-300 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-brand-300">Patient Portal</p>
                    <p className="text-[10px] text-slate-400">patient@clinic.demo</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('doctor', 'doctor@clinic.demo')}
                className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-indigo-300">Doctor Workspace</p>
                    <p className="text-[10px] text-slate-400">doctor@clinic.demo</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('admin', 'admin@clinic.demo')}
                className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-amber-300">Administrator</p>
                    <p className="text-[10px] text-slate-400">admin@clinic.demo</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-slate-400 leading-relaxed">
            <p>Demo Prototype v1.0 • Built per IEEE 830-1998 SRS Specification.</p>
          </div>
        </div>

        {/* Right Side: Standard Login Form */}
        <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your clinical credentials or use demo shortcuts on the left.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@clinic.demo"
                  required
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Mock: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Clinical Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>New patient seeking consultation?</span>
            <Link
              to="/register"
              className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Register Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
