import React from 'react';
import { Home, FolderHeart, Plus, Activity, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  onOpenModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenModal }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-200/50 dark:border-zinc-800/50 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between relative">
        
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setActiveTab(0)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ${
            activeTab === 0 
              ? 'text-[#6f8d6d] scale-105 font-medium' 
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
          }`}
        >
          <Home size={22} strokeWidth={activeTab === 0 ? 2.5 : 2} />
          <span className="text-[10px] mt-1 tracking-wide font-vietnam">Tổng quan</span>
        </button>

        {/* Tab 2: Categories */}
        <button
          onClick={() => setActiveTab(1)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ${
            activeTab === 1 
              ? 'text-[#6f8d6d] scale-105 font-medium' 
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
          }`}
        >
          <FolderHeart size={22} strokeWidth={activeTab === 1 ? 2.5 : 2} />
          <span className="text-[10px] mt-1 tracking-wide font-vietnam">Ngân sách</span>
        </button>

        {/* Center (+): Add Transaction */}
        <div className="flex-1 flex justify-center -mt-6 relative z-50">
          <button
            onClick={onOpenModal}
            className="w-14 h-14 bg-gradient-to-br from-[#8fae8d] to-[#6f8d6d] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(143,174,141,0.4)] hover:shadow-[0_6px_24px_rgba(143,174,141,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-white dark:border-zinc-950 focus:outline-none"
            aria-label="Thêm chi tiêu mới"
          >
            <Plus size={28} strokeWidth={2.5} className="transition-transform duration-300 hover:rotate-90" />
          </button>
        </div>

        {/* Tab 3: Debt */}
        <button
          onClick={() => setActiveTab(2)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ${
            activeTab === 2 
              ? 'text-[#6f8d6d] scale-105 font-medium' 
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
          }`}
        >
          <Activity size={22} strokeWidth={activeTab === 2 ? 2.5 : 2} />
          <span className="text-[10px] mt-1 tracking-wide font-vietnam">Tính Nợ</span>
        </button>

        {/* Tab 4: Profile */}
        <button
          onClick={() => setActiveTab(3)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ${
            activeTab === 3 
              ? 'text-[#6f8d6d] scale-105 font-medium' 
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
          }`}
        >
          <User size={22} strokeWidth={activeTab === 3 ? 2.5 : 2} />
          <span className="text-[10px] mt-1 tracking-wide font-vietnam">Cá nhân</span>
        </button>

      </div>
    </nav>
  );
};
