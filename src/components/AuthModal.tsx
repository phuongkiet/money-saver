import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, X, Loader2, Wallet, ArrowRight } from 'lucide-react';

// Custom hook to access AppContext
const useAppShim = () => {
  const context = useApp();
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, loginWithGoogle, register } = useAppShim();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setErrorMsg('Vui lòng nhập tên hiển thị.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await login(email.trim(), password);
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
        }
      } else {
        const res = await register(email.trim(), password, name.trim());
        if (res.success) {
          setIsLogin(true);
          setPassword('');
          setErrorMsg('');
        } else {
          setErrorMsg(res.error || 'Đăng ký không thành công. Email có thể đã tồn tại.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã xảy ra lỗi hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.15)] border border-zinc-150 dark:border-zinc-800 animate-scale-up">

        {/* Header Decor */}
        <div className="bg-gradient-to-br from-[#8fae8d] to-[#6f8d6d] p-8 text-center text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <X size={18} />
          </button>

          <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-4">
            <Wallet size={26} className="text-white" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight font-vietnam">
            {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-xs text-white/80 font-medium font-vietnam mt-1">
            {isLogin
              ? 'Đăng nhập để đồng bộ chi tiêu trên mọi thiết bị'
              : 'Đồng bộ ví tiền của bạn và người thương hoàn toàn miễn phí'
            }
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/30 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-450 leading-relaxed font-vietnam animate-slide-down">
                {errorMsg}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-vietnam ml-1">
                  TÊN HIỂN THỊ
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên hiển thị bạn muốn..."
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-sm font-semibold font-vietnam placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#6f8d6d]/50 focus:border-[#6f8d6d] transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-vietnam ml-1">
                EMAIL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-sm font-semibold font-vietnam placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#6f8d6d]/50 focus:border-[#6f8d6d] transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 font-vietnam ml-1">
                MẬT KHẨU
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-sm font-semibold font-vietnam placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#6f8d6d]/50 focus:border-[#6f8d6d] transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#8fae8d] to-[#6f8d6d] hover:brightness-105 active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#6f8d6d]/10"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Form Type */}
          <div className="mt-4 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
              }}
              className="text-xs font-bold text-[#6f8d6d] hover:text-[#8fae8d] transition-colors font-vietnam cursor-pointer"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 font-vietnam">
              HOẶC
            </span>
            <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            disabled={loading}
            onClick={loginWithGoogle}
            className="w-full mb-3 py-3.5 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold rounded-2xl text-xs transition-all duration-200 cursor-pointer font-vietnam flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99]"
          >
            <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.97 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.26 7.42 8.91 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2 3.7-5.02 3.7-8.62z"
              />
              <path
                fill="#FBBC05"
                d="M5.36 14.77c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27L1.5 7.23C.54 9.12 0 11.24 0 13.5s.54 4.38 1.5 6.27l3.86-3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.04.7-2.39 1.12-4.23 1.12-3.09 0-5.74-2.38-6.64-5.46L1.5 16.32C3.4 20.17 7.35 23 12 23z"
              />
            </svg>
            Tiếp tục với Google
          </button>

          {/* Offline Use */}
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-full py-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-850 border border-zinc-150 dark:border-zinc-800 text-zinc-600 dark:text-zinc-350 font-bold rounded-2xl text-xs transition-all duration-200 cursor-pointer font-vietnam flex items-center justify-center gap-2"
          >
            Sử dụng Offline không đồng bộ
          </button>
        </div>
      </div>
    </div>
  );
};
