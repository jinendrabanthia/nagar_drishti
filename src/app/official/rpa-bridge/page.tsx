import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import RPASimulator from '@/components/RPASimulator';
import { fetchRPAList } from '@/app/actions/export-rpa';

export default async function RPABridgePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('official_session')?.value;

  if (!session) {
    redirect('/official/login');
  }

  const res = await fetchRPAList();

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-100/50 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
      </div>
      <div className="relative z-10">
        <RPASimulator initialList={res.data || []} />
      </div>
    </div>
  );
}
