'use client';

import { useState, useRef, useEffect } from 'react';
import { submitReport } from '@/app/actions/submit-report';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Loader2, CheckCircle, AlertTriangle, Mic, MicOff, Shield } from 'lucide-react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading Map...</div> 
});

export default function ReportForm({ citizenId }: { citizenId: string }) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; duplicateOf?: string; message?: string; data?: any; error?: string; } | null>(null);
  
  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check for browser speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Default to Indian English, handles Hindi mix well
      
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setDescription(transcript);
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !lat || !lng) return;

    setIsSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('lat', lat.toString());
    formData.append('lng', lng.toString());
    formData.append('description', description);
    formData.append('citizen_id', citizenId);

    const response = await submitReport(formData);
    
    setIsSubmitting(false);
    setResult(response);
  };

  // Skeleton loader while AI is analyzing
  if (isSubmitting) {
    return (
      <div className="p-6 md:p-8 space-y-5">
        <div className="text-center mb-6">
          <Loader2 className="w-10 h-10 text-teal-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold text-slate-900 mb-1">AI Analyzing...</h3>
          <p className="text-sm text-slate-500">Scanning image for hazards, classifying severity, and routing to the right department.</p>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 animate-pulse w-3/4 rounded-lg"></div>
          <div className="h-4 bg-slate-200 animate-pulse w-1/2 rounded-lg"></div>
          <div className="h-20 bg-slate-200 animate-pulse w-full rounded-xl"></div>
          <div className="h-4 bg-slate-200 animate-pulse w-2/3 rounded-lg"></div>
          <div className="h-12 bg-slate-200 animate-pulse w-full rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="p-8 text-center">
        {result.duplicateOf ? (
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <CheckCircle className="w-8 h-8 text-teal-500" />
          </div>
        )}
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          {result.duplicateOf ? 'Duplicate Detected' : 'Report Received!'}
        </h3>
        <p className="text-slate-600 mb-6">{result.message}</p>
        {result.data && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 text-sm space-y-2">
            <p className="text-slate-600"><span className="font-semibold text-slate-900">AI Category:</span> {result.data.ai_category}</p>
            <p className="text-slate-600">
              <span className="font-semibold text-slate-900">Severity:</span>{' '}
              <span className={result.data.ai_severity > 80 ? 'text-orange-600 font-bold' : result.data.ai_severity > 50 ? 'text-amber-500 font-bold' : 'text-teal-600 font-bold'}>
                {result.data.ai_severity}/100
              </span>
            </p>
            <p className="text-slate-500 italic text-xs mt-2 border-t border-slate-200 pt-2">&quot;{result.data.ai_justification}&quot;</p>
          </div>
        )}
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm">
            Submit Another
          </Button>
          <NextLink href="/my-reports" className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-md shadow-teal-500/20">
            Track My Reports
          </NextLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Report an Issue</h2>
        <p className="text-slate-500 text-sm">Help keep our city safe. Your location is privacy-protected.</p>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 px-3 py-2 rounded-lg text-xs text-teal-700">
        <Shield size={14} className="text-teal-600" />
        <span className="font-medium">EXIF stripped • Location fuzzed ±200m • Verified</span>
      </div>

      {/* Map Section */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <MapPin size={14} /> Pin the Location
        </label>
        <div className="h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative z-0 shadow-inner">
          <Map onLocationSelect={(lat, lng) => { setLat(lat); setLng(lng); }} />
        </div>
        {lat && lng && (
          <p className="text-xs text-teal-600 font-mono font-medium">📍 Location captured securely</p>
        )}
      </div>

      {/* Photo Section */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Camera size={14} /> Upload Photo Evidence
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`h-36 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${preview ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 hover:border-teal-400 hover:bg-teal-50/30 bg-slate-50'}`}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-lg" />
            </>
          ) : (
            <div className="text-center text-slate-500">
              <Camera size={28} className="mx-auto mb-2 text-slate-400" />
              <span className="text-sm font-medium">Tap to take a photo</span>
            </div>
          )}
        </div>
        <input 
          type="file" 
          accept="image/jpeg,image/png,image/webp" 
          capture="environment"
          ref={fileInputRef}
          className="hidden" 
          onChange={handleImageChange}
        />
      </div>

      {/* Description Section with Voice Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Description (Optional)</span>
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${isListening ? 'bg-red-50 border border-red-200 text-red-600 animate-pulse' : 'bg-white border border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'}`}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              {isListening ? 'Stop' : 'Voice'}
            </button>
          )}
        </label>
        <textarea 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all duration-200 hover:bg-white text-sm shadow-sm"
          placeholder={isListening ? "🎤 Listening... speak now" : "Add any additional details, or use voice input..."}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {result?.error && (
        <div className="bg-orange-50 border border-orange-200 text-orange-600 p-3 rounded-xl text-sm font-medium">
          {result.error}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white py-6 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg shadow-teal-500/25 mt-2"
        disabled={!image || !lat || !lng || isSubmitting}
      >
        Submit Report
      </Button>
    </form>
  );
}
