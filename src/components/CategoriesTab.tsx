import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IconRenderer } from './IconRenderer';
import { FolderHeart, Pencil, AlertTriangle, PlusCircle, X, PiggyBank, RepeatIcon } from 'lucide-react';
import { formatThousand, parseThousand } from '../utils/format';
import type { Category } from '../types';
import { SavingsTab } from './SavingsTab';
import { RecurringTab } from './RecurringTab';

type SubTab = 'budget' | 'savings' | 'recurring';

export const CategoriesTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('budget');

  return (
    <div className="pb-24 pt-6 max-w-md mx-auto flex flex-col">
      {/* Sub-tab navigation */}
      <div className="px-4 mb-5">
        <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl flex gap-1 shadow-inner">
          <button
            onClick={() => setActiveSubTab('budget')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold font-vietnam rounded-xl transition-all ${
              activeSubTab === 'budget'
                ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
            }`}
          >
            <FolderHeart size={14} strokeWidth={activeSubTab === 'budget' ? 2.5 : 2} />
            Ngân sách
          </button>
          <button
            onClick={() => setActiveSubTab('savings')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold font-vietnam rounded-xl transition-all ${
              activeSubTab === 'savings'
                ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
            }`}
          >
            <PiggyBank size={14} strokeWidth={activeSubTab === 'savings' ? 2.5 : 2} />
            Heo đất
          </button>
          <button
            onClick={() => setActiveSubTab('recurring')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold font-vietnam rounded-xl transition-all ${
              activeSubTab === 'recurring'
                ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400'
            }`}
          >
            <RepeatIcon size={14} strokeWidth={activeSubTab === 'recurring' ? 2.5 : 2} />
            Định kỳ
          </button>
        </div>
      </div>

      {/* Content area */}
      {activeSubTab === 'budget' && <BudgetContent />}
      {activeSubTab === 'savings' && <SavingsContent />}
      {activeSubTab === 'recurring' && <RecurringContent />}
    </div>
  );
};

// ─── Budget Content ───────────────────────────────────────────
const BudgetContent: React.FC = () => {
  const { categories, transactions, addCategory, updateCategory, deleteCategory, showToast, confirm } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetColor, setNewBudgetColor] = useState('#8fae8d');
  const [newBudgetIcon, setNewBudgetIcon] = useState('ShoppingBag');

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editColor, setEditColor] = useState('#8fae8d');
  const [editIcon, setEditIcon] = useState('ShoppingBag');

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const colorPalette = [
    '#8fae8d', '#6f8d6d', '#57c5f7', '#3b82f6', '#9d7bf5', '#a855f7',
    '#f78ce6', '#ec4899', '#f36e6e', '#ef4444', '#f97316', '#f59e0b',
    '#e5c158', '#14b8a6', '#06b6d4', '#64748b',
  ];

  const iconOptions = [
    { name: 'ShoppingBag', label: 'Mua sắm' }, { name: 'Plane', label: 'Du lịch' },
    { name: 'Coffee', label: 'Cà phê' }, { name: 'Gift', label: 'Quà tặng' },
    { name: 'Home', label: 'Nhà cửa' }, { name: 'Sparkles', label: 'Làm đẹp' },
    { name: 'Shirt', label: 'Quần áo' }, { name: 'BookOpen', label: 'Học tập' },
    { name: 'Utensils', label: 'Ăn uống' }, { name: 'Car', label: 'Xe cộ' },
    { name: 'HeartPulse', label: 'Sức khỏe' }, { name: 'Gamepad2', label: 'Game' },
    { name: 'Film', label: 'Phim/Nhạc' }, { name: 'Dumbbell', label: 'Gym' },
    { name: 'Scissors', label: 'Cắt tóc' }, { name: 'Bus', label: 'Xe buýt' },
    { name: 'Heart', label: 'Gia đình' }, { name: 'Wrench', label: 'Sửa chữa' },
    { name: 'BadgeDollarSign', label: 'Đầu tư' }, { name: 'Receipt', label: 'Hóa đơn' },
    { name: 'Phone', label: 'Điện thoại' }, { name: 'Wine', label: 'Tiệc tùng' },
    { name: 'Apple', label: 'Đi chợ' }, { name: 'Briefcase', label: 'Kinh doanh' },
  ];

  const getSpentAmount = (catId: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === catId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getIncomeAmount = (catId: string) => {
    return transactions
      .filter(t => t.type === 'income' && t.categoryId === catId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditAmount(formatThousand(cat.budget.toString()));
    setEditColor(cat.color);
    setEditIcon(cat.icon);
    setShowAddForm(false);
    setCategoryType(cat.type || 'expense');
  };

  const handleCancelEdit = () => setEditingCatId(null);

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatId) return;
    const amount = categoryType === 'expense' ? parseThousand(editAmount) : 0;
    if (categoryType === 'expense' && (isNaN(amount) || amount < 0)) { showToast('Vui lòng nhập định mức hợp lệ.', 'error'); return; }
    if (!editName.trim()) { showToast('Vui lòng điền tên danh mục.', 'error'); return; }
    updateCategory(editingCatId, editName.trim(), editColor, editIcon, amount, categoryType);
    setEditingCatId(null);
    showToast('Cập nhật danh mục thành công!', 'success');
  };

  const handleAddBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = categoryType === 'expense' ? parseThousand(newBudgetAmount) : 0;
    if (categoryType === 'expense' && (isNaN(amount) || amount < 0)) { showToast('Vui lòng nhập định mức hợp lệ.', 'error'); return; }
    if (!newBudgetName.trim()) { showToast('Vui lòng điền tên danh mục.', 'error'); return; }
    addCategory(newBudgetName.trim(), newBudgetColor, newBudgetIcon, amount, categoryType);
    setNewBudgetName(''); setNewBudgetAmount(''); setNewBudgetColor('#8fae8d'); setNewBudgetIcon('ShoppingBag');
    setShowAddForm(false);
    showToast(categoryType === 'expense' ? 'Thêm danh mục chi tiêu thành công!' : 'Thêm danh mục thu nhập thành công!', 'success');
  };

  const handleDeleteCategoryClick = async (cat: Category) => {
    const txCount = transactions.filter(t => t.categoryId === cat.id).length;
    let message = `Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`;
    if (txCount > 0) message += ` Có ${txCount} giao dịch đang liên kết. Tên danh mục sẽ được lưu snapshot trên giao dịch để không bị mất báo cáo tài chính.`;
    const confirmed = await confirm("Xác nhận xóa danh mục", message);
    if (confirmed) {
      deleteCategory(cat.id);
      if (editingCatId === cat.id) setEditingCatId(null);
    }
  };

  const filteredCategories = categories.filter(c => (c.type || 'expense') === categoryType);

  return (
    <div className="px-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <FolderHeart className="text-[#6f8d6d]" />
          Danh Mục Quản Lý
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-vietnam mt-1 leading-relaxed">
          Quản lý các khoản chi tiêu và nguồn thu nhập.
        </p>
      </div>

      {!editingCatId && (
        <div className="bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-2xl flex gap-1.5 mt-2">
          <button onClick={() => setCategoryType('expense')} className={`flex-1 py-2.5 text-xs font-bold font-vietnam rounded-xl transition-all ${categoryType === 'expense' ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}>Chi tiêu (-)</button>
          <button onClick={() => setCategoryType('income')} className={`flex-1 py-2.5 text-xs font-bold font-vietnam rounded-xl transition-all ${categoryType === 'income' ? 'bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}>Thu nhập (+)</button>
        </div>
      )}

      {!editingCatId && (
        <button onClick={() => setShowAddForm(!showAddForm)} className={`w-full py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold font-vietnam transition-all shadow-[0_4px_12px_rgba(0,0,0,0.01)] cursor-pointer ${categoryType === 'expense' ? 'text-[#6f8d6d] dark:text-[#8fae8d] hover:bg-zinc-100/50' : 'text-emerald-500 dark:text-emerald-400 hover:bg-zinc-100/50'}`}>
          <PlusCircle size={16} />
          {showAddForm ? 'Đóng form tạo mới' : categoryType === 'expense' ? 'Thêm danh mục chi tiêu' : 'Thêm danh mục thu nhập'}
        </button>
      )}

      {showAddForm && !editingCatId && (
        <form onSubmit={handleAddBudgetSubmit} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-md space-y-4 animate-slide-down">
          <h3 className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{categoryType === 'expense' ? 'Tạo danh mục chi tiêu mới' : 'Tạo danh mục thu nhập mới'}</h3>
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">{categoryType === 'expense' ? 'Tên danh mục chi tiêu' : 'Tên danh mục thu nhập'}</label>
              <input type="text" required value={newBudgetName} onChange={(e) => setNewBudgetName(e.target.value)} placeholder={categoryType === 'expense' ? 'Ví dụ: Cà phê, Đi chợ...' : 'Ví dụ: Lương, Thưởng...'} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d] dark:text-zinc-200" />
            </div>
            {categoryType === 'expense' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Hạn mức hàng tháng (VNĐ)</label>
                <div className="relative">
                  <input type="text" inputMode="decimal" required value={newBudgetAmount} onChange={(e) => setNewBudgetAmount(formatThousand(e.target.value))} placeholder="0 (không hạn mức)" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d] dark:text-zinc-200" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-450 font-vietnam">đ</span>
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase block">Chọn màu chủ đạo</label>
              <div className="flex flex-wrap gap-2.5 bg-zinc-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-850 max-h-24 overflow-y-auto">
                {colorPalette.map(color => (
                  <button key={color} type="button" onClick={() => setNewBudgetColor(color)} className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${newBudgetColor === color ? 'border-zinc-700 dark:border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase block">Chọn biểu tượng</label>
              <div className="grid grid-cols-4 gap-2 bg-zinc-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-850 max-h-48 overflow-y-auto">
                {iconOptions.map(icon => (
                  <button key={icon.name} type="button" onClick={() => setNewBudgetIcon(icon.name)} className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${newBudgetIcon === icon.name ? 'bg-[#8fae8d]/10 border-[#8fae8d] text-[#6f8d6d] dark:text-[#8fae8d] font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-500'}`}>
                    <IconRenderer name={icon.name} size={16} />
                    <span className="text-[8px] font-vietnam truncate w-full">{icon.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className={`w-full py-3 text-white text-xs font-bold font-vietnam rounded-xl shadow-md active:scale-95 transition-all mt-2 cursor-pointer ${categoryType === 'expense' ? 'bg-[#6f8d6d] hover:bg-[#5b755a]' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
              {categoryType === 'expense' ? 'Tạo Danh Mục Chi Tiêu' : 'Tạo Danh Mục Thu Nhập'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {filteredCategories.map(cat => {
          const spent = getSpentAmount(cat.id);
          const hasBudget = cat.budget > 0;
          const percentage = hasBudget ? Math.min((spent / cat.budget) * 100, 100) : 0;
          const isOverBudget = hasBudget && spent > cat.budget;
          const remaining = cat.budget - spent;

          if (editingCatId === cat.id) {
            return (
              <form key={cat.id} onSubmit={handleSaveEditSubmit} className="bg-white dark:bg-zinc-900 border border-[#8fae8d] dark:border-[#6f8d6d] rounded-3xl p-5 shadow-lg space-y-4 animate-scale-up">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Chỉnh sửa danh mục</h3>
                  <button type="button" onClick={handleCancelEdit} className="p-1 text-zinc-400 hover:text-zinc-650 rounded-lg cursor-pointer"><X size={16} /></button>
                </div>
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Tên danh mục</label>
                    <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-semibold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d] dark:text-zinc-200" />
                  </div>
                  {categoryType === 'expense' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Hạn mức tháng (VNĐ)</label>
                      <div className="relative">
                        <input type="text" inputMode="decimal" required value={editAmount} onChange={(e) => setEditAmount(formatThousand(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d] dark:text-zinc-200" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-450 font-vietnam">đ</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase block">Màu chủ đạo</label>
                    <div className="flex flex-wrap gap-2 bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded-xl border border-zinc-100 dark:border-zinc-850 max-h-20 overflow-y-auto">
                      {colorPalette.map(color => (
                        <button key={color} type="button" onClick={() => setEditColor(color)} className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${editColor === color ? 'border-zinc-700 dark:border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase block">Biểu tượng</label>
                    <div className="grid grid-cols-4 gap-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded-xl border border-zinc-100 dark:border-zinc-850 max-h-40 overflow-y-auto">
                      {iconOptions.map(icon => (
                        <button key={icon.name} type="button" onClick={() => setEditIcon(icon.name)} className={`p-1.5 rounded-lg border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${editIcon === icon.name ? 'bg-[#8fae8d]/10 border-[#8fae8d] text-[#6f8d6d] dark:text-[#8fae8d] font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-500'}`}>
                          <IconRenderer name={icon.name} size={15} />
                          <span className="text-[8px] font-vietnam truncate w-full">{icon.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={handleCancelEdit} className="flex-1 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 text-zinc-550 dark:text-zinc-400 text-xs font-bold font-vietnam rounded-xl transition-all cursor-pointer">Hủy bỏ</button>
                    <button type="submit" className="flex-1 py-2.5 bg-[#6f8d6d] hover:bg-[#5b755a] text-white text-xs font-bold font-vietnam rounded-xl shadow-sm transition-all cursor-pointer">Lưu thay đổi</button>
                  </div>
                </div>
              </form>
            );
          }

          return (
            <div key={cat.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform hover:scale-105" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    <IconRenderer name={cat.icon} size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-200 truncate">{cat.name}</h3>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam font-semibold uppercase mt-0.5">{categoryType === 'expense' ? `Đã dùng: ${formatVND(spent)}` : `Tổng thu: ${formatVND(getIncomeAmount(cat.id))}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleStartEdit(cat)} className="p-2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-305 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl transition-all cursor-pointer" title="Sửa danh mục"><Pencil size={14} /></button>
                  <button onClick={() => handleDeleteCategoryClick(cat)} className="p-2 text-rose-400 hover:text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl transition-all cursor-pointer" title="Xóa danh mục"><X size={14} /></button>
                </div>
              </div>
              {categoryType === 'expense' && (
                <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-100/50 dark:border-zinc-800/50 flex items-center justify-between">
                  <span className="text-xs font-semibold font-vietnam text-zinc-400 dark:text-zinc-500">Hạn mức hàng tháng</span>
                  <span className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-100">{hasBudget ? formatVND(cat.budget) : 'Chưa thiết lập'}</span>
                </div>
              )}
              {categoryType === 'expense' && hasBudget && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-semibold font-vietnam">
                    <span className={`${isOverBudget ? 'text-rose-500' : 'text-zinc-400 dark:text-zinc-500'}`}>Tiến trình: {percentage.toFixed(0)}%</span>
                    {isOverBudget ? <span className="text-rose-500 flex items-center gap-1"><AlertTriangle size={11} />Vượt {formatVND(Math.abs(remaining))}</span> : <span className="text-zinc-500 dark:text-zinc-400">Còn {formatVND(remaining)}</span>}
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-[#8fae8d]'}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Savings Content (wrapper – remove outer padding since CategoriesTab has its own) ───
const SavingsContent: React.FC = () => {
  return (
    <div className="-mt-6">
      <SavingsTab />
    </div>
  );
};

// ─── Recurring Content (wrapper) ─────────────────────────────────────────────
const RecurringContent: React.FC = () => {
  return (
    <div className="-mt-6">
      <RecurringTab />
    </div>
  );
};
