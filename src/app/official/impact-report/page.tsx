import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateImpactReport } from '@/app/actions/generate-impact-report';
import ImpactReportView from '@/components/ImpactReportView';

export default async function ImpactReportPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('official_session')?.value;

  if (!session) {
    redirect('/official/login');
  }

  const reportRes = await generateImpactReport();

  if (!reportRes.success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-100/50 blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center relative z-10 shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-red-700">{reportRes.error}</p>
        </div>
      </div>
    );
  }

  return <ImpactReportView data={reportRes.data} />;
}
