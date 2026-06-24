'use client';

import { useState, useRef } from 'react';
import { registerOfficial } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Upload, CheckCircle2 } from 'lucide-react';
import { INDIAN_STATES, getCitiesForState } from '@/lib/india-states-cities';
import NextLink from 'next/link';

export default function OfficialRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [idCard, setIdCard] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cities = state ? getCitiesForState(state) : [];

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('ID card image must be under 5MB');
        return;
      }
      setIdCard(file);
      setIdCardPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!name || !email || !password || !state || !city) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsSubmitting(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }
    if (!idCard) {
      setError('Please upload your Government ID card.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('id_card', idCard);

    const res = await registerOfficial(formData);
    if (!res.success) {
      setError(res.error || 'Registration failed');
      setIsSubmitting(false);
    } else {
      setRegistered(true);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Registration Submitted!</h2>
          <p className="text-slate-400 leading-relaxed">
            Your application has been submitted for verification. An administrator will review your Government ID and approve your account.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-400 text-sm font-medium">⏳ Status: Pending Verification</p>
          </div>
          <NextLink
            href="/official/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Go to Login
          </NextLink>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const selectClass = "w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full space-y-5">
        <div className="text-center">
          <ShieldCheck className="w-14 h-14 text-blue-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-1">Official Registration</h2>
          <p className="text-slate-400 text-sm">Register as a City Official. Your identity will be verified before access is granted.</p>
        </div>

        <div className="space-y-3">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-200">Full Name</label>
            <input type="text" className={inputClass} placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-200">Official Email</label>
            <input type="email" className={inputClass} placeholder="you@municipality.gov.in" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <input type="password" className={inputClass} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">Confirm</label>
              <input type="password" className={inputClass} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>

          {/* State / City */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">State</label>
              <select className={selectClass} value={state} onChange={(e) => { setState(e.target.value); setCity(''); }}>
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">City</label>
              <select className={selectClass} value={city} onChange={(e) => setCity(e.target.value)} disabled={!state}>
                <option value="">Select City</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* ID Card Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-200">Government / Municipal ID Card</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer transition-colors min-h-[80px] ${idCardPreview ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'}`}
            >
              {idCardPreview ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={idCardPreview} alt="ID Preview" className="h-16 w-auto rounded-lg object-cover" />
                  <div className="text-left">
                    <p className="text-sm text-green-400 font-medium">ID Card Uploaded</p>
                    <p className="text-xs text-slate-500">{idCard?.name}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <Upload size={20} className="mx-auto mb-1 opacity-50" />
                  <span className="text-sm">Click to upload ID card</span>
                  <p className="text-xs text-slate-500 mt-0.5">JPG, PNG or PDF, max 5MB</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              ref={fileInputRef}
              className="hidden"
              onChange={handleIdCardChange}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold text-lg transition-all active:scale-[0.98]"
          disabled={isSubmitting || !name || !email || !password || !state || !city || !idCard}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit for Verification'
          )}
        </Button>

        <div className="text-center pt-1">
          <NextLink href="/official/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Already verified? Log In
          </NextLink>
        </div>
      </form>
    </div>
  );
}
