'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function registerCitizen(aadharNumber: string, passwordStr: string) {
  if (!aadharNumber || aadharNumber.trim().length !== 12 || isNaN(Number(aadharNumber))) {
    return { success: false, error: 'A valid 12-digit Aadhar number is required' };
  }
  if (!passwordStr || passwordStr.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }

  try {
    // 1. Check if citizen already exists
    const { data: existingCitizen } = await supabase
      .from('citizens')
      .select('id')
      .eq('aadhar_number', aadharNumber)
      .single();

    if (existingCitizen) {
      return { success: false, error: 'Aadhar number is already registered. Please log in.' };
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordStr, salt);

    // 3. Create citizen
    const { data: newCitizen, error } = await supabase
      .from('citizens')
      .insert([{ 
        aadhar_number: aadharNumber, 
        password_hash: passwordHash,
        is_aadhar_verified: true // Simulated
      }])
      .select()
      .single();
    
    if (error) throw error;

    // 4. Set cookie
    (await cookies()).set('citizen_id', newCitizen.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
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

  try {
    // 1. Fetch citizen
    const { data: citizen, error } = await supabase
      .from('citizens')
      .select('id, password_hash')
      .eq('aadhar_number', aadharNumber)
      .single();

    if (error || !citizen) {
       return { success: false, error: 'Invalid Aadhar number or password' };
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(passwordStr, citizen.password_hash);
    if (!isMatch) {
       return { success: false, error: 'Invalid Aadhar number or password' };
    }

    // 3. Set cookie
    (await cookies()).set('citizen_id', citizen.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Citizen Login Error:", error);
    return { success: false, error: 'Failed to authenticate' };
  }
}

export async function loginOfficial(specialIdPass: string) {
  if (!specialIdPass) {
    return { success: false, error: 'Special ID Pass is required' };
  }

  try {
    const { data: official } = await supabase
      .from('officials')
      .select('id, name')
      .eq('special_id_pass', specialIdPass)
      .single();

    if (!official) {
      return { success: false, error: 'Invalid Special ID Pass' };
    }

    (await cookies()).set('official_session', official.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
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
