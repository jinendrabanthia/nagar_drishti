import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import NextLink from 'next/link';
import { ArrowLeft, User, ShieldCheck, Mail, Phone, LogOut, MapPin, Globe } from 'lucide-react';

export default async function ProfilePage() {
  const citizenId = (await cookies()).get('citizen_id')?.value;

  if (!citizenId) {
    redirect('/');
  }

  // Fetch citizen data — select ONLY safe columns (never expose password_hash)
  const { data: citizen } = await supabase
    .from('citizens')
    .select('id, aadhar_last4, state, city, preferred_language, created_at')
    .eq('id', citizenId)
    .single();

  if (!citizen) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-100/50 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
      </div>

      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <NextLink href="/" className="text-slate-500 hover:text-teal-600 transition-colors flex items-center gap-2 font-medium">
            <ArrowLeft className="w-5 h-5" /> Back
          </NextLink>
          <div className="font-bold text-lg tracking-tight">Profile</div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 animate-fade-in-up relative z-10">
        <div className="glass-card-premium rounded-3xl p-8 mb-8 relative overflow-hidden border border-white/60 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/50 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-500/20">
              <User size={40} />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Citizen Profile</h1>
              <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 font-medium border border-teal-100">
                <ShieldCheck size={16} /> Aadhar Verified
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 relative z-10">
            <div className="bg-white/60 border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Aadhar Number</p>
                <p className="text-lg font-mono text-slate-900">
                  XXXX-XXXX-{citizen.aadhar_last4}
                </p>
              </div>
            </div>

            <div className="bg-white/60 border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-sm font-medium text-slate-800">{citizen.city}, {citizen.state}</p>
              </div>
            </div>

            <div className="bg-white/60 border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Language</p>
                <p className="text-sm font-medium text-slate-800">{citizen.preferred_language?.toUpperCase() || 'EN'}</p>
              </div>
            </div>
            
            <div className="bg-white/60 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 opacity-60">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email Notification</p>
                <p className="text-sm font-medium text-slate-600 italic">Not set (Coming soon)</p>
              </div>
            </div>

            <div className="bg-white/60 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 opacity-60">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">SMS Alerts</p>
                <p className="text-sm font-medium text-slate-600 italic">Not set (Coming soon)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <form action={async () => {
            'use server';
            const { cookies } = await import('next/headers');
            (await cookies()).delete('citizen_id');
            (await cookies()).delete('official_session');
            const { redirect } = await import('next/navigation');
            redirect('/');
          }}>
            <button type="submit" className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-medium transition-colors">
              <LogOut size={18} /> Sign Out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
