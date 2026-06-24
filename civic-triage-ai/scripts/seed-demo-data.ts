/**
 * CivicTriage AI — Demo Seed Script
 * Run: npx tsx scripts/seed-demo-data.ts
 * 
 * Inserts 75 randomized reports across Mumbai with varied categories,
 * severities, statuses, and timestamps. Also creates test officials and area assignments.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mumbai bounding box (approx)
const MUMBAI = {
  latMin: 18.89,
  latMax: 19.27,
  lngMin: 72.77,
  lngMax: 72.98,
};

const CATEGORIES = [
  'Pothole', 'Pothole', 'Pothole',  // Weighted higher
  'Street Light Out', 'Street Light Out',
  'Garbage Overflow', 'Garbage Overflow',
  'Water Leak', 'Water Leak',
  'Broken Sidewalk',
  'Open Manhole',
  'Fallen Tree',
  'Damaged Road Sign',
  'Flooding',
  'Exposed Wires',
  'Illegal Dumping',
  'Cracked Wall (Public Building)',
  'Sewer Backup',
  'Blocked Drainage',
  'Damaged Guardrail',
];

const DEPARTMENTS = [
  'Roads & Highways', 'Electricity Board', 'Sanitation', 'Water Supply',
  'Public Works', 'Parks & Gardens', 'Traffic Control', 'Drainage'
];

const STATUSES = ['open', 'open', 'open', 'in_progress', 'in_progress', 'resolved'];

const COMPLEXITIES = ['simple', 'moderate', 'complex'];

const EMERGENCY_TYPES = ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'electrical', 'sinkhole', 'flooding'];

const JUSTIFICATIONS = [
  'Moderate-sized pothole on a busy arterial road causing traffic disruption.',
  'Large accumulation of uncollected garbage near a residential area posing health risks.',
  'Street light has been non-functional for over a week, creating a safety hazard at night.',
  'Significant water leak from a burst pipe flooding the adjacent sidewalk.',
  'Broken sidewalk tiles creating tripping hazards for pedestrians, especially elderly.',
  'Open manhole cover missing on a pedestrian pathway — immediate danger.',
  'Fallen tree partially blocking road after recent storm. Branch removal needed.',
  'Damaged road sign at a major intersection reducing visibility for drivers.',
  'Minor flooding in low-lying area due to blocked drainage during rain.',
  'Exposed electrical wires near a school zone — critical safety issue.',
  'Illegal dumping of construction debris on public land.',
  'Cracked exterior wall of a public building showing structural concern.',
  'Sewer backup causing foul odor and potential contamination in residential block.',
  'Blocked drainage channel causing water stagnation and mosquito breeding.',
  'Damaged guardrail on a highway overpass — vehicle safety risk.',
];

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): string {
  const now = Date.now();
  const offset = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - offset).toISOString();
}

async function seed() {
  console.log('🌱 Starting CivicTriage AI seed...\n');

  // 1. Get the seeded admin official
  const { data: admin } = await supabase
    .from('officials')
    .select('id')
    .eq('email', 'admin@civictriage.gov.in')
    .single();

  if (!admin) {
    console.error('❌ Seeded admin not found. Run the supabase_schema.sql first.');
    process.exit(1);
  }
  
  const adminId = admin.id;
  console.log(`✅ Found admin: ${adminId}`);

  // 2. Create area assignments for Mumbai PIN codes
  const pinCodes = ['400001', '400002', '400003', '400004', '400005'];
  for (const pin of pinCodes) {
    const { error } = await supabase
      .from('area_assignments')
      .upsert({ pin_code: pin, official_id: adminId, city: 'Mumbai' }, { onConflict: 'pin_code' });
    if (error) console.warn(`  ⚠️ Area assignment ${pin}:`, error.message);
  }
  console.log(`✅ Created ${pinCodes.length} area assignments`);

  // 3. Generate 75 fake reports
  const reports = [];
  for (let i = 0; i < 75; i++) {
    const lat = randomInRange(MUMBAI.latMin, MUMBAI.latMax);
    const lng = randomInRange(MUMBAI.lngMin, MUMBAI.lngMax);
    const category = randomItem(CATEGORIES);
    const status = randomItem(STATUSES);
    const severity = Math.floor(Math.random() * 85) + 15; // 15-100
    const emergencyType = randomItem(EMERGENCY_TYPES);
    const isEmergency = emergencyType !== 'none';
    const displayLatOffset = (Math.random() - 0.5) * 0.004;
    const displayLngOffset = (Math.random() - 0.5) * 0.004;

    reports.push({
      location: `POINT(${lng} ${lat})`,
      lat,
      lng,
      display_lat: parseFloat((lat + displayLatOffset).toFixed(6)),
      display_lng: parseFloat((lng + displayLngOffset).toFixed(6)),
      image_url: `https://picsum.photos/seed/${i + 100}/400/300`, // Random placeholder image
      description: randomItem(JUSTIFICATIONS),
      ai_category: category,
      ai_severity: isEmergency ? 100 : severity,
      ai_confidence: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)),
      ai_justification: randomItem(JUSTIFICATIONS),
      ai_suggested_department: randomItem(DEPARTMENTS),
      ai_estimated_complexity: randomItem(COMPLEXITIES),
      status,
      is_emergency: isEmergency,
      emergency_type: emergencyType,
      emergency_notified_at: isEmergency ? randomDate(7) : null,
      pin_code: randomItem(pinCodes),
      assigned_to: adminId,
      created_at: randomDate(30),
      resolved_at: status === 'resolved' ? randomDate(7) : null,
      field_notes: status === 'resolved' ? 'Issue repaired by field crew. Materials used: asphalt/concrete patch.' : null,
    });
  }

  const { error: insertError } = await supabase
    .from('reports')
    .insert(reports);

  if (insertError) {
    console.error('❌ Failed to insert reports:', insertError.message);
    process.exit(1);
  }

  console.log(`✅ Inserted 75 demo reports across Mumbai`);
  console.log('\n🎉 Seed complete! Your dashboard should now look vibrant.');
  console.log('   Official login: admin@civictriage.gov.in / admin123');
}

seed().catch(console.error);
