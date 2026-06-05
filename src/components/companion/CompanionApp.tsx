import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanionProvider } from '../../context/CompanionContext';
import { CompanionDashboard } from './CompanionDashboard';
import { CompanionInfo } from './CompanionInfo';
import { CompanionAppointments } from './CompanionAppointments';
import { CompanionMemories } from './CompanionMemories';
import { CompanionSettings } from './CompanionSettings';
import { LayoutDashboard, Heart, Calendar, Gift, ArrowLeft, Settings } from 'lucide-react';

interface CompanionAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanionApp: React.FC<CompanionAppProps> = ({ isOpen, onClose }) => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'info' | 'appointments' | 'memories' | 'settings'>('dashboard');


  if (!isOpen) return null;

  // Theming based on user gender
  const isMaleUser = user.gender === 'male';
  const colors = isMaleUser
    ? {
        primary: '#FADADD', // Soft Pink
        accent: '#F3A3B5',  // Medium Pink for buttons/interactive states
        textDark: '#5E3E44', // Dark pink-tinted text
        textMuted: '#9B7A80',
        bgMain: '#FFF7F8',
        bgCard: '#FFFFFF',
        border: '#FCE1E5',
        navActive: '#FA6C8D',
        navInactive: '#C29EA4',
        glow: 'rgba(250, 218, 221, 0.4)'
      }
    : {
        primary: '#B9D6F3', // Soft Blue
        accent: '#7FAAD4',  // Medium Blue for buttons/interactive states
        textDark: '#2F4357', // Dark blue-tinted text
        textMuted: '#687E94',
        bgMain: '#F4F8FC',
        bgCard: '#FFFFFF',
        border: '#D7E5F4',
        navActive: '#4783BD',
        navInactive: '#8AA2B8',
        glow: 'rgba(185, 214, 243, 0.4)'
      };

  const title = isMaleUser ? 'Em ấy 💕' : 'Anh ấy 💙';

  return (
    <CompanionProvider>
      <div 
        className="fixed inset-0 z-[60] flex flex-col animate-slide-in font-vietnam"
        style={{ 
          backgroundColor: colors.bgMain,
          color: colors.textDark,
          '--theme-primary': colors.primary,
          '--theme-accent': colors.accent,
          '--theme-text-dark': colors.textDark,
          '--theme-text-muted': colors.textMuted,
          '--theme-bg-main': colors.bgMain,
          '--theme-bg-card': colors.bgCard,
          '--theme-border': colors.border,
          '--theme-nav-active': colors.navActive,
          '--theme-glow': colors.glow
        } as React.CSSProperties}
      >
        {/* Header */}
        <header 
          className="h-14 flex items-center px-4 justify-between border-b shadow-sm shrink-0 sticky top-0 z-10"
          style={{ 
            backgroundColor: colors.bgCard, 
            borderColor: colors.border
          }}
        >
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-zinc-100"
            style={{ color: colors.textDark }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          
          <h1 className="text-base font-bold tracking-tight">
            {title}
          </h1>
          
          {/* Empty spacer for alignment */}
          <div className="w-10"></div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-6">
          {activeTab === 'dashboard' && <CompanionDashboard />}
          {activeTab === 'info' && <CompanionInfo />}
          {activeTab === 'appointments' && <CompanionAppointments />}
          {activeTab === 'memories' && <CompanionMemories />}
          {activeTab === 'settings' && <CompanionSettings />}
        </main>

        {/* Bottom Navigation */}
        <nav 
          className="h-16 border-t flex items-center justify-around px-2 shrink-0 select-none"
          style={{ 
            backgroundColor: colors.bgCard, 
            borderColor: colors.border,
            boxShadow: `0 -4px 12px ${colors.glow}`
          }}
        >
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
            style={{ color: activeTab === 'dashboard' ? colors.navActive : colors.navInactive }}
          >
            <LayoutDashboard size={20} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">Dashboard</span>
          </button>

          {/* Tab 2: Thông tin */}
          <button
            onClick={() => setActiveTab('info')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
            style={{ color: activeTab === 'info' ? colors.navActive : colors.navInactive }}
          >
            <Heart size={20} strokeWidth={activeTab === 'info' ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">Thông tin</span>
          </button>

          {/* Tab 3: Lịch hẹn */}
          <button
            onClick={() => setActiveTab('appointments')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
            style={{ color: activeTab === 'appointments' ? colors.navActive : colors.navInactive }}
          >
            <Calendar size={20} strokeWidth={activeTab === 'appointments' ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">Lịch hẹn</span>
          </button>

          {/* Tab 4: Kỷ niệm & Quà */}
          <button
            onClick={() => setActiveTab('memories')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
            style={{ color: activeTab === 'memories' ? colors.navActive : colors.navInactive }}
          >
            <Gift size={20} strokeWidth={activeTab === 'memories' ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">Kỷ niệm</span>
          </button>

          {/* Tab 5: Cài đặt */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95"
            style={{ color: activeTab === 'settings' ? colors.navActive : colors.navInactive }}
          >
            <Settings size={20} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">Cài đặt</span>
          </button>
        </nav>
      </div>
    </CompanionProvider>
  );
};
