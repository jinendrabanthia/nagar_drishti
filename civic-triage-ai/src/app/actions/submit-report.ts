'use server';

import { supabase } from '@/lib/supabase';
import { analyzeReportImage } from '@/lib/gemini';

export async function submitReport(formData: FormData) {
  try {
    const file = formData.get('image') as File;
    const latStr = formData.get('lat') as string;
    const lngStr = formData.get('lng') as string;
    const description = formData.get('description') as string;

    if (!file || !latStr || !lngStr) {
      throw new Error("Missing required fields");
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    // 1. Convert image to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    // 2. Upload image to Supabase Storage
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) {
      console.error("Supabase storage error:", uploadError);
      throw new Error("Failed to upload image");
    }

    const imageUrl = supabase.storage.from('report-images').getPublicUrl(fileName).data.publicUrl;

    // 3. Analyze image with Gemini
    const aiResult = await analyzeReportImage(base64Image, file.type);
    
    // 4. Save to Database
    const reportData = {
      location: `POINT(${lng} ${lat})`,
      lat,
      lng,
      image_url: imageUrl,
      description,
      ai_category: aiResult.issue_category,
      ai_severity: aiResult.severity_score,
      ai_confidence: aiResult.confidence_score,
      ai_justification: aiResult.justification_for_severity,
      ai_suggested_department: aiResult.suggested_city_department,
      ai_estimated_complexity: aiResult.estimated_fix_complexity,
      status: aiResult.is_prank_or_unrelated ? 'rejected' : 'open'
    };

    const { data: insertData, error: dbError } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw new Error("Failed to save report to database");
    }

    // 5. Post-process: Deduplication logic
    // Call the RPC function to find duplicates within 50 meters
    if (insertData && !aiResult.is_prank_or_unrelated) {
      const { data: nearbyReports, error: rpcError } = await supabase.rpc('get_reports_within_radius', {
        query_lat: lat,
        query_lng: lng,
        radius_meters: 50
      });

      if (!rpcError && nearbyReports && nearbyReports.length > 0) {
        // Exclude the currently inserted report itself
        const others = nearbyReports.filter((r: any) => r.id !== insertData.id);
        
        if (others.length > 0) {
          const closest = others[0];
          // Simple duplicate check (could add image similarity here, but spatial + category is good for hackathon)
          if (closest.ai_category === aiResult.issue_category) {
            await supabase
              .from('reports')
              .update({ status: 'duplicate', merged_into_id: closest.id })
              .eq('id', insertData.id);
              
            return { success: true, duplicateOf: closest.id, message: `Merged with Incident #${closest.id.split('-')[0]}` };
          }
        }
      }
    }

    return { success: true, data: insertData, message: "Report submitted successfully." };

  } catch (error: any) {
    console.error("Submit Report Error:", error);
    return { success: false, error: error.message };
  }
}
