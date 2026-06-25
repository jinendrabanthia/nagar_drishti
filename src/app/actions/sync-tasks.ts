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

export async function syncOfflineTasks(updates: any[]) {
  try {
    await requireOfficialAuth();
    for (const update of updates) {
      let resolvedImageUrl = null;

      // If there's an image, we need to upload it
      if (update.imageBase64 && update.imageType) {
        // Convert base64 back to buffer
        const buffer = Buffer.from(update.imageBase64, 'base64');
        const fileName = `resolved-offline-${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabaseAdmin.storage
          .from('report-images')
          .upload(fileName, buffer, { contentType: update.imageType });

        if (!uploadError) {
          resolvedImageUrl = supabase.storage.from('report-images').getPublicUrl(fileName).data.publicUrl;
        }
      }

      const updateData: any = {
        status: update.status,
        field_notes: update.fieldNotes,
      };

      if (resolvedImageUrl) {
        updateData.resolved_image_url = resolvedImageUrl;
        updateData.resolved_at = new Date(update.queuedAt).toISOString();
      } else if (update.status === 'resolved') {
        updateData.resolved_at = new Date(update.queuedAt).toISOString();
      }

      await supabaseAdmin
        .from('reports')
        .update(updateData)
        .eq('id', update.reportId);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, error: 'Failed to sync offline tasks' };
  }
}
