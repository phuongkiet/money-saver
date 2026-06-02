import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IconRenderer } from './IconRenderer';
import { FolderHeart, Pencil, Check, AlertTriangle, Palette, PlusCircle, X } from 'lucide-react';
import { formatThousand, parseThousand } from '../utils/format';
import type { Category } from '../types';

export const CategoriesTab: React.FC = () => {
  const { categories, transactions, addCategory, updateCategory, showToast } = useApp();

  // Form states for adding new category
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [newBudgetColor, setNewBudgetColor] = useState('#8fae8d');
  const [newBudgetIcon, setNewBudgetIcon] = useState('ShoppingBag');

  // Form states for editing existing category
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editColor, setEditColor] = useState('#8fae8d');
  const [editIcon, setEditIcon] = useState('ShoppingBag');

  // Helper: Format currency in VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Expanded color palette (16 colors)
  const colorPalette = [
    '#8fae8d', // Sage Green
    '#6f8d6d', // Olive Green
    '#57c5f7', // Light Blue
    '#3b82f6', // Sapphire Blue
    '#9d7bf5', // Purple
    '#a855f7', // Violet
    '#f78ce6', // Pink
    '#ec4899', // Hot Pink
    '#f36e6e', // Pastel Red
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#e5c158', // Yellow
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#64748b', // Slate Gray
  ];

  // Expanded icon options (24 Lucide icons)
  const iconOptions = [
    { name: 'ShoppingBag', label: 'Mua sắm' },
    { name: 'Plane', label: 'Du lịch' },
    { name: 'Coffee', label: 'Cà phê/Ăn vặt' },
    { name: 'Gift', label: 'Quà tặng' },
    { name: 'Home', label: 'Nhà cửa' },
    { name: 'Sparkles', label: 'Làm đẹp/Spa' },
    { name: 'Shirt', label: 'Quần áo' },
    { name: 'BookOpen', label: 'Học tập' },
    { name: 'Utensils', label: 'Ăn uống' },
    { name: 'Car', label: 'Xe cộ/Xăng' },
    { name: 'HeartPulse', label: 'Sức khỏe/Y tế' },
    { name: 'Gamepad2', label: 'Giải trí/Game' },
    { name: 'Film', label: 'Xem phim/Nhạc' },
    { name: 'Dumbbell', label: 'Thể thao/Gym' },
    { name: 'Scissors', label: 'Cắt tóc' },
    { name: 'Bus', label: 'Xe buýt/Công cộng' },
    { name: 'Heart', label: 'Người yêu/Gia đình' },
    { name: 'Wrench', label: 'Sửa chữa/Bảo dưỡng' },
    { name: 'BadgeDollarSign', label: 'Đầu tư' },
    { name: 'Receipt', label: 'Hóa đơn/Điện nước' },
    { name: 'Phone', label: 'Điện thoại/Internet' },
    { name: 'Wine', label: 'Tiệc tùng/Bar' },
    { name: 'Apple', label: 'Đi chợ/Siêu thị' },
    { name: 'Briefcase', label: 'Kinh doanh' }
  ];

  // Calculate spent amount for a specific category in the current month
  const getSpentAmount = (catId: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === catId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Trigger editing mode and fill states with category details
  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditAmount(formatThousand(cat.budget.toString()));
    setEditColor(cat.color);
    setEditIcon(cat.icon);
    setShowAddForm(false); // Close add form to focus on edit
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatId) return;

    const amount = parseThousand(editAmount);
    if (isNaN(amount) || amount < 0) {
      showToast('Vui lòng nhập định mức chi tiêu hợp lệ (lớn hơn hoặc bằng 0).', 'error');
      return;
    }
    if (!editName.trim()) {
      showToast('Vui lòng điền tên danh mục.', 'error');
      return;
    }

    updateCategory(editingCatId, editName.trim(), editColor, editIcon, amount);
    setEditingCatId(null);
    showToast('Cập nhật danh mục thành công!', 'success');
  };

  const handleAddBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseThousand(newBudgetAmount);
    if (isNaN(amount) || amount < 0) {
      showToast('Vui lòng nhập định mức chi tiêu hợp lệ (lớn hơn hoặc bằng 0).', 'error');
      return;
    }
    if (!newBudgetName.trim()) {
      showToast('Vui lòng điền tên ngân sách.', 'error');
      return;
    }

    addCategory(newBudgetName.trim(), newBudgetColor, newBudgetIcon, amount);
    
    // Reset form
    setNewBudgetName('');
    setNewBudgetAmount('');
    setNewBudgetColor('#8fae8d');
    setNewBudgetIcon('ShoppingBag');
    setShowAddForm(false);
    showToast('Thêm ngân sách mới thành công!', 'success');
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <FolderHeart className="text-[#6f8d6d]" />
          Hạn Mức Ngân Sách
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-vietnam mt-1 leading-relaxed">
          Thiết lập ngân sách hàng tháng cho từng danh mục để kiểm soát tài chính tối ưu, tránh chi tiêu quá đà.
        </p>
      </div>

      {/* Button to collapse Add Budget Form */}
      {!editingCatId && (
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold font-vietnam text-[#6f8d6d] dark:text-[#8fae8d] hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.01)] cursor-pointer"
        >
          <PlusCircle size={16} />
          {showAddForm ? 'Đóng form ngân sách' : 'Thêm ngân sách mới'}
        </button>
      )}

      {/* Collapsible Add Budget Form */}
      {showAddForm && !editingCatId && (
        <form onSubmit={handleAddBudgetSubmit} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-md space-y-4 animate-slide-down">
          <h3 className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Tạo ngân sách định mức mới</h3>
          
          <div className="space-y-3.5">
            {/* Budget Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Tên ngân sách</label>
              <input
                type="text"
                required
                value={newBudgetName}
                onChange={(e) => setNewBudgetName(e.target.value)}
                placeholder="Ví dụ: Mua sắm quần áo, Du lịch hè..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d] dark:text-zinc-200"
              />
            </div>

            {/* Budget Limit Amount */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Hạn mức chi tiêu hàng tháng (VNĐ)</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(formatThousand(e.target.value))}
                  placeholder="0 (không hạn mức)"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d] dark:text-zinc-200"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-450 font-vietnam">đ</span>
              </div>
            </div>

            {/* Color Customize */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase block">Chọn màu chủ đạo</label>
              <div className="flex flex-wrap gap-2.5 bg-zinc-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-850 max-h-24 overflow-y-auto">
                {colorPalette.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewBudgetColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                      newBudgetColor === color ? 'border-zinc-700 dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  ></button>
                ))}
              </div>
            </div>

            {/* Icon selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase block">Chọn biểu tượng / Danh mục</label>
              <div className="grid grid-cols-4 gap-2 bg-zinc-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-850 max-h-48 overflow-y-auto">
                {iconOptions.map(icon => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setNewBudgetIcon(icon.name)}
                    className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      newBudgetIcon === icon.name
                        ? 'bg-[#8fae8d]/10 border-[#8fae8d] text-[#6f8d6d] dark:text-[#8fae8d] font-semibold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-500'
                    }`}
                  >
                    <IconRenderer name={icon.name} size={16} />
                    <span className="text-[8px] font-vietnam truncate w-full">{icon.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#6f8d6d] hover:bg-[#5b755a] text-white text-xs font-bold font-vietnam rounded-xl shadow-md active:scale-95 transition-all mt-2 cursor-pointer"
            >
              Tạo Ngân Sách Định Mức
            </button>

          </div>
        </form>
      )}

      {/* Categories Cards List */}
      <div className="space-y-4">
        {categories.map(cat => {
          const spent = getSpentAmount(cat.id);
          const hasBudget = cat.budget > 0;
          const percentage = hasBudget ? Math.min((spent / cat.budget) * 100, 100) : 0;
          const isOverBudget = hasBudget && spent > cat.budget;
          const remaining = cat.budget - spent;

          // If this category is being edited, render the inline form!
          if (editingCatId === cat.id) {
            return (
              <form
                key={cat.id}
                onSubmit={handleSaveEditSubmit}
                className="bg-white dark:bg-zinc-900 border border-[#8fae8d] dark:border-[#6f8d6d] rounded-3xl p-5 shadow-lg space-y-4 animate-scale-up"
              >
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Chỉnh sửa danh mục</h3>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Tên danh mục</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-semibold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d] dark:text-zinc-200"
                    />
                  </div>

                  {/* Limit Input */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase">Hạn mức chi tiêu tháng (VNĐ)</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={editAmount}
                        onChange={(e) => setEditAmount(formatThousand(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none focus:ring-1 focus:ring-[#8fae8d] dark:text-zinc-200"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-450 font-vietnam">đ</span>
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase block">Chọn màu chủ đạo</label>
                    <div className="flex flex-wrap gap-2 bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded-xl border border-zinc-100 dark:border-zinc-850 max-h-20 overflow-y-auto">
                      {colorPalette.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className={`w-5.5 h-5.5 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                            editColor === color ? 'border-zinc-700 dark:border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        ></button>
                      ))}
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase block">Chọn biểu tượng / Danh mục</label>
                    <div className="grid grid-cols-4 gap-1.5 bg-zinc-50 dark:bg-zinc-950/40 p-2 rounded-xl border border-zinc-100 dark:border-zinc-850 max-h-40 overflow-y-auto">
                      {iconOptions.map(icon => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setEditIcon(icon.name)}
                          className={`p-1.5 rounded-lg border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            editIcon === icon.name
                              ? 'bg-[#8fae8d]/10 border-[#8fae8d] text-[#6f8d6d] dark:text-[#8fae8d] font-semibold'
                              : 'border-transparent text-zinc-400 hover:text-zinc-500'
                          }`}
                        >
                          <IconRenderer name={icon.name} size={15} />
                          <span className="text-[8px] font-vietnam truncate w-full">{icon.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 text-zinc-500 dark:text-zinc-400 text-xs font-bold font-vietnam rounded-xl transition-all cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#6f8d6d] hover:bg-[#5b755a] text-white text-xs font-bold font-vietnam rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </form>
            );
          }

          // Otherwise render the regular category view card
          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4 transition-all"
            >
              {/* Card Header (Category Name & Icon) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform hover:scale-105"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <IconRenderer name={cat.icon} size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-200 truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam font-semibold uppercase mt-0.5">
                      Đã dùng: {formatVND(spent)}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => handleStartEdit(cat)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl transition-all cursor-pointer"
                  title="Sửa danh mục"
                >
                  <Pencil size={14} />
                </button>
              </div>

              {/* Budget Input & Display */}
              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-100/50 dark:border-zinc-800/50 flex items-center justify-between">
                <span className="text-xs font-semibold font-vietnam text-zinc-400 dark:text-zinc-500">Hạn mức hàng tháng</span>
                <span className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-100">
                  {hasBudget ? formatVND(cat.budget) : 'Chưa thiết lập'}
                </span>
              </div>

              {/* Budget Progress Bar */}
              {hasBudget && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-semibold font-vietnam">
                    <span className={`${isOverBudget ? 'text-rose-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      Tiến trình: {percentage.toFixed(0)}%
                    </span>
                    
                    {isOverBudget ? (
                      <span className="text-rose-500 flex items-center gap-1">
                        <AlertTriangle size={11} />
                        Vượt {formatVND(Math.abs(remaining))}
                      </span>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400">
                        Còn {formatVND(remaining)}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress Line */}
                  <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget 
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
                          : 'bg-[#8fae8d]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
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
