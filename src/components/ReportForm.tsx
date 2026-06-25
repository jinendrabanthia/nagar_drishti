'use client';

import { useState, useRef, useEffect } from 'react';
import { submitReport } from '@/app/actions/submit-report';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Loader2, CheckCircle, AlertTriangle, Mic, MicOff, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm animate-pulse rounded-xl">Loading Map...</div> 
});

export default function ReportForm({ citizenId }: { citizenId: string }) {
  const [step, setStep] = useState(1);
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
      // Auto advance to next step after a short delay
      setTimeout(() => setStep(2), 600);
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

    try {
      const response = await submitReport(formData);
      setIsSubmitting(false);
      setResult(response);
    } catch (error) {
      setIsSubmitting(false);
      setResult({ 
        success: false, 
        error: "Network error. Please check your connection and try again." 
      });
    }
  };

  // Skeleton loader while AI is analyzing
  if (isSubmitting) {
    return (
      <div className="p-6 md:p-8 space-y-5 animate-fade-in-up">
        <div className="text-center mb-6">
          <Loader2 className="w-12 h-12 text-teal-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">AI Analyzing...</h3>
          <p className="text-slate-500">Scanning image for hazards, classifying severity, and routing to the right department.</p>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-4 w-3/4"></div>
          <div className="skeleton h-4 w-1/2"></div>
          <div className="skeleton h-24 w-full"></div>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="p-8 text-center animate-scale-in">
        {result.duplicateOf ? (
          <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-inner">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-teal-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-teal-100 shadow-inner">
            <CheckCircle className="w-10 h-10 text-teal-500" />
          </div>
        )}
        <h3 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          {result.duplicateOf ? 'Duplicate Detected' : 'Report Received!'}
        </h3>
        <p className="text-slate-600 mb-8 text-lg font-light">{result.message}</p>
        
        {result.data && (
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 text-left mb-8 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-blue-500"></div>
            <p className="text-slate-600 flex justify-between"><span className="font-semibold text-slate-900">AI Category:</span> <span>{result.data.ai_category}</span></p>
            <p className="text-slate-600 flex justify-between">
              <span className="font-semibold text-slate-900">Severity Score:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${result.data.ai_severity > 80 ? 'bg-orange-100 text-orange-700' : result.data.ai_severity > 50 ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                {result.data.ai_severity}/100
              </span>
            </p>
            <div className="pt-3 mt-3 border-t border-slate-100">
              <p className="text-slate-500 italic text-sm leading-relaxed">&quot;{result.data.ai_justification}&quot;</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <NextLink href="/my-reports" className="w-full flex items-center justify-center py-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold text-lg transition-all shadow-lg shadow-teal-500/20 hover:-translate-y-0.5">
            Track My Reports
          </NextLink>
          <Button onClick={() => { setStep(1); setImage(null); setPreview(null); setLat(null); setLng(null); setDescription(''); setResult(null); }} className="w-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 py-6 rounded-xl font-medium">
            Submit Another Issue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col min-h-[500px]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Report an Issue</h2>
          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">Step {step} of 3</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 h-full transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
      </div>

      <div className="flex-1 relative">
        {/* Step 1: Photo */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera className="text-teal-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Snap a Photo</h3>
              <p className="text-sm text-slate-500">Take a clear picture of the infrastructure issue.</p>
            </div>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`h-56 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${preview ? 'border-teal-400 bg-teal-50/20 ring-4 ring-teal-500/10' : 'border-slate-300 hover:border-teal-400 hover:bg-teal-50/50 bg-slate-50'}`}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="h-full w-full object-cover animate-scale-in" />
              ) : (
                <div className="text-center text-slate-400 group">
                  <Camera size={40} className="mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 text-slate-300 group-hover:text-teal-400" />
                  <span className="font-medium text-slate-500 group-hover:text-teal-600 transition-colors">Tap to open camera</span>
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

            {preview && (
              <Button type="button" onClick={() => setStep(2)} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold text-lg mt-4 flex items-center gap-2 group">
                Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Pin Location</h3>
              <p className="text-sm text-slate-500">Drag the map to the exact location of the issue.</p>
            </div>

            <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative z-0 shadow-inner ring-4 ring-blue-500/5">
              <Map onLocationSelect={(lat, lng) => { setLat(lat); setLng(lng); }} />
            </div>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl text-xs text-blue-700">
              <Shield size={16} className="text-blue-600 flex-shrink-0" />
              <span className="font-medium leading-relaxed">Location data is privacy-protected and fuzzed (±200m) for public view.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" onClick={() => setStep(1)} className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 py-6 rounded-xl font-medium">
                Back
              </Button>
              <Button type="button" onClick={() => setStep(3)} disabled={!lat || !lng} className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 group">
                Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mic className="text-purple-600 w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Add Details</h3>
              <p className="text-sm text-slate-500">Optional: Provide more context about the issue.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-end">
                {voiceSupported && (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${isListening ? 'bg-red-500 border-red-600 text-white animate-pulse' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening ? 'Stop Recording' : 'Use Voice Input'}
                  </button>
                )}
              </div>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400 transition-all duration-200 hover:bg-white text-base shadow-inner resize-none"
                placeholder={isListening ? "🎤 Listening... speak now" : "e.g., The pothole is on the left lane near the signal..."}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {result?.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{result.error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={() => setStep(2)} className="flex-none aspect-square bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white py-6 rounded-xl font-bold text-lg transition-all shadow-lg shadow-teal-500/25 hover:-translate-y-0.5"
                disabled={isSubmitting}
              >
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
