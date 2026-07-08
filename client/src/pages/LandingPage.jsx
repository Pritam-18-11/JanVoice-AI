import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Shield, Mic, FileText, CheckCircle, 
  MapPin, TrendingUp, HelpCircle, Activity, Award, BarChart3, Users2 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const features = [
    {
      icon: <Mic className="w-6 h-6 text-sky-500" />,
      title: "Multilingual Voice Input",
      desc: "Report issues easily by speaking. AI translates and transcribes voice notes instantly using Whisper STT."
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-500" />,
      title: "AI Image Verification",
      desc: "Computer Vision verifies photos of broken roads, garbage, and leaks to validate legitimacy and filter spam."
    },
    {
      icon: <MapPin className="w-6 h-6 text-emerald-500" />,
      title: "Auto Geolocation",
      desc: "GPS integration automatically maps complaints to exact coordinates, reverse-geocoding the ward and district."
    },
    {
      icon: <Activity className="w-6 h-6 text-amber-500" />,
      title: "Smart Prioritization",
      desc: "Issues are ranked dynamically based on population impact, proximity to schools/hospitals, and urgency."
    },
    {
      icon: <FileText className="w-6 h-6 text-rose-500" />,
      title: "Duplicate Prevention",
      desc: "AI detects and clusters matching reports to prevent clutter and group community voices together."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-violet-500" />,
      title: "Actionable Dashboard",
      desc: "Gives MPs/MLAs a clean heat-map interface and automated reports to drive strategic budget allocation."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Citizen Reports",
      desc: "A citizen logs a problem on the portal. They can write text, upload photos, or just speak in their native tongue."
    },
    {
      num: "02",
      title: "AI Analysis",
      desc: "The AI system cleanses inputs, flags duplicate complaints, tags coordinates, and calculates a priority rating."
    },
    {
      num: "03",
      title: "MLA Prioritization",
      desc: "The local representative reviews aggregated civic clusters ordered by impact and allocates municipal resources."
    },
    {
      num: "04",
      title: "Tracked Resolution",
      desc: "The ward supervisor resolves the complaint and uploads photo proof, updating the citizen's timeline."
    }
  ];

  return (
    <div className="relative pt-24 pb-12 grid-bg bg-slate-50 min-h-screen">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-200/35 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO SECTION */}
        <section className="text-center py-16 lg:py-24 space-y-8 max-w-4xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            Smart Governance Platform
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Give Voice to Civic Issues, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Build a Smarter Tomorrow
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            JanVoice AI is a next-generation platform utilizing Speech-to-Text and Computer Vision to classify, prioritize, and resolve citizen grievances in real time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/citizen"
              className="glow-btn w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group text-base"
            >
              Report an Issue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button
              onClick={() => alert("MLA Dashboard (Phase 3) is currently undergoing simulated data structure setup. Click 'Citizen Portal' above to register and submit your first grievance!")}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl border border-slate-200 shadow-md transition-all flex items-center justify-center gap-2 text-base"
            >
              MLA Dashboard Demo
            </button>
          </div>
          
          {/* Mock Dashboard Preview Card */}
          <div className="pt-12 relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
            <div className="glass-card p-4 rounded-3xl border border-slate-200/70 shadow-2xl bg-white/60">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="ml-2 font-mono">MLA Portal / Grievance Map</span>
                </div>
                <span>Ward 10 Heatmap</span>
              </div>
              {/* Visual Mock representation of heatmap and cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left h-48 sm:h-64">
                <div className="col-span-2 bg-slate-200/50 rounded-2xl p-4 flex flex-col justify-between border border-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(14,165,233,0.15),transparent_60%)]"></div>
                  <div className="absolute top-1/3 left-1/4 w-6 h-6 bg-red-500/20 border-2 border-red-500 rounded-full animate-ping"></div>
                  <div className="absolute top-1/3 left-1/4 w-3.5 h-3.5 bg-red-500 rounded-full"></div>

                  <div className="absolute top-2/3 left-2/3 w-6 h-6 bg-amber-500/20 border-2 border-amber-500 rounded-full animate-ping"></div>
                  <div className="absolute top-2/3 left-2/3 w-3.5 h-3.5 bg-amber-500 rounded-full"></div>
                  
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Geo-Priority Map</div>
                  <div className="text-xs bg-white/80 p-2.5 rounded-xl border border-slate-100 self-start shadow-sm z-10">
                    <span className="font-bold text-red-600">Priority ID #9812:</span> Broken Road near School (Ward 10)
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="bg-white/80 border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between h-1/2">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Active Grievances</div>
                    <div className="text-2xl font-extrabold text-slate-800">128</div>
                    <div className="text-[10px] text-green-600 font-bold">↓ 14% resolved this week</div>
                  </div>
                  <div className="bg-white/80 border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between h-1/2">
                    <div className="text-[10px] uppercase font-bold text-slate-400">AI Priority Backlog</div>
                    <div className="text-2xl font-extrabold text-red-500">14 <span className="text-xs text-slate-400 font-medium">High Severity</span></div>
                    <div className="text-[10px] text-indigo-600 font-bold">Auto-clustered into 4 zones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS / STATS SECTION */}
        <section className="py-8 border-y border-slate-200/60 my-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="space-y-1.5">
              <p className="text-4xl font-extrabold text-slate-900">12,480+</p>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Citizen Grievances Lodged</p>
            </div>
            <div className="space-y-1.5 border-y sm:border-y-0 sm:border-x border-slate-200/60 py-6 sm:py-0">
              <p className="text-4xl font-extrabold text-sky-600">92.4%</p>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">AI Classification Accuracy</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-4xl font-extrabold text-slate-900">48 hrs</p>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Average Resolution Time</p>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-16 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Powered by Advanced Artificial Intelligence
            </h2>
            <p className="text-slate-600 font-medium">
              We process text, audio, and visual details to provide administrators with clear, spam-filtered, and actionable maps of regional demands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feat, index) => (
              <div 
                key={index}
                className="glass-card hover:bg-white/80 p-6 rounded-2xl border border-slate-200/60 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">{feat.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS TIMELINE */}
        <section className="py-16 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 my-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Header Column */}
            <div className="space-y-6 lg:pr-8">
              <span className="text-sky-400 font-bold text-xs uppercase tracking-widest">Simplifying Grievance Loop</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                How JanVoice AI Connects Communities
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our platform streamlines the communication between citizen issues and policy representatives by eliminating operational gaps using pipeline intelligence.
              </p>
              <div className="pt-2">
                <Link
                  to="/citizen"
                  className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-sm font-semibold transition-all group"
                >
                  Enter Citizen Portal 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Stepper Cards */}
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {steps.map((st, index) => (
                <div key={index} className="bg-slate-800/50 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/80 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl font-black text-slate-700/80 leading-none">{st.num}</span>
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{st.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT / GOVERNANCE IMPACT */}
        <section className="py-16 max-w-4xl mx-auto space-y-12 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Empowering MPs & MLAs for Data-Driven Decisions</h2>
            <p className="text-slate-600 font-medium">
              We bridge the gap between administrative budgeting and grassroots requirements by presenting structural community demands objectively.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="glass-card p-6 rounded-2xl flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base mb-1">Democratic Transparency</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Citizens receive unique tracking IDs to watch progress, fostering a culture of mutual accountability and trust.
                </p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <Users2 className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base mb-1">Optimal Resource Allocation</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Avoid guesswork. AI groups reports together and weights priority score metrics so MLAs allocate local area development funds to areas with peak demand.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
