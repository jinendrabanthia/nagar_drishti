import ReportForm from '@/components/ReportForm';
import CitizenLogin from '@/components/CitizenLogin';
import MagicBento from '@/components/MagicBento';
import { cookies } from 'next/headers';

export default async function Home() {
  const citizenId = (await cookies()).get('citizen_id')?.value;

  const bentoCards = [
    {
      color: 'rgba(255, 255, 255, 0.7)',
      title: 'Lightning Fast',
      description: '3.4s Avg AI triage time',
      label: 'Speed'
    },
    {
      color: 'rgba(255, 255, 255, 0.7)',
      title: 'Location Fuzzing',
      description: '±200m spatial accuracy protection',
      label: 'Privacy'
    },
    {
      color: 'rgba(255, 255, 255, 0.7)',
      title: 'Zero PII',
      description: 'Enterprise-grade data security',
      label: 'Security'
    },
    {
      color: 'rgba(255, 255, 255, 0.7)',
      title: 'Smart Routing',
      description: 'Directly to the right city crew',
      label: 'Efficiency'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500/30 flex flex-col relative overflow-hidden">
      {/* Decorative Light Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-100/50 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-12 lg:py-16 gap-12 lg:gap-20 max-w-7xl mx-auto w-full relative z-10">
        {/* Left — Hero & Bento Grid */}
        <div className="flex-1 space-y-10 max-w-2xl">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 glass-card px-5 py-2.5 rounded-full text-sm shadow-sm border border-teal-100 bg-white/80 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-teal-700 font-medium tracking-wide">AI-Powered Civic Infrastructure</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              See it.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Snap it.</span><br />
              We&apos;ll fix it.
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-lg font-light animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              Report potholes, hazards, and infrastructure issues in seconds. Our AI instantly analyzes severity and routes directly to the right city crew.
            </p>
          </div>

          {/* Magic Bento Integration for Stats */}
          <div className="w-full animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
            <MagicBento 
              cards={bentoCards} 
              textAutoHide={false}
              particleCount={10}
              enableTilt={true}
              glowColor="20, 184, 166" 
            />
          </div>
        </div>

        {/* Right — Form Card */}
        <div className="w-full max-w-md relative mt-8 lg:mt-0 animate-scale-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
          {/* Decorative glow behind form */}
          <div className="absolute -inset-4 bg-gradient-to-br from-teal-200 to-blue-200 rounded-[2.5rem] blur-2xl opacity-60"></div>
          <div className="relative glass-card-premium rounded-[2rem] overflow-hidden border border-white/60 shadow-xl">
            {citizenId ? <ReportForm citizenId={citizenId} /> : <CitizenLogin />}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/60 py-8 text-center text-slate-500 text-sm bg-white/40 backdrop-blur-md relative z-10 mt-auto">
        <p>Built for Vibe2Ship Hackathon by Jinendra Banthia. <span className="text-slate-400">Secured by design.</span></p>
      </footer>
    </div>
  );
}
