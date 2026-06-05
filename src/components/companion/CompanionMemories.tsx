import React, { useState } from 'react';
import { useCompanion } from '../../context/CompanionContext';
import type { SpecialDate, GiftIdea } from '../../types';
import { Sparkles, Gift, Plus, Trash2, Edit2, Check, X, ExternalLink, CheckSquare, Square } from 'lucide-react';
import { CustomSelect } from '../CustomSelect';

export const CompanionMemories: React.FC = () => {
  const {
    addSpecialDate,
    updateSpecialDate,
    deleteSpecialDate,
    giftIdeas,
    addGiftIdea,
    updateGiftIdea,
    deleteGiftIdea,
    getUpcomingSpecialDates
  } = useCompanion();

  const [activeSection, setActiveSection] = useState<'dates' | 'gifts'>('dates');

  // MODAL STATES
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  // EDIT STATE ID
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);

  // DATE FORM FIELDS
  const [dateTitle, setDateTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [dateIsRecurring, setDateIsRecurring] = useState(true);
  const [dateNotes, setDateNotes] = useState('');

  // GIFT FORM FIELDS
  const [giftName, setGiftName] = useState('');
  const [giftPrice, setGiftPrice] = useState('');
  const [giftPriority, setGiftPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [giftLink, setGiftLink] = useState('');
  const [giftNotes, setGiftNotes] = useState('');

  // GIFT FILTER STATE
  const [giftFilter, setGiftFilter] = useState<'all' | 'pending' | 'purchased'>('pending');

  const upcomingSpecialDates = getUpcomingSpecialDates();

  const handleOpenAddDate = () => {
    setEditingDateId(null);
    setDateTitle('');
    setDateStr('');
    setDateIsRecurring(true);
    setDateNotes('');
    setIsDateModalOpen(true);
  };

  const handleOpenEditDate = (sd: SpecialDate) => {
    setEditingDateId(sd.id);
    setDateTitle(sd.title);
    setDateStr(sd.date);
    setDateIsRecurring(sd.isRecurring);
    setDateNotes(sd.notes || '');
    setIsDateModalOpen(true);
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTitle.trim() || !dateStr) return;

    const data = {
      title: dateTitle.trim(),
      date: dateStr,
      isRecurring: dateIsRecurring,
      notes: dateNotes.trim() || undefined
    };

    if (editingDateId) {
      updateSpecialDate(editingDateId, data);
    } else {
      addSpecialDate(data);
    }
    setIsDateModalOpen(false);
  };

  const handleOpenAddGift = () => {
    setEditingGiftId(null);
    setGiftName('');
    setGiftPrice('');
    setGiftPriority('medium');
    setGiftLink('');
    setGiftNotes('');
    setIsGiftModalOpen(true);
  };

  const handleOpenEditGift = (gift: GiftIdea) => {
    setEditingGiftId(gift.id);
    setGiftName(gift.name);
    setGiftPrice(gift.price !== undefined ? gift.price.toString() : '');
    setGiftPriority(gift.priority);
    setGiftLink(gift.link || '');
    setGiftNotes(gift.notes || '');
    setIsGiftModalOpen(true);
  };

  const handleGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftName.trim()) return;

    const priceNum = giftPrice.trim() !== '' ? Number(giftPrice) : undefined;

    const data = {
      name: giftName.trim(),
      price: priceNum,
      priority: giftPriority,
      link: giftLink.trim() || undefined,
      notes: giftNotes.trim() || undefined
    };

    if (editingGiftId) {
      updateGiftIdea(editingGiftId, data);
    } else {
      addGiftIdea(data);
    }
    setIsGiftModalOpen(false);
  };

  const toggleGiftPurchased = (gift: GiftIdea) => {
    updateGiftIdea(gift.id, { isPurchased: !gift.isPurchased });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatVND = (price?: number) => {
    if (price === undefined) return 'Chưa ghi giá';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Filter gifts list
  const filteredGifts = giftIdeas.filter(gift => {
    if (giftFilter === 'all') return true;
    if (giftFilter === 'pending') return !gift.isPurchased;
    return gift.isPurchased;
  });

  return (
    <div className="flex flex-col h-full font-vietnam relative">
      {/* Tab pill selectors */}
      <div className="p-4 shrink-0 flex items-center justify-between">
        <div className="flex bg-zinc-150/60 dark:bg-zinc-900/60 p-1 border border-zinc-200/30 dark:border-zinc-800 rounded-xl max-w-[240px]">
          <button
            onClick={() => setActiveSection('dates')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all text-center flex items-center gap-1 ${
              activeSection === 'dates'
                ? 'bg-white dark:bg-zinc-800 text-[var(--theme-nav-active)] shadow-sm'
                : 'text-zinc-500'
            }`}
          >
            <Sparkles size={13} />
            Ngày kỷ niệm
          </button>
          
          <button
            onClick={() => setActiveSection('gifts')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all text-center flex items-center gap-1 ${
              activeSection === 'gifts'
                ? 'bg-white dark:bg-zinc-800 text-[var(--theme-nav-active)] shadow-sm'
                : 'text-zinc-500'
            }`}
          >
            <Gift size={13} />
            Ý tưởng quà
          </button>
        </div>

        {activeSection === 'dates' ? (
          <button
            onClick={handleOpenAddDate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            style={{ backgroundColor: 'var(--theme-nav-active)' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Thêm sự kiện
          </button>
        ) : (
          <button
            onClick={handleOpenAddGift}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            style={{ backgroundColor: 'var(--theme-nav-active)' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Thêm quà
          </button>
        )}
      </div>

      {/* SECTION 1: SPECIAL DATES */}
      {activeSection === 'dates' && (
        <div className="flex-1 px-4 overflow-y-auto space-y-3 pb-6">
          {upcomingSpecialDates.map(item => {
            const isPartnerBday = item.date.id === 'birthday-partner';
            return (
              <div
                key={item.date.id}
                className="border rounded-2xl p-4 shadow-sm bg-[var(--theme-bg-card)] border-[var(--theme-border)] flex items-center justify-between"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] uppercase font-black text-zinc-400">
                      {isPartnerBday ? '🎂 Sinh nhật' : '💖 Kỷ niệm'}
                    </span>
                    {item.date.isRecurring && (
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                        Hằng năm
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black truncate">{item.date.title}</h4>
                  <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">
                    Ngày: {formatDate(item.date.date)}
                  </p>
                  {item.date.notes && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mt-1 truncate border-t border-dashed pt-1" style={{ borderColor: 'var(--theme-border)' }}>
                      "{item.date.notes}"
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {item.daysRemaining === 0 ? (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase animate-pulse">Hôm nay 🎉</span>
                  ) : (
                    <div className="bg-zinc-50 dark:bg-zinc-900/40 px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center min-w-[55px]" style={{ borderColor: 'var(--theme-border)' }}>
                      <span className="text-[15px] font-black leading-none" style={{ color: 'var(--theme-nav-active)' }}>
                        {item.daysRemaining}
                      </span>
                      <span className="text-[8px] uppercase font-bold text-zinc-400 mt-0.5">ngày nữa</span>
                    </div>
                  )}

                  {/* Disable delete/edit for system basic partner birthday */}
                  {!isPartnerBday && (
                    <div className="flex flex-col gap-1 items-end shrink-0 border-l pl-2 border-dashed" style={{ borderColor: 'var(--theme-border)' }}>
                      <button
                        onClick={() => handleOpenEditDate(item.date)}
                        className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => deleteSpecialDate(item.date.id)}
                        className="p-1 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {upcomingSpecialDates.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-200/60 text-xs text-[var(--theme-text-muted)]">
              Chưa có ngày kỷ niệm nào. Bạn có thể thêm ngày kỷ niệm yêu nhau hoặc ngày cưới của hai bạn ở nút "Thêm sự kiện" bên trên. 💝
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: GIFT WISHLIST */}
      {activeSection === 'gifts' && (
        <div className="flex-grow flex flex-col h-full overflow-hidden">
          {/* Gift status filter pills */}
          <div className="px-4 pb-3 flex gap-2 shrink-0">
            {(['pending', 'purchased', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setGiftFilter(f)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                  giftFilter === f
                    ? 'bg-[var(--theme-primary)] border-[var(--theme-border)] text-[var(--theme-text-dark)] font-extrabold shadow-sm'
                    : 'bg-transparent border-zinc-200/60 dark:border-zinc-800 text-zinc-400'
                }`}
              >
                {f === 'pending' ? '🎁 Chưa mua' : f === 'purchased' ? '✅ Đã mua' : 'Tất cả'}
              </button>
            ))}
          </div>

          {/* Scrollable list */}
          <div className="flex-1 px-4 overflow-y-auto space-y-3 pb-6">
            {filteredGifts.map(gift => {
              const priorityConfigs = {
                high: { label: 'Ưu tiên cao', bg: '#FEE2E2', text: '#EF4444' },
                medium: { label: 'Ưu tiên vừa', bg: '#FEF3C7', text: '#D97706' },
                low: { label: 'Ưu tiên thấp', bg: '#F3F4F6', text: '#6B7280' }
              };

              return (
                <div
                  key={gift.id}
                  className="border rounded-2xl p-4 shadow-sm bg-[var(--theme-bg-card)] border-[var(--theme-border)] flex items-start gap-3 relative"
                >
                  <button 
                    onClick={() => toggleGiftPurchased(gift)}
                    className="mt-0.5 text-zinc-400 hover:text-zinc-650 shrink-0"
                  >
                    {gift.isPurchased ? (
                      <CheckSquare size={18} style={{ color: 'var(--theme-nav-active)' }} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span 
                        className="text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={{ 
                          backgroundColor: priorityConfigs[gift.priority].bg, 
                          color: priorityConfigs[gift.priority].text 
                        }}
                      >
                        {priorityConfigs[gift.priority].label}
                      </span>
                    </div>

                    <h4 className={`text-xs font-black truncate ${gift.isPurchased ? 'line-through text-zinc-400' : ''}`}>
                      {gift.name}
                    </h4>

                    <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                      💵 {formatVND(gift.price)}
                    </p>

                    {gift.link && (
                      <a 
                        href={gift.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-500 hover:underline mt-1.5"
                      >
                        <ExternalLink size={10} />
                        Link tham khảo
                      </a>
                    )}

                    {gift.notes && (
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mt-1.5 border-t border-dashed pt-1" style={{ borderColor: 'var(--theme-border)' }}>
                        "{gift.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 items-end shrink-0 pl-1 border-l border-dashed" style={{ borderColor: 'var(--theme-border)' }}>
                    <button
                      onClick={() => handleOpenEditGift(gift)}
                      className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition-colors"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => deleteGiftIdea(gift.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredGifts.length === 0 && (
              <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-200/60 text-xs text-[var(--theme-text-muted)]">
                {giftFilter === 'pending'
                  ? 'Chưa có ý tưởng quà tặng nào chưa mua. Hãy lưu lại mọi món đồ nhỏ bé mà người ấy bâng quơ nhắc đến nhé! 🎁'
                  : giftFilter === 'purchased'
                  ? 'Chưa có ý tưởng quà tặng nào đã mua.'
                  : 'Danh sách ý tưởng quà tặng rỗng.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SPECIAL DATE MODAL DIALOG */}
      {isDateModalOpen && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-end justify-center p-4 animate-fade-in">
          <form 
            onSubmit={handleDateSubmit}
            className="w-full max-w-sm rounded-2xl p-4 space-y-4 shadow-xl bg-[var(--theme-bg-card)] border border-[var(--theme-border)] max-h-[90%] overflow-y-auto animate-slide-up"
          >
            <div className="flex justify-between items-center pb-2 border-b border-dashed" style={{ borderColor: 'var(--theme-border)' }}>
              <h3 className="text-sm font-black text-[var(--theme-text-dark)]">
                {editingDateId ? 'Chỉnh sửa ngày kỷ niệm' : 'Thêm ngày kỷ niệm mới'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsDateModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Tiêu đề sự kiện</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Kỷ niệm ngày yêu nhau, Ngày cưới..."
                value={dateTitle}
                onChange={(e) => setDateTitle(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            {/* Date picker */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Ngày kỷ niệm</label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            {/* Is Recurring Checkbox */}
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="isRecurring"
                checked={dateIsRecurring}
                onChange={(e) => setDateIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--theme-nav-active)] focus:ring-[var(--theme-accent)] border-[var(--theme-border)] cursor-pointer"
              />
              <label htmlFor="isRecurring" className="text-xs font-bold text-[var(--theme-text-dark)] cursor-pointer select-none">
                Lặp lại hằng năm (như sinh nhật, ngày cưới)
              </label>
            </div>

            {/* Notes */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Ghi chú (không bắt buộc)</label>
              <textarea
                rows={2}
                placeholder="Ghi chú thêm kỷ niệm đáng nhớ của hai đứa..."
                value={dateNotes}
                onChange={(e) => setDateNotes(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 mt-2"
              style={{ backgroundColor: 'var(--theme-nav-active)' }}
            >
              <Check size={16} strokeWidth={2.5} />
              Lưu ngày kỷ niệm
            </button>
          </form>
        </div>
      )}

      {/* GIFT WISHLIST MODAL DIALOG */}
      {isGiftModalOpen && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-end justify-center p-4 animate-fade-in">
          <form 
            onSubmit={handleGiftSubmit}
            className="w-full max-w-sm rounded-2xl p-4 space-y-4 shadow-xl bg-[var(--theme-bg-card)] border border-[var(--theme-border)] max-h-[90%] overflow-y-auto animate-slide-up"
          >
            <div className="flex justify-between items-center pb-2 border-b border-dashed" style={{ borderColor: 'var(--theme-border)' }}>
              <h3 className="text-sm font-black text-[var(--theme-text-dark)]">
                {editingGiftId ? 'Chỉnh sửa ý tưởng quà' : 'Thêm ý tưởng quà mới'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsGiftModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Gift Name */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Tên món quà</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Son dưỡng Dior Addict Lip Glow"
                value={giftName}
                onChange={(e) => setGiftName(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            {/* Price (optional) */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Giá ước tính (VND) (không bắt buộc)</label>
              <input
                type="number"
                placeholder="Ví dụ: 850000"
                value={giftPrice}
                onChange={(e) => setGiftPrice(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Mức độ ưu tiên/mong muốn</label>
              <CustomSelect
                value={giftPriority}
                onChange={(val) => setGiftPriority(val as any)}
                options={[
                  { value: 'high', label: '🚨 Ưu tiên cao (Rất thích / Cần gấp)' },
                  { value: 'medium', label: '⭐ Ưu tiên vừa (Thích)' },
                  { value: 'low', label: '🧸 Ưu tiên thấp (Ý tưởng ngẫu hứng)' }
                ]}
                placeholder=""
              />
            </div>

            {/* Link (optional) */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Đường dẫn tham khảo (Shopee, web...) (không bắt buộc)</label>
              <input
                type="url"
                placeholder="http://example.com/item"
                value={giftLink}
                onChange={(e) => setGiftLink(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Ghi chú (size màu, lưu ý...)</label>
              <textarea
                rows={2}
                placeholder="Màu 001 Pink, mua ở mall chính hãng..."
                value={giftNotes}
                onChange={(e) => setGiftNotes(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 mt-2"
              style={{ backgroundColor: 'var(--theme-nav-active)' }}
            >
              <Check size={16} strokeWidth={2.5} />
              Lưu ý tưởng quà
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
