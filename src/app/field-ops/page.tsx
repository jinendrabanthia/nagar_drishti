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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-100/50 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
      </div>
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-xl p-4 sticky top-0 z-40 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <NextLink href="/official" className="text-slate-500 hover:text-orange-600 transition-colors p-2 bg-white/60 rounded-lg border border-slate-200 hover:bg-white">
            <ArrowLeft size={18} />
          </NextLink>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Field Ops Offline</h1>
          </div>
        </div>

        {/* Network & Sync Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase border ${isOnline ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            {isOnline ? <><Wifi size={14} /> Online</> : <><WifiOff size={14} /> Offline</>}
          </div>
          
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200">
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
              {pendingCount} Pending Sync
            </div>
          )}

          <button 
            onClick={downloadTasks} 
            disabled={!isOnline || isDownloading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-50 transition-all active:scale-[0.98] whitespace-nowrap text-slate-700 shadow-sm"
          >
            {isDownloading ? <RefreshCw size={14} className="animate-spin text-teal-600" /> : <HardDriveDownload size={14} className="text-teal-600" />}
            Cache Tasks
          </button>
        </div>
      </header>

      {/* Warning Banner when Offline */}
      {!isOnline && (
        <div className="bg-orange-50 border-b border-orange-200 text-orange-700 px-4 py-2 text-xs font-medium text-center uppercase tracking-widest shadow-sm backdrop-blur-md">
          Offline Mode Active — Changes will sync automatically
        </div>
      )}

      <main className="flex-1 p-4 max-w-3xl mx-auto w-full relative z-10">
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl pointer-events-none"></div>

        {lastSync && (
          <p className="text-slate-500 text-xs font-mono text-center mb-6 bg-white/60 py-1.5 rounded-lg w-fit mx-auto px-4 border border-slate-200 shadow-sm">
            Last cached: {lastSync}
          </p>
        )}

        {tasks.length === 0 ? (
          <div className="glass-card-premium rounded-3xl p-12 text-center mt-12 border-dashed border-2 border-slate-200 shadow-xl">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100">
              <ShieldAlert className="w-8 h-8 text-orange-400" />
            </div>
            <p className="text-lg font-bold text-slate-900 mb-2">No active assignments</p>
            {isOnline ? (
              <p className="text-sm text-slate-600">Click "Cache Tasks" to download your route for today.</p>
            ) : (
              <p className="text-sm text-slate-600">You are offline and have no cached tasks.</p>
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
