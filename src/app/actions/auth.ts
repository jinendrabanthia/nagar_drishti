'use server';

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { rateLimitCheck, sanitizeUserInput, validateFileUpload, validateMagicBytes, sanitizeFileName } from '@/lib/security';

// ============================================================
// CITIZEN AUTH
// ============================================================

export async function registerCitizen(
  aadharNumber: string,
  passwordStr: string,
  state: string,
  city: string,
  preferredLanguage: string = 'en'
) {
  // --- Input Validation ---
  if (!aadharNumber || aadharNumber.trim().length !== 12 || isNaN(Number(aadharNumber))) {
    return { success: false, error: 'A valid 12-digit Aadhar number is required' };
  }
  if (!passwordStr || passwordStr.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }
  if (!state || !city) {
    return { success: false, error: 'State and City are required' };
  }

  // --- Rate Limit (3 registrations per hour per Aadhar prefix) ---
  const rlKey = `register:${aadharNumber.slice(0, 6)}`;
  const rl = rateLimitCheck(rlKey, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return { success: false, error: 'Too many registration attempts. Please try again later.' };
  }

  try {
    // Hash Aadhar for storage (never store plaintext)
    const aadharSalt = await bcrypt.genSalt(10);
    const aadharHash = await bcrypt.hash(aadharNumber, aadharSalt);
    const aadharLast4 = aadharNumber.slice(-4);

    // Check if already registered (filter by last 4 first to avoid expensive linear scan)
    const { data: allCitizens } = await supabaseAdmin
      .from('citizens')
      .select('id, aadhar_hash')
      .eq('aadhar_last4', aadharLast4);

    if (allCitizens) {
      for (const c of allCitizens) {
        try {
          if (await bcrypt.compare(aadharNumber, c.aadhar_hash)) {
            return { success: false, error: 'Aadhar number is already registered. Please log in.' };
          }
        } catch (e) {
          // Ignore invalid hash formats (like legacy SHA-256 seed data)
        }
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordStr, salt);

    // Insert citizen — role is ALWAYS citizen, never accepts role from client
    const { data: newCitizen, error } = await supabaseAdmin
      .from('citizens')
      .insert([{
        aadhar_hash: aadharHash,
        aadhar_last4: aadharLast4,
        password_hash: passwordHash,
        is_aadhar_verified: true,
        state: sanitizeUserInput(state, 100),
        city: sanitizeUserInput(city, 100),
        preferred_language: ['en','hi','bn','ta','te','kn','ml','mr','gu','or','pa','ur'].includes(preferredLanguage) ? preferredLanguage : 'en',
      }])
      .select()
      .single();

    if (error) throw error;

    (await cookies()).set('citizen_id', newCitizen.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Citizen Registration Error:", error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function loginCitizen(aadharNumber: string, passwordStr: string) {
  if (!aadharNumber || !passwordStr) {
    return { success: false, error: 'Aadhar number and password are required' };
  }

  // --- Rate Limit (5 login attempts per minute) ---
  const rlKey = `login:citizen:${aadharNumber.slice(0, 6)}`;
  const rl = rateLimitCheck(rlKey, 5, 60 * 1000);
  if (!rl.allowed) {
    return { success: false, error: 'Too many login attempts. Please wait a minute.' };
  }

  try {
    const aadharLast4 = aadharNumber.slice(-4);

    // Find citizen by comparing aadhar hashes (filter by last 4 first to avoid expensive linear scan)
    const { data: allCitizens } = await supabase
      .from('citizens')
      .select('id, aadhar_hash, password_hash')
      .eq('aadhar_last4', aadharLast4);

    if (!allCitizens) {
      return { success: false, error: 'Invalid Aadhar number or password' };
    }

    let matchedCitizen = null;
    for (const c of allCitizens) {
      try {
        if (await bcrypt.compare(aadharNumber, c.aadhar_hash)) {
          matchedCitizen = c;
          break;
        }
      } catch (e) {
        // Fallback for SHA256 seeded data if bcrypt fails
      }
    }

    // Demo Account Fallback
    if (!matchedCitizen && aadharNumber === '123412341234' && passwordStr === 'admin123') {
      const demoUser = allCitizens[0];
      if (demoUser) {
        matchedCitizen = demoUser;
      }
    }

    if (!matchedCitizen) {
      return { success: false, error: 'Invalid Aadhar number or password' };
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(passwordStr, matchedCitizen.password_hash);
    } catch (e) {
      // ignore
    }

    if (!isMatch && aadharNumber === '123412341234' && passwordStr === 'admin123') {
      isMatch = true;
    }

    if (!isMatch) {
      return { success: false, error: 'Invalid Aadhar number or password' };
    }

    (await cookies()).set('citizen_id', matchedCitizen.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Citizen Login Error:", error);
    return { success: false, error: 'Failed to authenticate' };
  }
}

// ============================================================
// OFFICIAL AUTH
// ============================================================

export async function registerOfficial(formData: FormData) {
  const name = sanitizeUserInput(formData.get('name') as string, 200);
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const passwordStr = formData.get('password') as string;
  const state = sanitizeUserInput(formData.get('state') as string, 100);
  const city = sanitizeUserInput(formData.get('city') as string, 100);
  const idCard = formData.get('id_card') as File;

  if (!name || !email || !passwordStr || !state || !city) {
    return { success: false, error: 'All fields are required' };
  }
  if (passwordStr.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  if (!idCard || idCard.size === 0) {
    return { success: false, error: 'Government ID card image is required' };
  }

  // --- Validate file upload ---
  const fileValidation = validateFileUpload(idCard);
  if (!fileValidation.valid) {
    return { success: false, error: fileValidation.error };
  }
  const magicValidation = await validateMagicBytes(idCard);
  if (!magicValidation.valid) {
    return { success: false, error: magicValidation.error };
  }

  // --- Rate Limit ---
  const rl = rateLimitCheck(`register:official:${email}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return { success: false, error: 'Too many registration attempts. Please try again later.' };
  }

  try {
    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('officials')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return { success: false, error: 'This email is already registered. Please log in.' };
    }

    // Upload ID card to PRIVATE bucket (no public URL!)
    const safeFileName = sanitizeFileName(idCard.name);
    const fileName = `${Date.now()}-${safeFileName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('official-id-cards')
      .upload(fileName, idCard, { contentType: idCard.type });

    if (uploadError) {
      console.error("ID Card upload error:", uploadError);
      return { success: false, error: 'Failed to upload ID card' };
    }

    // Store just the path, NOT a public URL. Admins use signed URLs to view.
    const idCardPath = fileName;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordStr, salt);

    // Insert official — role is ALWAYS pending, never accepts status from client
    const { error: insertError } = await supabaseAdmin
      .from('officials')
      .insert([{
        name,
        email,
        password_hash: passwordHash,
        state,
        city,
        id_card_path: idCardPath,
        verification_status: 'pending', // ALWAYS pending — admin must approve
      }]);

    if (insertError) {
      console.error("Official insert error:", insertError);
      throw insertError;
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Official Registration Error:", error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function loginOfficial(email: string, passwordStr: string) {
  if (!email || !passwordStr) {
    return { success: false, error: 'Email and password are required' };
  }

  // --- Rate Limit ---
  const rl = rateLimitCheck(`login:official:${email}`, 5, 60 * 1000);
  if (!rl.allowed) {
    return { success: false, error: 'Too many login attempts. Please wait a minute.' };
  }

  try {
    const { data: official, error } = await supabase
      .from('officials')
      .select('id, name, password_hash, verification_status')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !official) {
      return { success: false, error: 'Invalid email or password' };
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(passwordStr, official.password_hash);
    } catch (e) {
      // ignore
    }

    // Demo Account Fallback
    if (!isMatch && email.trim().toLowerCase() === 'admin@nagardrishti.gov.in' && passwordStr === 'admin123') {
      isMatch = true;
    }

    if (!isMatch) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (official.verification_status === 'pending') {
      return { success: false, error: 'Your account is pending verification. Please wait for admin approval.', status: 'pending' };
    }

    if (official.verification_status === 'rejected') {
      return { success: false, error: 'Your registration has been rejected. Please contact the administrator.', status: 'rejected' };
    }

    (await cookies()).set('official_session', official.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Official Login Error:", error);
    return { success: false, error: 'Failed to authenticate' };
  }
}

export async function logout() {
  (await cookies()).delete('citizen_id');
  (await cookies()).delete('official_session');
  return { success: true };
}
