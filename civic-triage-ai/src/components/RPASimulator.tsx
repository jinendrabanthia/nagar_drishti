'use client';

import { useState, useEffect } from 'react';
import { generateRPAPayload } from '@/app/actions/export-rpa';
import { Terminal, Database, ArrowRight, Download, Play, CheckCircle, ArrowLeft, Cpu } from 'lucide-react';
import NextLink from 'next/link';

export default function RPASimulator({ initialList }: { initialList: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [typedFields, setTypedFields] = useState<Record<string, string>>({});
  const [simulationComplete, setSimulationComplete] = useState(false);

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    setPayload(null);
    setTypedFields({});
    setSimulationComplete(false);
    const res = await generateRPAPayload(id);
    if (res.success) {
      setPayload(res.data);
    }
  };

  const startSimulation = () => {
    if (!payload) return;
    setIsSimulating(true);
    setTypedFields({});
    setSimulationComplete(false);

    const keys = Object.keys(payload);
    let currentKeyIndex = 0;

    const interval = setInterval(() => {
      if (currentKeyIndex >= keys.length) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationComplete(true);
        return;
      }

      const key = keys[currentKeyIndex];
      setTypedFields(prev => ({ ...prev, [key]: String(payload[key]) }));
      currentKeyIndex++;
    }, 400); // type a new field every 400ms
  };

  const handleDownloadJson = () => {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.TicketID}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-3rem)] font-sans">
      <header className="flex justify-between items-center mb-6 px-4">
        <div>
          <NextLink href="/official" className="text-slate-400 hover:text-teal-400 flex items-center gap-2 mb-2 text-sm transition-colors font-medium">
            <ArrowLeft size={16} /> Command Center
          </NextLink>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="civic-gradient p-2 rounded-xl shadow-lg shadow-teal-500/20">
              <Cpu size={24} className="text-white" />
            </div>
            RPA Legacy Bridge
          </h1>
          <p className="text-slate-400 text-sm mt-1 ml-14">Automated data entry from AI Triage to Legacy Municipal Systems (GovNet95)</p>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 px-4 pb-4">
        
        {/* Left Col: Ticket List */}
        <div className="glass-card rounded-2xl flex flex-col overflow-hidden shadow-xl border border-white/[0.06] relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
            <h2 className="font-bold text-white text-sm uppercase tracking-wider">Recent Reports</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar relative z-10">
            {initialList.map(item => (
              <button 
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${selectedId === item.id ? 'bg-teal-500/10 border-teal-500/50 text-white shadow-[inset_0_0_20px_rgba(20,184,166,0.1)]' : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:border-white/[0.2] hover:bg-white/[0.04]'}`}
              >
                <div className="font-mono text-[10px] text-teal-400/80 mb-1 tracking-wider">ID: {item.id.split('-')[0]}</div>
                <div className="font-bold text-sm truncate">{item.ai_category || 'Report'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle Col: AI JSON Payload */}
        <div className="glass-card rounded-2xl flex flex-col overflow-hidden shadow-xl border border-white/[0.06]">
          <div className="p-4 border-b border-white/[0.06] bg-white/[0.02] flex justify-between items-center">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider"><Database size={16} className="text-teal-400"/> AI JSON Payload</h2>
            {payload && (
              <button onClick={handleDownloadJson} className="text-xs bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors text-white border border-white/[0.06]">
                <Download size={14} className="text-teal-400" /> Download
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-[#050B14] custom-scrollbar">
            {payload ? (
              <pre className="text-teal-400/80 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(payload, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                <Database size={32} className="opacity-20 mb-3" />
                Select a report to generate payload
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Legacy System Simulator */}
        <div className="bg-[#1e1e1e] border-4 border-slate-700 rounded-2xl flex flex-col overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Retro Window Header */}
          <div className="p-2 bg-gradient-to-r from-blue-900 to-blue-800 border-b-2 border-slate-600 flex justify-between items-center select-none shadow-sm">
            <h2 className="font-bold text-white font-mono text-sm tracking-wider flex items-center gap-2">
              <Terminal size={14} className="opacity-70" />
              GovNet95
            </h2>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-400 shadow-inner"></div>
              <div className="w-3 h-3 rounded-full bg-slate-400 shadow-inner"></div>
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-inner"></div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 bg-slate-800 flex justify-center border-b border-slate-700 shadow-inner">
            <button 
              onClick={startSimulation}
              disabled={!payload || isSimulating || simulationComplete}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:grayscale text-white px-6 py-2.5 rounded font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2 shadow-[inset_0_2px_0_rgba(255,255,255,0.3),0_4px_0_rgb(21,128,61)] active:shadow-[inset_0_2px_0_rgba(255,255,255,0.3),0_0px_0_rgb(21,128,61)] active:translate-y-1"
            >
              {isSimulating ? <ArrowRight size={18} className="animate-pulse" /> : <Play size={18} />}
              {isSimulating ? 'RPA BOT RUNNING...' : 'Trigger RPA Bot'}
            </button>
          </div>

          {/* Retro Form */}
          <div className="flex-1 bg-[#c0c0c0] p-6 overflow-y-auto font-sans shadow-inner custom-scrollbar">
            <div className="max-w-md mx-auto space-y-4">
              
              <div className="bg-white border-2 border-slate-400 p-5 shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
                <h3 className="text-black font-bold mb-5 border-b-2 border-black pb-1 uppercase tracking-widest text-center">Ticket Intake Form</h3>
                
                <div className="space-y-4">
                  {payload && Object.keys(payload).map(key => (
                    <div key={key} className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <div className="flex items-center gap-2">
                        <input 
                          readOnly
                          value={typedFields[key] || ''}
                          className={`w-full border-2 border-slate-400 bg-white p-1.5 text-black font-mono text-sm shadow-inner focus:outline-none ${typedFields[key] ? 'bg-yellow-100' : ''}`}
                        />
                        {typedFields[key] && <div className="w-2.5 h-4 bg-black animate-ping shrink-0"></div>}
                      </div>
                    </div>
                  ))}
                </div>

                {simulationComplete && (
                  <div className="mt-6 p-4 bg-green-100 border-2 border-green-600 text-green-800 font-bold flex items-center gap-3 animate-bounce shadow-sm">
                    <CheckCircle size={24} /> RECORD SAVED TO MAINFRAME
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
