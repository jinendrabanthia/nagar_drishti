'use client';

import { useState } from 'react';
import { loginCitizen, registerCitizen } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Loader2, Fingerprint, Globe } from 'lucide-react';
import { INDIAN_STATES, getCitiesForState } from '@/lib/india-states-cities';

export default function CitizenLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [aadhar, setAadhar] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cities = state ? getCitiesForState(state) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (aadhar.length !== 12 || isNaN(Number(aadhar))) {
      setError("Please enter a valid 12-digit Aadhar number.");
      setIsSubmitting(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && (!state || !city)) {
      setError("Please select your State and City.");
      setIsSubmitting(false);
      return;
    }

    if (isLogin) {
      const res = await loginCitizen(aadhar, password);
      if (!res.success) {
        setError(res.error || 'Failed to login');
        setIsSubmitting(false);
      } else {
        window.location.reload();
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const res = await registerCitizen(aadhar, password, state, city, preferredLanguage);
      if (!res.success) {
        setError(res.error || 'Failed to register');
        setIsSubmitting(false);
      } else {
        window.location.reload();
      }
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 text-sm transition-all duration-200 hover:bg-slate-100/50";
  const selectClass = "w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm appearance-none cursor-pointer transition-all duration-200 hover:bg-slate-100/50";

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
          <Fingerprint className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-slate-500 text-sm">{isLogin ? 'Log in with your Aadhar to report issues.' : 'Verify your identity to get started.'}</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aadhar Card Number</label>
          <input 
            type="text"
            maxLength={12}
            className={`${inputClass} tracking-[0.25em] text-center font-mono text-lg`}
            placeholder="XXXX XXXX XXXX"
            value={aadhar}
            onChange={(e) => setAadhar(e.target.value)}
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
          <input 
            type="password"
            className={`${inputClass} text-center font-mono text-lg`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {!isLogin && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <input 
                type="password"
                className={`${inputClass} text-center font-mono text-lg`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">State</label>
                <select
                  className={selectClass}
                  value={state}
                  onChange={(e) => { setState(e.target.value); setCity(''); }}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</label>
                <select
                  className={selectClass}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!state}
                >
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={12} /> Preferred Language
              </label>
              <select
                className={selectClass}
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
                <option value="or">Odia (ଓଡ଼ିଆ)</option>
                <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="ur">Urdu (اردو)</option>
              </select>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-orange-50 border border-orange-200 text-orange-600 p-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-6 rounded-xl font-semibold text-lg transition-all active:scale-[0.98] shadow-lg shadow-teal-600/20"
        disabled={isSubmitting || aadhar.length < 12 || password.length < 6}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isLogin ? 'Authenticating...' : 'Securing your identity...'}
          </>
        ) : (
          isLogin ? 'Login' : 'Verify & Register'
        )}
      </Button>

      <div className="text-center pt-1">
        <button 
          type="button" 
          onClick={() => { setIsLogin(!isLogin); setError(null); }} 
          className="text-sm text-teal-600 hover:text-teal-700 transition-colors font-medium"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already registered? Log In"}
        </button>
      </div>
    </form>
  );
}
