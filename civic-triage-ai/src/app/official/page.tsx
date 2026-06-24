import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { supabase } from '@/lib/supabase';

export default async function OfficialPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('official_session')?.value;

  if (!session) {
    redirect('/official/login');
  }

  // Verify the session is actually valid
  const { data: official } = await supabase
    .from('officials')
    .select('id, name')
    .eq('id', session)
    .single();

  if (!official) {
    // Invalid session, redirect to login
    redirect('/official/login');
  }

  return <DashboardClient officialName={official.name} />;
}
