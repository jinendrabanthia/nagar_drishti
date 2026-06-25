import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NextLink from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import LocationDisplay from '@/components/LocationDisplay';

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
      case 'resolved': return { icon: <CheckCircle2 className="text-teal-600 w-5 h-5" />, label: 'Resolved', color: 'text-teal-700', bg: 'bg-teal-500/10 border-teal-500/30' };
      case 'in_progress': return { icon: <AlertTriangle className="text-amber-600 w-5 h-5" />, label: 'In Progress', color: 'text-amber-700', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'duplicate': return { icon: <ArrowRight className="text-slate-600 w-5 h-5" />, label: 'Duplicate', color: 'text-slate-700', bg: 'bg-slate-500/10 border-slate-500/30' };
      default: return { icon: <Clock className="text-blue-600 w-5 h-5" />, label: 'Open', color: 'text-blue-700', bg: 'bg-blue-500/10 border-blue-500/30' };
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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500/30 flex flex-col relative overflow-hidden">
      {/* Decorative Light Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-100/50 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
      </div>

      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NextLink href="/" className="text-slate-500 hover:text-teal-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </NextLink>
            <div className="flex items-center gap-2">
              <div className="civic-gradient p-1.5 rounded-lg shadow-sm shadow-teal-500/20">
                <ShieldAlert size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center">
                Nagar Drishti <LocationDisplay />
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10 w-full">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">My Reports</h1>
        <p className="text-slate-600 text-sm mb-8">Track the status of your submitted civic issues.</p>

        {(!reports || reports.length === 0) ? (
          <div className="glass-card-premium rounded-[2rem] p-16 text-center shadow-xl">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
              <ShieldAlert className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Your neighborhood looks great!</h3>
            <p className="text-slate-600 text-sm mb-6 max-w-sm mx-auto">You haven't submitted any reports yet. See something that needs fixing? Be a community hero.</p>
            <NextLink href="/" className="civic-gradient text-white px-6 py-3 rounded-xl font-medium transition-all inline-block shadow-lg shadow-teal-600/20 hover:opacity-90">
              Report an Issue
            </NextLink>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report, index) => {
              const statusCfg = getStatusConfig(report.status);
              const timeline = getTimeline(report);
              
              return (
                <div key={report.id} className="glass-card-premium rounded-2xl overflow-hidden animate-fade-in-up border border-white/60 shadow-xl" style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}>
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="relative w-full md:w-64 h-48 flex-shrink-0 bg-slate-100">
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
                          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </span>
                          <span className="text-xs text-slate-500 font-mono font-medium">
                            {new Date(report.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{report.ai_category || 'Uncategorized Issue'}</h3>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-3">{report.description}</p>

                        {/* Status Timeline */}
                        <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                          {timeline.map((step, i) => (
                            <div key={i} className="flex items-center">
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${step.done ? 'bg-teal-50 border border-teal-200 text-teal-700' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                {step.done && <CheckCircle2 size={10} />}
                                {step.label}
                              </div>
                              {i < timeline.length - 1 && (
                                <div className={`w-3 h-px mx-0.5 ${step.done ? 'bg-teal-300' : 'bg-slate-200'}`}></div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Official Reply */}
                        {(report.official_reply || report.official_reply_translated) && (
                          <div className="bg-teal-50 border border-teal-100 p-3 rounded-xl mb-3 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-teal-800">
                              <FileText size={12} /> Official Response
                            </div>
                            <p className="text-teal-900 text-sm">
                              {report.original_language && report.original_language !== 'en' && report.official_reply_translated 
                                ? report.official_reply_translated 
                                : report.official_reply}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 flex-wrap mt-2">
                        {report.ai_severity !== null && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            report.ai_severity > 80 ? 'bg-orange-50 border-orange-200 text-orange-700' :
                            report.ai_severity > 50 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                            'bg-teal-50 border-teal-200 text-teal-700'
                          }`}>
                            Severity: {report.ai_severity}/100
                          </span>
                        )}
                        {report.ai_suggested_department && (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm">
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
