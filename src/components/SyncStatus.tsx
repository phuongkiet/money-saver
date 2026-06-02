import React from 'react';
import { useApp } from '../context/AppContext';
import { Cloud, CloudLightning, CloudOff, RefreshCw, LogIn } from 'lucide-react';

const useAppShim = () => {
  const context = useApp();
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

interface SyncStatusProps {
  onOpenAuth: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ onOpenAuth }) => {
  const { session, isSyncing, lastSyncedAt, syncData, transactions } = useAppShim();
  const isOnline = window.navigator.onLine;

  // Lấy các thay đổi chưa đồng bộ
  const pendingSyncCount = transactions.filter(t => t.pendingSync).length;

  const handleSyncClick = async () => {
    if (!session) {
      onOpenAuth();
      return;
    }
    if (!isOnline) return;
    await syncData();
  };

  // Render các trạng thái khác nhau của Sync
  if (!session) {
    return (
      <button
        onClick={onOpenAuth}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-full text-[10px] font-extrabold text-amber-700 dark:text-amber-450 hover:bg-amber-100 dark:hover:bg-amber-950/30 cursor-pointer shadow-sm shadow-amber-500/5 transition-all duration-200 active:scale-[0.98] font-vietnam shrink-0"
      >
        <LogIn size={11} strokeWidth={2.5} />
        Chưa đăng nhập
      </button>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 rounded-full text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 font-vietnam shrink-0">
        <CloudOff size={11} strokeWidth={2.5} />
        Ngoại tuyến
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-200/50 dark:border-sky-900/30 rounded-full text-[10px] font-extrabold text-sky-700 dark:text-sky-400 font-vietnam shrink-0">
        <RefreshCw size={11} strokeWidth={2.5} className="animate-spin" />
        Đang đồng bộ...
      </div>
    );
  }

  if (pendingSyncCount > 0) {
    return (
      <button
        onClick={handleSyncClick}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-full text-[10px] font-extrabold text-amber-700 dark:text-amber-450 hover:bg-amber-100 dark:hover:bg-amber-950/30 cursor-pointer shadow-sm shadow-amber-500/5 transition-all duration-200 active:scale-[0.98] font-vietnam shrink-0"
      >
        <CloudLightning size={11} strokeWidth={2.5} className="animate-bounce" />
        Chờ đồng bộ ({pendingSyncCount})
      </button>
    );
  }

  return (
    <button
      onClick={handleSyncClick}
      title={lastSyncedAt ? `Đồng bộ cuối: ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Chưa đồng bộ'}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-full text-[10px] font-extrabold text-emerald-700 dark:text-emerald-405 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 cursor-pointer shadow-sm shadow-emerald-500/5 transition-all duration-200 active:scale-[0.98] font-vietnam shrink-0"
    >
      <Cloud size={11} strokeWidth={2.5} />
      Đã đồng bộ
    </button>
  );
};
