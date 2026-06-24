'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { resolveReport, replyToReport } from '@/app/actions/resolve-report';
import { ShieldAlert, Map as MapIcon, Clock, AlertTriangle, Siren, X, Send, Camera, FileText, Cpu, Wifi, CheckCircle2, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="h-full skeleton rounded-xl flex items-center justify-center text-slate-500 text-sm">Loading Map...</div> 
});

export interface Report {
  id: string;
  lat: number;
  lng: number;
  status: string;
  ai_severity: number;
  ai_category: string;
  ai_justification: string;
  ai_suggested_department: string;
  image_url: string;
  description?: string;
  description_translated?: string;
  original_language?: string;
  is_emergency?: boolean;
  emergency_type?: string;
  pin_code?: string;
  assigned_to?: string;
  official_reply?: string;
}

export default function DashboardClient({ officialName }: { officialName?: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalMode, setModalMode] = useState<'details' | 'resolve' | 'reply' | null>(null);

  useEffect(() => {
    fetchReports();
    const channel = supabase
      .channel('reports_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchReports();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchReports() {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('ai_severity', { ascending: false });
    if (data) setReports(data as Report[]);
  }

  const openReports = reports.filter(r => r.status === 'open');
  const emergencyReports = openReports.filter(r => r.is_emergency);
  const criticalReports = openReports.filter(r => !r.is_emergency && r.ai_severity > 80);
  const standardReports = openReports.filter(r => r.ai_severity <= 80 && r.ai_severity > 30);
  const lowReports = openReports.filter(r => r.ai_severity <= 30);
  const duplicates = reports.filter(r => r.status === 'duplicate');
  const resolved = reports.filter(r => r.status === 'resolved');

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-50 flex flex-col font-sans">
      {/* Emergency Banner */}
      {emergencyReports.length > 0 && (
        <div className="bg-[#EA580C] animate-pulse px-4 py-3 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(234,88,12,0.5)] z-50">
          <Siren className="text-white w-5 h-5" />
          <span className="font-bold text-white tracking-wide uppercase text-sm">
            🚨 {emergencyReports.length} Emergency Alert{emergencyReports.length > 1 ? 's' : ''} — Immediate Response Required
          </span>
          <Siren className="text-white w-5 h-5" />
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0B1120]/80 backdrop-blur-xl p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="civic-gradient p-2 rounded-xl shadow-lg shadow-teal-500/10">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Command Center</h1>
            {officialName && <p className="text-xs text-teal-400 font-medium">Official: {officialName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <NextLink href="/official/impact-report" className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] px-3 py-2 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5 border border-white/[0.06]">
            <FileText size={14} className="text-purple-400" /> Impact
          </NextLink>
          <NextLink href="/official/rpa-bridge" className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] px-3 py-2 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5 border border-white/[0.06]">
            <Cpu size={14} className="text-teal-400" /> RPA Bridge
          </NextLink>
          <NextLink href="/field-ops" className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] px-3 py-2 rounded-lg text-slate-300 transition-colors flex items-center gap-1.5 border border-white/[0.06]">
            <Wifi size={14} className="text-orange-400" /> Field Ops
          </NextLink>
          <NextLink href="/" className="text-xs font-medium bg-transparent hover:text-teal-400 px-3 py-2 rounded-lg text-slate-500 transition-colors">
            Exit to Citizen Feed →
          </NextLink>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto w-full">
        <div className="xl:col-span-3 flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.06] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><Clock className="text-blue-400" /></div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Labor Saved</p>
                <p className="text-2xl font-bold text-white">{Math.round(reports.length * 3.4)} <span className="text-sm font-medium text-slate-500">hrs</span></p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.06] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center"><ShieldAlert className="text-teal-400" /></div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Triaged</p>
                <p className="text-2xl font-bold text-white">{reports.length}</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.06] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="text-amber-400" /></div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Duplicates</p>
                <p className="text-2xl font-bold text-white">{duplicates.length}</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:bg-white/[0.06] transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl"></div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"><CheckCircle2 className="text-green-400" /></div>
              <div className="relative">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Resolved</p>
                <p className="text-2xl font-bold text-white">{resolved.length}</p>
              </div>
            </div>
          </div>

          {/* Emergency Column (if any) */}
          {emergencyReports.length > 0 && (
            <div className="bg-[#111827] border border-[#EA580C]/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(234,88,12,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EA580C] to-[#C2410C]"></div>
              <h2 className="text-[#EA580C] font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Siren className="w-4 h-4 animate-pulse" /> Emergency — Immediate Dispatch
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyReports.map(r => <ReportCard key={r.id} report={r} onSelect={(rpt) => { setSelectedReport(rpt); setModalMode('details'); }} />)}
              </div>
            </div>
          )}

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
            <div className="glass-card rounded-2xl p-4 flex flex-col shadow-lg">
              <h2 className="text-[#EA580C] font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse"></span> Critical ({criticalReports.length})
              </h2>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {criticalReports.map(r => <ReportCard key={r.id} report={r} onSelect={(rpt) => { setSelectedReport(rpt); setModalMode('details'); }} />)}
                {criticalReports.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50"><CheckCircle2 size={32} className="mb-2" /><p className="text-sm">Inbox Zero</p></div>}
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-4 flex flex-col shadow-lg">
              <h2 className="text-amber-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Standard ({standardReports.length})
              </h2>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {standardReports.map(r => <ReportCard key={r.id} report={r} onSelect={(rpt) => { setSelectedReport(rpt); setModalMode('details'); }} />)}
                {standardReports.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50"><CheckCircle2 size={32} className="mb-2" /><p className="text-sm">Inbox Zero</p></div>}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 flex flex-col shadow-lg opacity-80 hover:opacity-100 transition-opacity">
              <h2 className="text-teal-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span> Low Priority ({lowReports.length})
              </h2>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {lowReports.map(r => <ReportCard key={r.id} report={r} onSelect={(rpt) => { setSelectedReport(rpt); setModalMode('details'); }} />)}
                {lowReports.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50"><CheckCircle2 size={32} className="mb-2" /><p className="text-sm">Inbox Zero</p></div>}
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="glass-card rounded-2xl p-4 flex flex-col h-[600px] xl:h-auto shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-slate-200 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider z-10"><MapIcon size={16} className="text-teal-400" /> Live Heatmap</h2>
          <div className="flex-1 rounded-xl overflow-hidden relative z-0 border border-white/[0.06]">
            <Map reports={openReports} />
          </div>
        </div>
      </main>

      {/* Detail / Resolve / Reply Modal */}
      {selectedReport && modalMode && (
        <ReportModal
          report={selectedReport}
          mode={modalMode}
          onClose={() => { setSelectedReport(null); setModalMode(null); }}
          onModeChange={setModalMode}
          onActionComplete={() => { fetchReports(); setSelectedReport(null); setModalMode(null); }}
        />
      )}
    </div>
  );
}

function ReportCard({ report, onSelect }: { report: Report; onSelect: (r: Report) => void }) {
  return (
    <div onClick={() => onSelect(report)} className="glass-card p-3.5 hover:bg-white/[0.06] transition-all duration-200 cursor-pointer relative overflow-hidden group rounded-xl">
      {report.is_emergency && <div className="absolute top-0 left-0 w-1 h-full bg-[#EA580C] animate-pulse"></div>}
      {!report.is_emergency && report.ai_severity > 80 && <div className="absolute top-0 left-0 w-1 h-full bg-[#EA580C]"></div>}
      
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={report.image_url} alt="Report" className="w-16 h-16 object-cover rounded-lg border border-white/[0.06] bg-black/50" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-sm text-white truncate pr-2">{report.ai_category}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {report.is_emergency && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EA580C] text-white animate-pulse">🚨</span>}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                report.ai_severity > 80 ? 'bg-[#C2410C]/20 text-[#EA580C]' : 
                report.ai_severity > 50 ? 'bg-amber-500/20 text-amber-400' : 
                'bg-teal-500/20 text-teal-400'
              }`}>
                {report.ai_severity}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{report.description_translated || report.ai_justification}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center text-[10px] border-t border-white/[0.06] pt-2">
        <span className="text-slate-400 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded flex items-center gap-1">
          {report.ai_suggested_department}
        </span>
        <div className="flex gap-2">
          {report.original_language && report.original_language !== 'en' && (
            <span className="text-blue-400 flex items-center gap-1">🌐 Auto-translated</span>
          )}
          {report.pin_code && <span className="text-slate-500 font-mono">📍 {report.pin_code}</span>}
        </div>
      </div>
    </div>
  );
}

function ReportModal({ report, mode, onClose, onModeChange, onActionComplete }: {
  report: Report;
  mode: 'details' | 'resolve' | 'reply';
  onClose: () => void;
  onModeChange: (m: 'details' | 'resolve' | 'reply') => void;
  onActionComplete: () => void;
}) {
  const [resolveImage, setResolveImage] = useState<File | null>(null);
  const [resolvePreview, setResolvePreview] = useState<string | null>(null);
  const [fieldNotes, setFieldNotes] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleResolve = async () => {
    if (!resolveImage) return;
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('report_id', report.id);
    fd.append('resolved_image', resolveImage);
    fd.append('field_notes', fieldNotes);
    const res = await resolveReport(fd);
    setIsSubmitting(false);
    if (res.success) onActionComplete();
  };

  const handleReply = async () => {
    if (!replyText) return;
    setIsSubmitting(true);
    const res = await replyToReport(report.id, replyText);
    setIsSubmitting(false);
    if (res.success) onActionComplete();
  };

  return (
    <div className="fixed inset-0 bg-[#0B1120]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="glass-card rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {report.ai_category}
            {report.is_emergency && <span className="bg-[#EA580C] text-white text-[10px] uppercase px-2 py-0.5 rounded font-bold animate-pulse">Emergency</span>}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-white/[0.04] p-1.5 rounded-full transition-colors"><X size={18} /></button>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={report.image_url} alt="Report" className="w-full h-56 object-cover rounded-2xl border border-white/[0.06] shadow-md relative z-10" />

        <div className="space-y-3 text-sm relative z-10">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Severity Score</p>
              <p className={`text-xl font-bold ${report.ai_severity > 80 ? 'text-[#EA580C]' : report.ai_severity > 50 ? 'text-amber-400' : 'text-teal-400'}`}>
                {report.ai_severity}<span className="text-sm text-slate-500">/100</span>
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Routing</p>
              <p className="text-sm font-semibold text-white">{report.ai_suggested_department}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/[0.06] pt-4">
            <div>
              <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">AI Triage Notes</p>
              <p className="text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">&quot;{report.ai_justification}&quot;</p>
            </div>
            
            {report.description && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  Citizen Context
                  {report.original_language && report.original_language !== 'en' && (
                    <span className="text-[10px] text-blue-400 normal-case bg-blue-500/10 px-1.5 py-0.5 rounded">Translated from {report.original_language.toUpperCase()}</span>
                  )}
                </p>
                <p className="text-slate-400 italic text-sm">{report.description_translated || report.description}</p>
              </div>
            )}
            
            {report.pin_code && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 bg-white/[0.02] p-2 rounded-lg w-fit">
                <MapIcon size={12} /> PIN: {report.pin_code}
              </div>
            )}
          </div>
        </div>

        {mode === 'details' && report.status === 'open' && (
          <div className="flex gap-3 pt-4 border-t border-white/[0.06] relative z-10">
            <button onClick={() => onModeChange('resolve')} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20">
              <Camera size={16} /> Mark Resolved
            </button>
            <button onClick={() => onModeChange('reply')} className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/[0.06]">
              <Send size={16} className="text-blue-400" /> Send Reply
            </button>
          </div>
        )}

        {mode === 'resolve' && (
          <div className="space-y-4 pt-4 border-t border-white/[0.06] relative z-10 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-teal-400" size={18}/> Resolution Proof</h3>
            <div onClick={() => fileRef.current?.click()} className={`h-36 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all ${resolvePreview ? 'border-teal-500/50 bg-teal-500/5' : 'border-white/[0.08] hover:border-teal-500/30 bg-white/[0.02]'}`}>
              {resolvePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolvePreview} alt="After" className="h-full w-full object-cover rounded-lg p-1" />
              ) : (
                <div className="text-slate-500 text-center"><Camera size={24} className="mx-auto mb-2 opacity-50" /><span className="text-sm">Upload "After" photo</span></div>
              )}
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileRef} className="hidden" onChange={(e) => {
              if (e.target.files?.[0]) { setResolveImage(e.target.files[0]); setResolvePreview(URL.createObjectURL(e.target.files[0])); }
            }} />
            <textarea className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-teal-500/50 outline-none" placeholder="Add field notes (e.g., Materials used, time taken)..." rows={2} value={fieldNotes} onChange={e => setFieldNotes(e.target.value)} />
            <button onClick={handleResolve} disabled={!resolveImage || isSubmitting} className="w-full civic-gradient hover:opacity-90 disabled:opacity-50 disabled:grayscale text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-teal-600/20 flex justify-center items-center gap-2">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Resolving...</> : 'Confirm Resolution'}
            </button>
            <button onClick={() => onModeChange('details')} className="w-full text-xs text-slate-500 hover:text-white pt-2">Cancel</button>
          </div>
        )}

        {mode === 'reply' && (
          <div className="space-y-4 pt-4 border-t border-white/[0.06] relative z-10 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold text-white flex items-center gap-2"><Send className="text-blue-400" size={18}/> Reply to Citizen</h3>
            {report.original_language && report.original_language !== 'en' && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
                <span>🌐</span> Your reply will be automatically translated to {report.original_language.toUpperCase()} for the citizen.
              </div>
            )}
            <textarea className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="Write your reply in English..." rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} />
            <button onClick={handleReply} disabled={!replyText || isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Reply'}
            </button>
            <button onClick={() => onModeChange('details')} className="w-full text-xs text-slate-500 hover:text-white pt-2">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
