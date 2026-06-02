import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  RepeatIcon, PlusCircle, Pause, Play, Trash2, Info,
  CheckCircle2, Clock, StopCircle
} from 'lucide-react';
import type { RecurringFrequency, TransactionType } from '../types';
import { formatThousand, parseThousand } from '../utils/format';
import { IconRenderer } from './IconRenderer';
import { CustomSelect } from './CustomSelect';

export const RecurringTab: React.FC = () => {
  const {
    recurringTransactions, categories, wallets,
    addRecurringTransaction, deleteRecurringTransaction,
    pauseRecurringTransaction, resumeRecurringTransaction,
    showToast, confirm
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [note, setNote] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [useTotalOccurrences, setUseTotalOccurrences] = useState(false);
  const [totalOccurrences, setTotalOccurrences] = useState('12');

  const formatVND = (a: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(a);
  const formatDate = (s: string) => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };

  const frequencyLabels: Record<RecurringFrequency, string> = {
    daily: 'Hàng ngày',
    weekly: 'Hàng tuần',
    monthly: 'Hàng tháng'
  };

  const statusConfig = {
    active: { label: 'Đang chạy', color: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400', icon: Play },
    paused: { label: 'Tạm dừng', color: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400', icon: Pause },
    completed: { label: 'Hoàn tất', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500', icon: CheckCircle2 }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseThousand(amount);
    if (!categoryId) { showToast('Vui lòng chọn danh mục.', 'error'); return; }

    addRecurringTransaction(
      parsedAmount, type, categoryId, walletId, note, frequency, startDate,
      endDate || undefined,
      useTotalOccurrences ? parseInt(totalOccurrences) : undefined
    );

    // Reset form
    setAmount(''); setNote(''); setEndDate('');
    setUseTotalOccurrences(false); setTotalOccurrences('12');
    setShowForm(false);
  };

  const activeList = recurringTransactions.filter(r => r.status === 'active');
  const pausedList = recurringTransactions.filter(r => r.status === 'paused');
  const completedList = recurringTransactions.filter(r => r.status === 'completed');

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <RepeatIcon className="text-[#6f8d6d]" size={22} />
          Giao dịch định kỳ
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6f8d6d] text-white rounded-xl text-xs font-bold font-vietnam shadow-sm hover:bg-[#5b755a] transition-all"
        >
          <PlusCircle size={14} />
          {showForm ? 'Đóng' : 'Thêm mới'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-[#8fae8d]/10 dark:bg-[#8fae8d]/5 border border-[#8fae8d]/20 rounded-2xl p-3.5 flex items-start gap-2.5">
        <Info size={15} className="text-[#6f8d6d] shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-vietnam leading-relaxed">
          Giao dịch định kỳ sẽ tự động được ghi vào lịch sử mỗi khi bạn mở app. Bạn có thể đặt số kỳ giới hạn (ví dụ: trả góp 12 tháng) để hệ thống tự dừng sau kỳ cuối.
        </p>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-4 shadow-md animate-slide-down"
        >
          <h3 className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Thiết lập giao dịch mới
          </h3>

          {/* Type toggle */}
          <div className="bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl flex gap-1">
            <button type="button" onClick={() => setType('expense')}
              className={`flex-1 py-2 text-xs font-bold font-vietnam rounded-lg transition-all ${type === 'expense' ? 'bg-white dark:bg-zinc-800 text-rose-500 shadow-sm' : 'text-zinc-400'}`}>
              Chi tiêu
            </button>
            <button type="button" onClick={() => setType('income')}
              className={`flex-1 py-2 text-xs font-bold font-vietnam rounded-lg transition-all ${type === 'income' ? 'bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm' : 'text-zinc-400'}`}>
              Thu nhập
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Số tiền (VNĐ)</label>
            <div className="relative">
              <input
                type="text" inputMode="decimal" required
                value={amount}
                onChange={e => setAmount(formatThousand(e.target.value))}
                placeholder="0"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2.5 text-sm font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">đ</span>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Ghi chú / Tên giao dịch</label>
            <input
              type="text" required
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="VD: Tiền thuê nhà, Lương tháng..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2.5 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
            />
          </div>

          {/* Category & Wallet */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Danh mục</label>
              <CustomSelect
                value={categoryId}
                onChange={setCategoryId}
                required
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                placeholder="-- Chọn --"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Ví thanh toán</label>
              <CustomSelect
                value={walletId}
                onChange={setWalletId}
                options={wallets.map(w => ({ value: w.id, label: w.name }))}
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Tần suất lặp</label>
            <div className="bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl flex gap-1">
              {(['daily', 'weekly', 'monthly'] as RecurringFrequency[]).map(f => (
                <button
                  key={f} type="button" onClick={() => setFrequency(f)}
                  className={`flex-1 py-1.5 text-[10px] font-bold font-vietnam rounded-lg transition-all ${frequency === f ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm' : 'text-zinc-400'}`}
                >
                  {frequencyLabels[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Ngày bắt đầu</label>
              <input
                type="date" required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Ngày kết thúc (tùy chọn)</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
              />
            </div>
          </div>

          {/* Limit occurrences */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useTotalOccurrences}
                onChange={e => setUseTotalOccurrences(e.target.checked)}
                className="rounded accent-[#6f8d6d]"
              />
              <span className="text-[11px] font-semibold font-vietnam text-zinc-600 dark:text-zinc-300">
                Giới hạn số kỳ (dùng cho trả góp theo tháng)
              </span>
            </label>
            {useTotalOccurrences && (
              <div className="flex items-center gap-2">
                <input
                  type="number" min="1" max="360"
                  value={totalOccurrences}
                  onChange={e => setTotalOccurrences(e.target.value)}
                  className="w-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                />
                <span className="text-xs text-zinc-500 font-vietnam">kỳ thanh toán</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#6f8d6d] text-white text-xs font-bold font-vietnam rounded-xl shadow-md hover:bg-[#5b755a] active:scale-95 transition-all"
          >
            Lưu giao dịch định kỳ
          </button>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Đang chạy', count: activeList.length, color: 'text-emerald-500' },
          { label: 'Tạm dừng', count: pausedList.length, color: 'text-amber-500' },
          { label: 'Hoàn tất', count: completedList.length, color: 'text-zinc-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 text-center">
            <span className={`text-lg font-extrabold font-vietnam ${s.color}`}>{s.count}</span>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {recurringTransactions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 text-center">
          <RepeatIcon size={32} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs font-vietnam text-zinc-400 dark:text-zinc-500">Chưa có giao dịch định kỳ nào.</p>
          <p className="text-[10px] font-vietnam text-zinc-300 dark:text-zinc-600 mt-1">Nhấn "+ Thêm mới" để bắt đầu!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurringTransactions.map(rt => {
            const cat = categories.find(c => c.id === rt.categoryId);
            const wallet = wallets.find(w => w.id === rt.walletId);
            const sc = statusConfig[rt.status];
            const StatusIcon = sc.icon;

            return (
              <div
                key={rt.id}
                className={`bg-white dark:bg-zinc-900 border rounded-3xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all ${
                  rt.status === 'completed' ? 'border-zinc-100 dark:border-zinc-800 opacity-60' :
                  rt.type === 'income' ? 'border-emerald-200/50 dark:border-emerald-900/20' :
                  'border-[#8fae8d]/30 dark:border-[#8fae8d]/15'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {cat && (
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        <IconRenderer name={cat.icon} size={18} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 truncate">{rt.note}</p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam mt-0.5">
                        {frequencyLabels[rt.frequency]} • {wallet?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-sm font-extrabold font-vietnam ${rt.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {rt.type === 'income' ? '+' : '-'}{formatVND(rt.amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-50 dark:border-zinc-800/60 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold font-vietnam ${sc.color}`}>
                      <StatusIcon size={10} />
                      {sc.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-vietnam">
                      {rt.totalOccurrences ? `${rt.executedCount}/${rt.totalOccurrences} kỳ` : `${rt.executedCount} kỳ`}
                    </span>
                    {rt.endDate && (
                      <span className="text-[10px] text-zinc-400 font-vietnam flex items-center gap-1">
                        <StopCircle size={9} />
                        {formatDate(rt.endDate)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {rt.status === 'active' && (
                      <button
                        onClick={() => pauseRecurringTransaction(rt.id)}
                        className="p-1.5 text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-colors"
                        title="Tạm dừng"
                      >
                        <Pause size={13} />
                      </button>
                    )}
                    {rt.status === 'paused' && (
                      <button
                        onClick={() => resumeRecurringTransaction(rt.id)}
                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors"
                        title="Tiếp tục"
                      >
                        <Play size={13} />
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        const ok = await confirm('Xóa giao dịch định kỳ', `Bạn có chắc chắn muốn xóa "${rt.note}"?`);
                        if (ok) deleteRecurringTransaction(rt.id);
                      }}
                      className="p-1.5 text-zinc-300 hover:text-rose-500 dark:text-zinc-700 dark:hover:text-rose-400 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {rt.lastExecutedDate && (
                  <p className="text-[9px] text-zinc-300 dark:text-zinc-700 font-vietnam mt-1.5 flex items-center gap-1">
                    <Clock size={9} />
                    Lần cuối: {formatDate(rt.lastExecutedDate)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
