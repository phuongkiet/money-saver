import React, { useState } from 'react';
import { useCompanion } from '../../context/CompanionContext';
import type { PartnerAppointment, AppointmentCategory } from '../../types';
import { Plus, Trash2, Edit2, Check, MapPin, Clock, X, CheckSquare, Square } from 'lucide-react';
import { CustomSelect } from '../CustomSelect';

export const CompanionAppointments: React.FC = () => {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getUpcomingAppointments
  } = useCompanion();

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<AppointmentCategory>('date');
  const [notes, setNotes] = useState('');

  // Tab state: 'upcoming' | 'completed'
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const upcomingAppts = getUpcomingAppointments();
  const completedAppts = appointments
    .filter(a => a.isCompleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest completed first

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDate('');
    setTime('');
    setLocation('');
    setCategory('date');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appt: PartnerAppointment) => {
    setEditingId(appt.id);
    setTitle(appt.title);
    setDate(appt.date);
    setTime(appt.time || '');
    setLocation(appt.location || '');
    setCategory(appt.category);
    setNotes(appt.notes || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const apptData = {
      title: title.trim(),
      date,
      time: time || undefined,
      location: location.trim() || undefined,
      category,
      notes: notes.trim() || undefined
    };

    if (editingId) {
      updateAppointment(editingId, apptData);
    } else {
      addAppointment(apptData);
    }
    handleCloseModal();
  };

  const toggleCompleted = (appt: PartnerAppointment) => {
    updateAppointment(appt.id, { isCompleted: !appt.isCompleted });
  };

  const categoryConfigs: Record<AppointmentCategory, { label: string; bg: string; text: string; emoji: string }> = {
    date: { label: 'Hẹn hò', bg: '#FFE4E6', text: '#E11D48', emoji: '❤️' },
    anniversary: { label: 'Kỷ niệm', bg: '#FEF3C7', text: '#D97706', emoji: '🎉' },
    health: { label: 'Sức khỏe', bg: '#ECFDF5', text: '#059669', emoji: '🏥' },
    movie: { label: 'Xem phim', bg: '#EDE9FE', text: '#7C3AED', emoji: '🍿' },
    travel: { label: 'Du lịch', bg: '#E0F2FE', text: '#0284C7', emoji: '✈️' },
    other: { label: 'Khác', bg: '#F3F4F6', text: '#4B5563', emoji: '✨' }
  };

  const categoryOptions = Object.entries(categoryConfigs).map(([key, cfg]) => ({
    value: key,
    label: `${cfg.emoji} ${cfg.label}`
  }));

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const currentTabAppts = activeTab === 'upcoming' 
    ? upcomingAppts.filter(a => !a.isCompleted) 
    : completedAppts;

  return (
    <div className="flex flex-col h-full font-vietnam relative">
      {/* Tab controls */}
      <div className="p-4 shrink-0 flex items-center justify-between">
        <div className="flex bg-zinc-150/60 dark:bg-zinc-900/60 p-1 border border-zinc-200/30 dark:border-zinc-800 rounded-xl max-w-[240px]">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-zinc-800 text-[var(--theme-nav-active)] shadow-sm'
                : 'text-zinc-500'
            }`}
          >
            Sắp diễn ra
          </button>
          
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-zinc-800 text-[var(--theme-nav-active)] shadow-sm'
                : 'text-zinc-500'
            }`}
          >
            Đã xong
          </button>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          style={{ backgroundColor: 'var(--theme-nav-active)' }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Hẹn lịch
        </button>
      </div>

      {/* List content */}
      <div className="flex-1 px-4 overflow-y-auto space-y-3 pb-6">
        {currentTabAppts.map(appt => {
          const cfg = categoryConfigs[appt.category];
          
          return (
            <div
              key={appt.id}
              className="border rounded-2xl p-4 shadow-sm bg-[var(--theme-bg-card)] border-[var(--theme-border)] relative flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2.5">
                <button 
                  onClick={() => toggleCompleted(appt)}
                  className="mt-0.5 text-zinc-400 hover:text-zinc-650 transition-colors shrink-0"
                >
                  {appt.isCompleted ? (
                    <CheckSquare size={18} style={{ color: 'var(--theme-nav-active)' }} />
                  ) : (
                    <Square size={18} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                      style={{ backgroundColor: cfg.bg, color: cfg.text }}
                    >
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>
                  
                  <h4 className={`text-xs font-black truncate ${appt.isCompleted ? 'line-through text-zinc-400' : ''}`}>
                    {appt.title}
                  </h4>
                  
                  <p className="text-[10px] text-[var(--theme-text-muted)] mt-1 flex flex-wrap gap-x-2.5 gap-y-1">
                    <span className="font-bold">📅 {formatDate(appt.date)}</span>
                    {appt.time && <span className="flex items-center gap-0.5"><Clock size={11} /> {appt.time}</span>}
                    {appt.location && <span className="flex items-center gap-0.5 max-w-[120px] truncate"><MapPin size={11} /> {appt.location}</span>}
                  </p>

                  {appt.notes && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mt-1.5 border-t border-dashed pt-1" style={{ borderColor: 'var(--theme-border)' }}>
                      "{appt.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1 items-end shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(appt)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteAppointment(appt.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {currentTabAppts.length === 0 && (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-200/60 text-xs text-[var(--theme-text-muted)]">
            {activeTab === 'upcoming' 
              ? 'Không có lịch hẹn nào sắp tới. Tạo mới một buổi hẹn hò đi nào! Hẹn hò là keo gắn kết tình cảm đó ❤️'
              : 'Chưa có lịch hẹn nào đã hoàn thành.'}
          </div>
        )}
      </div>

      {/* Appointment Edit/Add Overlay Dialog */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-end justify-center p-4 animate-fade-in">
          <form 
            onSubmit={handleSubmit}
            className="w-full max-w-sm rounded-2xl p-4 space-y-4 shadow-xl bg-[var(--theme-bg-card)] border border-[var(--theme-border)] max-h-[90%] overflow-y-auto animate-slide-up"
          >
            <div className="flex justify-between items-center pb-2 border-b border-dashed" style={{ borderColor: 'var(--theme-border)' }}>
              <h3 className="text-sm font-black text-[var(--theme-text-dark)]">
                {editingId ? 'Chỉnh sửa lịch hẹn' : 'Thêm lịch hẹn mới'}
              </h3>
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Tiêu đề cuộc hẹn</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đi ăn lẩu Haidilao mừng lương"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Ngày</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Giờ (không bắt buộc)</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Danh mục hẹn hò</label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val as AppointmentCategory)}
                options={categoryOptions}
                placeholder=""
              />
            </div>

            {/* Location */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Địa điểm (không bắt buộc)</label>
              <input
                type="text"
                placeholder="Nhập tên quán cafe, rạp phim, công viên..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block">Lời nhắn / Chi tiết</label>
              <textarea
                rows={2}
                placeholder="Ghi chú thêm về trang phục, chuẩn bị hoặc quà tặng đi kèm..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 mt-2"
              style={{ backgroundColor: 'var(--theme-nav-active)' }}
            >
              <Check size={16} strokeWidth={2.5} />
              Lưu cuộc hẹn
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
