'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cacheAssignedTasks, getCachedTasks, getPendingUpdates, clearSyncedUpdate } from '@/lib/offline-store';
import { syncOfflineTasks } from '@/app/actions/sync-tasks';
import FieldTaskCard from '@/components/FieldTaskCard';
import { Wifi, WifiOff, HardDriveDownload, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import NextLink from 'next/link';

export default function FieldOpsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline
    const handleOnline = () => { setIsOnline(true); triggerSync(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial tasks (from cache first, then try network)
    loadTasks();

    // Register service worker if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadTasks = async () => {
    // 1. Try to load from IndexedDB cache first
    const cached = await getCachedTasks();
    if (cached && cached.length > 0) {
      setTasks(cached);
    }
    await checkPending();

    // 2. If online, fetch fresh tasks
    if (navigator.onLine) {
      downloadTasks();
    }
  };

  const checkPending = async () => {
    const pending = await getPendingUpdates();
    setPendingCount(pending.length);
  };

  const downloadTasks = async () => {
    setIsDownloading(true);
    // In a real app, we'd get the official's ID from session. For demo, fetch all open/in_progress
    const { data } = await supabase
      .from('reports')
      .select('*')
      .in('status', ['open', 'in_progress'])
      .order('ai_severity', { ascending: false });

    if (data) {
      setTasks(data);
      await cacheAssignedTasks(data);
      setLastSync(new Date().toLocaleTimeString());
    }
    setIsDownloading(false);
  };

  const triggerSync = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);

    const pending = await getPendingUpdates();
    if (pending.length > 0) {
      const res = await syncOfflineTasks(pending);
      if (res.success) {
        // Clear synced items from IDB
        for (const update of pending) {
          await clearSyncedUpdate(update.reportId);
        }
        await checkPending();
        // Refresh tasks from server
        await downloadTasks();
      } else {
        console.error("Failed to sync:", res.error);
      }
    }
    
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0B1120]/80 backdrop-blur-xl p-4 sticky top-0 z-40 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <NextLink href="/official" className="text-slate-400 hover:text-[#EA580C] transition-colors p-2 bg-white/[0.04] rounded-lg border border-white/[0.06] hover:bg-white/[0.08]">
            <ArrowLeft size={18} />
          </NextLink>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#EA580C] to-[#C2410C] p-1.5 rounded-lg shadow-lg shadow-[#EA580C]/20">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Field Ops Offline</h1>
          </div>
        </div>

        {/* Network & Sync Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase border ${isOnline ? 'bg-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
            {isOnline ? <><Wifi size={14} /> Online</> : <><WifiOff size={14} /> Offline</>}
          </div>
          
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20">
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              {pendingCount} Pending Sync
            </div>
          )}

          <button 
            onClick={downloadTasks} 
            disabled={!isOnline || isDownloading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] disabled:opacity-50 transition-all active:scale-[0.98] whitespace-nowrap text-white"
          >
            {isDownloading ? <RefreshCw size={14} className="animate-spin text-[#14B8A6]" /> : <HardDriveDownload size={14} className="text-[#14B8A6]" />}
            Cache Tasks
          </button>
        </div>
      </header>

      {/* Warning Banner when Offline */}
      {!isOnline && (
        <div className="bg-[#EA580C]/20 border-b border-[#EA580C]/40 text-[#EA580C] px-4 py-2 text-xs font-medium text-center uppercase tracking-widest shadow-inner backdrop-blur-md">
          Offline Mode Active — Changes will sync automatically
        </div>
      )}

      <main className="flex-1 p-4 max-w-3xl mx-auto w-full relative">
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-[#EA580C]/5 rounded-full blur-3xl pointer-events-none"></div>

        {lastSync && (
          <p className="text-slate-500 text-xs font-mono text-center mb-6 bg-white/[0.02] py-1.5 rounded-lg w-fit mx-auto px-4 border border-white/[0.04]">
            Last cached: {lastSync}
          </p>
        )}

        {tasks.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center mt-12 border-dashed border-2 border-white/[0.1]">
            <div className="w-16 h-16 bg-[#EA580C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-[#EA580C]/50" />
            </div>
            <p className="text-lg font-bold text-white mb-2">No active assignments</p>
            {isOnline ? (
              <p className="text-sm text-slate-400">Click "Cache Tasks" to download your route for today.</p>
            ) : (
              <p className="text-sm text-slate-400">You are offline and have no cached tasks.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {tasks.map(task => (
              <FieldTaskCard key={task.id} task={task} onUpdate={checkPending} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
