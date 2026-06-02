import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { CategoriesTab } from './components/CategoriesTab';
import { DebtTab } from './components/DebtTab';
import { ProfileTab } from './components/ProfileTab';
import { TransactionModal } from './components/TransactionModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Onboarding } from './components/Onboarding';
import { UpdatePromptModal } from './components/UpdatePromptModal';

function AppContent() {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => localStorage.getItem('ms_onboarded') === 'true');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />;
  }

  // Render active screen tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <DashboardTab
            onEditTransaction={(id) => {
              setEditingTransactionId(id);
              setIsModalOpen(true);
            }}
          />
        );
      case 1:
        return <CategoriesTab />;
      case 2:
        return <DebtTab />;
      case 3:
        return <ProfileTab />;
      default:
        return (
          <DashboardTab
            onEditTransaction={(id) => {
              setEditingTransactionId(id);
              setIsModalOpen(true);
            }}
          />
        );
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 flex flex-col shadow-2xl relative border-x border-zinc-200/30 dark:border-zinc-850/50">
      
      {/* Scrollable Viewport */}
      <main className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </main>

      {/* Momo Bottom Menu Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenModal={() => {
          setEditingTransactionId(null);
          setIsModalOpen(true);
        }}
      />

      {/* New Transaction Bottom Sheet/Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransactionId(null);
        }}
        editingTransactionId={editingTransactionId}
      />

      {/* PWA Smart Installation Dialog Banner */}
      <PWAInstallBanner />

      {/* Modern PWA Update Modal */}
      <UpdatePromptModal />

    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
