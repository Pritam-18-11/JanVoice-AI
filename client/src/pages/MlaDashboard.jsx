import React, { useState, useEffect, useRef } from 'react';
import { useGrievances } from '../context/GrievanceContext';
import L from 'leaflet';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, BarChart, Bar
} from 'recharts';
import { 
  BarChart3, Landmark, MapPin, Search, Filter, AlertTriangle, 
  CheckCircle2, Clock, Users, ArrowUpRight, Send, HelpCircle, 
  X, Briefcase, FileText, ChevronRight, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MlaDashboard() {
  const { complaints, updateComplaintStatus } = useGrievances();

  // Dashboard Filters & Table States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'date'
  const [limitCount, setLimitCount] = useState(null); // for AI helper limit
  
  // Selected Complaint for Detail Drawer
  const [selectedId, setSelectedId] = useState(null);
  
  // Chat Assistant States
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "Hello Representative. I am your JanVoice AI Assistant. Ask me to extract reports, show priority issues, or compile monthly summaries." }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Report Modal State
  const [showReport, setShowReport] = useState(false);
  const [allocatedBudget, setAllocatedBudget] = useState(false);

  // Map Ref
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Recalculate metrics based on current database
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status !== 'Resolved').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const avgPriority = Math.round(complaints.reduce((acc, c) => acc + c.priorityScore, 0) / complaints.length) || 0;

  // Sync Leaflet GIS Map markers
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current).setView([22.6985, 88.4532], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    // Redraw markers when complaints state changes
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
      complaints.forEach((c) => {
        // Red = High Priority, Orange = Medium, Green/Blue = Low/Resolved
        const color = c.status === 'Resolved' ? '#10b981' : 
                      c.priorityScore >= 80 ? '#ef4444' : 
                      c.priorityScore >= 50 ? '#f59e0b' : '#3b82f6';
        
        const marker = L.circleMarker([c.location.lat, c.location.lng], {
          radius: 9,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: 0.9
        });

        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 140px;">
            <strong style="display:block; font-size:12px; margin-bottom:2px;">${c.id}</strong>
            <span style="font-size:10px; color:#6b7280; display:block; margin-bottom:6px;">${c.category}</span>
            <span style="display:inline-block; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:bold; background:${color}20; color:${color};">
              Priority: ${c.priorityScore}
            </span>
            <button onclick="window.handleMapSelect('${c.id}')" style="display:block; margin-top:8px; font-size:10px; color:#0ea5e9; border:none; background:transparent; font-weight:bold; cursor:pointer; padding:0;">
              View Actions →
            </button>
          </div>
        `);

        marker.addTo(markersGroupRef.current);
      });
    }
  }, [complaints]);

  // Handle map select callback
  useEffect(() => {
    window.handleMapSelect = (id) => {
      setSelectedId(id);
    };
    return () => {
      delete window.handleMapSelect;
    };
  }, []);

  // Compute Chart Data: Category distribution
  const categoryCounts = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.keys(categoryCounts).map(cat => ({
    name: cat.split(' ')[0], // abbreviate
    value: categoryCounts[cat]
  }));

  const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  // Trend Chart Data
  const trendData = [
    { name: 'Mon', Resolved: 12, Filed: 15 },
    { name: 'Tue', Resolved: 15, Filed: 18 },
    { name: 'Wed', Resolved: 19, Filed: 22 },
    { name: 'Thu', Resolved: 22, Filed: 20 },
    { name: 'Fri', Resolved: 28, Filed: 24 },
    { name: 'Sat', Resolved: 32, Filed: 14 },
    { name: 'Sun', Resolved: 36, Filed: 12 }
  ];

  // Execute AI Assistant Query Filters
  const handleAIQuery = (queryType, queryText) => {
    const userMsg = { sender: 'user', text: queryText };
    setChatMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let reply = "";
      switch (queryType) {
        case 'roads':
          setCategoryFilter("Road Infrastructure");
          setStatusFilter("All");
          setSortBy("priority");
          setLimitCount(5);
          reply = "I have filtered the grid below to show the top 5 Road Infrastructure issues, sorted by priority rating.";
          break;
        case 'priority':
          setCategoryFilter("All");
          setStatusFilter("All");
          setSortBy("priority");
          setLimitCount(null);
          reply = "Here are all complaints sorted by priority score in descending order. Critical issues are at the top.";
          break;
        case 'ward10':
          setSearchTerm("Ward 10");
          setCategoryFilter("All");
          setStatusFilter("All");
          setSortBy("priority");
          setLimitCount(null);
          reply = "Filtered to Ward 10 reports. Rending coordinates grid below.";
          break;
        case 'drainage':
          setCategoryFilter("Drainage & Sewerage");
          setStatusFilter("All"); // show all unresolved
          setSortBy("priority");
          setLimitCount(null);
          reply = "Showing unresolved drainage issues. You can allocate Area Development Funds using the 'Allocate Budget' panel.";
          break;
        case 'report':
          setShowReport(true);
          reply = "Monthly Progress and Governance report generated. Rendered report card overlay on your viewport.";
          break;
        default:
          reply = "I analyzed your query but could not match a structured search index. Here is the full active list.";
          break;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 800);
  };

  const handleCustomSearchSubmit = (e) => {
    e.preventDefault();
    if (!chatInput) return;
    const text = chatInput.toLowerCase();
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Processing search query...";
      if (text.includes("road") || text.includes("street")) {
        setCategoryFilter("Road Infrastructure");
        reply = "Filtered to Road Infrastructure grievances.";
      } else if (text.includes("high") || text.includes("priority")) {
        setSortBy("priority");
        reply = "Sorted records by descending priority score.";
      } else if (text.includes("ward 10")) {
        setSearchTerm("Ward 10");
        reply = "Database filtered to Ward 10.";
      } else if (text.includes("report")) {
        setShowReport(true);
        reply = "Monthly PDF/Print report preview loaded.";
      } else {
        setSearchTerm(chatInput);
        reply = `Searching records for keyword: "${chatInput}"`;
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 700);
  };

  // Filter complaints list
  let filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.areaName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    
    // Status Filter details
    let matchesStatus = true;
    if (statusFilter === 'Pending') {
      matchesStatus = c.status !== 'Resolved';
    } else if (statusFilter === 'Resolved') {
      matchesStatus = c.status === 'Resolved';
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Apply sorting
  if (sortBy === 'priority') {
    filteredComplaints.sort((a, b) => b.priorityScore - a.priorityScore);
  } else {
    filteredComplaints.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Apply limit if AI requested it
  if (limitCount) {
    filteredComplaints = filteredComplaints.slice(0, limitCount);
  }

  const selectedComplaint = complaints.find(c => c.id === selectedId);

  // Administrative MLA Actions
  const handleResolve = (id) => {
    updateComplaintStatus(id, "Resolved", "MLA resolved the issue. Allocated municipal funds to clear blockage.");
    setSelectedId(null);
  };

  const handleAllocateFunds = (id) => {
    setAllocatedBudget(true);
    updateComplaintStatus(id, "MLA Reviewed", "MLA allocated ₹2.5 Lakhs from Local Area Development (LAD) fund.");
    setTimeout(() => setAllocatedBudget(false), 2000);
  };

  return (
    <div className="pt-24 pb-12 bg-slate-50 min-h-screen grid-bg relative">
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl -z-10"></div>
      
      {/* Monthly Report Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex justify-between items-start border-b border-slate-150 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Ward Monthly Progress Report</h3>
                  <span className="text-xs text-slate-500 font-medium">JanVoice AI Governance Summaries</span>
                </div>
                <button onClick={() => setShowReport(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                  <span className="font-bold text-slate-500 block uppercase">Resolution Summary</span>
                  <div className="space-y-1 text-slate-700">
                    <p>Total Filed: <b>{totalCount}</b></p>
                    <p>Resolved: <b className="text-green-600">{resolvedCount}</b></p>
                    <p>Resolution Rate: <b>{Math.round((resolvedCount / totalCount) * 100) || 0}%</b></p>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2">
                  <span className="font-bold text-slate-500 block uppercase">Budget Status</span>
                  <div className="space-y-1 text-slate-700">
                    <p>Total MLA Development Allocation: <b>₹75 Lakhs</b></p>
                    <p>Allocated This Month: <b>₹18.5 Lakhs</b></p>
                    <p>Remaining: <b className="text-sky-600">₹56.5 Lakhs</b></p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-500 block uppercase">AI Priority Recommendation Cluster</span>
                <p className="text-slate-600 leading-relaxed italic bg-sky-50/50 p-3 rounded-xl border border-sky-100">
                  "Based on aggregate data, Road Infrastructure in Ward 10 has the highest density of reports. We recommend allocating 40% of next month's Area Development budget to laying asphalt near schools."
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setShowReport(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50">
                  Close Preview
                </button>
                <button onClick={() => alert("PDF report generated successfully.")} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow">
                  Download PDF Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold">
              <Landmark className="w-3.5 h-3.5" /> MP / MLA Administrative Portal
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Governance Intelligence Dashboard</h1>
            <p className="text-slate-500 text-sm">Analyze regional grievances, locate hotspots, and authorize Area Development funds.</p>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Representative: <b>MLA Pritam Saha</b> (Ward 10)
          </div>
        </div>

        {/* Top 4 Metrics Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Complaints</span>
              <p className="text-3xl font-extrabold text-slate-800">{totalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Grievances</span>
              <p className="text-3xl font-extrabold text-red-500">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-inner">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Issues Resolved</span>
              <p className="text-3xl font-extrabold text-emerald-600">{resolvedCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avg Priority Index</span>
              <p className="text-3xl font-extrabold text-slate-800">{avgPriority} <span className="text-xs font-semibold text-slate-400">/ 100</span></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Mid Grid: GIS Map & Recharts Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Leaflet GIS Map */}
          <div className="lg:col-span-7 glass-card p-4 rounded-3xl space-y-3 flex flex-col h-[400px]">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" /> Geographic Priority Hotspots
              </h3>
              <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-semibold">
                Click pin to inspect actions
              </span>
            </div>
            
            <div className="flex-grow rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner relative z-10">
              <div ref={mapContainerRef} className="h-full w-full" />
            </div>
          </div>

          {/* Recharts Analytics Charts (Category distribution Pie & submission Trend Area) */}
          <div className="lg:col-span-5 glass-card p-5 rounded-3xl flex flex-col justify-between h-[400px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm">Grievance Trends & Category Allocation</h3>
              <span className="text-[10px] text-slate-400 font-mono font-bold">Weekly Log</span>
            </div>

            {/* Recharts Container */}
            <div className="flex-grow w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Area type="monotone" dataKey="Filed" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorFiled)" />
                  <Area type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-slate-400 font-semibold bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
              Resolved rate increased by 18% following desilting drive in Ward 12.
            </div>
          </div>
        </div>

        {/* Lower Grid: Main Database Table & AI Chat Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Database Grid Table */}
          <div className="lg:col-span-8 glass-card p-6 rounded-3xl space-y-4">
            
            {/* Table Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Grievance Register</h3>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Ward or ID..."
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 max-w-[150px]"
                  />
                </div>

                {/* Filters */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[10px] font-bold focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Road Infrastructure">Roads</option>
                  <option value="Drainage & Sewerage">Drainage</option>
                  <option value="Electricity & Lighting">Lighting</option>
                  <option value="Water Supply">Water</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-[10px] font-bold focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Action</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px] bg-slate-50/50">
                    <th className="py-3 px-4">Grievance ID</th>
                    <th className="py-3 px-4">Problem Detail</th>
                    <th className="py-3 px-4">Ward / Area</th>
                    <th className="py-3 px-4 text-center">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 italic">No matching complaints found.</td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-slate-700">{c.id}</td>
                        <td className="py-4 px-4">
                          <div>
                            <span className="font-extrabold text-slate-800 block">{c.title}</span>
                            <span className="text-[9px] text-slate-400">{c.category}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <span className="font-semibold text-slate-700 block">{c.ward}</span>
                            <span className="text-[9px] text-slate-400">{c.landmark}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-mono font-extrabold ${
                            c.priorityScore >= 80 ? 'bg-red-50 text-red-600' :
                            c.priorityScore >= 50 ? 'bg-amber-50 text-amber-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {c.priorityScore}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            c.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                            c.status === 'MLA Reviewed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-sky-50 text-sky-700 border-sky-200 animate-pulse'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedId(c.id)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[10px]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Chat Assistant Sidebar */}
          <div className="lg:col-span-4 glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between h-[450px]">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
              <h3 className="font-extrabold text-slate-900 text-sm">Grievance AI Assistant</h3>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-1 text-xs my-2 max-h-[220px]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-slate-900 text-white font-medium rounded-tr-none' 
                      : 'bg-slate-100 text-slate-700 rounded-tl-none border border-slate-150'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Action Quick Chips */}
            <div className="flex flex-wrap gap-1.5 py-2 border-t border-slate-100">
              <button 
                onClick={() => handleAIQuery('roads', "Show top 5 road issues")}
                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-100 text-sky-700 rounded-lg text-[9px] font-bold"
              >
                Top 5 Road Issues
              </button>
              <button 
                onClick={() => handleAIQuery('priority', "Show highest priority complaints")}
                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-100 text-sky-700 rounded-lg text-[9px] font-bold"
              >
                Highest Priority
              </button>
              <button 
                onClick={() => handleAIQuery('ward10', "Show complaints from Ward 10")}
                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-100 text-sky-700 rounded-lg text-[9px] font-bold"
              >
                Ward 10 List
              </button>
              <button 
                onClick={() => handleAIQuery('report', "Generate monthly report")}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 rounded-lg text-[9px] font-bold"
              >
                Generate Report
              </button>
            </div>

            {/* Custom Input */}
            <form onSubmit={handleCustomSearchSubmit} className="flex gap-2 border-t border-slate-100 pt-3 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI query or search keyword..."
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 w-full"
              />
              <button
                type="submit"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>

      {/* Selected Complaint Detail Slide Drawer */}
      <AnimatePresence>
        {selectedId && selectedComplaint && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Drawer Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-slate-950"
            />
            
            {/* Drawer Sliding Body */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between z-10"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">{selectedComplaint.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      selectedComplaint.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                      selectedComplaint.status === 'MLA Reviewed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug pt-1">{selectedComplaint.title}</h3>
                </div>
                <button onClick={() => setSelectedId(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6 text-xs text-slate-600 leading-relaxed">
                
                {/* Image evidence */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Intake Image Evidence</span>
                  <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-100">
                    <img src={selectedComplaint.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-mono text-[9px] bg-slate-50 p-2 rounded-lg text-slate-500 border border-slate-100">{selectedComplaint.imageClassification}</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Citizen Complaint Details</span>
                  <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* AI Summary */}
                <div className="space-y-2">
                  <span className="font-bold text-sky-600 uppercase text-[10px]">AI Pipeline Summary</span>
                  <p className="bg-sky-50/50 p-3.5 rounded-xl border border-sky-100/50 italic leading-relaxed text-slate-700">
                    "{selectedComplaint.summary}"
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Geographic Location</span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{selectedComplaint.areaName}</span>
                      <span className="text-[9px] text-slate-400">Landmark: {selectedComplaint.landmark}</span>
                    </div>
                    <MapPin className="w-5 h-5 text-sky-500" />
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="space-y-2">
                  <span className="font-bold text-indigo-600 uppercase text-[10px]">AI Recommendation Action</span>
                  <p className="bg-indigo-50/30 p-3.5 rounded-xl border border-indigo-100 leading-relaxed">
                    {selectedComplaint.recommendation}
                  </p>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50">
                {selectedComplaint.status !== 'Resolved' ? (
                  <>
                    <button
                      onClick={() => handleAllocateFunds(selectedComplaint.id)}
                      disabled={allocatedBudget}
                      className="w-1/2 py-2.5 border border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-center text-[11px] disabled:opacity-50"
                    >
                      {allocatedBudget ? 'Funds Allocated!' : 'Allocate Budget'}
                    </button>
                    <button
                      onClick={() => handleResolve(selectedComplaint.id)}
                      className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition-colors text-center text-[11px]"
                    >
                      Resolve Issue
                    </button>
                  </>
                ) : (
                  <div className="w-full p-2.5 bg-green-50 text-green-700 border border-green-150 rounded-xl font-bold flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Issue Marked as Resolved
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
