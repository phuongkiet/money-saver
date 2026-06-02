import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { IconRenderer } from './IconRenderer';

export const CalendarTab: React.FC = () => {
  const { transactions, categories, wallets } = useApp();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
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

  // Build calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Offset: make Monday = 0 (Vietnamese convention)
  const startOffset = (firstDayOfMonth + 6) % 7;

  // Index transactions by date for this month
  const monthPad = (viewMonth + 1).toString().padStart(2, '0');
  const monthPrefix = `${viewYear}-${monthPad}`;

  const txByDay = useMemo(() => {
    const map: Record<string, { income: number; expense: number; count: number }> = {};
    transactions.forEach(tx => {
      if (!tx.date.startsWith(monthPrefix)) return;
      if (!map[tx.date]) map[tx.date] = { income: 0, expense: 0, count: 0 };
      if (tx.type === 'income') map[tx.date].income += tx.amount;
      else if (tx.categoryId !== 'transfer') map[tx.date].expense += tx.amount;
      map[tx.date].count++;
    });
    return map;
  }, [transactions, monthPrefix]);

  const getCategoryInfo = (catId: string) => {
    if (catId === 'transfer') return { name: 'Chuyển quỹ', icon: 'ArrowLeftRight', color: '#8c8c8c' };
    if (catId === 'income-default') return { name: 'Thu nhập', icon: 'TrendingUp', color: '#10b981' };
    if (catId === 'savings') return { name: 'Tiết kiệm', icon: 'PiggyBank', color: '#6f8d6d' };
    const cat = categories.find(c => c.id === catId);
    return cat || { name: 'Khác', icon: 'HelpCircle', color: '#a1a1aa' };
  };

  const selectedTxs = selectedDay
    ? transactions.filter(t => t.date === selectedDay).sort((a, b) => b.id.localeCompare(a.id))
    : [];

  const selectedDayIncome = selectedTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const selectedDayExpense = selectedTxs.filter(t => t.type === 'expense' && t.categoryId !== 'transfer').reduce((s, t) => s + t.amount, 0);

  const todayStr = today.toISOString().split('T')[0];

  // Month summary
  const monthIncome = Object.values(txByDay).reduce((s, d) => s + d.income, 0);
  const monthExpense = Object.values(txByDay).reduce((s, d) => s + d.expense, 0);

  const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="pb-24 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <CalendarDays className="text-[#6f8d6d]" size={22} />
          Lịch chi tiêu
        </h2>
      </div>

      {/* Month Navigation */}
      <div className="px-4 mb-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <p className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100 capitalize">{monthLabel}</p>
              <p className="text-[10px] text-zinc-400 font-vietnam mt-0.5">
                {Object.keys(txByDay).length} ngày có giao dịch
              </p>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Month summary */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-2.5 text-center">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-vietnam font-semibold uppercase">Thu</span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-vietnam mt-0.5">{formatVND(monthIncome)}</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-2.5 text-center">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-vietnam font-semibold uppercase">Chi</span>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 font-vietnam mt-0.5">{formatVND(monthExpense)}</p>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {weekDayLabels.map(d => (
              <div key={d} className="text-center text-[9px] font-bold text-zinc-400 dark:text-zinc-600 font-vietnam py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Empty cells before first day */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayPad = day.toString().padStart(2, '0');
              const dateStr = `${viewYear}-${monthPad}-${dayPad}`;
              const dayData = txByDay[dateStr];
              const isToday = dateStr === todayStr;
              const isSelected = selectedDay === dateStr;
              const hasIncome = dayData?.income > 0;
              const hasExpense = dayData?.expense > 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                    isSelected
                      ? 'bg-[#6f8d6d] text-white shadow-md scale-105'
                      : isToday
                        ? 'bg-[#8fae8d]/15 text-[#6f8d6d] dark:bg-[#8fae8d]/10 dark:text-[#8fae8d] ring-1 ring-[#8fae8d]/40'
                        : dayData
                          ? 'bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-700/30 text-zinc-700 dark:text-zinc-300'
                          : 'text-zinc-400 dark:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <span className="text-[11px] font-bold font-vietnam leading-none">{day}</span>
                  {dayData && (
                    <div className="flex gap-0.5">
                      {hasIncome && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-emerald-400'}`} />}
                      {hasExpense && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-rose-400'}`} />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-zinc-50 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-zinc-400 font-vietnam">Thu nhập</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-[9px] text-zinc-400 font-vietnam">Chi tiêu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8fae8d]" />
              <span className="text-[9px] text-zinc-400 font-vietnam">Hôm nay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Detail Panel */}
      {selectedDay && (
        <div className="px-4 animate-slide-down">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Day panel header */}
            <div className="px-4 py-3.5 bg-zinc-50/80 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200">
                  {new Date(selectedDay + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {selectedDayIncome > 0 && (
                    <span className="text-[10px] font-bold text-emerald-500 font-vietnam">+{formatVND(selectedDayIncome)}</span>
                  )}
                  {selectedDayExpense > 0 && (
                    <span className="text-[10px] font-bold text-rose-500 font-vietnam">-{formatVND(selectedDayExpense)}</span>
                  )}
                  {selectedTxs.length === 0 && (
                    <span className="text-[10px] text-zinc-400 font-vietnam">Không có giao dịch</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400"
              >
                <X size={14} />
              </button>
            </div>

            {selectedTxs.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 dark:text-zinc-600">
                <CalendarDays size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-vietnam">Ngày này chưa có giao dịch nào</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {selectedTxs.map(tx => {
                  const catInfo = getCategoryInfo(tx.categoryId);
                  const wallet = wallets.find(w => w.id === tx.walletId);
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}
                      >
                        <IconRenderer name={catInfo.icon} size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold font-vietnam text-zinc-800 dark:text-zinc-200 truncate">{tx.note}</p>
                        <p className="text-[10px] text-zinc-400 font-vietnam mt-0.5">{catInfo.name} • {wallet?.name}</p>
                      </div>
                      <span className={`text-xs font-bold font-vietnam shrink-0 ${
                        tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatVND(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
