import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useCompanion } from '../../context/CompanionContext';
import { Calendar, Heart, Sparkles, Save, Droplet } from 'lucide-react';

export const CompanionDashboard: React.FC = () => {
  const { user } = useApp();
  const { 
    basicInfo, 
    preferences, 
    menstrualData, 
    updateMenstrualData,
    getUpcomingAppointments, 
    getUpcomingSpecialDates,
    getCurrentCyclePhase,
    getPredictedNextPeriod,
    addDailyEntry,
    deleteDailyEntry
  } = useCompanion();

  const isMaleUser = user.gender === 'male';

  // Menstrual tracker local states
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  const [periodDate, setPeriodDate] = useState(menstrualData.lastPeriodDate || '');
  const [cycleLength, setCycleLength] = useState(menstrualData.cycleLength || 28);
  const [periodLength, setPeriodLength] = useState(menstrualData.periodLength || 5);

  // Today recommendation local state
  const [todaySuggestion, setTodaySuggestion] = useState<string>('');

  useEffect(() => {
    if (preferences.length > 0) {
      // Pick a random preference
      const randomIndex = Math.floor(Math.random() * preferences.length);
      const pref = preferences[randomIndex];
      const categoryLabels: Record<string, string> = {
        game: 'chơi game',
        sport: 'chơi thể thao',
        book: 'đọc sách',
        food: 'món ăn',
        music: 'nhạc',
        movie: 'phim',
        travel: 'đi du lịch',
        hobby: 'sở thích',
        other: 'sở thích khác'
      };
      setTodaySuggestion(`Người ấy thích ${categoryLabels[pref.category] || 'sở thích'}: "${pref.content}"`);
    } else {
      setTodaySuggestion('Hãy thêm các sở thích ở tab "Thông tin" để nhận gợi ý ngẫu nhiên mỗi ngày nhé! ✨');
    }
  }, [preferences]);

  // Sync state if context changes
  useEffect(() => {
    setPeriodDate(menstrualData.lastPeriodDate || '');
    setCycleLength(menstrualData.cycleLength || 28);
    setPeriodLength(menstrualData.periodLength || 5);
  }, [menstrualData]);

  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodDate) return;
    updateMenstrualData({
      lastPeriodDate: periodDate,
      cycleLength: Number(cycleLength),
      periodLength: Number(periodLength)
    });
    setIsEditingPeriod(false);
  };

  const moods = [
    { val: 'happy', emoji: '😊', label: 'Vui vẻ' },
    { val: 'neutral', emoji: '😐', label: 'Bình thường' },
    { val: 'sad', emoji: '😢', label: 'Buồn bã' },
    { val: 'irritable', emoji: '⚡', label: 'Dễ cáu gắt' },
    { val: 'anxious', emoji: '😰', label: 'Lo âu' }
  ] as const;

  const symptomsList = [
    { val: 'cramps', emoji: '😫', label: 'Đau bụng' },
    { val: 'bloating', emoji: '🎈', label: 'Đầy hơi' },
    { val: 'headache', emoji: '🤕', label: 'Đau đầu' },
    { val: 'fatigue', emoji: '🥱', label: 'Mệt mỏi' },
    { val: 'acne', emoji: '🧼', label: 'Nổi mụn' },
    { val: 'tender_breasts', emoji: '🍒', label: 'Đau ngực' }
  ] as const;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = menstrualData.dailyLog?.find(e => e.date === todayStr);

  const handleSaveMood = (moodVal: typeof moods[number]['val']) => {
    const existingSymptoms = todayLog?.symptoms || [];
    addDailyEntry({
      date: todayStr,
      mood: moodVal,
      symptoms: existingSymptoms
    });
  };

  const handleToggleSymptom = (symptomVal: typeof symptomsList[number]['val']) => {
    const existingSymptoms = todayLog?.symptoms || [];
    const isSelected = existingSymptoms.includes(symptomVal);
    const newSymptoms = isSelected
      ? existingSymptoms.filter(s => s !== symptomVal)
      : [...existingSymptoms, symptomVal];
    
    addDailyEntry({
      date: todayStr,
      mood: todayLog?.mood,
      symptoms: newSymptoms
    });
  };


  // Get data for widgets
  const nextAppt = getUpcomingAppointments(30)[0]; // Nearest within 30 days or general
  const nextSpecial = getUpcomingSpecialDates()[0];
  const cyclePhase = getCurrentCyclePhase();
  const nextPeriodDateStr = getPredictedNextPeriod();

  // Format date helper (dd/mm/yyyy)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Chưa thiết lập';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* 1. Mùa dâu / Menstrual Cycle Widget (ONLY FOR MALE USERS) */}
      {isMaleUser && (
        <div 
          className="border rounded-2xl p-4 shadow-sm transition-all relative overflow-hidden"
          style={{ 
            backgroundColor: 'var(--theme-bg-card)', 
            borderColor: 'var(--theme-border)' 
          }}
        >
          {/* Background decorative droplet */}
          <div className="absolute right-[-10px] top-[-10px] opacity-5 pointer-events-none">
            <Droplet size={120} className="fill-[#FA6C8D] text-[#FA6C8D]" />
          </div>

          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Droplet size={18} className="text-[#FA6C8D]" />
              Theo dõi chu kỳ của cô ấy 🍓
            </h3>
            <button 
              onClick={() => setIsEditingPeriod(!isEditingPeriod)}
              className="text-xs font-semibold px-2.5 py-1 rounded-full border border-pink-200/70 hover:bg-pink-50 transition-colors text-[#FA6C8D] bg-pink-50/30"
            >
              {isEditingPeriod ? 'Đóng' : 'Cập nhật'}
            </button>
          </div>

          {!isEditingPeriod ? (
            <div className="space-y-3.5">
              {menstrualData.lastPeriodDate ? (
                <>
                  {/* Phase card styling */}
                  <div className="bg-[#FFF2F4] dark:bg-pink-950/20 border border-pink-100 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-pink-500 font-bold uppercase tracking-wider mb-0.5">Trạng thái hiện tại</div>
                      <div className="text-sm font-bold text-[#5E3E44] dark:text-pink-250">
                        {cyclePhase.label}
                      </div>
                    </div>
                    {cyclePhase.phase !== 'unknown' && (
                      <div className="text-right shrink-0">
                        <div className="text-[20px] font-black text-[#FA6C8D] leading-none">
                          {cyclePhase.daysRemaining}
                        </div>
                        <div className="text-[9px] text-[#9B7A80] font-bold uppercase">ngày nữa</div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase mb-1">Mùa dâu gần nhất</span>
                      <span className="font-bold">{formatDate(menstrualData.lastPeriodDate)}</span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase mb-1">Dự kiến chu kỳ tiếp theo</span>
                      <span className="font-bold text-[#FA6C8D]">{formatDate(nextPeriodDateStr)}</span>
                    </div>
                  </div>

                  {/* Daily Symptom Logging */}
                  <div className="border-t border-dashed pt-3 mt-3 space-y-3" style={{ borderColor: 'var(--theme-border)' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tâm trạng & Triệu chứng hôm nay</span>
                      {todayLog && (
                        <button 
                          onClick={() => deleteDailyEntry(todayStr)}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Xóa ghi nhận
                        </button>
                      )}
                    </div>
                    
                    {/* Moods */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400 block">Tâm trạng của cô ấy:</span>
                      <div className="flex gap-2">
                        {moods.map(m => (
                          <button
                            key={m.val}
                            type="button"
                            onClick={() => handleSaveMood(m.val)}
                            className={`text-base p-1.5 rounded-xl border transition-all active:scale-95 ${
                              todayLog?.mood === m.val 
                                ? 'bg-pink-100 dark:bg-pink-950/40 border-[#FA6C8D] scale-110' 
                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                            title={m.label}
                          >
                            {m.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400 block">Triệu chứng nhận thấy:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {symptomsList.map(s => {
                          const isSelected = todayLog?.symptoms?.includes(s.val);
                          return (
                            <button
                              key={s.val}
                              type="button"
                              onClick={() => handleToggleSymptom(s.val)}
                              className="text-[9.5px] px-2.5 py-1 rounded-full border font-bold transition-all active:scale-95"
                              style={
                                isSelected 
                                  ? { backgroundColor: '#FFF2F4', color: '#FA6C8D', borderColor: '#FA6C8D' } 
                                  : { backgroundColor: 'var(--theme-bg-main)', color: 'var(--theme-text-muted)', borderColor: 'var(--theme-border)' }
                              }
                            >
                              {s.emoji} {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>

              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-xs text-[var(--theme-text-muted)]">Bạn chưa cập nhật thông tin chu kỳ gần đây của cô ấy.</p>
                  <button
                    onClick={() => setIsEditingPeriod(true)}
                    className="text-xs font-bold text-white px-4 py-2 rounded-xl shadow-sm bg-[#FA6C8D] hover:bg-[#E05B79] active:scale-95 transition-all"
                  >
                    Cài đặt ngay 📅
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSavePeriod} className="space-y-3 mt-2 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Ngày bắt đầu mùa dâu gần nhất</label>
                <input
                  type="date"
                  required
                  value={periodDate}
                  onChange={(e) => setPeriodDate(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FA6C8D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Độ dài chu kỳ (ngày)</label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={50}
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FA6C8D]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Số ngày hành kinh</label>
                  <input
                    type="number"
                    required
                    min={2}
                    max={15}
                    value={periodLength}
                    onChange={(e) => setPeriodLength(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FA6C8D]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-[#FA6C8D] to-[#E05B79] text-white font-bold rounded-xl shadow active:scale-95 transition-all mt-3 flex items-center justify-center gap-1.5"
              >
                <Save size={14} />
                Lưu thông tin chu kỳ
              </button>
            </form>
          )}
        </div>
      )}

      {/* 2. Lịch hẹn gần nhất / Next Appointment Widget */}
      <div 
        className="border rounded-2xl p-4 shadow-sm"
        style={{ 
          backgroundColor: 'var(--theme-bg-card)', 
          borderColor: 'var(--theme-border)' 
        }}
      >
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
          <Calendar size={18} style={{ color: 'var(--theme-accent)' }} />
          Lịch hẹn gần nhất
        </h3>

        {nextAppt ? (
          <div 
            className="border rounded-xl p-3 flex items-start gap-3 transition-all"
            style={{ 
              borderColor: 'var(--theme-border)',
              backgroundColor: 'var(--theme-bg-main)'
            }}
          >
            <div className="p-2.5 rounded-lg bg-white shadow-sm shrink-0 flex flex-col items-center justify-center min-w-[50px]">
              <span className="text-[9px] uppercase font-black tracking-wider text-zinc-400">T{new Date(nextAppt.date).getMonth() + 1}</span>
              <span className="text-lg font-black leading-none mt-0.5" style={{ color: 'var(--theme-nav-active)' }}>
                {new Date(nextAppt.date).getDate()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black truncate">{nextAppt.title}</h4>
              <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5 flex flex-wrap gap-x-2">
                {nextAppt.time && <span>🕒 {nextAppt.time}</span>}
                {nextAppt.location && <span className="truncate">📍 {nextAppt.location}</span>}
              </p>
              {nextAppt.notes && (
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mt-1 truncate border-t border-dashed pt-1" style={{ borderColor: 'var(--theme-border)' }}>
                  "{nextAppt.notes}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-zinc-200/60 dark:border-zinc-850">
            <p className="text-xs text-[var(--theme-text-muted)]">Không có lịch hẹn nào sắp tới.</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Bấm vào tab "Lịch hẹn" để lên kế hoạch đi chơi nhé! 🥰</p>
          </div>
        )}
      </div>

      {/* 3. Thông tin nhanh / Quick Info Sizes Grid */}
      <div 
        className="border rounded-2xl p-4 shadow-sm"
        style={{ 
          backgroundColor: 'var(--theme-bg-card)', 
          borderColor: 'var(--theme-border)' 
        }}
      >
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
          <Heart size={18} style={{ color: 'var(--theme-accent)' }} />
          Thông số nhanh của {basicInfo.nickname || 'người ấy'}
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div 
            className="p-2 rounded-xl border flex flex-col justify-center h-16 transition-all"
            style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-main)' }}
          >
            <span className="text-[9px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wide block mb-0.5">Size áo</span>
            <span className="font-extrabold text-sm">{basicInfo.shirtSize || '—'}</span>
          </div>

          <div 
            className="p-2 rounded-xl border flex flex-col justify-center h-16 transition-all"
            style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-main)' }}
          >
            <span className="text-[9px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wide block mb-0.5">Size quần</span>
            <span className="font-extrabold text-sm">{basicInfo.pantsSize || '—'}</span>
          </div>

          <div 
            className="p-2 rounded-xl border flex flex-col justify-center h-16 transition-all"
            style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-main)' }}
          >
            <span className="text-[9px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wide block mb-0.5">Size nhẫn</span>
            <span className="font-extrabold text-sm">{basicInfo.ringSize || '—'}</span>
          </div>
        </div>
      </div>

      {/* 4. Ngày kỷ niệm sắp tới / Next Special Date Widget */}
      <div 
        className="border rounded-2xl p-4 shadow-sm"
        style={{ 
          backgroundColor: 'var(--theme-bg-card)', 
          borderColor: 'var(--theme-border)' 
        }}
      >
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
          <Sparkles size={18} style={{ color: 'var(--theme-accent)' }} />
          Sự kiện đặc biệt sắp tới
        </h3>

        {nextSpecial ? (
          <div 
            className="border rounded-xl p-3 flex items-center justify-between"
            style={{ 
              borderColor: 'var(--theme-border)',
              backgroundColor: 'var(--theme-bg-main)'
            }}
          >
            <div>
              <h4 className="text-xs font-black">{nextSpecial.date.title}</h4>
              <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">
                Ngày: {formatDate(nextSpecial.date.date)} {nextSpecial.date.isRecurring && '(Lặp lại hàng năm)'}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              {nextSpecial.daysRemaining === 0 ? (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase animate-pulse">Hôm nay 🎉</span>
              ) : (
                <div className="bg-white px-2.5 py-1 rounded-lg border shadow-sm flex flex-col items-center justify-center min-w-[50px]" style={{ borderColor: 'var(--theme-border)' }}>
                  <span className="text-[14px] font-black leading-none" style={{ color: 'var(--theme-nav-active)' }}>
                    {nextSpecial.daysRemaining}
                  </span>
                  <span className="text-[8px] uppercase font-bold text-zinc-400 mt-0.5">ngày nữa</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-zinc-200/60 dark:border-zinc-850">
            <p className="text-xs text-[var(--theme-text-muted)]">Chưa thêm ngày kỷ niệm nào.</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Bấm vào tab "Kỷ niệm" để theo dõi ngày yêu, sinh nhật nhé! 💖</p>
          </div>
        )}
      </div>

      {/* 5. Gợi ý hôm nay / Suggestion Widget */}
      <div 
        className="border rounded-2xl p-4 shadow-sm bg-gradient-to-br"
        style={{ 
          borderColor: 'var(--theme-border)',
          backgroundImage: `linear-gradient(135deg, var(--theme-bg-card) 60%, ${isMaleUser ? '#FFF2F4' : '#F0F5FA'} 100%)`
        }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl shrink-0 mt-0.5" style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-nav-active)' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-0.5">💡 Ý tưởng cho ngày hôm nay</h4>
            <p className="text-xs font-semibold leading-relaxed text-[var(--theme-text-dark)]">
              {todaySuggestion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
