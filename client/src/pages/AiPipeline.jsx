import React, { useState, useEffect, useRef } from 'react';
import { useGrievances } from '../context/GrievanceContext';
import { 
  Play, Pause, RotateCcw, Cpu, Mic, Image as ImageIcon, MapPin, 
  Sparkles, Layers, RefreshCw, BarChart2, ShieldCheck, CheckCircle2, 
  Terminal, Sliders, ArrowRight, Check, AlertCircle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiPipeline() {
  const { complaints } = useGrievances();
  
  // Selection & Pipeline Control States
  const [selectedId, setSelectedId] = useState(complaints[0]?.id || "");
  const [pipelineState, setPipelineState] = useState('idle'); // 'idle' | 'running' | 'paused' | 'done'
  const [currentStep, setCurrentStep] = useState(-1); // -1 to 11
  const [speed, setSpeed] = useState(1500); // ms delay per step
  const [logs, setLogs] = useState([]);
  
  const timerRef = useRef(null);
  const terminalEndRef = useRef(null);

  const selectedComplaint = complaints.find(c => c.id === selectedId) || complaints[0];

  const steps = [
    { name: "Citizen Intake", desc: "Loading multi-modal inputs", icon: <Layers className="w-5 h-5" /> },
    { name: "Speech-to-Text", desc: "Whisper audio translation", icon: <Mic className="w-5 h-5" /> },
    { name: "Image Analysis", desc: "Gemini Vision civic check", icon: <ImageIcon className="w-5 h-5" /> },
    { name: "Geocoding", desc: "Reverse GPS lookup", icon: <MapPin className="w-5 h-5" /> },
    { name: "Text Normalization", desc: "Grammar & language cleaning", icon: <RefreshCw className="w-5 h-5" /> },
    { name: "JSON Structured compiler", desc: "Synthesizing metadata object", icon: <FileText className="w-5 h-5" /> },
    { name: "AI Summarizer", desc: "Generating brief report", icon: <Sparkles className="w-5 h-5" /> },
    { name: "Category Classifier", desc: "Assigning municipal division", icon: <Cpu className="w-5 h-5" /> },
    { name: "Duplicate Detection", desc: "Clustering matches in database", icon: <ShieldCheck className="w-5 h-5" /> },
    { name: "Priority Evaluator", desc: "Computing weighted priority", icon: <BarChart2 className="w-5 h-5" /> },
    { name: "Recommendation Engine", desc: "Proposing civic action", icon: <Sparkles className="w-5 h-5" /> },
    { name: "Database Commit", desc: "Serializing active records", icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Log generator helper
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✔' : type === 'error' ? '✘' : 'ℹ';
    const colorClass = type === 'success' ? 'text-emerald-400' : type === 'error' ? 'text-red-400' : 'text-sky-400';
    setLogs(prev => [...prev, { timestamp, prefix, message, colorClass }]);
  };

  // Pipeline runner logic
  useEffect(() => {
    if (pipelineState === 'running') {
      timerRef.current = setTimeout(() => {
        const nextStep = currentStep + 1;
        if (nextStep < steps.length) {
          setCurrentStep(nextStep);
          triggerStepLog(nextStep);
        } else {
          setPipelineState('done');
          addLog("=== AI PIPELINE COMPLETED SUCCESSFULLY ===", "success");
          addLog(`Grievance record committed to DB under Primary ID: ${selectedComplaint.id}`, "success");
        }
      }, speed);
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [pipelineState, currentStep, speed, selectedId]);

  const startPipeline = () => {
    if (pipelineState === 'idle' || pipelineState === 'done') {
      setCurrentStep(0);
      setLogs([]);
      addLog("=== INITIALIZING JANVOICE AI PIPELINE ===");
      addLog(`Selected Grievance ID: ${selectedComplaint.id}`);
      setPipelineState('running');
      triggerStepLog(0);
    } else if (pipelineState === 'paused') {
      setPipelineState('running');
      addLog("Resuming pipeline execution...");
    }
  };

  const pausePipeline = () => {
    setPipelineState('paused');
    addLog("Pipeline paused by user.");
  };

  const resetPipeline = () => {
    setPipelineState('idle');
    setCurrentStep(-1);
    setLogs([]);
    clearTimeout(timerRef.current);
  };

  const triggerStepLog = (stepIndex) => {
    const comp = selectedComplaint;
    switch (stepIndex) {
      case 0:
        addLog(`[INTAKE] Loading citizen inputs. Title: "${comp.title}". Description size: ${comp.description.length} chars.`, "info");
        break;
      case 1:
        if (comp.voiceText) {
          addLog(`[WHISPER STT] Audio file detected. Commencing translation from Bengali/Hindi to English...`, "info");
          setTimeout(() => {
            addLog(`[WHISPER STT] Speech converted: "${comp.voiceText}"`, "success");
          }, 400);
        } else {
          addLog(`[WHISPER STT] No audio file uploaded. Skipping translation.`, "info");
        }
        break;
      case 2:
        if (comp.imageUrl) {
          addLog(`[VISION AI] Analyzing image attachment: ${comp.imageUrl.substring(0, 45)}...`, "info");
          setTimeout(() => {
            addLog(`[VISION AI] Classification output: ${comp.imageClassification}`, "success");
          }, 400);
        } else {
          addLog(`[VISION AI] No evidence image attached. Skipping vision verification.`, "info");
        }
        break;
      case 3:
        addLog(`[GEOCODING] Fetching location metadata for lat: ${comp.location.lat}, lng: ${comp.location.lng}`, "info");
        setTimeout(() => {
          addLog(`[GEOCODING] Location resolved. District: ${comp.district}, Ward: ${comp.ward}, Landmark: ${comp.landmark}`, "success");
        }, 400);
        break;
      case 4:
        addLog(`[TEXT CLEANING] Sanitizing inputs: removing trailing formatting, correcting case...`, "info");
        setTimeout(() => {
          addLog(`[TEXT CLEANING] Clean text generated. Primary language identified: EN-IN.`, "success");
        }, 400);
        break;
      case 5:
        addLog(`[JSON COMPILER] Compiling metadata fields into structured API payload object.`, "info");
        setTimeout(() => {
          addLog(`[JSON COMPILER] Structured schema built. Coordinates verified.`, "success");
        }, 400);
        break;
      case 6:
        addLog(`[SUMMARIZER] Creating brief summary from description...`, "info");
        setTimeout(() => {
          addLog(`[SUMMARIZER] Summary output: "${comp.summary}"`, "success");
        }, 400);
        break;
      case 7:
        addLog(`[CLASSIFIER] Running categorization matrix...`, "info");
        setTimeout(() => {
          addLog(`[CLASSIFIER] Category assigned: ${comp.category} (AI Confidence: 94%)`, "success");
        }, 400);
        break;
      case 8:
        addLog(`[DUPLICATE SCAN] Scanning active database records for overlapping reports within 50-meter radius...`, "info");
        setTimeout(() => {
          addLog(`[DUPLICATE SCAN] Scan finished. No matching duplicate records found in ${comp.ward}. Registering as Unique.`, "success");
        }, 400);
        break;
      case 9:
        addLog(`[PRIORITY] Evaluating Priority score. Weighting parameters: Severity + Ward Population + Landmark Importance...`, "info");
        setTimeout(() => {
          addLog(`[PRIORITY] Score calculated: ${comp.priorityScore}/100. Rank index: High Impact.`, "success");
        }, 400);
        break;
      case 10:
        addLog(`[RECOMMENDATION] Dispatching LLM context block to generate suggested municipal resolution...`, "info");
        setTimeout(() => {
          addLog(`[RECOMMENDATION] LLM output: "${comp.recommendation}"`, "success");
        }, 400);
        break;
      case 11:
        addLog(`[DB COMMIT] Writing grievance cluster packet to MongoDB server...`, "info");
        break;
      default:
        break;
    }
  };

  const getStepState = (idx) => {
    if (idx < currentStep) return "completed";
    if (idx === currentStep) return "processing";
    return "locked";
  };

  return (
    <div className="pt-24 pb-12 bg-slate-50 min-h-screen grid-bg relative">
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title Section */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" /> Core Intelligence Module
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Processing Workflow</h1>
            <p className="text-slate-500 text-sm">Observe the 12-stage automated pipeline mapping citizen inputs to prioritized development records.</p>
          </div>

          {/* Control Panel Panel */}
          <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] text-slate-400 font-bold uppercase mb-1">Select Complaint</label>
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  resetPipeline();
                }}
                disabled={pipelineState === 'running'}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none max-w-[200px] truncate"
              >
                {complaints.map((c) => (
                  <option key={c.id} value={c.id}>{c.id} - {c.category}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] text-slate-400 font-bold uppercase mb-1">Processing Delay</label>
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="500"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-20 accent-sky-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600 font-mono">{(speed / 1000).toFixed(1)}s</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4">
              {pipelineState === 'running' ? (
                <button
                  onClick={pausePipeline}
                  className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
              ) : (
                <button
                  onClick={startPipeline}
                  disabled={pipelineState === 'done' && currentStep === 11}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 fill-current" /> Run Pipeline
                </button>
              )}

              <button
                onClick={resetPipeline}
                className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors flex items-center justify-center"
                title="Reset Pipeline"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Split: Left details, Right Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Dashboard Left Widgets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Pipeline Status Summary Card */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-slate-100">Status Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">Active State</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    pipelineState === 'running' ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse' :
                    pipelineState === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    pipelineState === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {pipelineState === 'running' ? 'Processing' : pipelineState === 'paused' ? 'Paused' : pipelineState === 'done' ? 'Success' : 'Idle'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">Overall Confidence Score</span>
                  <span className="text-lg font-black text-slate-800 font-mono">96%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-semibold">Pipeline Step Progress</span>
                  <span className="text-xs font-bold text-slate-600 font-mono">{currentStep + 1} / 12</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / 12) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Structured Card output showing results */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-slate-100">Compiled Object Schema</h3>
              
              <div className="bg-slate-900 rounded-2xl p-4 overflow-hidden border border-slate-800 shadow-inner relative">
                <div className="absolute top-2 right-2 text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold">JSON Payload</div>
                <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-[220px]">
                  {JSON.stringify({
                    id: selectedComplaint.id,
                    timestamp: selectedComplaint.timestamp,
                    source: {
                      hasVoice: !!selectedComplaint.voiceText,
                      hasPhoto: !!selectedComplaint.imageUrl
                    },
                    nlp: {
                      language: "EN-IN",
                      cleanedText: selectedComplaint.description.substring(0, 40) + "..."
                    },
                    vision: {
                      verified: currentStep >= 2 ? "SUCCESS" : "PENDING",
                      label: currentStep >= 2 ? selectedComplaint.imageClassification.split(': ')[1]?.split(' (')[0] : null
                    },
                    gis: {
                      coords: selectedComplaint.location,
                      resolvedZone: currentStep >= 3 ? selectedComplaint.areaName : null
                    },
                    classification: {
                      category: currentStep >= 7 ? selectedComplaint.category : null,
                      duplicateCheck: currentStep >= 8 ? "Unique Record" : "Pending"
                    },
                    metrics: {
                      priorityScore: currentStep >= 9 ? selectedComplaint.priorityScore : null,
                      severity: selectedComplaint.severity
                    }
                  }, null, 2)}
                </pre>
              </div>
            </div>

          </div>

          {/* Pipeline Cards Grid (Takes up remaining 8 columns) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {steps.map((st, idx) => {
              const state = getStepState(idx);
              const isLocked = state === 'locked';
              const isProcessing = state === 'processing';
              const isCompleted = state === 'completed';

              return (
                <div 
                  key={idx}
                  className={`glass-card p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-[150px] relative ${
                    isLocked ? 'opacity-40 bg-slate-50/50 border-slate-200/50' :
                    isProcessing ? 'border-sky-500 bg-sky-500/5 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30' :
                    'border-emerald-300 bg-emerald-500/5'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      {/* Step Indicator */}
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                        isLocked ? 'bg-slate-100 text-slate-400' :
                        isProcessing ? 'bg-sky-100 text-sky-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        Stage {idx + 1}
                      </span>

                      {/* Status indicator icon */}
                      {isCompleted && (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {isProcessing && (
                        <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center border border-sky-200 animate-spin">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1.5">
                      <div className={`p-1.5 rounded-lg border ${
                        isLocked ? 'bg-slate-100 text-slate-400 border-slate-200' :
                        isProcessing ? 'bg-sky-50 text-sky-500 border-sky-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-150'
                      }`}>
                        {st.icon}
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-xs leading-tight">{st.name}</h4>
                    </div>

                    <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">{st.desc}</p>
                  </div>

                  {/* Step Specific Dynamic Data Output */}
                  {!isLocked && (
                    <div className="text-[9px] font-mono border-t border-slate-100 pt-2 flex items-center justify-between text-slate-500">
                      {idx === 0 && <span className="truncate">Loaded: {selectedComplaint.id}</span>}
                      {idx === 1 && <span className="truncate">{selectedComplaint.voiceText ? 'Converted Audio Text' : 'Skipped (No audio)'}</span>}
                      {idx === 2 && <span className="truncate">{selectedComplaint.imageUrl ? 'Verified Image Bounding' : 'Skipped (No image)'}</span>}
                      {idx === 3 && <span className="truncate">Ward: {selectedComplaint.ward}</span>}
                      {idx === 4 && <span className="truncate">Standardized text generated</span>}
                      {idx === 5 && <span className="truncate">Casting JSON properties</span>}
                      {idx === 6 && <span className="truncate italic">"{selectedComplaint.summary.substring(0, 20)}..."</span>}
                      {idx === 7 && <span className="truncate">{selectedComplaint.category}</span>}
                      {idx === 8 && <span className="truncate">DB Cluster ID generated</span>}
                      {idx === 9 && <span className="font-bold text-sky-600">Priority Score: {selectedComplaint.priorityScore}</span>}
                      {idx === 10 && <span className="truncate">LLM Action: Ready</span>}
                      {idx === 11 && <span className="font-bold text-emerald-600">Commit status: 201 Written</span>}
                    </div>
                  )}
                </div>
              );
            })}

          </div>

        </div>

        {/* Priority Score weights mathematical breakdown visual panel (Only visible when currentStep >= 9) */}
        <AnimatePresence>
          {currentStep >= 9 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="glass-card p-6 rounded-3xl border border-sky-100 space-y-6"
            >
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <h3 className="font-extrabold text-slate-800 text-base">Priority Score Formulation Detail</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm items-center">
                {/* Visual Math Bar representation */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Severity (Weight: 30%)</span>
                      <span className="font-bold">{selectedComplaint.severity === 'High' ? 100 : selectedComplaint.severity === 'Medium' ? 60 : 30}/100</span>
                    </div>
                    <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: selectedComplaint.severity === 'High' ? '100%' : selectedComplaint.severity === 'Medium' ? '60%' : '30%' }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Estimated Impact Area (Weight: 25%)</span>
                      <span className="font-bold">85/100</span>
                    </div>
                    <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Infrastructure Importance (Weight: 20%)</span>
                      <span className="font-bold">{selectedComplaint.category === 'Road Infrastructure' || selectedComplaint.category === 'Healthcare/Hospitals' ? 95 : 60}/100</span>
                    </div>
                    <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: selectedComplaint.category === 'Road Infrastructure' || selectedComplaint.category === 'Healthcare/Hospitals' ? '95%' : '60%' }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>AI Model Confidence (Weight: 15%)</span>
                      <span className="font-bold">96/100</span>
                    </div>
                    <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>
                </div>

                {/* Mathematical Equation & Output display */}
                <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Dynamic Equation Output</h4>
                  <div className="p-3 bg-white border border-slate-100 rounded-xl font-mono text-xs text-slate-600 text-center leading-relaxed">
                    $$\text{Score} = (0.3 \times \text{Sev}) + (0.25 \times \text{Imp}) + (0.2 \times \text{Infra}) + (0.15 \times \text{Conf})$$
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                    <span className="text-xs font-semibold text-slate-500">Calculated Index</span>
                    <span className="text-2xl font-black text-slate-800">{selectedComplaint.priorityScore} <span className="text-xs font-medium text-slate-400">/ 100</span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Panel: Developer Activity Terminal Console Logs */}
        <div className="glass-card p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="font-mono">AI Activity Log Monitor (Whisper + Gemini + DB)</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">Stream: active</span>
          </div>

          <div className="h-[180px] overflow-y-auto font-mono text-xs leading-relaxed space-y-1.5 bg-slate-950 p-4 rounded-2xl shadow-inner border border-slate-850/30">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">Console idle. Hit "Run Pipeline" to watch log streams...</p>
            ) : (
              logs.map((lg, i) => (
                <div key={i} className="flex gap-2 items-start text-slate-300">
                  <span className="text-slate-600 select-none shrink-0 font-bold">[{lg.timestamp}]</span>
                  <span className={`${lg.colorClass} select-none shrink-0 font-bold`}>{lg.prefix}</span>
                  <span className="text-slate-300 break-all">{lg.message}</span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}
