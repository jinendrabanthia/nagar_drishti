'use client';

import { useState, useRef } from 'react';
import { submitReport } from '@/app/actions/submit-report';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div> 
});

export default function ReportForm({ citizenId }: { citizenId: string }) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; duplicateOf?: string; message?: string; data?: any; error?: string; } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (result?.success) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-auto">
        {result.duplicateOf ? (
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        ) : (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        )}
        <h3 className="text-2xl font-bold text-white mb-2">
          {result.duplicateOf ? 'Duplicate Detected' : 'Report Received!'}
        </h3>
        <p className="text-slate-400 mb-6">{result.message}</p>
        {result.data && (
          <div className="bg-slate-800 rounded-xl p-4 text-left mb-6 text-sm">
            <p className="text-slate-300"><span className="font-semibold text-white">AI Category:</span> {result.data.ai_category}</p>
            <p className="text-slate-300"><span className="font-semibold text-white">Severity Score:</span> <span className={result.data.ai_severity > 80 ? 'text-red-400' : 'text-orange-400'}>{result.data.ai_severity}/100</span></p>
            <p className="text-slate-300 mt-2 italic">&quot;{result.data.ai_justification}&quot;</p>
          </div>
        )}
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
            Submit Another
          </Button>
          <NextLink href="/my-reports" className="flex-1 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all active:scale-[0.98]">
            Track My Reports
          </NextLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Report an Issue</h2>
        <p className="text-slate-400 text-sm">Help keep our city safe by reporting infrastructure problems.</p>
      </div>

      {/* Map Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <MapPin size={16} /> Pin the Location
        </label>
        <div className="h-48 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 relative z-0">
          <Map onLocationSelect={(lat, lng) => { setLat(lat); setLng(lng); }} />
        </div>
        {lat && lng && (
          <p className="text-xs text-green-400 font-mono">Location captured: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
        )}
      </div>

      {/* Photo Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <Camera size={16} /> Upload Photo Evidence
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors ${preview ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'}`}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-lg opacity-80" />
            </>
          ) : (
            <div className="text-center text-slate-400">
              <Camera size={24} className="mx-auto mb-2 opacity-50" />
              <span className="text-sm">Tap to take a photo</span>
            </div>
          )}
        </div>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef}
          className="hidden" 
          onChange={handleImageChange}
        />
      </div>

      {/* Description Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">Description (Optional)</label>
        <textarea 
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add any additional details..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {result?.error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
          {result.error}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold text-lg transition-all active:scale-[0.98]"
        disabled={!image || !lat || !lng || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing with AI...
          </>
        ) : (
          'Submit Report'
        )}
      </Button>
    </form>
  );
}
