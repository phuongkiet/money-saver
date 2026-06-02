import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IconRenderer } from './IconRenderer';
import { Sun, Moon, Plus, ArrowLeftRight, Download, Upload, Trash2, Smartphone, Building2, Wallet as WalletIcon, Camera, X } from 'lucide-react';
import { formatThousand, parseThousand } from '../utils/format';

const compressAvatar = (file: File, maxSize: number = 150): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const size = Math.min(width, height);
        canvas.width = maxSize;
        canvas.height = maxSize;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sourceX = (width - size) / 2;
          const sourceY = (height - size) / 2;
          
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            size,
            size,
            0,
            0,
            maxSize,
            maxSize
          );
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        } else {
          reject(new Error('Không tạo được context 2D'));
        }
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export const ProfileTab: React.FC = () => {
  const { user, wallets, theme, setTheme, updateProfile, addWallet, transferFunds, resetData, deleteWallet, showToast, confirm } = useApp();

  // Edit profile states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const avatar = user.avatarUrl;
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // EmailJS configuration states
  /*
  const [serviceId, setServiceId] = useState(() => localStorage.getItem('ms_emailjs_service_id') || import.meta.env.VITE_EMAILJS_SERVICE_ID || '');
  const [templateId, setTemplateId] = useState(() => localStorage.getItem('ms_emailjs_template_id') || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '');
  const [publicKey, setPublicKey] = useState(() => localStorage.getItem('ms_emailjs_public_key') || import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '');
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  */

  // Compaction preview states
  /*
  const [previewSummary, setPreviewSummary] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  */

  // Transfer states
  const [showTransfer, setShowTransfer] = useState(false);
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // Add wallet states
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletIcon, setWalletIcon] = useState('Smartphone');

  // Helper: Format currency in VNĐ
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (email.trim() && !email.includes('@')) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ.', 'error');
      return;
    }
    updateProfile(name.trim(), avatar, email.trim());
    setIsEditingProfile(false);
    showToast('Cập nhật hồ sơ thành công!', 'success');
  };

  /*
  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ms_emailjs_service_id', serviceId.trim());
    localStorage.setItem('ms_emailjs_template_id', templateId.trim());
    localStorage.setItem('ms_emailjs_public_key', publicKey.trim());
    showToast('Lưu cấu hình EmailJS thành công!', 'success');
    setShowEmailConfig(false);
  };

  const handleSimulateCompaction = () => {
    const currentMonthId = new Date().toISOString().substring(0, 7);
    const summary = compactMonthData(currentMonthId);
    if (!summary) {
      showToast('Không có giao dịch nào trong tháng này để nén báo cáo. Hãy thêm vài chi tiêu trước nhé!', 'error');
      return;
    }
    setPreviewSummary(summary);
    setIsPreviewOpen(true);
    showToast('Giả lập nén dữ liệu & phân tích AI thành công!', 'success');
  };
  */

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseThousand(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Vui lòng nhập số tiền chuyển hợp lệ.', 'error');
      return;
    }
    if (fromWalletId === toWalletId) {
      showToast('Tài khoản chuyển và nhận phải khác nhau.', 'error');
      return;
    }

    const success = transferFunds(fromWalletId, toWalletId, amount);
    if (success) {
      showToast('Chuyển tiền quỹ thành công!', 'success');
      setTransferAmount('');
      setShowTransfer(false);
    } else {
      showToast('Số dư tài khoản nguồn không đủ để thực hiện giao dịch.', 'error');
    }
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseThousand(walletBalance);
    if (isNaN(balance) || balance < 0) {
      showToast('Vui lòng nhập số tiền khởi tạo hợp lệ.', 'error');
      return;
    }
    if (!walletName.trim()) {
      showToast('Vui lòng điền tên ví / ngân hàng.', 'error');
      return;
    }

    addWallet(walletName.trim(), 'online', balance, walletIcon);
    setWalletName('');
    setWalletBalance('');
    setShowAddWallet(false);
    showToast('Thêm tài khoản thành công!', 'success');
  };

  const handleDeleteWalletClick = async (walletId: string, name: string) => {
    const confirmDelete = await confirm(
      'Xác nhận xóa ví',
      `CẢNH BÁO: Xóa ví "${name}" sẽ làm MẤT HOÀN TOÀN tất cả lịch sử giao dịch liên quan tới ví này. Bạn có chắc chắn muốn xóa không?`
    );
    if (confirmDelete) {
      deleteWallet(walletId);
      showToast(`Đã xóa ví "${name}" và toàn bộ giao dịch liên quan thành công!`, 'success');
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `money_saver_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          Object.keys(parsed).forEach(key => {
            if (key.startsWith('ms_')) {
              localStorage.setItem(key, parsed[key]);
            }
          });
          showToast('Đã đồng bộ hóa dữ liệu sao lưu thành công! Đang tải lại...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (err) {
          showToast('Tệp sao lưu không hợp lệ. Vui lòng thử lại.', 'error');
        }
      };
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Đang nén và tối ưu ảnh đại diện...', 'info');
      const compressedBase64 = await compressAvatar(file, 150);
      
      // Update profile instantly
      updateProfile(user.name, compressedBase64, user.email);
      showToast('Cập nhật ảnh đại diện thành công!', 'success');
      setShowAvatarModal(false);
    } catch (err) {
      console.error('Lỗi khi nén ảnh:', err);
      showToast('Nén ảnh đại diện thất bại, vui lòng thử lại.', 'error');
    }
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto space-y-6">

      {/* 1. Header Profile details */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-[#8fae8d]/10 rounded-full blur-lg"></div>

        <img
          src={avatar}
          alt={user.name}
          className="w-16 h-16 rounded-full border-2 border-[#8fae8d]/50 bg-[#8fae8d]/10 shrink-0 cursor-pointer hover:opacity-85 active:scale-95 transition-all object-cover shadow-sm"
          onClick={handleAvatarClick}
          title="Bấm để thay đổi ảnh đại diện"
        />

        <div className="flex-1 min-w-0">
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-2.5">
              <div className="space-y-0.5">
                <label className="text-[8px] text-zinc-400 font-bold uppercase font-vietnam">Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-bold font-vietnam focus:outline-none dark:text-zinc-200"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[8px] text-zinc-400 font-bold uppercase font-vietnam">Email báo cáo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-bold font-vietnam focus:outline-none dark:text-zinc-200"
                  placeholder="example@gmail.com"
                />
              </div>
              <div className="flex gap-2 pt-0.5">
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#6f8d6d] text-white text-[10px] font-bold font-vietnam rounded-md cursor-pointer"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold font-vietnam rounded-md cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-200">{user.name}</h3>
              {user.email && (
                <p className="text-[10px] font-vietnam text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">{user.email}</p>
              )}
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-[10px] text-[#6f8d6d] font-bold font-vietnam hover:underline mt-1.5 block cursor-pointer"
              >
                Chỉnh sửa thông tin
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. Wallets Manager (Quản lý ví) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
            <WalletIcon size={16} className="text-[#6f8d6d]" />
            Quản lý Ví tài khoản
          </h3>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setShowTransfer(!showTransfer);
                setShowAddWallet(false);
                if (wallets.length >= 2) {
                  setFromWalletId(wallets[0].id);
                  setToWalletId(wallets[1].id);
                }
              }}
              className="p-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 rounded-xl text-zinc-500 hover:text-[#6f8d6d] transition-all"
              title="Chuyển quỹ"
            >
              <ArrowLeftRight size={14} />
            </button>
            <button
              onClick={() => {
                setShowAddWallet(!showAddWallet);
                setShowTransfer(false);
              }}
              className="p-1.5 bg-[#8fae8d]/10 hover:bg-[#8fae8d]/20 text-[#6f8d6d] rounded-xl transition-all"
              title="Thêm tài khoản online mới"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Collapsible Transfer Funds Form */}
        {showTransfer && (
          <form onSubmit={handleTransfer} className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-md space-y-3 animate-slide-down">
            <h4 className="text-[10px] font-bold font-vietnam text-[#6f8d6d] uppercase tracking-wider flex items-center gap-1">
              <ArrowLeftRight size={12} />
              Chuyển tiền giữa các tài khoản (Chuyển quỹ)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">Từ ví</label>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-2 py-2 text-xs font-medium font-vietnam focus:outline-none"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">Đến ví</label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-2 py-2 text-xs font-medium font-vietnam focus:outline-none"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({formatVND(w.balance)})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">Số tiền cần chuyển (VNĐ)</label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(formatThousand(e.target.value))}
                placeholder="0"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold font-vietnam focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#6f8d6d] hover:bg-[#5b755a] text-white text-xs font-bold font-vietnam rounded-xl transition-all"
            >
              Xác Nhận Chuyển Khoản
            </button>
          </form>
        )}

        {/* Collapsible Add Wallet Form */}
        {showAddWallet && (
          <form onSubmit={handleAddWallet} className="bg-white dark:bg-zinc-900 p-4.5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-md space-y-3 animate-slide-down">
            <h4 className="text-[10px] font-bold font-vietnam text-[#6f8d6d] uppercase tracking-wider flex items-center gap-1">
              <Plus size={12} />
              Thêm tài khoản online mới
            </h4>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">Tên tài khoản / Ví online</label>
              <input
                type="text"
                required
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="Ví dụ: Ví ZaloPay, Techcombank..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">Số dư khởi tạo (VNĐ)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(formatThousand(e.target.value))}
                  placeholder="0"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2.5 text-xs font-bold font-vietnam focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">Biểu tượng</label>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-1 border border-zinc-100 dark:border-zinc-850 rounded-xl flex gap-1 h-[42px] items-center">
                  <button
                    type="button"
                    onClick={() => setWalletIcon('Smartphone')}
                    className={`flex-1 py-1 text-[10px] font-bold font-vietnam rounded-lg transition-all flex items-center justify-center gap-1 ${walletIcon === 'Smartphone' ? 'bg-[#8fae8d] text-white shadow-sm' : 'text-zinc-400'
                      }`}
                  >
                    <Smartphone size={12} />
                    Ví
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletIcon('Building2')}
                    className={`flex-1 py-1 text-[10px] font-bold font-vietnam rounded-lg transition-all flex items-center justify-center gap-1 ${walletIcon === 'Building2' ? 'bg-[#8fae8d] text-white shadow-sm' : 'text-zinc-400'
                      }`}
                  >
                    <Building2 size={12} />
                    Bank
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#6f8d6d] hover:bg-[#5b755a] text-white text-xs font-bold font-vietnam rounded-xl transition-all"
            >
              Thêm Ví Online
            </button>
          </form>
        )}

        {/* Wallets simple detailed list */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl divide-y divide-zinc-50 dark:divide-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.01)] overflow-hidden">
          {wallets.map(w => (
            <div key={w.id} className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#8fae8d]/10 dark:bg-[#8fae8d]/20 text-[#6f8d6d] rounded-xl shrink-0">
                  <IconRenderer name={w.icon} size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200">{w.name}</h4>
                  <span className="text-[9px] font-vietnam text-zinc-400 dark:text-zinc-500 font-semibold uppercase">
                    {w.type === 'cash' ? 'Ví tiền mặt chính' : 'Ví trực tuyến online'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-vietnam text-zinc-700 dark:text-zinc-200">
                  {formatVND(w.balance)}
                </span>
                {w.type !== 'cash' && (
                  <button
                    onClick={() => handleDeleteWalletClick(w.id, w.name)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                    title="Xóa ví"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Báo cáo & Tối ưu hóa dữ liệu (Compaction & AI Reports)
      <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
            <Database size={16} className="text-[#6f8d6d]" />
            Báo cáo & Tối ưu bộ nhớ
          </h3>
          <button
            onClick={handleSimulateCompaction}
            className="px-2.5 py-1.5 bg-[#8fae8d]/10 hover:bg-[#8fae8d]/20 text-[#6f8d6d] text-[10px] font-bold font-vietnam rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            title="Chạy thử báo cáo tháng cũ & Nén dữ liệu"
          >
            <Send size={10} />
            Test Báo Cáo & Nén
          </button>
        </div>

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam leading-relaxed">
          Money Saver tự động nén các giao dịch tháng cũ thành dòng báo cáo duy nhất khi bắt đầu tháng mới để tối ưu hóa bộ nhớ điện thoại của bạn nhẹ nhất. Bạn có thể nhấn nút chạy thử để xem báo cáo mẫu ngay lập tức.
        </p>

        Compressed monthly reports list
        {monthlySummaries.length === 0 ? (
          <div className="text-center p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-850 text-[10px] text-zinc-400 dark:text-zinc-550 font-vietnam">
            Chưa có báo cáo lưu trữ tháng cũ nào.
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {monthlySummaries.map(s => {
              const [y, m] = s.monthId.split('-');
              return (
                <div key={s.monthId} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                  <div>
                    <h5 className="text-[10px] font-bold font-vietnam text-zinc-800 dark:text-zinc-200">Tháng {m}/{y}</h5>
                    <p className="text-[8px] font-vietnam text-zinc-400 dark:text-zinc-550 mt-0.5">
                      Thu: +{formatVND(s.totalIncome)} • Chi: -{formatVND(s.totalExpense)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPreviewSummary(s);
                      setIsPreviewOpen(true);
                    }}
                    className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-750 hover:bg-[#8fae8d]/10 hover:text-[#6f8d6d] text-zinc-500 text-[8px] font-bold font-vietnam rounded-lg transition-all cursor-pointer"
                  >
                    Xem thư
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      4. Cấu hình EmailJS báo cáo (EmailJS Config)
      <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
            <Mail size={16} className="text-[#6f8d6d]" />
            Cấu hình EmailJS báo cáo
          </h3>
          <button
            onClick={() => setShowEmailConfig(!showEmailConfig)}
            className="p-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-150 dark:border-zinc-750 text-zinc-400 hover:text-[#6f8d6d] rounded-xl transition-all cursor-pointer"
            title="Cài đặt cấu hình API"
          >
            <Settings size={14} />
          </button>
        </div>

        {showEmailConfig ? (
          <form onSubmit={handleSaveEmailConfig} className="space-y-3 pt-1 animate-slide-down">
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">Service ID</label>
              <input
                type="text"
                required
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="service_xxxx"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none dark:text-zinc-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">Template ID</label>
              <input
                type="text"
                required
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="template_xxxx"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none dark:text-zinc-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold">Public Key (API Key)</label>
              <input
                type="text"
                required
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="Mã tài khoản từ EmailJS"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-medium font-vietnam focus:outline-none dark:text-zinc-200"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#6f8d6d] hover:bg-[#5b755a] text-white text-[10px] font-bold font-vietnam rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Lưu Cấu Hình
            </button>
          </form>
        ) : (
          <div className="text-[9px] text-zinc-400 dark:text-zinc-550 leading-relaxed bg-zinc-50 dark:bg-zinc-950/20 p-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-850/60 font-vietnam">
            {serviceId && templateId && publicKey ? (
              <span className="text-[#6f8d6d] font-bold">✅ Đã cấu hình khóa API EmailJS (từ Vercel Env hoặc cấu hình máy). Hệ thống đã sẵn sàng gửi thư thật!</span>
            ) : (
              <span>⚠️ Chưa cấu hình EmailJS. Bấm icon bánh răng cưa để thiết lập giúp app gửi thư thật về Gmail của bạn nhé!</span>
            )}
          </div>
        )}
      </section> */}

      {/* 5. System Settings (Cài đặt hệ thống) */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100">Cài đặt hệ thống</h3>

        <div className="space-y-2.5">
          {/* Light/Dark Switcher */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800/60">
            <span className="text-xs font-semibold font-vietnam text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              {theme === 'dark' ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
              Chế độ giao diện sáng/tối
            </span>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="relative w-12 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 transition-all duration-300 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50"
            >
              <div
                className={`w-4 h-4 rounded-full shadow-md transform transition-all duration-300 flex items-center justify-center ${theme === 'dark'
                  ? 'translate-x-6 bg-indigo-500 text-white'
                  : 'translate-x-0 bg-white text-amber-500'
                  }`}
              ></div>
            </button>
          </div>

          {/* Backup / Export */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800/60">
            <span className="text-xs font-semibold font-vietnam text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <Download size={16} className="text-emerald-500" />
              Sao lưu xuất tệp dữ liệu
            </span>
            <button
              onClick={handleExportData}
              className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-[#8fae8d]/10 hover:text-[#6f8d6d] text-zinc-500 text-[10px] font-bold font-vietnam rounded-lg border border-zinc-200/30 dark:border-zinc-750 transition-all flex items-center gap-1"
            >
              Xuất JSON
            </button>
          </div>

          {/* Restore / Import */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800/60">
            <span className="text-xs font-semibold font-vietnam text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <Upload size={16} className="text-[#6f8d6d]" />
              Khôi phục nhập dữ liệu
            </span>
            <label className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-[#8fae8d]/10 hover:text-[#6f8d6d] text-zinc-500 text-[10px] font-bold font-vietnam rounded-lg border border-zinc-200/30 dark:border-zinc-750 transition-all flex items-center gap-1 cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              Nhập JSON
            </label>
          </div>

          {/* Reset All Data */}
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-semibold font-vietnam text-rose-500 flex items-center gap-2">
              <Trash2 size={16} />
              Xóa hoàn toàn dữ liệu
            </span>
            <button
              onClick={async () => {
                const confirmReset = await confirm(
                  'Cảnh báo xóa sạch dữ liệu',
                  'Hành động này sẽ xóa toàn bộ giao dịch, tài khoản và danh sách nợ để khôi phục cấu hình mặc định ban đầu. Bạn có chắc muốn tiếp tục?'
                );
                if (confirmReset) {
                  resetData();
                  showToast('Đã xóa sạch dữ liệu thành công! Đang tải lại...', 'success');
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                }
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 text-[10px] font-bold font-vietnam rounded-lg transition-all cursor-pointer"
            >
              Khởi động lại
            </button>
          </div>
        </div>
      </section>

      {/* 6. Simulated Mail Envelope Dialog Preview Modal */}
      {/* {isPreviewOpen && previewSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in" onClick={() => setIsPreviewOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-[0_12px_45px_rgba(0,0,0,0.18)] z-10 flex flex-col max-h-[85vh] overflow-hidden animate-scale-up">

            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div>
                <h3 className="text-xs font-bold font-vietnam text-zinc-850 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={14} className="text-[#6f8d6d]" />
                  Hòm thư Báo cáo Tháng
                </h3>
                <p className="text-[9px] font-vietnam text-zinc-400 dark:text-zinc-550 mt-0.5">Xem trước email gửi đến {user.email || 'chưa thiết lập email'}</p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350 bg-zinc-50 dark:bg-zinc-800 rounded-xl transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl bg-zinc-50 dark:bg-zinc-950 overflow-hidden shadow-inner">
              <div
                className="w-full h-full p-2 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: generateEmailHTML(previewSummary) }}
              />
            </div>

            <div className="flex gap-2.5 shrink-0 pt-1">
              <button
                onClick={() => {
                  const htmlContent = generateEmailHTML(previewSummary);
                  const dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `MoneySaver_BaoCao_${previewSummary.monthId}.html`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                  showToast('Đã xuất và tải báo cáo HTML thành công!', 'success');
                }}
                className="flex-1 py-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-850 border border-zinc-200/50 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 text-xs font-bold font-vietnam rounded-xl transition-all cursor-pointer text-center"
              >
                Tải Thư HTML (.html)
              </button>

              <button
                onClick={async () => {
                  if (!user.email) {
                    showToast('Vui lòng thiết lập email của bạn ở mục Chỉnh sửa thông tin trước nhé!', 'error');
                    return;
                  }
                  setIsSendingEmail(true);
                  const success = await sendEmailJSReport(previewSummary);
                  setIsSendingEmail(false);
                  if (success) {
                    showToast(`Báo cáo chi tiêu đã được gửi thành công đến ${user.email}!`, 'success');
                  } else {
                    showToast('Gửi email thất bại. Hãy kiểm tra cài đặt Service ID / Template ID / Public Key của bạn!', 'error');
                  }
                }}
                disabled={isSendingEmail}
                className="flex-1 py-3 bg-[#6f8d6d] hover:bg-[#5b755a] text-white text-xs font-bold font-vietnam rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                {isSendingEmail ? 'Đang gửi qua EmailJS...' : 'Gửi Thư Thật'}
              </button>
            </div>

          </div>
        </div>
      )} */}

      {/* 7. Modal Thay đổi ảnh đại diện */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
            onClick={() => setShowAvatarModal(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-xs bg-white/95 dark:bg-zinc-900/95 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-2xl space-y-4 animate-scale-up z-10 text-center backdrop-blur-lg">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-vietnam text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Ảnh đại diện
              </span>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-650 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Upload Button Area */}
            <div className="py-4">
              <button
                type="button"
                onClick={triggerFileInput}
                className="w-20 h-20 bg-[#6f8d6d]/10 hover:bg-[#6f8d6d]/20 text-[#6f8d6d] dark:bg-[#6f8d6d]/20 dark:text-[#8fae8d] rounded-full flex items-center justify-center mx-auto transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 group relative overflow-hidden"
              >
                <Camera size={28} className="group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#8fae8d]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>

            {/* Explanation text */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold font-vietnam text-zinc-800 dark:text-zinc-200">
                Chọn ảnh từ thiết bị
              </h4>
              <p className="text-[10px] font-vietnam text-zinc-400 dark:text-zinc-500 leading-relaxed px-2">
                Bấm vào biểu tượng camera phía trên để tải ảnh của bạn lên. Hệ thống sẽ tự động cắt khung vuông và nén ảnh xuống định dạng siêu nhẹ (~15KB) giúp tải ứng dụng nhanh hơn.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-500 dark:text-zinc-400 text-xs font-bold font-vietnam rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
          </div>
        </div>
      )}

    </div>
  );
};
