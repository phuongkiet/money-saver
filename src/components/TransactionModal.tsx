import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IconRenderer } from './IconRenderer';
import { X, Calendar, Wallet as WalletIcon, FolderHeart, FileText } from 'lucide-react';
import { formatThousand, parseThousand } from '../utils/format';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransactionId?: string | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, editingTransactionId }) => {
  const { categories, wallets, addTransaction, updateTransaction, transactions, showToast } = useApp();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  // Set form values when opening or changing edit transaction
  React.useEffect(() => {
    if (isOpen) {
      if (editingTransactionId) {
        const tx = transactions.find(t => t.id === editingTransactionId);
        if (tx) {
          setType(tx.type);
          setAmount(formatThousand(tx.amount.toString()));
          setCategoryId(tx.categoryId === 'income-default' ? '' : tx.categoryId);
          setWalletId(tx.walletId);
          setDate(tx.date);
          setNote(tx.note);
          return;
        }
      }

      // Default values for new transaction
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('expense');
      
      if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      if (wallets.length > 0) {
        // Set cash wallet or first wallet as default
        const cashWallet = wallets.find(w => w.type === 'cash') || wallets[0];
        setWalletId(cashWallet.id);
      }
    }
  }, [isOpen, editingTransactionId, categories, wallets, transactions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseThousand(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Vui lòng nhập số tiền hợp lệ lớn hơn 0.', 'error');
      return;
    }

    if (!categoryId && type === 'expense') {
      showToast('Vui lòng chọn danh mục chi tiêu.', 'error');
      return;
    }

    if (!walletId) {
      showToast('Vui lòng chọn tài khoản thanh toán.', 'error');
      return;
    }

    // If type is income, use income-default category id
    const finalCategoryId = type === 'income' ? 'income-default' : categoryId;

    if (editingTransactionId) {
      updateTransaction(editingTransactionId, parsedAmount, type, finalCategoryId, walletId, note, date);
      showToast('Cập nhật giao dịch thành công!', 'success');
    } else {
      addTransaction(parsedAmount, type, finalCategoryId, walletId, note, date);
      showToast('Thêm giao dịch mới thành công!', 'success');
    }
    
    // Reset form & Close
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[2.5rem] shadow-2xl border-t border-zinc-100 dark:border-zinc-800 px-6 pt-5 pb-8 space-y-5 animate-slide-up z-10 min-h-[85vh] max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-base font-bold font-vietnam text-zinc-800 dark:text-zinc-100">
            {editingTransactionId ? 'Chỉnh Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Segmented Control (Expense vs Income) */}
          <div className="bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-2xl flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                // Select first category
                if (categories.length > 0) setCategoryId(categories[0].id);
              }}
              className={`flex-1 py-2 text-xs font-bold font-vietnam rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-zinc-800 text-rose-500 shadow-sm'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-500'
              }`}
            >
              Chi tiêu (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-xs font-bold font-vietnam rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-500'
              }`}
            >
              Thu nhập (+)
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Số tiền giao dịch (VNĐ)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                required
                value={amount}
                onChange={(e) => setAmount(formatThousand(e.target.value))}
                placeholder="0"
                className={`w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl pl-4 pr-12 py-3.5 text-lg font-bold font-vietnam focus:outline-none focus:ring-2 focus:ring-[#8fae8d]/40 focus:border-[#8fae8d] ${
                  type === 'expense' ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold font-vietnam text-zinc-400">
                đ
              </span>
            </div>
          </div>

          {/* Wallet Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block flex items-center gap-1">
              <WalletIcon size={12} />
              Chọn tài khoản / ví thanh toán
            </label>
            <div className="grid grid-cols-3 gap-2">
              {wallets.map(w => (
                <button
                  type="button"
                  key={w.id}
                  onClick={() => setWalletId(w.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                    walletId === w.id
                      ? 'border-[#8fae8d] bg-[#8fae8d]/5 ring-1 ring-[#8fae8d]'
                      : 'border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-950/20'
                  }`}
                >
                  <span className={`p-1.5 rounded-lg text-xs ${
                    walletId === w.id ? 'bg-[#8fae8d]/20 text-[#6f8d6d]' : 'bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    <IconRenderer name={w.icon} size={14} />
                  </span>
                  <span className="text-[10px] font-bold font-vietnam text-zinc-700 dark:text-zinc-300 truncate w-full mt-1">
                    {w.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection (Only show for expense) */}
          {type === 'expense' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block flex items-center gap-1">
                <FolderHeart size={12} />
                Chọn danh mục chi tiêu
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {categories.map(cat => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      categoryId === cat.id
                        ? 'bg-[#8fae8d]/5 border-[#8fae8d] ring-1 ring-[#8fae8d]'
                        : 'border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      <IconRenderer name={cat.icon} size={15} />
                    </span>
                    <span className="text-[9px] font-bold font-vietnam text-zinc-600 dark:text-zinc-300 truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Picker & Notes */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block flex items-center gap-1">
                <Calendar size={12} />
                Ngày chi tiêu
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium font-vietnam text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block flex items-center gap-1">
                <FileText size={12} />
                Ghi chú / Mô tả
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú chi tiêu..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium font-vietnam text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 pb-6">
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-br from-[#8fae8d] to-[#6f8d6d] text-white text-xs font-bold font-vietnam rounded-2xl shadow-[0_4px_16px_rgba(143,174,141,0.3)] hover:scale-[1.01] hover:shadow-[0_6px_20px_rgba(143,174,141,0.4)] active:scale-95 transition-all focus:outline-none"
            >
              {editingTransactionId ? 'Lưu Thay Đổi' : 'Hoàn Thành Giao Dịch'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
