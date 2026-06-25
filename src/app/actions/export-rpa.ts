'use server';

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

async function requireOfficialAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('official_session')?.value;
  if (!session) throw new Error('Unauthorized');
  
  const { data: official } = await supabaseAdmin
    .from('officials')
    .select('id, verification_status')
    .eq('id', session)
    .single();
    
  if (!official || official.verification_status !== 'approved') {
    throw new Error('Unauthorized: Official not approved');
  }
  return session;
}

// Simulates transforming our modern schema into a legacy municipality XML/JSON format
export async function generateRPAPayload(reportId: string) {
  await requireOfficialAuth();
  
  const { data: report } = await supabaseAdmin
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (!report) return { success: false, error: 'Report not found' };

  // Transform into a legacy-looking format
  const payload = {
    TicketID: `CIVIC-${report.id.split('-')[0].toUpperCase()}`,
    DateLogged: new Date(report.created_at).toISOString().split('T')[0],
    TimeLogged: new Date(report.created_at).toISOString().split('T')[1].split('.')[0],
    PriorityCode: report.is_emergency ? 'P0-CRITICAL' : report.ai_severity > 80 ? 'P1-HIGH' : 'P3-ROUTINE',
    AssignedDept: report.ai_suggested_department?.toUpperCase() || 'GENERAL',
    GIS_Lat: report.lat.toFixed(6),
    GIS_Long: report.lng.toFixed(6),
    WardPin: report.pin_code || 'UNKNOWN',
    IssueDesc: report.description_translated || report.description || report.ai_category,
    AIAssessment: report.ai_justification,
    StatusMark: 'OPEN_NEW',
    AttachmentURL: report.image_url
  };

  return { success: true, data: payload };
}

export async function fetchRPAList() {
  await requireOfficialAuth();
  const { data } = await supabaseAdmin
    .from('reports')
    .select('id, ai_category, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  return { success: true, data };
}
