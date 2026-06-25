'use client';

import { useState, useRef } from 'react';
import { registerOfficial } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, Upload, CheckCircle2, Shield } from 'lucide-react';
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
      if (file.size > 10 * 1024 * 1024) {
        setError('ID card image must be under 10MB');
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-100/50 blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
        </div>
        <div className="glass-card-premium p-10 rounded-3xl max-w-md w-full text-center space-y-6 border border-white/60 shadow-xl relative z-10">
          <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
            <CheckCircle2 className="w-10 h-10 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Registration Submitted!</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            Your application has been submitted for verification. An administrator will review your Government ID and approve your account.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-700 text-sm font-medium">⏳ Status: Pending Verification</p>
          </div>
          <div className="bg-white/60 border border-slate-200 rounded-xl p-3 flex items-center gap-2 text-xs text-slate-500">
            <Shield size={14} className="text-teal-600" />
            Your ID card is stored in a private, encrypted bucket and is only accessible via time-limited signed URLs.
          </div>
          <NextLink
            href="/official/login"
            className="inline-block civic-gradient text-white px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90 shadow-lg shadow-teal-600/20"
          >
            Go to Login
          </NextLink>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-sm transition-all duration-200 shadow-sm";
  const selectClass = "w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm appearance-none cursor-pointer transition-all duration-200 shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-3xl blur-lg"></div>
        <form onSubmit={handleSubmit} className="relative glass-card-premium p-6 md:p-8 rounded-3xl space-y-5 border border-white/60 shadow-xl">
          <div className="text-center">
            <div className="w-14 h-14 civic-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Official Registration</h2>
            <p className="text-slate-500 text-sm">Your identity will be verified before access is granted.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input type="text" className={inputClass} placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Official Email</label>
              <input type="email" className={inputClass} placeholder="you@municipality.gov.in" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                <input type="password" className={inputClass} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm</label>
                <input type="password" className={inputClass} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">State</label>
                <select className={selectClass} value={state} onChange={(e) => { setState(e.target.value); setCity(''); }}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City</label>
                <select className={selectClass} value={city} onChange={(e) => setCity(e.target.value)} disabled={!state}>
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* ID Card Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Government / Municipal ID Card</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center cursor-pointer transition-all duration-200 min-h-[80px] ${idCardPreview ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 bg-slate-50'}`}
              >
                {idCardPreview ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={idCardPreview} alt="ID Preview" className="h-16 w-auto rounded-lg object-cover" />
                    <div className="text-left">
                      <p className="text-sm text-teal-600 font-medium">ID Card Uploaded</p>
                      <p className="text-xs text-slate-500">{idCard?.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    <Upload size={20} className="mx-auto mb-1 opacity-40" />
                    <span className="text-sm">Click to upload ID card</span>
                    <p className="text-xs text-slate-600 mt-0.5">JPEG, PNG or WebP, max 10MB • Stored privately</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                className="hidden"
                onChange={handleIdCardChange}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full civic-gradient hover:opacity-90 text-white py-6 rounded-xl font-semibold text-lg transition-all active:scale-[0.98] shadow-lg shadow-teal-600/20"
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
            <NextLink href="/official/login" className="text-sm text-teal-600 hover:text-teal-700 transition-colors">
              Already verified? Log In
            </NextLink>
          </div>
        </form>
      </div>
    </div>
  );
}
