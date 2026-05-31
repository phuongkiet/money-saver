import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IconRenderer } from './IconRenderer';
import { TrendingDown, TrendingUp, Wallet as WalletIcon, Trash2, Info } from 'lucide-react';

export const DashboardTab: React.FC = () => {
  const { transactions, categories, wallets, deleteTransaction } = useApp();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Helper: Format currency in VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Helper: Get Category Info
  const getCategoryInfo = (catId: string) => {
    if (catId === 'transfer') {
      return { name: 'Chuyển quỹ', icon: 'ArrowLeftRight', color: '#8c8c8c' };
    }
    if (catId === 'income-default') {
      return { name: 'Thu nhập', icon: 'TrendingUp', color: '#10b981' };
    }
    const cat = categories.find(c => c.id === catId);
    return cat || { name: 'Khác', icon: 'HelpCircle', color: '#a1a1aa' };
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

  // Group spending by category
  const expenseTransactions = transactions.filter(t => t.type === 'expense' && t.categoryId !== 'transfer');
  
  const categorySpending = categories.map(cat => {
    const amount = expenseTransactions
      .filter(t => t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...cat,
      amount
    };
  }).filter(c => c.amount > 0);

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
          {/* Welcome Info */}
          <div className="text-zinc-500 dark:text-zinc-400 text-xs font-vietnam uppercase tracking-wider font-semibold">
            Tổng tài sản tích lũy
          </div>
          <div className="text-3xl font-bold font-vietnam mt-1 text-zinc-800 dark:text-zinc-100 flex items-baseline gap-1">
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
                    className="w-full text-center py-1 text-[11px] font-semibold text-[#6f8d6d] hover:underline"
                  >
                    Bỏ lọc biểu đồ
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

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
                      const catInfo = getCategoryInfo(tx.categoryId);
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
                          
                          {/* Amount and Delete Action */}
                          <div className="flex items-center gap-3 shrink-0 ml-3 text-right">
                            <div>
                              <span className={`text-xs font-bold font-vietnam ${
                                tx.type === 'income' 
                                  ? 'text-emerald-500 dark:text-emerald-400' 
                                  : 'text-rose-500 dark:text-rose-400'
                              }`}>
                                {tx.type === 'income' ? '+' : '-'}{formatVND(tx.amount)}
                              </span>
                            </div>
                            
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
