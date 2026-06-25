'use client';

import { useState } from 'react';
import { loginOfficial } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';

export default function OfficialLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingMessage(null);
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setIsSubmitting(false);
      return;
    }

    const res = await loginOfficial(email, password);
    if (!res.success) {
      if (res.status === 'pending') {
        setPendingMessage(res.error || 'Account pending verification.');
      } else {
        setError(res.error || 'Failed to authenticate');
      }
      setIsSubmitting(false);
    } else {
      router.push('/official');
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-sm transition-all duration-200 shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-teal-500/30 relative overflow-hidden">
      {/* Decorative Light Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-100/40 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-3xl blur-lg"></div>
        <form onSubmit={handleSubmit} className="relative glass-card-premium p-8 rounded-3xl space-y-6 shadow-xl border border-white/60">
          <div className="text-center">
            <div className="w-16 h-16 civic-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Command Center</h2>
            <p className="text-slate-500 text-sm flex items-center justify-center gap-1.5 font-medium">
              <Lock size={12} /> Official Authorized Access Only
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Email</label>
              <input 
                type="email"
                className={inputClass}
                placeholder="you@municipality.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <input 
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {pendingMessage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl text-sm text-center font-medium shadow-sm">
              ⏳ {pendingMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center font-medium shadow-sm">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full civic-gradient hover:opacity-90 text-white py-6 rounded-xl font-semibold text-lg transition-all active:scale-[0.98] shadow-lg shadow-teal-600/20"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Access Dashboard'
            )}
          </Button>

          <div className="text-center pt-2 space-y-3">
            <NextLink href="/official/register" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors block">
              New official? Register here
            </NextLink>
            <NextLink href="/" className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors block">
              ← Back to Citizen Portal
            </NextLink>
          </div>
        </form>
      </div>
    </div>
  );
}
