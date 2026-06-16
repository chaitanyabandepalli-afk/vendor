import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Mail, Lock, UserCheck, ChevronDown, ArrowRight, Shield } from 'lucide-react';

const DEMO_CREDENTIALS = [
  { label: 'Admin (Full Access)', email: 'admin@slvevents.com', password: 'password123', role: 'Admin' },
  { label: 'Event Planner', email: 'planner@slvevents.com', password: 'password123', role: 'Event Planner' },
  { label: 'Vendor Coordinator', email: 'coordinator@slvevents.com', password: 'password123', role: 'Vendor Coordinator' },
];

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@slvevents.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 900));
    onLogin({ email, role });
    navigate('/dashboard');
  };

  const fillDemo = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setRole(cred.role);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07080a] relative overflow-hidden px-4">

      {/* Animated background blobs */}
      <div className="animate-blob absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="animate-blob delay-300 absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-700/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="animate-blob delay-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-700/8 rounded-full blur-[80px] pointer-events-none" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Card */}
      <div
        className={`w-full max-w-md glass-panel rounded-2xl border border-white/10 shadow-2xl relative z-10 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

        <div className="p-8">
          {/* Branding */}
          <div className={`flex flex-col items-center mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl blur-xl opacity-60" />
              <div className="relative p-3.5 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">SLV Events</h1>
            <p className="text-xs text-gray-400 font-medium mt-1 tracking-wide uppercase">
              Vendor Rating &amp; Blacklist System
            </p>
          </div>

          {/* Quick-fill demo credentials */}
          <div className={`mb-6 transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2 text-center">
              Quick Demo Login
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {DEMO_CREDENTIALS.map((c) => (
                <button
                  key={c.role}
                  type="button"
                  onClick={() => fillDemo(c)}
                  className={`px-3 py-1 text-[10px] font-semibold rounded-full border transition-all duration-200 ${
                    role === c.role
                      ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                  }`}
                >
                  {c.role}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error */}
            {error && (
              <div className="p-3 text-xs font-semibold text-red-300 bg-red-950/40 border border-red-500/30 rounded-xl animate-fade-in flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-red-400 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className={`space-y-1.5 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-10 pr-4 py-2.5 text-sm"
                  placeholder="you@slvevents.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className={`space-y-1.5 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10 pr-10 py-2.5 text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className={`space-y-1.5 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Staff Role</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <UserCheck className="w-4 h-4" />
                </span>
                <select
                  id="login-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="glass-input pl-10 pr-8 py-2.5 text-sm appearance-none"
                >
                  <option value="Admin">Admin (Full Access)</option>
                  <option value="Event Planner">Event Planner</option>
                  <option value="Vendor Coordinator">Vendor Coordinator</option>
                  <option value="Finance Team">Finance Team</option>
                  <option value="Operations Lead">Operations Lead</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className={`pt-1 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Access Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className={`mt-6 text-center transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="divider mb-4" />
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
              Demo Portal · No Registration Required
            </p>
            <p className="text-[10px] text-gray-600 mt-1">
              SLV Events Internal Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
