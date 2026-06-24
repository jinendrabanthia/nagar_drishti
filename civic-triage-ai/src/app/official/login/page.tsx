'use client';

import { useState } from 'react';
import { loginOfficial } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OfficialLogin() {
  const [specialId, setSpecialId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!specialId || specialId.length < 5) {
      setError("Please enter a valid Special ID Pass.");
      setIsSubmitting(false);
      return;
    }

    const res = await loginOfficial(specialId);
    if (!res.success) {
      setError(res.error || 'Failed to authenticate');
      setIsSubmitting(false);
    } else {
      router.push('/official');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-6">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-1">Command Center</h2>
          <p className="text-slate-400 text-sm">Official Authorized Access Only</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Special ID Pass</label>
          <input 
            type="password"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg tracking-widest text-center font-mono"
            placeholder="Enter ID Pass"
            value={specialId}
            onChange={(e) => setSpecialId(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold text-lg transition-all active:scale-[0.98]"
          disabled={isSubmitting || !specialId}
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
      </form>
    </div>
  );
}
