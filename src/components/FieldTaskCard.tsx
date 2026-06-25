'use client';

import { useState, useRef } from 'react';
import { Camera, CheckCircle, AlertTriangle, ArrowRight, Loader2, Save } from 'lucide-react';
import { queueStatusUpdate } from '@/lib/offline-store';
import BorderGlow from './BorderGlow';

export default function FieldTaskCard({ task, onUpdate }: { task: any, onUpdate: () => void }) {
  const [status, setStatus] = useState(task.status);
  const [fieldNotes, setFieldNotes] = useState(task.field_notes || '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // If online, we could call the server action directly. 
    // For offline-first, we ALWAYS put it in the queue, and let the sync manager handle it.
    await queueStatusUpdate(task.id, status, fieldNotes, image);
    setIsSaving(false);
    onUpdate(); // Trigger re-render to show offline badge
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'resolved': return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'in_progress': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="20 184 166"
      backgroundColor="#ffffff"
      borderRadius={16}
      glowRadius={40}
      glowIntensity={1}
      coneSpread={25}
      animated={false}
      colors={['#14b8a6', '#0ea5e9', '#bae6fd']}
    >
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative border border-slate-200 bg-white/80">
        {task.is_emergency && <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 animate-pulse z-10"></div>}
      
      <div className="flex gap-4 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={task.image_url} alt="Issue" className="w-24 h-24 object-cover rounded-xl border border-slate-200 bg-slate-100 shadow-sm" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-slate-900 text-lg truncate pr-2">{task.ai_category}</h3>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getStatusColor(status)} shrink-0 shadow-sm`}>
              {status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1 line-clamp-2 leading-relaxed">{task.description || task.ai_justification}</p>
          <div className="mt-3 flex gap-2 text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider flex-wrap">
            <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-slate-600 shadow-sm">📍 {task.pin_code || 'No PIN'}</span>
            <span className={`flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md shadow-sm ${task.ai_severity > 80 ? 'text-orange-600 border-orange-200 bg-orange-50' : task.ai_severity > 50 ? 'text-amber-600 border-amber-200 bg-amber-50' : 'text-teal-700 border-teal-200 bg-teal-50'}`}>
              🚨 SEV: {task.ai_severity}
            </span>
            {task.is_emergency && <span className="bg-orange-100 border border-orange-200 text-orange-700 px-2 py-1 rounded-md animate-pulse shadow-sm font-bold">EMERGENCY</span>}
          </div>
        </div>
      </div>

      <div className="bg-slate-50/80 p-5 border-t border-slate-200 space-y-4">
        
        {/* Status Toggles */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Update Status</label>
          <div className="flex bg-slate-200/50 rounded-xl p-1 border border-slate-200 shadow-inner">
            <button 
              onClick={() => setStatus('open')}
              className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all duration-200 ${status === 'open' ? 'bg-white shadow text-blue-700 border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              Open
            </button>
            <button 
              onClick={() => setStatus('in_progress')}
              className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all duration-200 ${status === 'in_progress' ? 'bg-white shadow text-amber-700 border border-amber-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setStatus('resolved')}
              className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all duration-200 ${status === 'resolved' ? 'bg-teal-50 shadow text-teal-700 border border-teal-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Resolution Photo */}
        {status === 'resolved' && !task.resolved_image_url && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Resolution Proof</label>
            <div 
              onClick={() => fileRef.current?.click()} 
              className={`h-28 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${preview ? 'border-teal-400 bg-teal-50' : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-teal-50/50'}`}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="After" className="h-full w-full object-cover rounded-lg p-1" />
              ) : (
                <div className="text-slate-400 text-center flex flex-col items-center">
                  <Camera size={24} className="mb-2 opacity-60" />
                  <span className="text-xs font-medium">Upload "After" Photo</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleImageChange} />
          </div>
        )}

        {/* Field Notes */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Field Notes</label>
          <textarea 
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-all duration-200 placeholder:text-slate-400 hover:bg-slate-50 shadow-sm" 
            placeholder="Add notes about materials used, time taken, etc." 
            rows={2} 
            value={fieldNotes} 
            onChange={e => setFieldNotes(e.target.value)} 
          />
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving || (status === task.status && fieldNotes === (task.field_notes || ''))}
          className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:grayscale text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Queue Local Update
        </button>

      </div>
    </BorderGlow>
  );
}
