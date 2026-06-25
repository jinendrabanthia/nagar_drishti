import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { supabase } from '@/lib/supabase';
import NextLink from 'next/link';
import { ShieldCheck, Clock } from 'lucide-react';

export default async function OfficialPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('official_session')?.value;

  if (!session) {
    redirect('/official/login');
  }

  // Verify the session is actually valid and check verification status
  const { data: official } = await supabase
    .from('officials')
    .select('id, name, verification_status')
    .eq('id', session)
    .single();

  if (!official) {
    redirect('/official/login');
  }

  // Gate: only approved officials can access the dashboard
  if (official.verification_status !== 'approved') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6">
          {official.verification_status === 'pending' ? (
            <>
              <Clock className="w-20 h-20 text-amber-500 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Verification Pending</h2>
              <p className="text-slate-400 leading-relaxed">
                Your account is awaiting admin verification. You will be able to access the Command Center once your Government ID has been reviewed and approved.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-400 text-sm font-medium">⏳ Status: Pending Review</p>
              </div>
            </>
          ) : (
            <>
              <ShieldCheck className="w-20 h-20 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Access Denied</h2>
              <p className="text-slate-400 leading-relaxed">
                Your registration has been rejected. Please contact the city administrator for more information.
              </p>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm font-medium">❌ Status: Rejected</p>
              </div>
            </>
          )}
          <NextLink
            href="/"
            className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-slate-700"
          >
            Back to Home
          </NextLink>
        </div>
      </div>
    );
  }

  return <DashboardClient officialName={official.name} />;
}
