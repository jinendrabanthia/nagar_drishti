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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-100/50 blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
        </div>
        <div className="glass-card-premium border border-white/60 p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 relative z-10">
          {official.verification_status === 'pending' ? (
            <>
              <Clock className="w-20 h-20 text-amber-500 mx-auto" />
              <h2 className="text-2xl font-bold text-slate-900">Verification Pending</h2>
              <p className="text-slate-600 leading-relaxed">
                Your account is awaiting admin verification. You will be able to access the Command Center once your Government ID has been reviewed and approved.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-700 text-sm font-medium">⏳ Status: Pending Review</p>
              </div>
            </>
          ) : (
            <>
              <ShieldCheck className="w-20 h-20 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
              <p className="text-slate-600 leading-relaxed">
                Your registration has been rejected. Please contact the city administrator for more information.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm font-medium">❌ Status: Rejected</p>
              </div>
            </>
          )}
          <NextLink
            href="/"
            className="inline-block bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-medium transition-colors border border-slate-200 shadow-sm"
          >
            Back to Home
          </NextLink>
        </div>
      </div>
    );
  }

  return <DashboardClient officialName={official.name} />;
}
