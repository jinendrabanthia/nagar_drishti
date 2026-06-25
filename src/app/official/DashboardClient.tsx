'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { resolveReport, replyToReport } from '@/app/actions/resolve-report';
import { ShieldAlert, Map as MapIcon, Clock, AlertTriangle, Siren, X, Send, Camera, FileText, Cpu, Wifi, CheckCircle2, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import DashboardStats from './DashboardStats';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[500px] bg-teal-100/50 rounded-full blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[600px] bg-blue-100/40 rounded-full blur-[150px] mix-blend-multiply"></div>
      </div>

      {/* Emergency Banner */}
      {emergencyReports.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse px-4 py-3 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(234,88,12,0.6)] z-50 relative border-b border-orange-400/30">
          <Siren className="text-white w-5 h-5 animate-bounce" />
          <span className="font-bold text-white tracking-[0.2em] uppercase text-sm drop-shadow-md">
            {emergencyReports.length} Emergency Alert{emergencyReports.length > 1 ? 's' : ''} — Immediate Response Required
          </span>
          <Siren className="text-white w-5 h-5 animate-bounce" />
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/60 bg-white/40 backdrop-blur-2xl p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4 pl-2">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-200 to-blue-200 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-white p-2.5 rounded-xl border border-white/60 shadow-sm">
              <ShieldAlert size={22} className="text-teal-600" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-teal-700 to-blue-700 bg-clip-text text-transparent leading-tight tracking-tight">Nagar Drishti Command</h1>
            {officialName && <p className="text-xs text-slate-500 font-medium tracking-wide">Authorized Official: {officialName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pr-2">
          <NextLink href="/official/impact-report" className="text-xs font-semibold bg-white/60 hover:bg-white/80 px-4 py-2.5 rounded-xl text-slate-600 transition-all flex items-center gap-2 border border-slate-200 hover:border-purple-300 hover:shadow-sm group">
            <FileText size={14} className="text-purple-600 group-hover:scale-110 transition-transform" /> Impact
          </NextLink>
          <NextLink href="/official/rpa-bridge" className="text-xs font-semibold bg-white/60 hover:bg-white/80 px-4 py-2.5 rounded-xl text-slate-600 transition-all flex items-center gap-2 border border-slate-200 hover:border-teal-300 hover:shadow-sm group">
            <Cpu size={14} className="text-teal-600 group-hover:scale-110 transition-transform" /> RPA Bridge
          </NextLink>
          <NextLink href="/field-ops" className="text-xs font-semibold bg-white/60 hover:bg-white/80 px-4 py-2.5 rounded-xl text-slate-600 transition-all flex items-center gap-2 border border-slate-200 hover:border-orange-300 hover:shadow-sm group">
            <Wifi size={14} className="text-orange-600 group-hover:scale-110 transition-transform" /> Field Ops
          </NextLink>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <NextLink href="/" className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-200/50 flex items-center gap-1.5">
            Exit Portal <span className="text-teal-600">→</span>
          </NextLink>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-4 gap-6 max-w-[1800px] mx-auto w-full relative z-10">
        <div className="xl:col-span-3 flex flex-col gap-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="relative group bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl group-hover:bg-blue-200 transition-all"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200 shadow-sm"><Clock className="text-blue-600 w-6 h-6" /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Labor Saved</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{Math.round(reports.length * 3.4)} <span className="text-sm font-semibold text-slate-400">hrs</span></p>
                </div>
              </div>
            </div>
            
            <div className="relative group bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100 rounded-full blur-2xl group-hover:bg-teal-200 transition-all"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center border border-teal-200 shadow-sm"><ShieldAlert className="text-teal-600 w-6 h-6" /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Triaged</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{reports.length}</p>
                </div>
              </div>
            </div>

            <div className="relative group bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100 rounded-full blur-2xl group-hover:bg-amber-200 transition-all"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center border border-amber-200 shadow-sm"><AlertTriangle className="text-amber-600 w-6 h-6" /></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duplicates</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{duplicates.length}</p>
                </div>
              </div>
            </div>

            <div className="relative group bg-gradient-to-br from-white/90 to-green-50/90 backdrop-blur-md p-5 rounded-3xl border border-green-200 shadow-lg overflow-hidden">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-100/0 via-green-100/50 to-green-100/0 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl group-hover:bg-green-200 transition-all"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center border border-green-200 shadow-sm"><CheckCircle2 className="text-green-600 w-6 h-6 drop-shadow-sm" /></div>
                <div>
                  <p className="text-[11px] font-bold text-green-700 uppercase tracking-widest mb-1">Resolved</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{resolved.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Charts */}
          <DashboardStats reports={reports} />

          {/* Emergency Column (if any) */}
          {emergencyReports.length > 0 && (
            <div className="bg-gradient-to-r from-red-950/40 to-orange-950/40 backdrop-blur-xl border border-red-500/40 rounded-3xl p-5 shadow-[0_0_40px_rgba(220,38,38,0.15)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl pointer-events-none"></div>
              <h2 className="text-red-400 font-black mb-5 flex items-center gap-2 text-sm uppercase tracking-widest relative z-10">
                <Siren className="w-5 h-5 animate-pulse text-red-500" /> Emergency — Immediate Dispatch
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {emergencyReports.map(r => <ReportCard key={r.id} report={r} onSelect={(rpt) => { setSelectedReport(rpt); setModalMode('details'); }} />)}
              </div>
            </div>
          )}

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[600px]">
            {/* Critical */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-5 flex flex-col relative overflow-hidden animate-fade-in-up hover:border-orange-200 transition-colors" style={{ animationDelay: '0.3s' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 opacity-80"></div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-orange-600 font-bold flex items-center gap-2 text-[11px] uppercase tracking-widest">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span> Critical Priority
                </h2>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-orange-200">{criticalReports.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {criticalReports.map(r => <ReportCard key={r.id} report={r} onSelect={(rpt) => { setSelectedReport(rpt); setModalMode('details'); }} />)}
                {criticalReports.length === 0 && <EmptyState message="No Critical Issues" icon={<CheckCircle2 size={32} className="mb-3 text-orange-300" />} />}
              </div>
            </div>
            
            {/* Standard */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-5 flex flex-col relative overflow-hidden animate-fade-in-up hover:border-amber-200 transition-colors" style={{ animationDelay: '0.4s' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-500 opacity-80"></div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-amber-600 font-bold flex items-center gap-2 text-[11px] uppercase tracking-widest">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></span> Standard Action
                </h2>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200">{standardReports.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {standardReports.map(r => <ReportCard key={r.id} report={r} onSelect={(rpt) => { setSelectedReport(rpt); setModalMode('details'); }} />)}
                {standardReports.length === 0 && <EmptyState message="All Caught Up" icon={<CheckCircle2 size={32} className="mb-3 text-amber-300" />} />}
              </div>
            </div>

            {/* Low */}
            <div className="bg-white/50 backdrop-blur-xl border border-white shadow-lg rounded-3xl p-5 flex flex-col relative overflow-hidden animate-fade-in-up hover:border-teal-200 transition-colors opacity-90 hover:opacity-100" style={{ animationDelay: '0.5s' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-60"></div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-teal-600 font-bold flex items-center gap-2 text-[11px] uppercase tracking-widest">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]"></span> Low Priority
                </h2>
                <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-teal-200">{lowReports.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {lowReports.map(r => <ReportCard key={r.id} report={r} onSelect={(rpt) => { setSelectedReport(rpt); setModalMode('details'); }} />)}
                {lowReports.length === 0 && <EmptyState message="Queue Empty" icon={<CheckCircle2 size={32} className="mb-3 text-teal-300" />} />}
              </div>
            </div>
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-xl rounded-3xl p-5 flex flex-col h-[700px] xl:h-auto relative overflow-hidden animate-fade-in-up hover:border-teal-200 transition-all duration-500 sticky top-24" style={{ animationDelay: '0.6s' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-5 relative z-10">
            <h2 className="text-slate-800 font-bold flex items-center gap-2 text-[11px] uppercase tracking-widest">
              <MapIcon size={16} className="text-teal-600" /> Live Heatmap Tracker
            </h2>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Live</span>
            </div>
          </div>
          
          <div className="flex-1 rounded-2xl overflow-hidden relative z-10 border border-slate-200 shadow-inner bg-slate-100">
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
    <div onClick={() => onSelect(report)} className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group">
      {report.is_emergency && <div className="absolute top-0 left-0 w-1 h-full bg-orange-600 animate-pulse"></div>}
      {!report.is_emergency && report.ai_severity > 80 && <div className="absolute top-0 left-0 w-1 h-full bg-orange-600"></div>}
      
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={report.image_url} alt="Report" className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-slate-100" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-sm text-slate-800 truncate pr-2">{report.ai_category}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {report.is_emergency && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-600 text-white animate-pulse">🚨</span>}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                report.ai_severity > 80 ? 'bg-orange-100 text-orange-700' : 
                report.ai_severity > 50 ? 'bg-amber-100 text-amber-700' : 
                'bg-teal-100 text-teal-700'
              }`}>
                {report.ai_severity}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{report.description_translated || report.ai_justification}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center text-[10px] border-t border-slate-100 pt-2">
        <span className="text-slate-600 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
          {report.ai_suggested_department}
        </span>
        <div className="flex gap-2">
          {report.original_language && report.original_language !== 'en' && (
            <span className="text-blue-600 flex items-center gap-1">🌐 Auto-translated</span>
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative border border-slate-200" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {report.ai_category}
            {report.is_emergency && <span className="bg-orange-600 text-white text-[10px] uppercase px-2 py-0.5 rounded font-bold animate-pulse">Emergency</span>}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"><X size={18} /></button>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={report.image_url} alt="Report" className="w-full h-56 object-cover rounded-2xl border border-slate-200 shadow-sm relative z-10" />

        <div className="space-y-3 text-sm relative z-10">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Severity Score</p>
              <p className={`text-xl font-bold ${report.ai_severity > 80 ? 'text-orange-600' : report.ai_severity > 50 ? 'text-amber-600' : 'text-teal-600'}`}>
                {report.ai_severity}<span className="text-sm text-slate-400">/100</span>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Routing</p>
              <p className="text-sm font-semibold text-slate-700">{report.ai_suggested_department}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">AI Triage Notes</p>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">&quot;{report.ai_justification}&quot;</p>
            </div>
            
            {report.description && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  Citizen Context
                  {report.original_language && report.original_language !== 'en' && (
                    <span className="text-[10px] text-blue-600 normal-case bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">Translated from {report.original_language.toUpperCase()}</span>
                  )}
                </p>
                <p className="text-slate-600 italic text-sm">{report.description_translated || report.description}</p>
              </div>
            )}
            
            {report.pin_code && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg w-fit border border-slate-100">
                <MapIcon size={12} /> PIN: {report.pin_code}
              </div>
            )}
          </div>
        </div>

        {mode === 'details' && report.status === 'open' && (
          <div className="flex gap-3 pt-4 border-t border-slate-100 relative z-10">
            <button onClick={() => onModeChange('resolve')} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm">
              <Camera size={16} /> Mark Resolved
            </button>
            <button onClick={() => onModeChange('reply')} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-slate-300 shadow-sm">
              <Send size={16} className="text-blue-600" /> Send Reply
            </button>
          </div>
        )}

        {mode === 'resolve' && (
          <div className="space-y-4 pt-4 border-t border-slate-100 relative z-10 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="text-teal-600" size={18}/> Resolution Proof</h3>
            <div onClick={() => fileRef.current?.click()} className={`h-36 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all ${resolvePreview ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 bg-slate-50'}`}>
              {resolvePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolvePreview} alt="After" className="h-full w-full object-cover rounded-lg p-1" />
              ) : (
                <div className="text-slate-400 text-center"><Camera size={24} className="mx-auto mb-2 opacity-50" /><span className="text-sm">Upload "After" photo</span></div>
              )}
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileRef} className="hidden" onChange={(e) => {
              if (e.target.files?.[0]) { setResolveImage(e.target.files[0]); setResolvePreview(URL.createObjectURL(e.target.files[0])); }
            }} />
            <textarea className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Add field notes (e.g., Materials used, time taken)..." rows={2} value={fieldNotes} onChange={e => setFieldNotes(e.target.value)} />
            <button onClick={handleResolve} disabled={!resolveImage || isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all shadow-sm flex justify-center items-center gap-2">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Resolving...</> : 'Confirm Resolution'}
            </button>
            <button onClick={() => onModeChange('details')} className="w-full text-xs text-slate-500 hover:text-slate-800 pt-2">Cancel</button>
          </div>
        )}

        {mode === 'reply' && (
          <div className="space-y-4 pt-4 border-t border-slate-100 relative z-10 animate-in slide-in-from-bottom-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Send className="text-blue-600" size={18}/> Reply to Citizen</h3>
            {report.original_language && report.original_language !== 'en' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-2.5 rounded-lg text-xs flex items-center gap-2">
                <span>🌐</span> Your reply will be automatically translated to {report.original_language.toUpperCase()} for the citizen.
              </div>
            )}
            <textarea className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Write your reply in English..." rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} />
            <button onClick={handleReply} disabled={!replyText || isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all shadow-sm flex justify-center items-center gap-2">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Reply'}
            </button>
            <button onClick={() => onModeChange('details')} className="w-full text-xs text-slate-500 hover:text-slate-800 pt-2">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, icon }: { message: string, icon: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white/40 rounded-2xl border border-dashed border-slate-200 p-6 m-2 mt-4 hover:bg-white/60 hover:border-slate-300 transition-all duration-300">
      <div className="bg-slate-50 p-4 rounded-full mb-3 shadow-inner border border-slate-100">
        {icon}
      </div>
      <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500">{message}</p>
    </div>
  );
}
