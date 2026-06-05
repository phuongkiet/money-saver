import React, { useState, useEffect } from 'react';
import { useCompanion } from '../../context/CompanionContext';
import { Save, Plus, X, Award, ShieldAlert, FileText } from 'lucide-react';
import { CustomSelect } from '../CustomSelect';

export const CompanionInfo: React.FC = () => {
  const {
    basicInfo,
    updateBasicInfo,
    preferences,
    addPreference,
    deletePreference,
    dislikes,
    addDislike,
    deleteDislike
  } = useCompanion();

  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'preferences' | 'dislikes'>('basic');

  // Basic info states
  const [nickname, setNickname] = useState(basicInfo.nickname);
  const [birthday, setBirthday] = useState(basicInfo.birthday);
  const [shirtSize, setShirtSize] = useState(basicInfo.shirtSize);
  const [pantsSize, setPantsSize] = useState(basicInfo.pantsSize);
  const [ringSize, setRingSize] = useState(basicInfo.ringSize);
  const [notes, setNotes] = useState(basicInfo.notes);

  // Pref states
  const [prefCategory, setPrefCategory] = useState<'game' | 'sport' | 'book' | 'food' | 'music' | 'movie' | 'travel' | 'hobby' | 'other'>('food');
  const [prefContent, setPrefContent] = useState('');

  // Dislike states
  const [disCategory, setDisCategory] = useState<'food' | 'drink' | 'topic' | 'behavior' | 'place' | 'other'>('food');
  const [disContent, setDisContent] = useState('');

  // Sync basic info state when context loads
  useEffect(() => {
    setNickname(basicInfo.nickname);
    setBirthday(basicInfo.birthday);
    setShirtSize(basicInfo.shirtSize);
    setPantsSize(basicInfo.pantsSize);
    setRingSize(basicInfo.ringSize);
    setNotes(basicInfo.notes);
  }, [basicInfo]);

  const handleSaveBasic = (e: React.FormEvent) => {
    e.preventDefault();
    updateBasicInfo({
      nickname: nickname.trim(),
      birthday,
      shirtSize,
      pantsSize,
      ringSize,
      notes: notes.trim()
    });
    // Add brief animation/toast visual cue
  };

  const handleAddPref = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefContent.trim()) return;
    addPreference(prefCategory, prefContent);
    setPrefContent('');
  };

  const handleAddDislike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disContent.trim()) return;
    addDislike(disCategory, disContent);
    setDisContent('');
  };

  // Preference Categories configuration
  const prefCategories = [
    { value: 'food', label: '🍔 Ăn uống' },
    { value: 'music', label: '🎵 Âm nhạc' },
    { value: 'movie', label: '🎬 Phim ảnh' },
    { value: 'travel', label: '✈️ Du lịch' },
    { value: 'game', label: '🎮 Game' },
    { value: 'sport', label: '⚽ Thể thao' },
    { value: 'book', label: '📚 Sách' },
    { value: 'hobby', label: '🎨 Sở thích' },
    { value: 'other', label: '✨ Khác' }
  ] as const;

  // Dislike Categories configuration
  const disCategories = [
    { value: 'food', label: '🤢 Thức ăn' },
    { value: 'drink', label: '☕ Đồ uống' },
    { value: 'topic', label: '💬 Chủ đề nhạy cảm' },
    { value: 'behavior', label: '⚡ Hành vi ghét' },
    { value: 'place', label: '🚷 Địa điểm' },
    { value: 'other', label: '❌ Khác' }
  ] as const;

  return (
    <div className="flex flex-col h-full font-vietnam">
      {/* Sub-tabs Pills Selector */}
      <div className="p-4 shrink-0">
        <div className="flex bg-zinc-150/60 dark:bg-zinc-900/60 p-1 border border-zinc-200/30 dark:border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('basic')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeSubTab === 'basic'
                ? 'bg-white dark:bg-zinc-800 text-[var(--theme-nav-active)] shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <FileText size={14} />
            Cơ bản
          </button>
          
          <button
            onClick={() => setActiveSubTab('preferences')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeSubTab === 'preferences'
                ? 'bg-white dark:bg-zinc-800 text-[var(--theme-nav-active)] shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Award size={14} />
            Sở thích
          </button>

          <button
            onClick={() => setActiveSubTab('dislikes')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeSubTab === 'dislikes'
                ? 'bg-white dark:bg-zinc-800 text-[var(--theme-nav-active)] shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <ShieldAlert size={14} />
            Kiêng kị
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 px-4 overflow-y-auto">
        
        {/* SUBTAB 1: BASIC INFORMATION */}
        {activeSubTab === 'basic' && (
          <form onSubmit={handleSaveBasic} className="space-y-4 pb-4">
            <div className="border rounded-2xl p-4 space-y-4 shadow-sm bg-[var(--theme-bg-card)] border-[var(--theme-border)]">
              {/* Nickname */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Biệt danh / Tên thường gọi</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập biệt danh của người thương"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                />
              </div>

              {/* Birthday */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Ngày sinh nhật</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                />
              </div>

              {/* Sizes Selection Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block text-center">Size áo</label>
                  <input
                    type="text"
                    placeholder="S, M, L..."
                    value={shirtSize}
                    onChange={(e) => setShirtSize(e.target.value)}
                    className="w-full text-center bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-2 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block text-center">Size quần</label>
                  <input
                    type="text"
                    placeholder="29, 30, 31..."
                    value={pantsSize}
                    onChange={(e) => setPantsSize(e.target.value)}
                    className="w-full text-center bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-2 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block text-center">Size nhẫn</label>
                  <input
                    type="text"
                    placeholder="12, 13..."
                    value={ringSize}
                    onChange={(e) => setRingSize(e.target.value)}
                    className="w-full text-center bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-2 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                  />
                </div>
              </div>

              {/* General notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Ghi chú thêm</label>
                <textarea
                  rows={4}
                  placeholder="Ghi chú sở thích ăn mặc, thói quen ăn uống, hoặc thông tin đặc biệt khác..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
              style={{ backgroundColor: 'var(--theme-nav-active)' }}
            >
              <Save size={16} />
              Lưu thông tin cơ bản
            </button>
          </form>
        )}

        {/* SUBTAB 2: PREFERENCES (SỞ THÍCH) */}
        {activeSubTab === 'preferences' && (
          <div className="space-y-4 pb-4">
            {/* Create Tag Form */}
            <form onSubmit={handleAddPref} className="border rounded-2xl p-4 shadow-sm bg-[var(--theme-bg-card)] border-[var(--theme-border)] space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--theme-text-muted)]">Thêm sở thích mới</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] block uppercase">Danh mục</label>
                <CustomSelect
                  value={prefCategory}
                  onChange={(val) => setPrefCategory(val as any)}
                  options={[...prefCategories]}
                  placeholder=""
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] block uppercase">Nội dung sở thích</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Thích uống trà sữa matcha ít đường"
                    value={prefContent}
                    onChange={(e) => setPrefContent(e.target.value)}
                    className="flex-1 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 shrink-0 rounded-xl text-white flex items-center justify-center shadow-sm active:scale-95 transition-all"
                    style={{ backgroundColor: 'var(--theme-nav-active)' }}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </form>

            {/* List Tags Grouped by Category */}
            <div className="space-y-3">
              {prefCategories.map(cat => {
                const catPrefs = preferences.filter(p => p.category === cat.value);
                if (catPrefs.length === 0) return null;

                return (
                  <div 
                    key={cat.value} 
                    className="border rounded-xl p-3 bg-[var(--theme-bg-card)] border-[var(--theme-border)]"
                  >
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">{cat.label}</h5>
                    <div className="flex flex-wrap gap-2">
                      {catPrefs.map(p => (
                        <span 
                          key={p.id}
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-semibold rounded-full border"
                          style={{ 
                            backgroundColor: 'var(--theme-bg-main)', 
                            borderColor: 'var(--theme-border)',
                            color: 'var(--theme-text-dark)'
                          }}
                        >
                          {p.content}
                          <button 
                            onClick={() => deletePreference(p.id)}
                            className="w-4.5 h-4.5 rounded-full hover:bg-zinc-200/50 flex items-center justify-center text-zinc-400 hover:text-zinc-650 shrink-0"
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {preferences.length === 0 && (
                <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-200/60 text-xs text-[var(--theme-text-muted)]">
                  Chưa ghi lại sở thích nào. Hãy điền form bên trên để ghi nhớ nhé! 💖
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: DISLIKES (KIÊNG KỊ) */}
        {activeSubTab === 'dislikes' && (
          <div className="space-y-4 pb-4">
            {/* Create Dislike Form */}
            <form onSubmit={handleAddDislike} className="border rounded-2xl p-4 shadow-sm bg-[var(--theme-bg-card)] border-[var(--theme-border)] space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--theme-text-muted)]">Thêm điều kiêng kị mới</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] block uppercase">Danh mục</label>
                <CustomSelect
                  value={disCategory}
                  onChange={(val) => setDisCategory(val as any)}
                  options={[...disCategories]}
                  placeholder=""
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] block uppercase">Nội dung tránh/kiêng</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bị dị ứng với tôm, cua hải sản có vỏ"
                    value={disContent}
                    onChange={(e) => setDisContent(e.target.value)}
                    className="flex-1 bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 shrink-0 rounded-xl text-white flex items-center justify-center shadow-sm active:scale-95 transition-all"
                    style={{ backgroundColor: 'var(--theme-nav-active)' }}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </form>

            {/* List Dislikes Grouped by Category */}
            <div className="space-y-3">
              {disCategories.map(cat => {
                const catDislikes = dislikes.filter(d => d.category === cat.value);
                if (catDislikes.length === 0) return null;

                return (
                  <div 
                    key={cat.value} 
                    className="border rounded-xl p-3 bg-[var(--theme-bg-card)] border-[var(--theme-border)]"
                  >
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">{cat.label}</h5>
                    <div className="flex flex-wrap gap-2">
                      {catDislikes.map(d => (
                        <span 
                          key={d.id}
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-semibold rounded-full border bg-zinc-50 border-rose-150/40 text-rose-950 dark:bg-zinc-900 dark:border-rose-950/20"
                        >
                          {d.content}
                          <button 
                            onClick={() => deleteDislike(d.id)}
                            className="w-4.5 h-4.5 rounded-full hover:bg-rose-50/50 dark:hover:bg-zinc-800 flex items-center justify-center text-rose-450 hover:text-rose-650 shrink-0"
                          >
                            <X size={12} strokeWidth={2.5} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {dislikes.length === 0 && (
                <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-200/60 text-xs text-[var(--theme-text-muted)]">
                  Chưa có điều kiêng kị nào được nhập.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
