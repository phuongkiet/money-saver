import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, BarChart3, Calculator, UserCheck, ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { updateProfile, showToast } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form states
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [email, setEmail] = useState('');

  const handleNext = () => {
    if (currentSlide < 3) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleStartApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập họ và tên của bạn.', 'error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'error');
      return;
    }

    // Set default avatar based on gender
    const avatarSeed = gender === 'male' ? 'Jack' : 'Lily';
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;
    updateProfile(name.trim(), avatarUrl, email.trim());

    // Set onboarded flag in localStorage
    localStorage.setItem('ms_onboarded', 'true');

    // Complete
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-between p-6 overflow-y-auto">
      <div className="w-full max-w-md flex-1 flex flex-col justify-center py-6">

        {/* Slide 0: Welcome */}
        {currentSlide === 0 && (
          <div className="space-y-6 text-center animate-bounce-in">
            <div className="w-24 h-24 bg-[#8fae8d]/20 text-[#6f8d6d] rounded-[2rem] flex items-center justify-center mx-auto shadow-lg">
              <Sparkles size={48} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-vietnam text-zinc-800 dark:text-zinc-100">
                Chào mừng đến với Money Saver!
              </h2>
              <p className="text-sm font-vietnam text-zinc-500 dark:text-zinc-400 leading-relaxed px-4">
                Trợ lý quản lý tài chính cá nhân tối giản, trực quan và hiện đại.
              </p>
            </div>
          </div>
        )}

        {/* Slide 1: Dashboard Chart */}
        {currentSlide === 1 && (
          <div className="space-y-6 text-center animate-bounce-in">
            <div className="w-24 h-24 bg-indigo-500/10 text-indigo-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg">
              <BarChart3 size={44} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-vietnam text-zinc-800 dark:text-zinc-100">
                Biểu đồ phân tích trực quan
              </h2>
              <p className="text-sm font-vietnam text-zinc-500 dark:text-zinc-400 leading-relaxed px-4">
                Biểu đồ tròn SVG sinh động tự động hiển thị tỷ trọng các khoản chi tiêu. Bạn có thể chạm trực tiếp vào danh mục trên biểu đồ để xem giao dịch tương ứng cực kỳ tiện lợi.
              </p>
            </div>
          </div>
        )}

        {/* Slide 2: Budgets & Debts */}
        {currentSlide === 2 && (
          <div className="space-y-6 text-center animate-bounce-in">
            <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg">
              <Calculator size={44} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-vietnam text-zinc-800 dark:text-zinc-100">
                Ngân sách & Công cụ tính nợ
              </h2>
              <p className="text-sm font-vietnam text-zinc-500 dark:text-zinc-400 leading-relaxed px-4">
                Tạo ngân sách định mức để nhận cảnh báo chi tiêu vượt giới hạn. Đồng thời tính toán kế hoạch trả nợ định kỳ theo cả phương thức EMI hoặc Dư nợ gốc giảm dần.
              </p>
            </div>
          </div>
        )}

        {/* Slide 3: Personal Information Form */}
        {currentSlide === 3 && (
          <div className="space-y-5 animate-bounce-in max-w-sm mx-auto w-full">
            <div className="text-center space-y-1">
              <div className="w-16 h-16 bg-[#8fae8d]/20 text-[#6f8d6d] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <UserCheck size={32} />
              </div>
              <h3 className="text-lg font-bold font-vietnam text-zinc-800 dark:text-zinc-100">
                Thiết lập hồ sơ ban đầu
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-vietnam">Cài đặt thông tin cá nhân để bắt đầu ghi chép chi tiêu.</p>
            </div>

            <form onSubmit={handleStartApp} className="space-y-4 text-left">
              {/* Họ tên */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Họ và tên của bạn</label>
                <input
                  type="text"
                  required
                  value={name}
                  placeholder={'Nhập tên của bạn'}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold font-vietnam text-zinc-850 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">Email nhận báo cáo chi tiêu</label>
                <input
                  type="email"
                  required
                  value={email}
                  placeholder={'example@gmail.com'}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold font-vietnam text-zinc-850 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#8fae8d]"
                />
              </div>



              {/* Giới tính */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Giới tính của bạn</label>
                <div className="bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200/20 dark:border-zinc-800 rounded-xl flex gap-1.5 h-[42px] items-center">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex-1 py-1.5 text-xs font-bold font-vietnam rounded-lg transition-all text-center ${gender === 'male'
                      ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm font-semibold'
                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-500'
                      }`}
                  >
                    Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex-1 py-1.5 text-xs font-bold font-vietnam rounded-lg transition-all text-center ${gender === 'female'
                      ? 'bg-white dark:bg-zinc-800 text-[#6f8d6d] shadow-sm font-semibold'
                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-500'
                      }`}
                  >
                    Nữ
                  </button>
                </div>
              </div>

              {/* Complete button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-br from-[#8fae8d] to-[#6f8d6d] text-white text-xs font-bold font-vietnam rounded-xl shadow-md active:scale-95 transition-all mt-4 flex items-center justify-center gap-1.5"
              >
                <Check size={16} strokeWidth={2.5} />
                Bắt đầu trải nghiệm ngay!
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Footer Nav Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-4 py-4">
        {/* Progress dots indicator */}
        <div className="flex gap-2">
          {[0, 1, 2, 3].map(index => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-6 bg-[#6f8d6d]' : 'w-2 bg-zinc-200 dark:bg-zinc-800'
                }`}
            ></span>
          ))}
        </div>

        {/* Action Button */}
        {currentSlide < 3 && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-gradient-to-br from-[#8fae8d] to-[#6f8d6d] text-white text-xs font-bold font-vietnam rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            Tiếp theo
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

    </div>
  );
};
