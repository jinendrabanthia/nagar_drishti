'use server';

import { supabase } from '@/lib/supabase';
import { analyzeReportImage } from '@/lib/gemini';

// Reverse geocode lat/lng to extract PIN code using OpenStreetMap Nominatim
async function reverseGeocodeForPinCode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: { 'User-Agent': 'CivicTriageAI/1.0' }, // Required by Nominatim ToS
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.address?.postcode || null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

// Look up the area_assignments table to find the official for a given PIN code
async function findAssignedOfficial(pinCode: string, citizenCity?: string): Promise<string | null> {
  // 1. Try direct PIN code match
  const { data: assignment } = await supabase
    .from('area_assignments')
    .select('official_id')
    .eq('pin_code', pinCode)
    .single();

  if (assignment) return assignment.official_id;

  // 2. Fallback: find any approved official in the same city
  if (citizenCity) {
    const { data: cityAdmin } = await supabase
      .from('officials')
      .select('id')
      .eq('city', citizenCity)
      .eq('verification_status', 'approved')
      .limit(1)
      .single();

    if (cityAdmin) return cityAdmin.id;
  }

  // 3. Last resort: find any approved official
  const { data: anyAdmin } = await supabase
    .from('officials')
    .select('id')
    .eq('verification_status', 'approved')
    .limit(1)
    .single();

  return anyAdmin?.id || null;
}

export async function submitReport(formData: FormData) {
  try {
    const file = formData.get('image') as File;
    const latStr = formData.get('lat') as string;
    const lngStr = formData.get('lng') as string;
    const description = formData.get('description') as string;
    const citizenId = formData.get('citizen_id') as string;

    if (!file || !latStr || !lngStr || !citizenId) {
      throw new Error("Missing required fields");
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    // 1. Convert image to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    // 2. Upload image to Supabase Storage
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error: uploadError } = await supabase.storage
      .from('report-images')
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) {
      console.error("Supabase storage error:", uploadError);
      throw new Error("Failed to upload image");
    }

    const imageUrl = supabase.storage.from('report-images').getPublicUrl(fileName).data.publicUrl;

    // 3. Analyze image with Gemini
    const aiResult = await analyzeReportImage(base64Image, file.type);

    // 4. Reverse geocode for PIN code
    const pinCode = await reverseGeocodeForPinCode(lat, lng);

    // 5. Get citizen's city for fallback routing
    let citizenCity: string | undefined;
    const { data: citizen } = await supabase
      .from('citizens')
      .select('city')
      .eq('id', citizenId)
      .single();
    citizenCity = citizen?.city;

    // 6. Find assigned official
    let assignedTo: string | null = null;
    if (pinCode) {
      assignedTo = await findAssignedOfficial(pinCode, citizenCity);
    } else if (citizenCity) {
      // No PIN code found, try city-based fallback
      const { data: cityAdmin } = await supabase
        .from('officials')
        .select('id')
        .eq('city', citizenCity)
        .eq('verification_status', 'approved')
        .limit(1)
        .single();
      assignedTo = cityAdmin?.id || null;
    }
    
    // 7. Save to Database
    const reportData: Record<string, unknown> = {
      citizen_id: citizenId,
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
      status: aiResult.is_prank_or_unrelated ? 'rejected' : 'open',
      pin_code: pinCode,
      assigned_to: assignedTo,
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

    // 8. Post-process: Deduplication logic
    if (insertData && !aiResult.is_prank_or_unrelated) {
      const { data: nearbyReports, error: rpcError } = await supabase.rpc('get_reports_within_radius', {
        query_lat: lat,
        query_lng: lng,
        radius_meters: 50
      });

      if (!rpcError && nearbyReports && nearbyReports.length > 0) {
        const others = nearbyReports.filter((r: { id: string, ai_category: string }) => r.id !== insertData.id);
        
        if (others.length > 0) {
          const closest = others[0];
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

    return {
      success: true,
      data: insertData,
      message: assignedTo
        ? `Report submitted and auto-assigned to area official${pinCode ? ` (PIN: ${pinCode})` : ''}.`
        : "Report submitted successfully."
    };

  } catch (error: unknown) {
    console.error("Submit Report Error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
