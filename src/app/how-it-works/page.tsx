import React from 'react';
import NextLink from 'next/link';
import { ArrowLeft, BrainCircuit, ShieldCheck, Zap, ServerCog } from 'lucide-react';
import MagicBento from '@/components/MagicBento';

export default function HowItWorksPage() {
  const aiCards = [
    {
      color: 'rgba(255, 255, 255, 0.7)',
      title: 'Image Analysis',
      description: 'Gemini 2.5 Flash analyzes the photo for hazards.',
      label: 'Vision AI'
    },
    {
      color: 'rgba(255, 255, 255, 0.7)',
      title: 'Severity Scoring',
      description: 'Assigns a 0-100 score based on urgency and risk.',
      label: 'Scoring'
    },
    {
      color: 'rgba(255, 255, 255, 0.7)',
      title: 'Auto-Routing',
      description: 'Determines the exact city department needed.',
      label: 'Routing'
    },
    {
      color: 'rgba(255, 255, 255, 0.7)',
      title: 'Translation',
      description: 'Automatically translates local languages to English.',
      label: 'Language'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/30">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <NextLink href="/" className="text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-2 font-medium">
            <ArrowLeft className="w-5 h-5" /> Back Home
          </NextLink>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
        <div className="text-center space-y-6 mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass-card-premium px-5 py-2 rounded-full text-sm font-bold text-teal-700 shadow-sm mx-auto">
            <BrainCircuit size={16} /> The AI Engine
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            How Nagar Drishti Works
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We use Google&apos;s most advanced AI models to turn citizen reports into actionable tasks for city officials in under 4 seconds.
          </p>
        </div>

        <div className="space-y-16">
          {/* Step 1 */}
          <section className="flex flex-col md:flex-row gap-8 items-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex-1 space-y-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">1</div>
              <h2 className="text-3xl font-bold">Secure Citizen Reporting</h2>
              <p className="text-slate-600 text-lg">Citizens snap a photo of an issue. Before the image even hits our servers, EXIF data is stripped and location is fuzzed (±200m) to protect privacy.</p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2 text-slate-700"><ShieldCheck className="text-teal-500 w-5 h-5" /> Aadhar-verified accounts</li>
                <li className="flex items-center gap-2 text-slate-700"><ShieldCheck className="text-teal-500 w-5 h-5" /> PII scrubbing</li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="h-48 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse"><Zap className="text-blue-500 w-8 h-8" /></div>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="flex flex-col md:flex-row-reverse gap-8 items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex-1 space-y-4">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">2</div>
              <h2 className="text-3xl font-bold">Instant AI Triage</h2>
              <p className="text-slate-600 text-lg">Google Gemini 2.5 Flash analyzes the image and description simultaneously. It categorizes the issue, determines severity, and generates an official justification.</p>
            </div>
            <div className="flex-1 w-full">
              <MagicBento 
                cards={aiCards} 
                textAutoHide={false}
                particleCount={8}
                enableTilt={true}
                glowColor="20, 184, 166" 
              />
            </div>
          </section>

          {/* Step 3 */}
          <section className="flex flex-col md:flex-row gap-8 items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex-1 space-y-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">3</div>
              <h2 className="text-3xl font-bold">Command Center Routing</h2>
              <p className="text-slate-600 text-lg">The fully processed report appears on the Official Kanban board. Critical issues trigger immediate emergency alerts for dispatch.</p>
            </div>
            <div className="flex-1 w-full bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="space-y-4">
                <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center"><ServerCog className="w-4 h-4 text-teal-600" /></div>
                  <div className="flex-1">
                    <div className="h-2 w-24 bg-slate-300 rounded-full mb-2"></div>
                    <div className="h-2 w-48 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"><ServerCog className="w-4 h-4 text-orange-600" /></div>
                  <div className="flex-1">
                    <div className="h-2 w-32 bg-slate-300 rounded-full mb-2"></div>
                    <div className="h-2 w-40 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
