import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Cập nhật state để lần render sau sẽ hiển thị UI thay thế.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleForceReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu lưu trữ tạm trên máy này để khôi phục ứng dụng không? Việc này không thể hoàn tác.")) {
      localStorage.clear();
      // Xóa tất cả các Service Worker đang hoạt động để ép tải lại hoàn toàn code mới
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7faf6] px-4 py-8 font-sans antialiased text-[#27272a]">
          <div className="max-w-md w-full bg-white border border-[#e1ebd5] shadow-xl shadow-sage-900/5 rounded-[28px] overflow-hidden p-6 md:p-8 text-center transition-all duration-300">
            
            {/* Elegant Shield Alert Icon */}
            <div className="mx-auto w-16 h-16 bg-[#f1f6f0] border border-[#d8e5d3] text-[#6f8d6d] rounded-full flex items-center justify-center mb-6 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            {/* Error Messages */}
            <h1 className="text-xl font-bold tracking-tight text-[#27272a] mb-3">
              Ối! Đã xảy ra lỗi nhỏ
            </h1>
            <p className="text-sm text-[#71717a] leading-relaxed mb-6">
              Khi hệ thống cập nhật code mới hoặc cấu trúc dữ liệu bị lệch, ứng dụng có thể gặp xung đột bộ nhớ tạm. Hãy chọn phương án khắc phục nhanh dưới đây nhé.
            </p>

            {/* Error Collapse Detail */}
            {this.state.error && (
              <div className="mb-6 text-left">
                <details className="group border border-red-100 bg-red-50/30 rounded-xl overflow-hidden">
                  <summary className="list-none flex items-center justify-between p-3 text-xs font-semibold text-red-700 cursor-pointer select-none">
                    <span>Xem chi tiết kỹ thuật</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="p-3 border-t border-red-100/50 font-mono text-[10px] text-red-600 bg-white overflow-auto max-h-36 whitespace-pre-wrap leading-relaxed">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-[#6f8d6d] hover:bg-[#5b755a] text-white py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-md shadow-sage-900/10 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Tải lại ứng dụng
              </button>

              <button
                onClick={this.handleForceReset}
                className="w-full bg-[#fff5f5] hover:bg-[#ffebeb] text-red-600 border border-red-200 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 active:scale-[0.98]"
              >
                Dọn sạch bộ nhớ & Reset ứng dụng
              </button>
            </div>

            <p className="text-[11px] text-[#a1a1aa] mt-6 leading-relaxed">
              Dữ liệu của bạn được lưu trữ an toàn, ngoại trừ dữ liệu chưa kịp đồng bộ sẽ cần thiết lập lại.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
