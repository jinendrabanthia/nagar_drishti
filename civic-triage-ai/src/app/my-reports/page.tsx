import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NextLink from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';

export default async function MyReports() {
  const citizenId = (await cookies()).get('citizen_id')?.value;

  if (!citizenId) {
    redirect('/');
  }

  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .eq('citizen_id', citizenId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching reports:", error);
  }

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'resolved': return { icon: <CheckCircle2 className="text-teal-400 w-5 h-5" />, label: 'Resolved', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' };
      case 'in_progress': return { icon: <AlertTriangle className="text-amber-400 w-5 h-5" />, label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'duplicate': return { icon: <ArrowRight className="text-slate-400 w-5 h-5" />, label: 'Duplicate', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30' };
      default: return { icon: <Clock className="text-blue-400 w-5 h-5" />, label: 'Open', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
    }
  };

  // Status timeline steps
  const getTimeline = (report: any) => {
    const steps = [
      { label: 'Submitted', done: true, time: report.created_at },
      { label: 'AI Triaged', done: !!report.ai_category, time: report.created_at },
      { label: 'Assigned', done: !!report.assigned_to, time: report.created_at },
      { label: 'In Progress', done: report.status === 'in_progress' || report.status === 'resolved', time: null },
      { label: 'Resolved', done: report.status === 'resolved', time: report.resolved_at },
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-50">
      <header className="border-b border-white/[0.06] bg-[#0B1120]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NextLink href="/" className="text-slate-400 hover:text-teal-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </NextLink>
            <div className="flex items-center gap-2">
              <div className="civic-gradient p-1.5 rounded-lg">
                <ShieldAlert size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">CivicTriage<span className="text-teal-400">.ai</span></span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">My Reports</h1>
        <p className="text-slate-500 text-sm mb-8">Track the status of your submitted civic issues.</p>

        {(!reports || reports.length === 0) ? (
          <div className="glass-card rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-teal-500/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Your neighborhood looks great!</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">You haven't submitted any reports yet. See something that needs fixing? Be a community hero.</p>
            <NextLink href="/" className="civic-gradient text-white px-6 py-3 rounded-xl font-medium transition-all inline-block shadow-lg shadow-teal-600/20 hover:opacity-90">
              Report an Issue
            </NextLink>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => {
              const statusCfg = getStatusConfig(report.status);
              const timeline = getTimeline(report);
              
              return (
                <div key={report.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-300">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="relative w-full md:w-64 h-48 flex-shrink-0 bg-white/[0.02]">
                      {report.status === 'resolved' && report.resolved_image_url ? (
                        <BeforeAfterSlider beforeUrl={report.image_url} afterUrl={report.resolved_image_url} />
                      ) : (
                        <Image 
                          src={report.image_url} 
                          alt="Issue image" 
                          fill 
                          className="object-cover"
                          unoptimized 
                        />
                      )}
                    </div>
                    
                    {/* Details Section */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusCfg.bg}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {new Date(report.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white mb-1">{report.ai_category || 'Uncategorized Issue'}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-3">{report.description}</p>

                        {/* Status Timeline */}
                        <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                          {timeline.map((step, i) => (
                            <div key={i} className="flex items-center">
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${step.done ? 'bg-teal-500/10 text-teal-400' : 'bg-white/[0.03] text-slate-600'}`}>
                                {step.done && <CheckCircle2 size={10} />}
                                {step.label}
                              </div>
                              {i < timeline.length - 1 && (
                                <div className={`w-3 h-px mx-0.5 ${step.done ? 'bg-teal-500/40' : 'bg-white/[0.06]'}`}></div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Official Reply */}
                        {(report.official_reply || report.official_reply_translated) && (
                          <div className="glass-card p-3 rounded-xl mb-3">
                            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-teal-400">
                              <FileText size={12} /> Official Response
                            </div>
                            <p className="text-slate-300 text-sm">
                              {report.original_language && report.original_language !== 'en' && report.official_reply_translated 
                                ? report.official_reply_translated 
                                : report.official_reply}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {report.ai_severity !== null && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            report.ai_severity > 80 ? 'bg-[#C2410C]/15 text-[#EA580C]' :
                            report.ai_severity > 50 ? 'bg-amber-500/15 text-amber-400' :
                            'bg-teal-500/15 text-teal-400'
                          }`}>
                            Severity: {report.ai_severity}/100
                          </span>
                        )}
                        {report.ai_suggested_department && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-400">
                            {report.ai_suggested_department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
