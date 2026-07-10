import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GrievanceProvider } from './context/GrievanceContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import CitizenPortal from './pages/CitizenPortal';
import AiPipeline from './pages/AiPipeline';
import MlaDashboard from './pages/MlaDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { Cpu, ArrowRight } from 'lucide-react';
import './App.css';

// Phase placeholders to show professional feedback
function PhasePlaceholder({ title, description, badge, nextStep }) {
  return (
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-slate-50 grid-bg">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-2xl text-center space-y-6 bg-white/70 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-500"></div>
        <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-500 border border-sky-100 flex items-center justify-center mx-auto animate-bounce">
          <Cpu className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] bg-sky-50 border border-sky-100 text-sky-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">{badge}</span>
          <h2 className="text-xl font-bold text-slate-900 pt-1">{title}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50 text-xs text-left">
          <span className="font-bold text-slate-700 block mb-1">What's being built next:</span>
          <p className="text-slate-500 leading-relaxed">{nextStep}</p>
        </div>
        <div className="pt-2">
          <Link to="/citizen" className="inline-flex items-center gap-1.5 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md">
            Go to Citizen Portal (Phase 1)
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <GrievanceProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:text-slate-100 select-none">
              <Navbar />

              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/citizen" element={<CitizenPortal />} />
                  <Route path="/citizen/track/:id" element={<CitizenPortal />} />

                  <Route path="/ai-pipeline" element={<AiPipeline />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['mla']}>
                        <MlaDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
        </GrievanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;