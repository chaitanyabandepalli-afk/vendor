import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Key, Mail, UserCheck } from 'lucide-react';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@slvevents.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Admin');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Simulate login
    onLogin({ email, role });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07080a] relative overflow-hidden px-4">
      {/* Background soft glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main glass card container */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-white/10 shadow-2xl relative z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl shadow-lg mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">SLV Events</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Vendor Rating & Blacklist System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-200 bg-red-950/40 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm text-white"
                placeholder="you@slvevents.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Role selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Staff Role</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <UserCheck className="w-4 h-4" />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm text-white appearance-none"
              >
                <option value="Admin">Admin (Full Access)</option>
                <option value="Event Planner">Event Planner</option>
                <option value="Vendor Coordinator">Vendor Coordinator</option>
                <option value="Finance Team">Finance Team</option>
                <option value="Operations Lead">Operations Lead</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-bold text-white shadow-lg shadow-purple-900/20 hover:shadow-purple-500/10 transition-all hover:scale-[1.01] mt-3"
          >
            Access Dashboard
          </button>
        </form>

        {/* Demo Credential notice */}
        <div className="mt-8 text-center border-t border-white/5 pt-4">
          <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider font-semibold">
            Demo Portal (No actual registration required)
          </p>
        </div>
      </div>
    </div>
  );
}
