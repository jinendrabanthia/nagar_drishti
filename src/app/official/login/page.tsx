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

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-sm transition-all duration-200 hover:bg-white/[0.06]";

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-3xl blur-lg"></div>
        <form onSubmit={handleSubmit} className="relative glass-card p-8 rounded-3xl space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 civic-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Command Center</h2>
            <p className="text-slate-500 text-sm flex items-center justify-center gap-1.5">
              <Lock size={12} /> Official Authorized Access Only
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Official Email</label>
              <input 
                type="email"
                className={inputClass}
                placeholder="you@municipality.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
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
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-sm text-center">
              ⏳ {pendingMessage}
            </div>
          )}

          {error && (
            <div className="bg-[#C2410C]/10 border border-[#C2410C]/30 text-[#EA580C] p-3 rounded-xl text-sm text-center">
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

          <div className="text-center pt-1 space-y-2">
            <NextLink href="/official/register" className="text-sm text-teal-400 hover:text-teal-300 transition-colors block">
              New official? Register here
            </NextLink>
            <NextLink href="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors block">
              ← Back to Citizen Portal
            </NextLink>
          </div>
        </form>
      </div>
    </div>
  );
}
