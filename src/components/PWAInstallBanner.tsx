import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent standard browser bar from showing
      e.preventDefault();
      // Store prompt to trigger later
      setDeferredPrompt(e);
      // Check if user has already dismissed it recently
      const dismissed = localStorage.getItem('pwa_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show browser prompt
    deferredPrompt.prompt();
    
    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to PWA install: ${outcome}`);
    
    // Clear prompt since it can only be used once
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa_dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-bounce-in">
      <div className="bg-gradient-to-r from-[#8fae8d] to-[#6f8d6d] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
            <Smartphone size={24} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold font-vietnam text-white">Cài đặt ứng dụng PWA</h4>
            <p className="text-xs text-white/80 font-vietnam mt-0.5 leading-relaxed">Lưu Money Saver ra màn hình chính, sử dụng mượt mà không cần mạng!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-white text-[#6f8d6d] font-vietnam font-semibold text-xs rounded-xl shadow-md hover:bg-zinc-50 active:scale-95 transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <Download size={13} strokeWidth={2.5} />
            Cài đặt
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 bg-white/10 hover:bg-white/20 active:scale-90 text-white rounded-lg transition-all"
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
