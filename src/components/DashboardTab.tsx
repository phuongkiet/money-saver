import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { IconRenderer } from './IconRenderer';
import { SyncStatus } from './SyncStatus';
import { TrendingDown, TrendingUp, Wallet as WalletIcon, Trash2, Pencil, Info, CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DashboardTabProps {
  onEditTransaction: (id: string) => void;
  onOpenAuth: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ onEditTransaction, onOpenAuth }) => {
  const { transactions, categories, wallets, deleteTransaction, user } = useApp();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Helper: Format currency in VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper: Get Category Info
  const getCategoryInfo = (catId: string, tx?: any) => {
    if (catId === 'transfer') {
      return { name: 'Chuyển quỹ', icon: 'ArrowLeftRight', color: '#8c8c8c' };
    }
    if (catId === 'income-default') {
      return { name: 'Thu nhập', icon: 'TrendingUp', color: '#10b981' };
    }
    const cat = categories.find(c => c.id === catId);
    if (cat) return cat;
    if (tx && tx.categoryName) {
      return { name: tx.categoryName, icon: 'FolderHeart', color: '#a1a1aa' };
    }
    return { name: 'Khác', icon: 'HelpCircle', color: '#a1a1aa' };
  };

  // Helper: Get Wallet Info
  const getWalletInfo = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet || { name: 'Ví không rõ', icon: 'Wallet' };
  };

  // Calculations
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  
  // Total Income and Expenses
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.categoryId !== 'transfer')
    .reduce((sum, t) => sum + t.amount, 0);

  // Smart Daily Budget
  const today = new Date();
  const currentMonthId = today.toISOString().substring(0, 7);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dayOfMonth = today.getDate();
  const remainingDays = daysInMonth - dayOfMonth + 1; // Include today

  const monthIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith(currentMonthId))
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = transactions
    .filter(t => t.type === 'expense' && t.categoryId !== 'transfer' && t.date.startsWith(currentMonthId))
    .reduce((sum, t) => sum + t.amount, 0);
  const monthBalance = monthIncome - monthExpense;
  const safeDailyBudget = remainingDays > 0 ? monthBalance / remainingDays : 0;

  // Group spending by category
  const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.categoryId !== 'transfer');
  
  const categorySpending = useMemo(() => {
    const spendingMap: { [id: string]: { id: string; name: string; color: string; icon: string; amount: number; budget: number; type: string } } = {};

    expenseTransactions.forEach(t => {
      const catId = t.categoryId;
      const liveCat = categories.find(c => c.id === catId);
      const id = catId;
      const name = liveCat ? liveCat.name : (t.categoryName || 'Danh mục đã xóa');
      const color = liveCat ? liveCat.color : '#a1a1aa';
      const icon = liveCat ? liveCat.icon : 'FolderHeart';
      const budget = liveCat ? liveCat.budget : 0;
      const type = 'expense';

      if (!spendingMap[id]) {
        spendingMap[id] = { id, name, color, icon, amount: 0, budget, type };
      }
      spendingMap[id].amount += t.amount;
    });

    return Object.values(spendingMap).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);
  }, [categories, expenseTransactions]);

  const totalSpendingFiltered = categorySpending.reduce((sum, c) => sum + c.amount, 0);

  // Generate SVG Donut Chart data
  let accumulatedPercentage = 0;
  const donutData = categorySpending.map(cat => {
    const percentage = totalSpendingFiltered > 0 ? (cat.amount / totalSpendingFiltered) * 100 : 0;
    const startAngle = (accumulatedPercentage * 360) / 100;
    accumulatedPercentage += percentage;
    return {
      ...cat,
      percentage,
      startAngle
    };
  });

  // Group transactions by date
  const formatDateString = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateStr === today) return 'Hôm nay';
    if (dateStr === yesterday) return 'Hôm qua';
    
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredTransactions = activeCategoryFilter
    ? transactions.filter(t => t.categoryId === activeCategoryFilter)
    : transactions;

  // Group transactions by date
  const groupedTransactions: { [key: string]: typeof transactions } = {};
  filteredTransactions.forEach(tx => {
    if (!groupedTransactions[tx.date]) {
      groupedTransactions[tx.date] = [];
    }
    groupedTransactions[tx.date].push(tx);
  });

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));

  return (
    <div className="pb-24">
      {/* Upper header */}
      <div className="bg-gradient-to-b from-[#8fae8d]/30 to-transparent pt-6 pb-4 px-4 rounded-b-[2rem]">
        <div className="max-w-md mx-auto">
          {/* Welcome Info & Sync pill */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'}
                alt="Avatar"
                className="w-8 h-8 rounded-xl object-cover bg-zinc-100 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
              />
              <span className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100">
                Chào {user.name}!
              </span>
            </div>
            <SyncStatus onOpenAuth={onOpenAuth} />
          </div>

          <div className="text-zinc-500 dark:text-zinc-400 text-[10px] font-vietnam uppercase tracking-wider font-bold">
            Tổng tài sản tích lũy
          </div>
          <div className="text-3xl font-extrabold font-vietnam mt-1 text-zinc-800 dark:text-zinc-100 flex items-baseline gap-1">
            {formatVND(totalBalance)}
          </div>

          {/* Quick Stats Cash & Online summary */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/40 dark:border-zinc-800/40 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <TrendingUp size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam uppercase font-semibold">Thu nhập</span>
                <p className="text-sm font-semibold font-vietnam text-emerald-600 dark:text-emerald-400 mt-0.5">{formatVND(totalIncome)}</p>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/40 dark:border-zinc-800/40 shadow-sm flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                <TrendingDown size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam uppercase font-semibold">Đã chi tiêu</span>
                <p className="text-sm font-semibold font-vietnam text-rose-600 dark:text-rose-400 mt-0.5">{formatVND(totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Daily Budget Widget */}
        {monthBalance !== 0 && (
          <div className={`mt-4 rounded-2xl p-3.5 flex items-center gap-3 ${
            safeDailyBudget >= 100000
              ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/20'
              : safeDailyBudget >= 0
                ? 'bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/20'
                : 'bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/20'
          }`}>
            <div className={`text-xl ${safeDailyBudget >= 100000 ? '🟢' : safeDailyBudget >= 0 ? '🟡' : '🔴'}`}>
              {safeDailyBudget >= 100000 ? '💰' : safeDailyBudget >= 0 ? '⚠️' : '🚨'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold font-vietnam uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Ngân sách an toàn hôm nay
              </p>
              <p className={`text-sm font-extrabold font-vietnam mt-0.5 ${
                safeDailyBudget >= 100000
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : safeDailyBudget >= 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
              }`}>
                {safeDailyBudget >= 0 ? formatVND(safeDailyBudget) : `Bội chi ${formatVND(Math.abs(safeDailyBudget))}`}
              </p>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-vietnam mt-0.5">
                Còn {remainingDays} ngày trong tháng • Dư tháng: {formatVND(monthBalance)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto px-4 mt-4 space-y-6">
        
        {/* Wallets Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
              <WalletIcon size={16} className="text-[#6f8d6d]" />
              Ví và Tài khoản của bạn
            </h3>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {wallets.map(w => (
              <div
                key={w.id}
                className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.02)] min-w-[140px] flex-1 snap-start"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-[#8fae8d]/10 dark:bg-[#8fae8d]/20 text-[#6f8d6d] rounded-xl">
                    <IconRenderer name={w.icon} size={16} />
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-vietnam uppercase font-semibold ${
                    w.type === 'cash' 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {w.type === 'cash' ? 'Tiền mặt' : 'Online'}
                  </span>
                </div>
                <h4 className="text-xs font-semibold font-vietnam text-zinc-400 dark:text-zinc-500 truncate">{w.name}</h4>
                <p className="text-sm font-bold font-vietnam text-zinc-700 dark:text-zinc-200 mt-1 whitespace-nowrap">{formatVND(w.balance)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Spending SVG Donut Chart */}
        <section className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100 mb-4">Phân tích chi tiêu tháng này</h3>

          {donutData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-zinc-400 dark:text-zinc-500">
              <Info size={32} className="mb-2 opacity-50" />
              <p className="text-xs font-vietnam">Chưa có giao dịch chi tiêu nào để phân tích.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Circular SVG Donut Chart */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Base Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="var(--color-bg-base, #f4f4f5)"
                    className="stroke-zinc-100 dark:stroke-zinc-800"
                    strokeWidth="12"
                  />
                  
                  {/* Segments */}
                  {donutData.map((segment) => {
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius; // ~251.2
                    const strokeLength = (segment.percentage / 100) * circumference;

                    return (
                      <circle
                        key={segment.id}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={segment.color}
                        strokeWidth="12"
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        strokeDashoffset={0}
                        className="transition-[stroke-width] duration-350 hover:stroke-[14] cursor-pointer"
                        style={{
                          transform: `rotate(${segment.startAngle}deg)`,
                          transformOrigin: '50px 50px',
                        }}
                        onClick={() => {
                          if (activeCategoryFilter === segment.id) {
                            setActiveCategoryFilter(null);
                          } else {
                            setActiveCategoryFilter(segment.id);
                          }
                        }}
                      />
                    );
                  })}
                </svg>

                {/* Donut Center */}
                <div className="absolute text-center">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam uppercase font-semibold tracking-wider">Tổng Chi</span>
                  <p className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100 mt-0.5">{formatVND(totalSpendingFiltered)}</p>
                </div>
              </div>

              {/* Legends */}
              <div className="flex-1 w-full space-y-2.5">
                {donutData.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (activeCategoryFilter === item.id) {
                        setActiveCategoryFilter(null);
                      } else {
                        setActiveCategoryFilter(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                      activeCategoryFilter === item.id 
                        ? 'bg-zinc-100 dark:bg-zinc-800/60 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50' 
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-xs font-semibold font-vietnam text-zinc-600 dark:text-zinc-300 truncate">{item.name}</span>
                    </div>
                    <div className="text-right ml-2 shrink-0">
                      <span className="text-xs font-bold font-vietnam text-zinc-700 dark:text-zinc-200">{formatVND(item.amount)}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam font-medium block">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </button>
                ))}
                
                {activeCategoryFilter && (
                  <button
                    onClick={() => setActiveCategoryFilter(null)}
                    className="w-full text-center py-2 text-[11px] font-bold font-vietnam text-[#6f8d6d] hover:text-[#5b755a] dark:text-[#8fae8d] dark:hover:text-[#6f8d6d] transition-colors"
                  >
                    Bỏ lọc biểu đồ
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ─── Mini Calendar Section ─────────────────────────────────── */}
        <MiniCalendarSection transactions={transactions} categories={categories} wallets={wallets} />

        {/* Detailed Transactions List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100">Lịch sử giao dịch</h3>
            {activeCategoryFilter && (
              <span className="text-[11px] px-2.5 py-0.5 bg-[#8fae8d]/10 text-[#6f8d6d] font-semibold rounded-full font-vietnam">
                Đang lọc theo danh mục
              </span>
            )}
          </div>

          {sortedDates.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 dark:text-zinc-500 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
              <p className="text-xs font-vietnam">Chưa có bản ghi giao dịch nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedDates.map(dateStr => (
                <div key={dateStr} className="space-y-2">
                  {/* Date Badge */}
                  <div className="text-[11px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 tracking-wider px-1">
                    {formatDateString(dateStr)}
                  </div>
                  
                  {/* Date's Transactions */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-50 dark:divide-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.01)] overflow-hidden">
                    {groupedTransactions[dateStr].map(tx => {
                      const catInfo = getCategoryInfo(tx.categoryId, tx);
                      const wInfo = getWalletInfo(tx.walletId);
                      
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3.5 group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-all"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Category Icon */}
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}
                            >
                              <IconRenderer name={catInfo.icon} size={20} />
                            </div>
                            
                            {/* Notes and Wallet details */}
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold font-vietnam text-zinc-800 dark:text-zinc-200 truncate leading-snug">
                                {tx.note}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam font-medium">
                                <span className="font-semibold text-zinc-500 dark:text-zinc-400">{catInfo.name}</span>
                                <span>•</span>
                                <span className="truncate">{wInfo.name}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Amount and Actions */}
                          <div className="flex items-center gap-2 shrink-0 ml-3 text-right">
                            <div className="mr-1">
                              <span className={`text-xs font-bold font-vietnam ${
                                tx.type === 'income' 
                                  ? 'text-emerald-500 dark:text-emerald-400' 
                                  : 'text-rose-500 dark:text-rose-400'
                              }`}>
                                {tx.type === 'income' ? '+' : '-'}{formatVND(tx.amount)}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => onEditTransaction(tx.id)}
                              className="p-1.5 text-zinc-350 dark:text-zinc-650 hover:text-[#6f8d6d] dark:hover:text-[#8fae8d] active:scale-90 transition-colors opacity-0 group-hover:opacity-100 max-sm:opacity-100"
                              title="Sửa giao dịch"
                            >
                              <Pencil size={13} />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này? Số dư ví sẽ được cập nhật lại.')) {
                                  deleteTransaction(tx.id);
                                }
                              }}
                              className="p-1.5 text-zinc-300 dark:text-zinc-700 hover:text-rose-500 dark:hover:text-rose-400 active:scale-90 transition-colors opacity-0 group-hover:opacity-100 max-sm:opacity-100"
                              title="Xóa giao dịch"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

// ─── Mini Calendar Component (embedded in Dashboard) ──────────────────────────
const MiniCalendarSection: React.FC<{
  transactions: import('../types').Transaction[];
  categories: import('../types').Category[];
  wallets: import('../types').Wallet[];
}> = ({ transactions, categories, wallets }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const formatVND = (a: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(a);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = (firstDayOfMonth + 6) % 7; // Mon = 0

  const monthPad = (viewMonth + 1).toString().padStart(2, '0');
  const monthPrefix = `${viewYear}-${monthPad}`;
  const todayStr = today.toISOString().split('T')[0];

  const txByDay = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(tx => {
      if (!tx.date.startsWith(monthPrefix)) return;
      if (!map[tx.date]) map[tx.date] = { income: 0, expense: 0 };
      if (tx.type === 'income') map[tx.date].income += tx.amount;
      else if (tx.categoryId !== 'transfer') map[tx.date].expense += tx.amount;
    });
    return map;
  }, [transactions, monthPrefix]);

  const getCategoryInfo = (catId: string, tx?: any) => {
    if (catId === 'transfer') return { name: 'Chuyển quỹ', icon: 'ArrowLeftRight', color: '#8c8c8c' };
    if (catId === 'savings') return { name: 'Tiết kiệm', icon: 'PiggyBank', color: '#6f8d6d' };
    const cat = categories.find(c => c.id === catId);
    if (cat) return cat;
    if (tx && tx.categoryName) return { name: tx.categoryName, icon: 'FolderHeart', color: '#a1a1aa' };
    return { name: 'Khác', icon: 'HelpCircle', color: '#a1a1aa' };
  };

  const selectedTxs = selectedDay
    ? transactions.filter(t => t.date === selectedDay).sort((a, b) => b.id.localeCompare(a.id))
    : [];

  const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800/60">
        <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
          <CalendarDays size={16} className="text-[#6f8d6d]" />
          Lịch chi tiêu
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400">
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-semibold font-vietnam text-zinc-600 dark:text-zinc-300 capitalize min-w-[100px] text-center">
            {monthLabel}
          </span>
          <button onClick={nextMonth} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {/* Weekday headers */}
        <div className="grid grid-cols-7">
          {weekDayLabels.map(d => (
            <div key={d} className="text-center text-[9px] font-bold text-zinc-400 dark:text-zinc-600 font-vietnam py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPad = day.toString().padStart(2, '0');
            const dateStr = `${viewYear}-${monthPad}-${dayPad}`;
            const dayData = txByDay[dateStr];
            const isToday = dateStr === todayStr;
            const isSelected = selectedDay === dateStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${
                  isSelected
                    ? 'bg-[#6f8d6d] text-white shadow-md scale-105'
                    : isToday
                      ? 'bg-[#8fae8d]/15 text-[#6f8d6d] dark:bg-[#8fae8d]/10 dark:text-[#8fae8d] ring-1 ring-[#8fae8d]/40'
                      : dayData
                        ? 'bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-700/40 text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-400 dark:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/20'
                }`}
              >
                <span className="text-[11px] font-bold font-vietnam leading-none">{day}</span>
                {dayData && (
                  <div className="flex gap-0.5">
                    {dayData.income > 0 && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-emerald-400'}`} />}
                    {dayData.expense > 0 && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-rose-400'}`} />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[9px] text-zinc-400 font-vietnam">Thu</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /><span className="text-[9px] text-zinc-400 font-vietnam">Chi</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8fae8d]" /><span className="text-[9px] text-zinc-400 font-vietnam">Hôm nay</span></div>
        </div>
      </div>

      {/* Day detail drawer */}
      {selectedDay && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 animate-slide-down">
          <div className="px-4 py-3 bg-zinc-50/80 dark:bg-zinc-800/30 flex items-center justify-between">
            <p className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200">
              {new Date(selectedDay + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <button onClick={() => setSelectedDay(null)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors">
              <X size={13} />
            </button>
          </div>
          {selectedTxs.length === 0 ? (
            <p className="text-center py-4 text-[11px] text-zinc-400 font-vietnam">Không có giao dịch</p>
          ) : (
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800 max-h-48 overflow-y-auto">
              {selectedTxs.map(tx => {
                const catInfo = getCategoryInfo(tx.categoryId, tx);
                const wallet = wallets.find(w => w.id === tx.walletId);
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}>
                      <IconRenderer name={catInfo.icon} size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold font-vietnam text-zinc-800 dark:text-zinc-200 truncate">{tx.note}</p>
                      <p className="text-[9px] text-zinc-400 font-vietnam">{catInfo.name} • {wallet?.name}</p>
                    </div>
                    <span className={`text-xs font-bold font-vietnam shrink-0 ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatVND(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
