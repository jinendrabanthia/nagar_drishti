'use client';

import { useState, useRef } from 'react';
import { Camera, CheckCircle, AlertTriangle, ArrowRight, Loader2, Save } from 'lucide-react';
import { queueStatusUpdate } from '@/lib/offline-store';

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
      case 'resolved': return 'text-[#14B8A6] bg-[#14B8A6]/10 border-[#14B8A6]/30';
      case 'in_progress': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative">
      {task.is_emergency && <div className="absolute top-0 left-0 w-1 h-full bg-[#EA580C] animate-pulse z-10"></div>}
      
      <div className="flex gap-4 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={task.image_url} alt="Issue" className="w-24 h-24 object-cover rounded-xl border border-white/[0.08] bg-black/40 shadow-inner" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-white text-lg truncate pr-2">{task.ai_category}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${getStatusColor(status)} shrink-0`}>
              {status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1 line-clamp-2 leading-relaxed">{task.description || task.ai_justification}</p>
          <div className="mt-3 flex gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1 bg-white/[0.04] px-1.5 py-0.5 rounded">📍 {task.pin_code || 'No PIN'}</span>
            <span className={`flex items-center gap-1 bg-white/[0.04] px-1.5 py-0.5 rounded ${task.ai_severity > 80 ? 'text-[#EA580C]' : task.ai_severity > 50 ? 'text-amber-400' : 'text-[#14B8A6]'}`}>
              🚨 SEV: {task.ai_severity}
            </span>
            {task.is_emergency && <span className="bg-[#EA580C]/20 text-[#EA580C] px-1.5 py-0.5 rounded animate-pulse">EMERGENCY</span>}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] p-5 border-t border-white/[0.06] space-y-4">
        
        {/* Status Toggles */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Update Status</label>
          <div className="flex bg-black/20 rounded-xl p-1 border border-white/[0.04]">
            <button 
              onClick={() => setStatus('open')}
              className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all duration-200 ${status === 'open' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
            >
              Open
            </button>
            <button 
              onClick={() => setStatus('in_progress')}
              className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all duration-200 ${status === 'in_progress' ? 'bg-amber-600 shadow-md text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setStatus('resolved')}
              className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all duration-200 ${status === 'resolved' ? 'bg-[#0F766E] shadow-md text-white' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}
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
              className={`h-28 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ${preview ? 'border-[#14B8A6]/50 bg-[#14B8A6]/5' : 'border-white/[0.08] hover:border-white/[0.2] bg-white/[0.02]'}`}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="After" className="h-full w-full object-cover rounded-lg p-1" />
              ) : (
                <div className="text-slate-500 text-center flex flex-col items-center">
                  <Camera size={24} className="mb-2 opacity-50" />
                  <span className="text-xs">Upload "After" Photo</span>
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
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-[#EA580C]/50 focus:outline-none transition-all duration-200 placeholder:text-slate-600 hover:bg-white/[0.06]" 
            placeholder="Add notes about materials used, time taken, etc." 
            rows={2} 
            value={fieldNotes} 
            onChange={e => setFieldNotes(e.target.value)} 
          />
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving || (status === task.status && fieldNotes === (task.field_notes || ''))}
          className="w-full bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-50 disabled:grayscale text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 border border-white/[0.1] active:scale-[0.98]"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Queue Local Update
        </button>

      </div>
    </div>
  );
}
