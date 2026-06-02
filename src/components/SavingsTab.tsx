import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PiggyBank, PlusCircle, Trash2, Info, Target, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { formatThousand, parseThousand } from '../utils/format';
import { CustomSelect } from './CustomSelect';

const GOAL_ICONS = ['🐷', '🏠', '✈️', '🚗', '💍', '📱', '🎓', '🌴', '💻', '🎮', '🏋️', '🎵', '⛵', '🎁', '🌿'];
const GOAL_COLORS = [
  '#8fae8d', '#57c5f7', '#f36e6e', '#9d7bf5', '#f78ce6',
  '#fbbf24', '#34d399', '#fb923c', '#38bdf8', '#a78bfa',
];

export const SavingsTab: React.FC = () => {
  const {
    savingsGoals, wallets,
    addSavingsGoal, deleteSavingsGoal,
    depositToSavingsGoal, withdrawFromSavingsGoal,
    showToast, confirm
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🐷');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  // Deposit / Withdraw modal
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    mode: 'deposit' | 'withdraw';
    goalId: string;
    goalName: string;
    maxAmount: number;
  } | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [actionWalletId, setActionWalletId] = useState(wallets[0]?.id || '');

  const formatVND = (a: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(a);

  const getDaysLeft = (deadline?: string): number | null => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSavingsGoal(name, selectedIcon, selectedColor, parseThousand(targetAmount), deadline || undefined, notes);
    setName(''); setTargetAmount(''); setDeadline(''); setNotes('');
    setShowForm(false);
  };

  const handleAction = () => {
    if (!actionModal) return;
    const parsed = parseThousand(actionAmount);
    if (actionModal.mode === 'deposit') {
      depositToSavingsGoal(actionModal.goalId, actionWalletId, parsed);
    } else {
      withdrawFromSavingsGoal(actionModal.goalId, actionWalletId, parsed);
    }
    setActionModal(null);
    setActionAmount('');
  };

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <PiggyBank className="text-[#6f8d6d]" size={22} />
          Heo Đất Tiết Kiệm
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6f8d6d] text-white rounded-xl text-xs font-bold font-vietnam shadow-sm hover:bg-[#5b755a] transition-all"
        >
          <PlusCircle size={14} />
          {showForm ? 'Đóng' : 'Mục tiêu mới'}
        </button>
      </div>

      {/* Summary Banner */}
      {savingsGoals.length > 0 && (
        <div className="bg-gradient-to-r from-[#6f8d6d] to-[#8fae8d] rounded-3xl p-5 text-white shadow-lg">
          <p className="text-[10px] uppercase tracking-wider opacity-80 font-vietnam font-bold">Tổng tích lũy</p>
          <p className="text-2xl font-extrabold font-vietnam mt-1">{formatVND(totalSaved)}</p>
          <div className="mt-3 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-700"
              style={{ width: `${Math.min(100, totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0)}%` }}
            />
          </div>
          <p className="text-[10px] opacity-70 font-vietnam mt-1.5">
            {totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(1)}% của tổng mục tiêu ${formatVND(totalTarget)}` : 'Chưa có mục tiêu'}
          </p>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 space-y-4 shadow-md animate-slide-down">
          <h3 className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Tạo mục tiêu tiết kiệm
          </h3>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Tên mục tiêu</label>
            <input
              type="text" required value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Mua nhà, Du lịch Nhật..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2.5 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
            />
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Biểu tượng</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(ico => (
                <button
                  key={ico} type="button" onClick={() => setSelectedIcon(ico)}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedIcon === ico ? 'bg-[#8fae8d]/20 ring-2 ring-[#6f8d6d] scale-110' : 'bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map(c => (
                <button
                  key={c} type="button" onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-offset-2 ring-zinc-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Target amount */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Số tiền mục tiêu (VNĐ)</label>
            <div className="relative">
              <input
                type="text" inputMode="decimal" required
                value={targetAmount}
                onChange={e => setTargetAmount(formatThousand(e.target.value))}
                placeholder="0"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2.5 text-sm font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400">đ</span>
            </div>
          </div>

          {/* Deadline & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Hạn chót (tùy chọn)</label>
              <input
                type="date" value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Ghi chú</label>
              <input
                type="text" value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mục tiêu quan trọng..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: `${selectedColor}15`, border: `1px solid ${selectedColor}30` }}>
            <span className="text-2xl">{selectedIcon}</span>
            <div>
              <p className="text-xs font-bold font-vietnam" style={{ color: selectedColor }}>{name || 'Tên mục tiêu'}</p>
              <p className="text-[10px] text-zinc-400 font-vietnam">{targetAmount ? `Mục tiêu: ${formatVND(parseThousand(targetAmount))}` : 'Nhập số tiền...'}</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#6f8d6d] text-white text-xs font-bold font-vietnam rounded-xl shadow-md hover:bg-[#5b755a] active:scale-95 transition-all"
          >
            Tạo heo đất mới 🐷
          </button>
        </form>
      )}

      {/* Goals List */}
      {savingsGoals.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-10 text-center">
          <span className="text-5xl">🐷</span>
          <p className="text-xs font-vietnam text-zinc-400 dark:text-zinc-500 mt-3">Chưa có mục tiêu tiết kiệm nào.</p>
          <p className="text-[10px] font-vietnam text-zinc-300 dark:text-zinc-600 mt-1">Nhấn "+ Mục tiêu mới" để bắt đầu!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savingsGoals.map(goal => {
            const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const daysLeft = getDaysLeft(goal.deadline);

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      {goal.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100">{goal.name}</h4>
                      {goal.notes && (
                        <p className="text-[10px] text-zinc-400 font-vietnam">{goal.notes}</p>
                      )}
                      {daysLeft !== null && (
                        <p className={`text-[10px] font-semibold font-vietnam mt-0.5 flex items-center gap-1 ${
                          daysLeft < 0 ? 'text-rose-500' : daysLeft <= 30 ? 'text-amber-500' : 'text-zinc-400'
                        }`}>
                          <Target size={9} />
                          {daysLeft < 0 ? `Quá hạn ${Math.abs(daysLeft)} ngày` : `Còn ${daysLeft} ngày`}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const ok = await confirm('Xóa mục tiêu', `Bạn có chắc muốn xóa mục tiêu "${goal.name}"?`);
                      if (ok) deleteSavingsGoal(goal.id);
                    }}
                    className="p-1.5 text-zinc-300 hover:text-rose-500 dark:text-zinc-700 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-vietnam">
                    <span className="font-bold" style={{ color: goal.color }}>
                      {formatVND(goal.currentAmount)}
                    </span>
                    <span className="text-zinc-400">{formatVND(goal.targetAmount)}</span>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: goal.color,
                      }}
                    >
                      {progress > 15 && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-vietnam">{progress.toFixed(1)}% hoàn thành</span>
                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-500 font-vietnam">🎉 Đạt mục tiêu!</span>
                    )}
                    {!isCompleted && (
                      <span className="text-[10px] text-zinc-400 font-vietnam">
                        Còn thiếu {formatVND(goal.targetAmount - goal.currentAmount)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setActionModal({ open: true, mode: 'deposit', goalId: goal.id, goalName: goal.name, maxAmount: goal.targetAmount - goal.currentAmount });
                      setActionAmount('');
                      setActionWalletId(wallets[0]?.id || '');
                    }}
                    disabled={isCompleted}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold font-vietnam transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: `${goal.color}15`,
                      color: goal.color,
                      border: `1px solid ${goal.color}30`
                    }}
                  >
                    <ArrowDownCircle size={13} />
                    Nạp vào heo
                  </button>
                  <button
                    onClick={() => {
                      if (goal.currentAmount <= 0) { showToast('Heo đất đang trống!', 'error'); return; }
                      setActionModal({ open: true, mode: 'withdraw', goalId: goal.id, goalName: goal.name, maxAmount: goal.currentAmount });
                      setActionAmount('');
                      setActionWalletId(wallets[0]?.id || '');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[11px] font-bold font-vietnam text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                  >
                    <ArrowUpCircle size={13} />
                    Rút về ví
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deposit/Withdraw Modal */}
      {actionModal?.open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActionModal(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-t-[2.5rem] p-6 space-y-4 shadow-2xl animate-slide-up z-10">
            <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              {actionModal.mode === 'deposit' ? <ArrowDownCircle size={18} className="text-[#6f8d6d]" /> : <ArrowUpCircle size={18} className="text-amber-500" />}
              {actionModal.mode === 'deposit' ? `Nạp vào "${actionModal.goalName}"` : `Rút từ "${actionModal.goalName}"`}
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">
                Số tiền (Tối đa: {formatVND(actionModal.maxAmount)})
              </label>
              <div className="relative">
                <input
                  type="text" inputMode="decimal" autoFocus
                  value={actionAmount}
                  onChange={e => setActionAmount(formatThousand(e.target.value))}
                  placeholder="0"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-3 text-lg font-extrabold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">đ</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 uppercase">Ví</label>
              <CustomSelect
                value={actionWalletId}
                onChange={setActionWalletId}
                options={wallets.map(w => ({ value: w.id, label: w.name }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-zinc-500 text-xs font-bold font-vietnam rounded-xl transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAction}
                className="py-3 bg-[#6f8d6d] text-white text-xs font-bold font-vietnam rounded-xl shadow-sm hover:bg-[#5b755a] transition-all cursor-pointer"
              >
                {actionModal.mode === 'deposit' ? 'Nạp ngay' : 'Rút ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-[#8fae8d]/5 border border-[#8fae8d]/10 rounded-2xl p-3.5 flex items-start gap-2">
        <Info size={13} className="text-[#6f8d6d] shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-400 font-vietnam leading-relaxed">
          Khi nạp tiền vào heo đất, số tiền sẽ được trừ khỏi ví tương ứng và ghi vào lịch sử chi tiêu. Khi rút ra, số dư sẽ được hoàn về ví đã chọn.
        </p>
      </div>
    </div>
  );
};
