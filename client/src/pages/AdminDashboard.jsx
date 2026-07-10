import React, { useState, useEffect } from 'react';
import { useGrievances } from '../context/GrievanceContext';
import api from '../api/axios';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, LineChart, Line
} from 'recharts';
import { 
  Server, Users, Bell, AlertTriangle, ShieldCheck, Cpu, 
  Database, RefreshCw, Trash2, Edit3, Settings, Play, 
  RotateCcw, Check, UserPlus, Send, Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const { complaints, updateComplaintStatus } = useGrievances();
  const [activeTab, setActiveTab] = useState('monitoring'); // 'monitoring' | 'users' | 'notifications' | 'complaints'
  
  // Real user directory (Phase 3 — replaces the old dummy initialUsers array)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overrideTargetId, setOverrideTargetId] = useState(null);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setUsersError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Notification logs — still a simulated log for the demo, since real SMS/push dispatch
  // is outside this project's scope (no telecom/SMS gateway integrated)
  const [notifications] = useState([
    { id: "NT-109", recipient: "Registered Citizens (SMS Gateway)", msg: "ALERT: Status-change notifications are dispatched whenever an MLA updates a grievance.", status: "Simulated", time: new Date().toLocaleString() },
  ]);

  // System Monitor Metrics (simulated real-time — no infra metrics API is wired up in this project)
  const [monitorData, setMonitorData] = useState([
    { name: '10s ago', CPU: 24, RAM: 64, API: 12 },
    { name: '8s ago', CPU: 28, RAM: 64, API: 15 },
    { name: '6s ago', CPU: 32, RAM: 65, API: 18 },
    { name: '4s ago', CPU: 27, RAM: 65, API: 14 },
    { name: '2s ago', CPU: 29, RAM: 66, API: 16 },
    { name: 'Now', CPU: 31, RAM: 66, API: 13 }
  ]);

  // Simulate server pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setMonitorData(prev => {
        const next = [...prev.slice(1)];
        next.push({
          name: 'Now',
          CPU: Math.round(20 + Math.random() * 20),
          RAM: Math.round(63 + Math.random() * 4),
          API: Math.round(10 + Math.random() * 10)
        });
        // Correct previous labels
        next[0].name = '10s ago';
        next[1].name = '8s ago';
        next[2].name = '6s ago';
        next[3].name = '4s ago';
        next[4].name = '2s ago';
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerSkeletonLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2200);
  };

  // Real role/status updates (Phase 3) — hit the backend instead of just local state
  const handleSetRole = async (userId, role) => {
    const prev = users;
    setUsers((cur) => cur.map((u) => (u._id === userId ? { ...u, role } : u)));
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
    } catch (err) {
      console.error('Failed to update role:', err.response?.data?.message || err.message);
      setUsers(prev); // roll back on failure
      alert('Failed to update role. Please try again.');
    }
  };

  const handleSetActive = async (userId, active) => {
    const prev = users;
    setUsers((cur) => cur.map((u) => (u._id === userId ? { ...u, active } : u)));
    try {
      await api.patch(`/admin/users/${userId}/status`, { active });
    } catch (err) {
      console.error('Failed to update status:', err.response?.data?.message || err.message);
      setUsers(prev);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleOverrideStatus = (id, nextStatus) => {
    updateComplaintStatus(id, nextStatus, "Admin manually updated grievance category priority routing.");
    setOverrideTargetId(null);
  };

  // Skeleton Loader representation Component
  const SkeletonLine = ({ className }) => (
    <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded ${className}`} />
  );

  return (
    <div className="pt-24 pb-12 bg-slate-50 dark:bg-slate-950 min-h-screen grid-bg relative transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Console */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold">
              <Settings className="w-3.5 h-3.5" /> Back-Office Admin System
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">System Control Console</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor computing health parameters, coordinate verified profiles, and manually override database structures.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerSkeletonLoading}
              className="px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Simulate Skeleton Loading
            </button>
            <div className="text-xs font-semibold text-slate-500 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              Terminal: <b className="text-red-500">Root Access</b>
            </div>
          </div>
        </div>

        {/* System Health Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">System Latency</span>
              {loading ? <SkeletonLine className="h-8 w-20" /> : <p className="text-2xl font-black text-slate-800 dark:text-slate-100">12ms <span className="text-xs text-green-500 font-bold">Optimal</span></p>}
            </div>
            <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
              <Server className="w-5 h-5 text-indigo-500" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registered Users</span>
              {loading || usersLoading ? <SkeletonLine className="h-8 w-20" /> : <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{users.length} <span className="text-xs text-slate-400 font-medium">Total</span></p>}
            </div>
            <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
              <Users className="w-5 h-5 text-sky-500" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Complaints</span>
              {loading ? <SkeletonLine className="h-8 w-20" /> : <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{complaints.length} <span className="text-xs text-emerald-500 font-bold">On Record</span></p>}
            </div>
            <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Queue Success</span>
              {loading ? <SkeletonLine className="h-8 w-20" /> : <p className="text-2xl font-black text-slate-800 dark:text-slate-100">99.8% <span className="text-xs text-indigo-500 font-bold">STT/Vision</span></p>}
            </div>
            <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
              <Cpu className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-4">
          {[
            { id: 'monitoring', label: 'Systems Monitoring' },
            { id: 'users', label: 'User Directory' },
            { id: 'notifications', label: 'Outbound Notification Log' },
            { id: 'complaints', label: 'Grievance Override' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 transition-all ${
                activeTab === tab.id 
                  ? 'border-b-2 border-red-500 text-slate-900 dark:text-slate-100 font-extrabold' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content display panels */}
        {loading ? (
          /* Shimmering Skeletons Mode */
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-900">
              <SkeletonLine className="h-6 w-48" />
              <SkeletonLine className="h-8 w-24" />
            </div>
            <div className="space-y-4">
              <SkeletonLine className="h-10 w-full" />
              <SkeletonLine className="h-10 w-full" />
              <SkeletonLine className="h-10 w-full" />
              <SkeletonLine className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB: SYSTEM MONITORING */}
            {activeTab === 'monitoring' && (
              <motion.div 
                key="monitoring"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* CPU usage chart */}
                <div className="lg:col-span-8 glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between h-[360px]">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Server Workloads (% Capacity)</h3>
                    <span className="text-[10px] text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">Simulated Pulse</span>
                  </div>
                  
                  <div className="flex-grow w-full flex items-center justify-center pt-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={monitorData}>
                        <defs>
                          <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" dataKey="CPU" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                        <Area type="monotone" dataKey="RAM" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* API latency charts */}
                <div className="lg:col-span-4 glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between h-[360px]">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Whisper Queue (req/s)</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Performance</span>
                  </div>

                  <div className="flex-grow w-full flex items-center justify-center pt-2">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={monitorData}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="API" stroke="#10b981" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded-xl text-slate-500 border border-slate-150/40 text-center leading-relaxed">
                    Gemini Vision API status: <b className="text-green-500">Normal (99ms)</b>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: USER MANAGEMENT (Phase 3 — wired to real backend) */}
            {activeTab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 rounded-3xl space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-900">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">User Accounts Directory</h3>
                  <button onClick={fetchUsers} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                    <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>

                {usersError && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl font-semibold">{usersError}</div>
                )}

                {usersLoading && users.length === 0 ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 w-full bg-slate-100 dark:bg-slate-900 rounded-xl" />)}
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400 py-12">
                    <Inbox className="w-8 h-8 stroke-1" />
                    <span className="italic text-xs">No registered users yet.</span>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[9px] bg-slate-50/50 dark:bg-slate-900/30">
                        <th className="py-3 px-4">Full Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Account Type</th>
                        <th className="py-3 px-4">Jurisdiction Zone</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                          <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400">{u.email}</td>
                          <td className="py-4 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleSetRole(u._id, e.target.value)}
                              className={`px-2 py-1 rounded text-[9px] font-bold border focus:outline-none ${
                                u.role === 'admin' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40' :
                                u.role === 'mla' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40' :
                                'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/40'
                              }`}
                            >
                              <option value="citizen">Citizen</option>
                              <option value="mla">MP/MLA</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">{u.ward}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              u.active
                                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40'
                                : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40'
                            }`}>{u.active ? 'Active' : 'Suspended'}</span>
                          </td>
                          <td className="py-4 px-4 text-right flex justify-end gap-1.5">
                            {u.active ? (
                              <button onClick={() => handleSetActive(u._id, false)} className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[9px]">
                                Suspend
                              </button>
                            ) : (
                              <button onClick={() => handleSetActive(u._id, true)} className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-[9px] flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Reactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </motion.div>
            )}

            {/* TAB: OUTBOUND NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 rounded-3xl space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-900">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Notification Broadcast Log</h3>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">No SMS gateway wired up (demo only)</span>
                </div>

                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{n.recipient}</span>
                          <span className="text-[9px] text-slate-400 font-mono">Time: {n.time}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs italic leading-relaxed">"{n.msg}"</p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-full font-bold text-[9px] border border-amber-200 dark:border-amber-900/40">
                          {n.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: GRIEVANCE OVERRIDE */}
            {activeTab === 'complaints' && (
              <motion.div 
                key="complaints"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 rounded-3xl space-y-4"
              >
                <div className="pb-3 border-b border-slate-100 dark:border-slate-900">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Grievance Overrides & Moderation</h3>
                </div>

                {complaints.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400 py-12">
                    <Inbox className="w-8 h-8 stroke-1" />
                    <span className="italic text-xs">No complaints on record yet.</span>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[9px] bg-slate-50/50 dark:bg-slate-900/30">
                        <th className="py-3 px-4">Complaint ID</th>
                        <th className="py-3 px-4">Title & Details</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Current Status</th>
                        <th className="py-3 px-4 text-right">Moderator Override Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {complaints.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">{c.id}</td>
                          <td className="py-4 px-4">
                            <div>
                              <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{c.title}</span>
                              <span className="text-[10px] text-slate-400">{c.category}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-extrabold text-red-500 font-mono">{c.priorityScore}</span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">{c.status}</td>
                          <td className="py-4 px-4 text-right">
                            {overrideTargetId === c.id ? (
                              <div className="flex justify-end gap-1.5">
                                <button onClick={() => handleOverrideStatus(c.id, "Resolved")} className="px-2 py-1 bg-green-500 text-white rounded text-[10px] font-bold">
                                  Set Resolved
                                </button>
                                <button onClick={() => handleOverrideStatus(c.id, "MLA Reviewed")} className="px-2 py-1 bg-indigo-500 text-white rounded text-[10px] font-bold">
                                  Set Reviewed
                                </button>
                                <button onClick={() => setOverrideTargetId(null)} className="px-2 py-1 border border-slate-200 text-slate-600 rounded text-[10px] font-bold bg-white">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setOverrideTargetId(c.id)} className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg font-bold text-[10px]">
                                Force Status Update
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>
    </div>
  );
}