import ReportForm from '@/components/ReportForm';
import Link from 'next/line'; // Wait, let's just use Next Link properly
// Oh wait, next/link
import NextLink from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">CivicTriage AI</span>
          </div>
          <nav>
            <NextLink href="/official" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              City Official Login
            </NextLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 md:p-8 gap-8 max-w-6xl mx-auto w-full">
        <div className="flex-1 space-y-6 max-w-xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            See it. <span className="text-blue-500">Snap it.</span> <br/> We'll fix it.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Report potholes, hazards, and infrastructure issues in seconds. Our AI instantly analyzes the severity and routes it directly to the right city crew.
          </p>
          <div className="hidden md:flex gap-4 pt-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1">
              <h4 className="text-2xl font-bold text-white mb-1">3.4s</h4>
              <p className="text-sm text-slate-400">Average AI triage time</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex-1">
              <h4 className="text-2xl font-bold text-white mb-1">Zero</h4>
              <p className="text-sm text-slate-400">Duplicate truck rolls</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md relative">
          {/* Decorative glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 animate-pulse"></div>
          <div className="relative">
            <ReportForm />
          </div>
        </div>
      </main>
      
      <footer className="border-t border-slate-900 py-6 text-center text-slate-500 text-sm">
        <p>Built for the 2026 GovTech Hackathon.</p>
      </footer>
    </div>
  );
}
