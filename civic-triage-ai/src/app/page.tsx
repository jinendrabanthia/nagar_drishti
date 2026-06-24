import ReportForm from '@/components/ReportForm';
import CitizenLogin from '@/components/CitizenLogin';
import NextLink from 'next/link';
import { ShieldAlert, ArrowRight, Zap, MapPin, Shield } from 'lucide-react';
import { cookies } from 'next/headers';

export default async function Home() {
  const citizenId = (await cookies()).get('citizen_id')?.value;

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-50 selection:bg-teal-500/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0B1120]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="civic-gradient p-2 rounded-xl shadow-lg shadow-teal-500/10">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">CivicTriage<span className="text-teal-400">.ai</span></span>
          </div>
          <nav className="flex items-center gap-4">
            {citizenId && (
              <NextLink href="/my-reports" className="text-sm font-medium text-slate-300 hover:text-white transition-all duration-200 glass-card px-4 py-2 rounded-xl hover:bg-white/[0.08]">
                My Reports
              </NextLink>
            )}
            <NextLink href="/official" className="text-sm font-medium text-slate-400 hover:text-teal-400 transition-all duration-200">
              Official Portal →
            </NextLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-12 lg:py-0 gap-12 lg:gap-20 max-w-7xl mx-auto w-full">
        {/* Left — Hero */}
        <div className="flex-1 space-y-8 max-w-xl">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-teal-300 font-medium">AI-Powered Civic Infrastructure</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            See it.<br />
            <span className="civic-gradient-text">Snap it.</span><br />
            We&apos;ll fix it.
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed max-w-md">
            Report potholes, hazards, and infrastructure issues in seconds. Our AI instantly analyzes severity, detects emergencies, and routes directly to the right city crew.
          </p>

          {/* Stats Row */}
          <div className="flex gap-4 pt-2">
            <div className="glass-card p-5 rounded-2xl flex-1 group glass-card-hover transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-teal-400" />
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Speed</span>
              </div>
              <h4 className="text-3xl font-bold text-white mb-0.5">3.4s</h4>
              <p className="text-sm text-slate-500">Avg AI triage time</p>
            </div>
            <div className="glass-card p-5 rounded-2xl flex-1 group glass-card-hover transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-teal-400" />
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Privacy</span>
              </div>
              <h4 className="text-3xl font-bold text-white mb-0.5">±200m</h4>
              <p className="text-sm text-slate-500">Location fuzzing</p>
            </div>
            <div className="glass-card p-5 rounded-2xl flex-1 group glass-card-hover transition-all duration-300 hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-teal-400" />
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Security</span>
              </div>
              <h4 className="text-3xl font-bold text-white mb-0.5">Zero</h4>
              <p className="text-sm text-slate-500">PII exposure</p>
            </div>
          </div>
        </div>

        {/* Right — Form Card */}
        <div className="w-full max-w-md relative">
          {/* Decorative glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-teal-600/20 to-emerald-600/20 rounded-[2rem] blur-xl opacity-60"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-3xl"></div>
          <div className="relative glass-card rounded-3xl overflow-hidden">
            {citizenId ? <ReportForm citizenId={citizenId} /> : <CitizenLogin />}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.04] py-6 text-center text-slate-600 text-sm">
        <p>Built for the 2026 GovTech Hackathon. <span className="text-slate-500">Secured by design.</span></p>
      </footer>
    </div>
  );
}
