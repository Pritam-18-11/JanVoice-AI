import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGrievances } from '../context/GrievanceContext';
import { useAuth } from '../context/AuthContext';
import VoiceRecorder from '../components/VoiceRecorder';
import MapPicker from '../components/MapPicker';
import { 
  FileText, Image as ImageIcon, MapPin, Check, 
  Search, Filter, Plus, Calendar, AlertTriangle, 
  ArrowLeft, Clock, Map, ChevronRight, User, Key, Lock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CitizenPortal() {
  const { id } = useParams(); // For tracking page
  const navigate = useNavigate();
  const { complaints, addComplaint } = useGrievances();

  // Real JWT Authentication (via AuthContext)
  const { user, login, register, logout, authLoading, authError } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWard, setRegWard] = useState('Ward 10');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
    } catch {
      // authError from context is displayed in the JSX below
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPassword) {
      alert('Please fill in all details');
      return;
    }
    try {
      await register({ name: regName, email: regEmail, phone: regPhone, ward: regWard, password: regPassword });
    } catch {
      // authError from context is displayed in the JSX below
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Grievance Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road Infrastructure');
  const [severity, setSeverity] = useState('Medium');
  const [landmark, setLandmark] = useState('');
  const [voiceData, setVoiceData] = useState({ voiceBlob: null, voiceUrl: null });
  const [locationData, setLocationData] = useState({
    lat: 22.6985,
    lng: 88.4532,
    areaName: 'Madhyamgram, Ward 10',
    ward: 'Ward 10',
    district: 'North 24 Parganas'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  
  // Dashboard states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Simulated submission notification
  const [showSuccess, setShowSuccess] = useState(false);
  const [newTrackingId, setNewTrackingId] = useState('');

  // Image Upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl(null);
  };

  // Handle Grievance Submit — now posts real multipart data to the backend
  const handleGrievanceSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      alert("Please write a description of the issue");
      return;
    }

    const formData = new FormData();
    formData.append('title', title || `${category} Issue`);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('severity', severity);
    formData.append('landmark', landmark);
    formData.append('lat', locationData.lat);
    formData.append('lng', locationData.lng);
    formData.append('areaName', locationData.areaName);
    formData.append('ward', locationData.ward);
    formData.append('district', locationData.district);
    if (voiceData.voiceBlob) formData.append('voice', voiceData.voiceBlob, 'voice-note.webm'); // real audio → Whisper STT on backend
    if (imageFile) formData.append('image', imageFile); // real File object → Gemini Vision + Cloudinary on backend

    try {
      const newGrievance = await addComplaint(formData);
      setNewTrackingId(newGrievance.id);
      setShowSuccess(true);

      // Clear form
      setTitle('');
      setDescription('');
      setCategory('Road Infrastructure');
      setSeverity('Medium');
      setLandmark('');
      setVoiceData({ voiceBlob: null, voiceUrl: null });
      setImageFile(null);
      setImageUrl(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    }
  };

  // Redirect to tracking page
  const proceedToTracking = () => {
    setShowSuccess(false);
    navigate(`/citizen/track/${newTrackingId}`);
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [
    "Road Infrastructure",
    "Drainage & Sewerage",
    "Electricity & Lighting",
    "Water Supply",
    "Solid Waste & Garbage",
    "Public Transport",
    "Healthcare/Hospitals",
    "School Infrastructure",
    "Agriculture Development"
  ];

  // SUB-VIEW: COMPLAINT TRACKING DETAIL PAGE
  if (id) {
    const complaint = complaints.find(c => c.id === id);

    if (!complaint) {
      return (
        <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Complaint Not Found</h2>
          <p className="text-slate-500">The tracking ID <b>{id}</b> could not be located in our database.</p>
          <Link to="/citizen" className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Return to Citizen Portal
          </Link>
        </div>
      );
    }

    const getSeverityBadge = (sev) => {
      const colors = {
        High: "bg-red-50 text-red-700 border-red-200",
        Medium: "bg-amber-50 text-amber-700 border-amber-200",
        Low: "bg-green-50 text-green-700 border-green-200"
      };
      return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[sev] || colors.Medium}`}>{sev} Severity</span>;
    };

    const getStatusColor = (stat) => {
      const colors = {
        "Submitted": "bg-slate-100 text-slate-700 border-slate-200",
        "AI Processing": "bg-sky-50 text-sky-700 border-sky-200 animate-pulse",
        "MLA Reviewed": "bg-indigo-50 text-indigo-700 border-indigo-200",
        "Resolved": "bg-green-50 text-green-700 border-green-200"
      };
      return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[stat] || 'bg-slate-100'}`}>{stat}</span>;
    };

    return (
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-16 space-y-8">
        {/* Back Link */}
        <div className="flex justify-between items-center">
          <Link to="/citizen" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="text-xs font-mono text-slate-400 font-bold bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-lg">
            Complaint Tracking: {complaint.id}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Details */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded uppercase tracking-wider">{complaint.category}</span>
                  <h1 className="text-2xl font-extrabold text-slate-900">{complaint.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(complaint.severity)}
                  {getStatusColor(complaint.status)}
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                {complaint.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Submitted on: {new Date(complaint.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Landmark: <b className="text-slate-700">{complaint.landmark || "Not Specified"}</b></span>
                </div>
              </div>
            </div>

            {/* AI Summary and Analytics Panel */}
            <div className="glass-card p-6 rounded-3xl border border-sky-100/50 bg-sky-50/20 space-y-6">
              <div className="flex items-center space-x-2 border-b border-sky-100 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <h3 className="font-extrabold text-slate-800 text-base">Pipeline AI Assessment</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Summary Info */}
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Problem Summary</span>
                    <p className="font-medium text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
                      {complaint.summary || "Pending speech and image classification processing."}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Estimated Impact</span>
                    <span className="font-bold text-slate-800 block text-xs bg-slate-100/70 p-2 rounded-lg border border-slate-200/50">
                      Impact Area: {complaint.impact || "Calculated during cluster analysis"} ({complaint.peopleAffected} people affected)
                    </span>
                  </div>
                </div>

                {/* Priority Weight Details */}
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Auto Priority Score</span>
                      <span className="text-xs font-mono font-bold text-slate-500">Metrics Weighted</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900">{complaint.priorityScore}</span>
                      <span className="text-sm font-semibold text-slate-400">/ 100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                      <div 
                        className={`h-full rounded-full ${complaint.priorityScore > 80 ? 'bg-red-500' : complaint.priorityScore > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${complaint.priorityScore}%` }}
                      ></div>
                    </div>
                    {complaint.aiConfidenceScore != null && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-400 font-bold uppercase">Gemini AI Confidence</span>
                        <span className="font-bold text-slate-700">{complaint.aiConfidenceScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {complaint.mergedCount > 1 && (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold p-3 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                  Duplicate detection: merged with {complaint.mergedCount - 1} other citizen report{complaint.mergedCount - 1 > 1 ? 's' : ''} for the same issue in this ward.
                </div>
              )}

              {/* AI Recommendation */}
              <div className="bg-sky-500/5 p-4 rounded-2xl border border-sky-100 text-xs">
                <span className="font-bold text-sky-700 block mb-1">AI Recommendation:</span>
                <p className="text-slate-600 leading-relaxed italic">{complaint.recommendation}</p>
              </div>
            </div>

            {/* Evidence & Location Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Evidence Photo */}
              <div className="glass-card p-4 rounded-3xl space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-400" /> Evidence Photo
                </h4>
                <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-100">
                  <img 
                    src={complaint.imageUrl} 
                    alt="Evidence of grievance" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[10px] font-mono bg-slate-50 p-2 rounded-xl text-slate-500 border border-slate-100 leading-relaxed">
                  {complaint.imageClassification}
                </div>
              </div>

              {/* Location Marker Details */}
              <div className="glass-card p-4 rounded-3xl space-y-3 flex flex-col">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> Geographic Info
                </h4>
                {/* Static Mock Map image representation to save loads */}
                <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.06),transparent_80%)] grid-bg"></div>
                  <div className="text-center z-10 space-y-2 p-4">
                    <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto border border-sky-500/30">
                      <MapPin className="w-5 h-5 text-sky-500" />
                    </div>
                    <span className="font-bold text-slate-800 text-xs block">{complaint.areaName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Lat: {complaint.location.lat} | Lng: {complaint.location.lng}</span>
                  </div>
                </div>
                <div className="text-[10px] bg-slate-50 p-2 rounded-xl text-slate-500 border border-slate-100 flex justify-between mt-auto">
                  <span>Ward: <b>{complaint.ward}</b></span>
                  <span>District: <b>{complaint.district}</b></span>
                </div>
              </div>
            </div>

            {/* Voice Recording Details */}
            {complaint.voiceText && (
              <div className="glass-card p-5 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" /> Citizen Voice Submission
                  </h4>
                  {complaint.voiceLanguage && (
                    <span className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                      Detected language: {complaint.voiceLanguage}
                    </span>
                  )}
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs italic text-slate-600 leading-relaxed">
                  "{complaint.voiceText}"
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed">
                  Transcribed automatically by Whisper AI (Groq) — citizens can speak in any local language, no manual translation needed.
                </p>
              </div>
            )}

          </div>

          {/* Stepper Timeline Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl space-y-6">
              <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-100">Grievance Timeline</h3>
              
              <div className="relative pl-6 space-y-6 border-l border-slate-200">
                {complaint.timeline.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Circle Node */}
                    <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${
                      step.active 
                        ? 'bg-sky-500 border-sky-500 shadow-md shadow-sky-500/20' 
                        : 'bg-white border-slate-300'
                    }`}></span>

                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className={`text-xs font-bold ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.status}
                        </span>
                        {step.time && (
                          <span className="text-[9px] font-semibold text-slate-400">
                            {new Date(step.time).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${step.active ? 'text-slate-500' : 'text-slate-400'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tracking help card */}
            <div className="bg-slate-900 text-slate-400 p-6 rounded-3xl space-y-4">
              <h4 className="text-white font-bold text-sm">Need help tracking?</h4>
              <p className="text-xs leading-relaxed text-slate-400">
                This pipeline runs on Groq, Gemini Vision, and Whisper. Updates reflect immediately as civic agencies inspect the site.
              </p>
              <div className="w-full py-2 px-3 bg-slate-800/60 text-slate-400 rounded-xl text-[10px] font-medium border border-slate-700 text-center leading-relaxed">
                📱 SMS notifications on status change — <span className="text-slate-300 font-semibold">on the roadmap</span>, not yet wired to a live SMS gateway. Check back on this page for live updates.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUB-VIEW: NOT AUTHENTICATED
  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 bg-slate-50 grid-bg">
        <div className="max-w-md w-full glass-card p-8 rounded-3xl shadow-2xl relative bg-white/70 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"></div>
          
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Access</h1>
            <p className="text-slate-500 text-sm">Sign in to lodge grievances and view tracking statuses.</p>
          </div>

          {/* Form Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-bold">
            <button
              onClick={() => setAuthMode('login')}
              className={`w-1/2 py-2 rounded-lg transition-colors ${authMode === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`w-1/2 py-2 rounded-lg transition-colors ${authMode === 'register' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-3 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
            </div>
          )}

          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <motion.form 
                key="login"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Email Address</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="citizen@janvoice.in"
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
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md mt-6 disabled:opacity-60"
                >
                  {authLoading ? 'Signing in...' : 'Access Portal'}
                </button>
                
                <div className="text-center text-[10px] text-slate-400 pt-2 font-medium">
                  New citizen? Switch to the Register tab above.
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="register"
                onSubmit={handleRegister}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter full name"
                    className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Residential Ward</label>
                  <select
                    value={regWard}
                    onChange={(e) => setRegWard(e.target.value)}
                    className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                  >
                    <option value="Ward 4">Ward 4 (Station Zone)</option>
                    <option value="Ward 10">Ward 10 (School Zone)</option>
                    <option value="Ward 12">Ward 12 (Kolkata Road Zone)</option>
                    <option value="Ward 8">Ward 8 (Municipal Zone)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md mt-6 disabled:opacity-60"
                >
                  {authLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // SUB-VIEW: CITIZEN DASHBOARD & COMPLAINT CREATOR (WHEN LOGGED IN)
  return (
    <div className="pt-24 pb-12 bg-slate-50 min-h-screen">
      
      {/* Dynamic Success Dialog Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 border border-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Grievance Lodged Successfully</h3>
                <p className="text-slate-500 text-sm">Your complaint has been successfully registered. The AI pipeline is now extracting text, validating images, and calculating priority scores.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 font-mono text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Your Unique Tracking ID</span>
                <span className="text-xl font-black text-slate-800">{newTrackingId}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="w-1/2 py-3 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={proceedToTracking}
                  className="w-1/2 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-500/10 transition-colors"
                >
                  Track Grievance
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User profile banner */}
        <div className="glass-card p-6 rounded-3xl flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-500 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-sky-500/10">
              {user.name.split(' ').map(n=>n[0]).join('')}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-none">Welcome back</span>
              <h2 className="text-lg font-bold text-slate-800 leading-tight">{user.name}</h2>
              <span className="text-[10px] font-semibold text-slate-500">{user.ward}, {user.district}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs font-semibold text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            Log Out
          </button>
        </div>

        {/* Outer Form and Dashboard split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Submission Form Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-extrabold text-slate-900">Lodge Civic Grievance</h3>
                <p className="text-xs text-slate-500">Provide details about local issues. Voice clips and photographs will trigger automatic validation.</p>
              </div>

              <form onSubmit={handleGrievanceSubmit} className="space-y-5">
                
                {/* Grid Form Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Complaint Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 w-full font-semibold"
                    >
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 block">Severity Level</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 w-full font-semibold"
                    >
                      <option value="Low">Low (No danger, minor issue)</option>
                      <option value="Medium">Medium (Affects daily transit/activity)</option>
                      <option value="High">High (Immediate hazard/flooding/damage)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Complaint Title (Optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Broken road, Waterlogging near block A..."
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 w-full font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Grievance Description *</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe the issue in detail. State what needs repair and how it is affecting local transport, health, or infrastructure..."
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 w-full font-medium leading-relaxed"
                  ></textarea>
                </div>

                {/* Simulated Voice Recording Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Voice Note Recording</label>
                  <VoiceRecorder onVoiceRecorded={setVoiceData} />
                </div>

                {/* Evidence Image Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Upload Photo Evidence</label>
                  <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center relative hover:bg-slate-50 transition-colors">
                    {imageUrl ? (
                      <div className="w-full relative">
                        <img 
                          src={imageUrl} 
                          alt="Evidence upload" 
                          className="h-40 w-full object-cover rounded-xl border border-slate-200" 
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 shadow-md transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto border border-slate-200">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <label className="cursor-pointer text-sky-500 hover:text-sky-600 text-xs font-semibold">
                            Choose Image file
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageChange} 
                              className="hidden" 
                            />
                          </label>
                          <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or JPEG up to 5MB. Real images show best.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Map Location Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Pin GPS Coordinates on Map</label>
                  <MapPicker onLocationSelected={setLocationData} />
                </div>

                {/* Landmark Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">Nearby Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Government School, Behind Hospital..."
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 w-full font-medium"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="glow-btn w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-slate-900/5"
                >
                  Submit Grievance to AI Pipeline
                </button>
              </form>
            </div>
          </div>

          {/* Form Live Preview Sidebar (Takes up remaining 5 columns) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* Live Preview Header Badge */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              <span>Dynamic Card Preview</span>
              <span className="text-[10px] text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded animate-pulse">Syncing Live</span>
            </div>

            {/* Simulated Submitted Card Representation */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200/80 bg-white/70 space-y-4 shadow-xl">
              
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-sky-500 tracking-wider">
                    {category}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-base leading-snug">
                    {title || "Untitled Grievance"}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                  severity === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                  severity === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-green-50 text-green-600 border-green-200'
                }`}>
                  {severity}
                </span>
              </div>

              {/* Photo representation */}
              <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-100 bg-slate-100 flex items-center justify-center relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Live evidence preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400 text-[10px] space-y-1">
                    <ImageIcon className="w-6 h-6 mx-auto stroke-1" />
                    <span>No image uploaded</span>
                  </div>
                )}
              </div>

              <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                {description || "Fill out the description box to watch this live preview update..."}
              </p>

              {/* Geographic preview detail */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/70 text-[10px] space-y-1 text-slate-500 font-semibold">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Area: <b className="text-slate-700">{locationData.areaName}</b></span>
                </div>
                {landmark && (
                  <div className="pl-4 text-slate-400 text-[9px]">
                    Landmark: <i>{landmark}</i>
                  </div>
                )}
              </div>

              {/* Voice Note Badge indicator */}
              {voiceData.voiceUrl && (
                <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold bg-green-50 p-2 rounded-xl border border-green-150">
                  <Check className="w-3.5 h-3.5" />
                  <span>Attached voice note transcribed (Speech-to-Text attached)</span>
                </div>
              )}
            </div>

            {/* CITIZEN HISTORY LIST */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-900 text-sm">Grievance Dashboard</h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {filteredComplaints.length} Filed
                </span>
              </div>

              {/* Search & Filter Inputs */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID or description..."
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-1/2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[10px] font-semibold focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-1/2 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[10px] font-semibold focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="AI Processing">AI Processing</option>
                    <option value="MLA Reviewed">MLA Reviewed</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Grievances List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredComplaints.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-8">No records match your filters.</p>
                ) : (
                  filteredComplaints.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => navigate(`/citizen/track/${c.id}`)}
                      className="p-3 bg-white hover:bg-slate-50 border border-slate-250/60 rounded-xl cursor-pointer transition-colors shadow-sm flex items-center justify-between group"
                    >
                      <div className="space-y-1 text-left min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-700">{c.id}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'Resolved' ? 'bg-green-500' :
                            c.status === 'MLA Reviewed' ? 'bg-indigo-500' :
                            'bg-sky-500 animate-pulse'
                          }`}></span>
                          <span className="text-[9px] font-bold text-slate-400">{c.status}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-800 text-xs truncate leading-snug">{c.title}</h5>
                        <p className="text-slate-400 text-[10px]">{c.areaName}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}