import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useCompanion } from '../../context/CompanionContext';
import {
  isPushSupported,
  getNotificationPermissionState,
  requestNotificationPermission,
  subscribeUserToPush,
  unsubscribeUserFromPush
} from '../../utils/pushNotification';
import { Bell, BellOff, ShieldCheck, RefreshCw, Send } from 'lucide-react';

export const CompanionSettings: React.FC = () => {
  const { session, showToast } = useApp();
  const { syncCompanionData, isSyncing } = useCompanion();

  const [pushSupported, setPushSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Check initial support & state
  useEffect(() => {
    const supported = isPushSupported();
    setPushSupported(supported);

    if (supported) {
      const currentPermission = getNotificationPermissionState();
      setPermission(currentPermission);
      
      // If permission is granted, check service worker registration to see if we have an active subscription
      if (currentPermission === 'granted') {
        navigator.serviceWorker.ready.then((reg) => {
          reg.pushManager.getSubscription().then((sub) => {
            setIsNotificationsEnabled(!!sub);
          });
        });
      }
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!pushSupported) {
      showToast('Trình duyệt hoặc thiết bị của bạn không hỗ trợ nhận thông báo push.', 'error');
      return;
    }

    if (!session) {
      showToast('Vui lòng đăng nhập tài khoản để đồng bộ và bật thông báo.', 'error');
      return;
    }

    setActionLoading(true);

    try {
      if (isNotificationsEnabled) {
        // Unsubscribe
        const success = await unsubscribeUserFromPush(session.user.id);
        if (success) {
          setIsNotificationsEnabled(false);
          showToast('Đã tắt nhận thông báo push.', 'success');
        } else {
          showToast('Có lỗi xảy ra khi hủy đăng ký nhận thông báo.', 'error');
        }
      } else {
        // Request permission if not granted
        let currentPermission = getNotificationPermissionState();
        if (currentPermission === 'default') {
          currentPermission = await requestNotificationPermission();
          setPermission(currentPermission);
        }

        if (currentPermission !== 'granted') {
          showToast('Quyền nhận thông báo chưa được cấp. Vui lòng cấp quyền thông báo trong cài đặt trình duyệt.', 'error');
          setActionLoading(false);
          return;
        }

        // Subscribe
        const success = await subscribeUserToPush(session.user.id);
        if (success) {
          setIsNotificationsEnabled(true);
          showToast('Đã bật nhận thông báo thành công! 🎉', 'success');
        } else {
          showToast('Không thể bật thông báo. Vui lòng thử lại sau.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi thay đổi cài đặt thông báo.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (Notification.permission !== 'granted') {
      showToast('Vui lòng cấp quyền thông báo trước.', 'error');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification('Kiểm tra thông báo Money Saver 🔔', {
        body: 'Thông báo đã sẵn sàng! Bạn sẽ nhận được lời nhắc về cuộc hẹn và kỳ kinh tự động hàng ngày lúc 8:00 sáng.',
        icon: '/icons/icon-192.png',
        badge: '/favicon.svg',
        vibrate: [100, 50, 100],
        tag: 'test-notification'
      } as any);
      showToast('Đã gửi thông báo test! Hãy kiểm tra màn hình của bạn.', 'info');
    } catch (err) {
      console.error('Test notification error:', err);
      showToast('Không thể gửi thông báo test.', 'error');
    }
  };

  const handleManualSync = async () => {
    if (!session) {
      showToast('Vui lòng đăng nhập để đồng bộ dữ liệu.', 'error');
      return;
    }
    const success = await syncCompanionData();
    if (success) {
      showToast('Đồng bộ dữ liệu thành công! ✅', 'success');
    } else {
      showToast('Đồng bộ thất bại. Vui lòng kiểm tra kết nối mạng.', 'error');
    }
  };

  return (
    <div className="p-4 space-y-4 font-vietnam text-xs">
      {/* 1. Notification Card */}
      <div 
        className="border rounded-2xl p-4 shadow-sm space-y-4"
        style={{ 
          backgroundColor: 'var(--theme-bg-card)', 
          borderColor: 'var(--theme-border)' 
        }}
      >
        <h3 className="text-sm font-bold flex items-center gap-1.5 text-[var(--theme-text-dark)]">
          <Bell size={18} style={{ color: 'var(--theme-accent)' }} />
          Cài đặt Thông báo Nhắc lịch
        </h3>

        <p className="text-[10px] text-[var(--theme-text-muted)] leading-relaxed">
          Nhận thông báo tự động ngay cả khi ứng dụng đã đóng để không bỏ lỡ các ngày đặc biệt, lịch hẹn và chu kỳ dâu của bạn gái.
        </p>

        {pushSupported ? (
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-black text-[var(--theme-text-dark)] block">Trạng thái thông báo</span>
                <span className="text-[10px] text-[var(--theme-text-muted)] font-medium">
                  {permission === 'denied' 
                    ? 'Bị chặn bởi trình duyệt' 
                    : isNotificationsEnabled 
                      ? 'Đang hoạt động' 
                      : 'Đang tắt'}
                </span>
              </div>

              <button
                onClick={handleToggleNotifications}
                disabled={actionLoading || permission === 'denied'}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl shadow-sm transition-all active:scale-95 text-white ${
                  isNotificationsEnabled ? 'bg-zinc-500 hover:bg-zinc-650' : 'bg-[var(--theme-accent)] hover:opacity-90'
                } ${actionLoading || permission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isNotificationsEnabled ? (
                  <>
                    <BellOff size={14} />
                    Tắt thông báo
                  </>
                ) : (
                  <>
                    <Bell size={14} />
                    Bật thông báo
                  </>
                )}
              </button>
            </div>

            {isNotificationsEnabled && (
              <div className="pt-2 border-t border-dashed" style={{ borderColor: 'var(--theme-border)' }}>
                <button
                  onClick={handleTestNotification}
                  className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[var(--theme-text-dark)] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border"
                  style={{ borderColor: 'var(--theme-border)' }}
                >
                  <Send size={13} />
                  Gửi thử thông báo kiểm tra
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-300 p-3 rounded-xl border border-red-150 flex items-start gap-2">
            <BellOff size={16} className="shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Thiết bị không hỗ trợ</span>
              <span className="text-[10px] leading-relaxed block">
                Trình duyệt hoặc thiết bị này không hỗ trợ Push Notification. Nếu dùng iOS, hãy "Thêm vào màn hình chính (Add to Home Screen)" trước khi bật tính năng này.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Cloud Sync Card */}
      <div 
        className="border rounded-2xl p-4 shadow-sm space-y-4"
        style={{ 
          backgroundColor: 'var(--theme-bg-card)', 
          borderColor: 'var(--theme-border)' 
        }}
      >
        <h3 className="text-sm font-bold flex items-center gap-1.5 text-[var(--theme-text-dark)]">
          <ShieldCheck size={18} style={{ color: 'var(--theme-accent)' }} />
          Đồng bộ Đám mây
        </h3>

        <p className="text-[10px] text-[var(--theme-text-muted)] leading-relaxed">
          Dữ liệu Companion App hiện tại được đồng bộ tự động với Supabase khi bạn đăng nhập. Bạn cũng có thể bắt buộc đồng bộ thủ công.
        </p>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="font-black text-[var(--theme-text-dark)] block">Trạng thái kết nối</span>
            <span className="text-[10px] text-[var(--theme-text-muted)] font-medium">
              {session ? 'Đã liên kết tài khoản' : 'Chưa đăng nhập'}
            </span>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing || !session}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-xl shadow-sm transition-all active:scale-95 text-white bg-[var(--theme-accent)] hover:opacity-90 ${
              isSyncing || !session ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSyncing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Đang đồng bộ...
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Đồng bộ ngay
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Notification Rules */}
      <div className="px-1.5 space-y-2">
        <h4 className="font-bold text-[var(--theme-text-muted)] uppercase tracking-wider text-[10px]">
          🤖 Quy tắc gửi thông báo:
        </h4>
        <ul className="list-disc pl-4 space-y-1.5 text-[10px] text-[var(--theme-text-muted)] leading-relaxed">
          <li><strong>🗓️ Lịch hẹn hò:</strong> Nhắc lúc 8h sáng ngày hôm trước và đúng ngày hẹn.</li>
          <li><strong>🎂 Sinh nhật / Kỷ niệm:</strong> Nhắc trước 3 ngày, trước 1 ngày và sáng đúng ngày.</li>
          <li><strong>🩸 Chu kỳ kinh nguyệt:</strong> Nhắc trước 3 ngày dự kiến (chỉ gửi cho tài khoản nam).</li>
        </ul>
      </div>
    </div>
  );
};
