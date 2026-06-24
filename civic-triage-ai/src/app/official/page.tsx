'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldAlert, Map as MapIcon, Clock, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';

const Map = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <div className="h-full bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div> });

export default function OfficialDashboard() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('reports_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, payload => {
        fetchReports();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('ai_severity', { ascending: false });
    
    if (data) setReports(data);
  };

  const openReports = reports.filter(r => r.status === 'open');
  const criticalReports = openReports.filter(r => r.ai_severity > 80);
  const standardReports = openReports.filter(r => r.ai_severity <= 80 && r.ai_severity > 30);
  const lowReports = openReports.filter(r => r.ai_severity <= 30);
  const duplicates = reports.filter(r => r.status === 'duplicate');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-blue-500" />
          <h1 className="text-xl font-bold">City Triage Command Center</h1>
        </div>
        <NextLink href="/" className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-slate-300 transition-colors">
          Back to Citizen Feed
        </NextLink>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Kanban Board */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-lg"><Clock className="text-blue-500" /></div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Labor Hours Saved (Est.)</p>
                <p className="text-2xl font-bold text-white">412 hrs</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-lg"><ShieldAlert className="text-green-500" /></div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Auto-Triaged Reports</p>
                <p className="text-2xl font-bold text-white">{reports.length}</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-lg"><AlertTriangle className="text-purple-500" /></div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Duplicates Prevented</p>
                <p className="text-2xl font-bold text-white">{duplicates.length}</p>
              </div>
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Critical */}
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 flex flex-col h-[600px] shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <h2 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                CRITICAL ACTION
              </h2>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-4">
                {criticalReports.map(report => <ReportCard key={report.id} report={report} />)}
                {criticalReports.length === 0 && <p className="text-slate-500 text-sm text-center mt-10">No critical issues.</p>}
              </div>
            </div>

            {/* Standard */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[600px]">
              <h2 className="text-slate-200 font-bold mb-4">Standard Queue</h2>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-4">
                {standardReports.map(report => <ReportCard key={report.id} report={report} />)}
                {standardReports.length === 0 && <p className="text-slate-500 text-sm text-center mt-10">No standard issues.</p>}
              </div>
            </div>

            {/* Low Priority */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[600px]">
              <h2 className="text-slate-400 font-bold mb-4">Low Priority</h2>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-4">
                {lowReports.map(report => <ReportCard key={report.id} report={report} />)}
                {lowReports.length === 0 && <p className="text-slate-500 text-sm text-center mt-10">No low priority issues.</p>}
              </div>
            </div>

          </div>
        </div>

        {/* Live Map Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[740px]">
           <h2 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
             <MapIcon size={18} /> Live Incident Map
           </h2>
           <div className="flex-1 rounded-xl overflow-hidden relative z-0">
             <Map reports={openReports} />
           </div>
        </div>

      </main>
    </div>
  );
}

function ReportCard({ report }: { report: any }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition-colors cursor-pointer relative overflow-hidden group">
      {report.ai_severity > 80 && (
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
      )}
      <div className="flex gap-3">
        <img src={report.image_url} alt="Report" className="w-16 h-16 object-cover rounded-lg border border-slate-700 bg-slate-900" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-sm text-slate-200">{report.ai_category}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${report.ai_severity > 80 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
              {report.ai_severity}/100
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{report.ai_justification}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center text-xs">
        <span className="text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded">Dept: {report.ai_suggested_department}</span>
        <button className="bg-slate-700 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors opacity-0 group-hover:opacity-100">
          View Details
        </button>
      </div>
    </div>
  );
}
