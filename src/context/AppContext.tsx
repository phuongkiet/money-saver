import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, Category, Wallet, Debt, UserProfile, TransactionType, DebtType, RepaymentMethod, MonthlySummary, YearlySummary } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  debts: Debt[];
  user: UserProfile;
  theme: 'light' | 'dark';
  toasts: Toast[];
  monthlySummaries: MonthlySummary[];
  yearlySummaries: YearlySummary[];
  compactMonthData: (monthId: string) => MonthlySummary | null;
  sendEmailJSReport: (summary: MonthlySummary) => Promise<boolean>;
  generateEmailHTML: (summary: MonthlySummary) => string;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  confirm: (title: string, message: string) => Promise<boolean>;
  addTransaction: (amount: number, type: TransactionType, categoryId: string, walletId: string, note: string, date: string) => void;
  deleteTransaction: (id: string) => void;
  addWallet: (name: string, type: 'cash' | 'online', balance: number, icon: string) => void;
  updateWalletBalance: (id: string, amount: number) => void;
  transferFunds: (fromId: string, toId: string, amount: number) => boolean;
  addCategory: (name: string, color: string, icon: string, budget: number) => void;
  updateCategoryBudget: (id: string, budget: number) => void;
  updateCategoryColor: (id: string, color: string) => void;
  addDebt: (name: string, amount: number, interestRate: number, termMonths: number, startDate: string, type: DebtType, repaymentMethod: RepaymentMethod, notes?: string) => void;
  toggleDebtStatus: (id: string) => void;
  deleteDebt: (id: string) => void;
  deleteWallet: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateProfile: (name: string, avatarUrl: string, email?: string) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Ăn uống', icon: 'Utensils', color: '#8fae8d', budget: 0 },
  { id: 'cat-2', name: 'Đi lại', icon: 'Car', color: '#57c5f7', budget: 0 },
  { id: 'cat-3', name: 'Thuốc men', icon: 'HeartPulse', color: '#f36e6e', budget: 0 },
  { id: 'cat-4', name: 'Học phí', icon: 'GraduationCap', color: '#9d7bf5', budget: 0 },
  { id: 'cat-5', name: 'Giải trí', icon: 'Gamepad2', color: '#f78ce6', budget: 0 }
];

const defaultWallets: Wallet[] = [
  { id: 'wallet-cash', name: 'Tiền mặt', type: 'cash', balance: 0, icon: 'Wallet' }
];

const defaultDebts: Debt[] = [];

const defaultTransactions: Transaction[] = [];

const defaultUser: UserProfile = {
  name: 'Người dùng',
  avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ms_transactions');
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('ms_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('ms_wallets');
    return saved ? JSON.parse(saved) : defaultWallets;
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('ms_debts');
    return saved ? JSON.parse(saved) : defaultDebts;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ms_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ms_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>(() => {
    const saved = localStorage.getItem('ms_monthly_summaries');
    return saved ? JSON.parse(saved) : [];
  });

  const [yearlySummaries, setYearlySummaries] = useState<YearlySummary[]>(() => {
    const saved = localStorage.getItem('ms_yearly_summaries');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ms_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ms_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('ms_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('ms_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('ms_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ms_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ms_monthly_summaries', JSON.stringify(monthlySummaries));
  }, [monthlySummaries]);

  useEffect(() => {
    localStorage.setItem('ms_yearly_summaries', JSON.stringify(yearlySummaries));
  }, [yearlySummaries]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    resolve: ((val: boolean) => void) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    resolve: null
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const confirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        resolve
      });
    });
  };

  const handleConfirmResolve = (val: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(val);
    }
    setConfirmState({
      isOpen: false,
      title: '',
      message: '',
      resolve: null
    });
  };

  const addTransaction = (amount: number, type: TransactionType, categoryId: string, walletId: string, note: string, date: string) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount,
      type,
      categoryId,
      walletId,
      date,
      note: note.trim() || (type === 'income' ? 'Thu nhập khác' : 'Chi tiêu khác')
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update wallet balance
    setWallets(prev => prev.map(w => {
      if (w.id === walletId) {
        return {
          ...w,
          balance: type === 'income' ? w.balance + amount : w.balance - amount
        };
      }
      return w;
    }));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setTransactions(prev => prev.filter(t => t.id !== id));

    // Refund wallet balance
    setWallets(prev => prev.map(w => {
      if (w.id === tx.walletId) {
        return {
          ...w,
          balance: tx.type === 'income' ? w.balance - tx.amount : w.balance + tx.amount
        };
      }
      return w;
    }));
  };

  const addWallet = (name: string, type: 'cash' | 'online', balance: number, icon: string) => {
    // If creating a cash wallet, ensure we only have exactly 1 cash wallet.
    if (type === 'cash') {
      const existingCash = wallets.find(w => w.type === 'cash');
      if (existingCash) {
        // Just update balance and name of the existing cash wallet
        setWallets(prev => prev.map(w => w.type === 'cash' ? { ...w, name, balance: w.balance + balance } : w));
        return;
      }
    }

    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      name,
      type,
      balance,
      icon
    };
    setWallets(prev => [...prev, newWallet]);
  };

  const updateWalletBalance = (id: string, amount: number) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, balance: amount } : w));
  };

  const transferFunds = (fromId: string, toId: string, amount: number): boolean => {
    const fromW = wallets.find(w => w.id === fromId);
    const toW = wallets.find(w => w.id === toId);
    if (!fromW || !toW || fromW.balance < amount) return false;

    setWallets(prev => prev.map(w => {
      if (w.id === fromId) return { ...w, balance: w.balance - amount };
      if (w.id === toId) return { ...w, balance: w.balance + amount };
      return w;
    }));

    // Record as transfer transaction notes
    const newTxFrom: Transaction = {
      id: `tx-tf-${Date.now()}-1`,
      amount,
      type: 'expense',
      categoryId: 'transfer',
      walletId: fromId,
      date: new Date().toISOString().split('T')[0],
      note: `Chuyển tiền đến ${toW.name}`
    };

    const newTxTo: Transaction = {
      id: `tx-tf-${Date.now()}-2`,
      amount,
      type: 'income',
      categoryId: 'transfer',
      walletId: toId,
      date: new Date().toISOString().split('T')[0],
      note: `Nhận tiền từ ${fromW.name}`
    };

    setTransactions(prev => [newTxFrom, newTxTo, ...prev]);
    return true;
  };

  const addCategory = (name: string, color: string, icon: string, budget: number) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      color,
      icon,
      budget
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategoryBudget = (id: string, budget: number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, budget } : c));
  };

  const updateCategoryColor = (id: string, color: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, color } : c));
  };

  const addDebt = (name: string, amount: number, interestRate: number, termMonths: number, startDate: string, type: DebtType, repaymentMethod: RepaymentMethod, notes?: string) => {
    const newDebt: Debt = {
      id: `debt-${Date.now()}`,
      name,
      amount,
      interestRate,
      termMonths,
      startDate,
      type,
      status: 'active',
      repaymentMethod,
      notes
    };
    setDebts(prev => [newDebt, ...prev]);
  };

  const toggleDebtStatus = (id: string) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'paid' : 'active' } : d));
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const deleteWallet = (id: string) => {
    const wallet = wallets.find(w => w.id === id);
    if (!wallet || wallet.type === 'cash') return;

    // Xóa ví
    setWallets(prev => prev.filter(w => w.id !== id));

    // Xóa các giao dịch thuộc ví này (Xóa thông minh)
    setTransactions(prev => prev.filter(t => t.walletId !== id));
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  const updateProfile = (name: string, avatarUrl: string, email?: string) => {
    setUser({ name, avatarUrl, email });
  };

  const generateEmailHTML = (summary: MonthlySummary): string => {
    const formatVND = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const monthStr = summary.monthId.split('-')[1];
    const yearStr = summary.monthId.split('-')[0];

    // Render categories table
    let categoriesRows = '';
    Object.values(summary.categories).forEach(cat => {
      const isOver = cat.budget > 0 && cat.spent > cat.budget;
      const statusText = cat.budget > 0 
        ? (isOver ? `<span style="color: #ef4444; font-weight: bold;">Vượt hạn mức</span>` : `<span style="color: #10b981; font-weight: bold;">An toàn</span>`)
        : 'Không đặt hạn mức';
      
      categoriesRows += `
        <tr style="border-bottom: 1px solid #f4f4f5;">
          <td style="padding: 12px 8px; font-size: 13px; font-weight: bold; color: #27272a;">${cat.name}</td>
          <td style="padding: 12px 8px; font-size: 13px; color: #71717a;">${formatVND(cat.budget)}</td>
          <td style="padding: 12px 8px; font-size: 13px; font-weight: bold; color: #27272a;">${formatVND(cat.spent)}</td>
          <td style="padding: 12px 8px; font-size: 12px;">${statusText}</td>
        </tr>
      `;
    });

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7faf6; padding: 24px 12px; margin: 0;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e1ebd5; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <!-- Header -->
          <div style="background-color: #6f8d6d; padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; opacity: 0.8;">Báo cáo tài chính tháng ${monthStr}/${yearStr}</div>
            <h1 style="font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Money Saver</h1>
          </div>

          <!-- Content -->
          <div style="padding: 24px;">
            <p style="font-size: 15px; color: #27272a; margin-top: 0; margin-bottom: 20px; line-height: 1.5;">
              Xin chào <strong>${user.name}</strong>, dưới đây là báo cáo tổng kết chi tiêu tháng ${monthStr}/${yearStr} của bạn đã được ứng dụng lưu trữ và nén thành công.
            </p>

            <!-- Overview Card -->
            <div style="background-color: #f1f6f0; border: 1px solid #d8e5d3; border-radius: 18px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #5b755a; letter-spacing: 1px; margin-bottom: 6px;">Số dư tích lũy tháng</div>
              <div style="font-size: 24px; font-weight: 800; color: #6f8d6d; margin-bottom: 16px;">
                ${formatVND(summary.totalIncome - summary.totalExpense)}
              </div>
              
              <div style="display: flex; justify-content: space-around; border-top: 1px dashed #cddcc9; padding-top: 12px;">
                <div style="flex: 1; text-align: center;">
                  <span style="font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 2px;">Thu nhập</span>
                  <span style="font-size: 14px; font-weight: bold; color: #10b981;">${formatVND(summary.totalIncome)}</span>
                </div>
                <div style="width: 1px; background-color: #cddcc9;"></div>
                <div style="flex: 1; text-align: center;">
                  <span style="font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 2px;">Chi tiêu</span>
                  <span style="font-size: 14px; font-weight: bold; color: #ef4444;">${formatVND(summary.totalExpense)}</span>
                </div>
              </div>
            </div>

            <!-- AI Advice -->
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 18px; padding: 16px; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 16px; margin-right: 6px;">💡</span>
                <strong style="font-size: 13px; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">Lời khuyên từ Trợ lý AI</strong>
              </div>
              <p style="font-size: 12px; color: #78350f; margin: 0; line-height: 1.6; font-style: italic;">
                "${summary.aiComment}"
              </p>
            </div>

            <!-- Categories Title -->
            <h3 style="font-size: 14px; font-weight: bold; color: #27272a; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              Hạn mức chi tiêu danh mục
            </h3>

            <!-- Table -->
            <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 24px;">
              <thead>
                <tr style="border-bottom: 2px solid #e4e4e7;">
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: bold;">Danh mục</th>
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: bold;">Ngân sách</th>
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: bold;">Thực tế</th>
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #71717a; font-weight: bold;">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                ${categoriesRows}
              </tbody>
            </table>

            <!-- App Footer Prompts -->
            <div style="border-top: 1px dashed #e4e4e7; padding-top: 20px; text-align: center;">
              <p style="font-size: 11px; color: #a1a1aa; margin: 0; line-height: 1.5;">
                Báo cáo này được tự động tạo bởi ứng dụng <strong>Money Saver PWA</strong>.<br/>
                Dữ liệu của tháng này đã được dọn dẹp để ứng dụng của bạn luôn siêu nhẹ và hoạt động trơn tru.
              </p>
            </div>

          </div>
        </div>
      </div>
    `;
  };

  const compactMonthData = (monthId: string): MonthlySummary | null => {
    const monthTxs = transactions.filter(t => t.date.startsWith(monthId));
    if (monthTxs.length === 0) return null;

    const totalIncome = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const categoriesMap: { [catId: string]: { name: string; budget: number; spent: number } } = {};
    
    categories.forEach(cat => {
      const spent = monthTxs.filter(t => t.type === 'expense' && t.categoryId === cat.id).reduce((sum, t) => sum + t.amount, 0);
      categoriesMap[cat.id] = {
        name: cat.name,
        budget: cat.budget,
        spent
      };
    });

    let overBudgetCats: string[] = [];
    let safeCats: string[] = [];
    categories.forEach(cat => {
      const spent = categoriesMap[cat.id].spent;
      if (cat.budget > 0) {
        if (spent > cat.budget) {
          overBudgetCats.push(cat.name);
        } else {
          safeCats.push(cat.name);
        }
      }
    });

    let aiComment = '';
    if (totalExpense > totalIncome) {
      aiComment = `Tháng này bạn đang chi tiêu vượt thu nhập (${new Intl.NumberFormat('vi-VN').format(totalExpense - totalIncome)} đ). `;
    } else {
      aiComment = `Tuyệt vời! Bạn đã tích lũy được ${new Intl.NumberFormat('vi-VN').format(totalIncome - totalExpense)} đ trong tháng này. `;
    }

    if (overBudgetCats.length > 0) {
      aiComment += `Bạn đã chi vượt hạn mức ở danh mục: ${overBudgetCats.join(', ')}. Hãy thắt chặt các khoản chi này vào tháng sau nhé! `;
    } else if (safeCats.length > 0) {
      aiComment += `Bạn đã kiểm soát ngân sách cực kỳ tốt ở các danh mục có định mức: ${safeCats.join(', ')}. Hãy tiếp tục duy trì kỷ luật này! `;
    } else {
      aiComment += `Bạn chưa thiết lập ngân sách định mức chi tiêu. Hãy đặt hạn mức chi tiêu hàng tháng ở các danh mục để AI giúp bạn kiểm soát dòng tiền tốt hơn nhé!`;
    }

    const newSummary: MonthlySummary = {
      monthId,
      totalIncome,
      totalExpense,
      categories: categoriesMap,
      aiComment
    };

    setMonthlySummaries(prev => {
      const filtered = prev.filter(s => s.monthId !== monthId);
      return [...filtered, newSummary].sort((a, b) => b.monthId.localeCompare(a.monthId));
    });

    setTransactions(prev => prev.filter(t => !t.date.startsWith(monthId)));

    return newSummary;
  };

  const sendEmailJSReport = async (summary: MonthlySummary): Promise<boolean> => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || localStorage.getItem('ms_emailjs_service_id') || '';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || localStorage.getItem('ms_emailjs_template_id') || '';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || localStorage.getItem('ms_emailjs_public_key') || '';
    const toEmail = user.email || '';

    if (!serviceId || !templateId || !publicKey || !toEmail) {
      return false;
    }

    const htmlReport = generateEmailHTML(summary);

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            user_name: user.name,
            to_email: toEmail,
            month_id: summary.monthId,
            email_content: htmlReport,
            title: `Báo cáo tài chính tháng ${summary.monthId.split('-')[1]}/${summary.monthId.split('-')[0]}`,
            subject: `Báo cáo tài chính tháng ${summary.monthId.split('-')[1]}/${summary.monthId.split('-')[0]}`
          }
        })
      });

      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  useEffect(() => {
    const currentMonthId = new Date().toISOString().substring(0, 7);
    const olderMonths = Array.from(new Set(
      transactions
        .map(t => t.date.substring(0, 7))
        .filter(m => m < currentMonthId && m.match(/^\d{4}-\d{2}$/))
    ));

    if (olderMonths.length > 0) {
      olderMonths.forEach(m => {
        compactMonthData(m);
      });
      setTimeout(() => {
        showToast(`Đã tự động lưu báo cáo và tối ưu bộ nhớ cho các tháng cũ: ${olderMonths.join(', ')}!`, 'info');
      }, 1000);
    }
  }, []);

  const resetData = () => {
    localStorage.clear();
    setTransactions(defaultTransactions);
    setCategories(defaultCategories);
    setWallets(defaultWallets);
    setDebts(defaultDebts);
    setUser(defaultUser);
    setThemeState('light');
    setMonthlySummaries([]);
    setYearlySummaries([]);
  };

  return (
    <AppContext.Provider value={{
      transactions,
      categories,
      wallets,
      debts,
      user,
      theme,
      toasts,
      monthlySummaries,
      yearlySummaries,
      compactMonthData,
      sendEmailJSReport,
      generateEmailHTML,
      showToast,
      confirm,
      addTransaction,
      deleteTransaction,
      addWallet,
      updateWalletBalance,
      transferFunds,
      addCategory,
      updateCategoryBudget,
      updateCategoryColor,
      addDebt,
      toggleDebtStatus,
      deleteDebt,
      deleteWallet,
      setTheme,
      updateProfile,
      resetData
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <ConfirmModal state={confirmState} onResolve={handleConfirmResolve} />
    </AppContext.Provider>
  );
};

// --- Beautiful Custom Toast Container Component ---
const ToastContainer: React.FC<{
  toasts: Toast[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
      {toasts.map(t => {
        let bgClass = '';
        let borderClass = '';
        let textClass = '';
        let Icon = Info;

        if (t.type === 'success') {
          bgClass = 'bg-emerald-50/95 dark:bg-emerald-950/90';
          borderClass = 'border-emerald-200/60 dark:border-emerald-900/30';
          textClass = 'text-emerald-700 dark:text-emerald-450';
          Icon = CheckCircle2;
        } else if (t.type === 'error') {
          bgClass = 'bg-rose-50/95 dark:bg-rose-950/90';
          borderClass = 'border-rose-200/60 dark:border-rose-900/30';
          textClass = 'text-rose-700 dark:text-rose-450';
          Icon = AlertCircle;
        } else {
          bgClass = 'bg-[#8fae8d]/10 bg-white/95 dark:bg-zinc-900/95';
          borderClass = 'border-[#8fae8d]/20 dark:border-zinc-800';
          textClass = 'text-[#6f8d6d] dark:text-[#8fae8d]';
          Icon = Info;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl px-4 py-3 border ${bgClass} ${borderClass} ${textClass} shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center gap-3 backdrop-blur-md animate-slide-down transition-all duration-300`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="text-xs font-vietnam font-semibold flex-1 leading-normal">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 hover:bg-zinc-500/10 rounded-lg shrink-0 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// --- Beautiful Custom Promise-based Confirm Modal Component ---
const ConfirmModal: React.FC<{
  state: {
    isOpen: boolean;
    title: string;
    message: string;
  };
  onResolve: (val: boolean) => void;
}> = ({ state, onResolve }) => {
  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => onResolve(false)}
      ></div>

      {/* Container */}
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)] space-y-4 animate-scale-up z-10 text-center">
        
        {/* Soft aesthetic warning icon */}
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100">
            {state.title}
          </h3>
          <p className="text-xs font-vietnam text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {state.message}
          </p>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            onClick={() => onResolve(false)}
            className="flex-1 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-500 dark:text-zinc-400 text-xs font-bold font-vietnam rounded-xl transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => onResolve(true)}
            className="flex-1 py-2.5 bg-[#6f8d6d] hover:bg-[#5b755a] text-white text-xs font-bold font-vietnam rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
