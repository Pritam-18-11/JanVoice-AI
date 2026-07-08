import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Landmark, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'mla') navigate('/dashboard');
      else if (loggedInUser.role === 'admin') navigate('/admin');
      else navigate('/citizen');
    } catch {
      // authError is already set inside AuthContext and shown below
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-slate-50 grid-bg">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-2xl relative bg-white/70 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"></div>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg mx-auto">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">MLA / Admin Access</h1>
          <p className="text-slate-500 text-sm">Sign in with your representative or admin credentials.</p>
        </div>

        {authError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-3 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Email Address</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mla@janvoice.in"
                className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md mt-6 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {authLoading ? 'Signing in...' : 'Access Dashboard'}
            {!authLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Citizen? <Link to="/citizen" className="text-sky-600 font-semibold hover:underline">Go to Citizen Portal</Link>
        </p>
      </div>
    </div>
  );
}