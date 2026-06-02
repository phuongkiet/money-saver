import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export const UpdatePromptModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Check if service worker is controlled and get registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      // 1. If there's already a waiting worker, show modal
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShowModal(true);
      }

      // 2. Listen for when a new service worker installs
      const handleUpdateFound = () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowModal(true);
          }
        });
      };

      reg.addEventListener('updatefound', handleUpdateFound);
    });

    // 3. Listen for controller change (active worker swap) and reload cleanly
    let refreshing = false;
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Glassmorphism blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white/95 dark:bg-zinc-900/95 border border-zinc-100 dark:border-zinc-800/80 rounded-[2.5rem] p-6 shadow-2xl space-y-5 animate-scale-up z-10 text-center backdrop-blur-lg">
        {/* Glow accent */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#8fae8d]/10 rounded-full blur-2xl"></div>

        {/* Soft aesthetic update icon container */}
        <div className="w-14 h-14 bg-[#6f8d6d]/10 text-[#6f8d6d] dark:bg-[#6f8d6d]/20 dark:text-[#8fae8d] rounded-2xl flex items-center justify-center mx-auto animate-bounce">
          <RefreshCw size={26} className="animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold font-vietnam text-[#6f8d6d] dark:text-[#8fae8d] uppercase tracking-wider">
            <Sparkles size={12} />
            Đã có phiên bản mới nhất!
          </div>
          <h3 className="text-sm font-extrabold font-vietnam text-zinc-800 dark:text-zinc-100">
            Nâng cấp ứng dụng Money Saver
          </h3>
          <p className="text-xs font-vietnam text-zinc-500 dark:text-zinc-400 leading-relaxed px-2">
            Money Saver vừa phát hành bản cập nhật mới trên hệ thống. Khởi động lại ngay để trải nghiệm giao diện mượt mà và các tính năng mới cực hot!
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleUpdate}
            className="w-full py-3.5 bg-gradient-to-br from-[#8fae8d] to-[#6f8d6d] hover:scale-[1.01] text-white text-xs font-bold font-vietnam rounded-2xl shadow-[0_4px_16px_rgba(143,174,141,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '2s' }} />
            Cập nhật & Khởi động lại
          </button>
        </div>
      </div>
    </div>
  );
};
export default UpdatePromptModal;
