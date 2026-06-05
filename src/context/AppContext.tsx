import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Transaction, Category, Wallet, Debt, UserProfile, TransactionType,
  DebtType, RepaymentMethod, MonthlySummary, YearlySummary,
  RecurringTransaction, RecurringFrequency, SavingsGoal
} from '../types';
import { CheckCircle2, AlertCircle, Info, X, Wallet as WalletIcon, Loader2 } from 'lucide-react';
import { db } from '../utils/db';
import { supabase } from '../utils/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import {
  mapTransactionToDb, mapTransactionFromDb,
  mapCategoryToDb, mapCategoryFromDb,
  mapWalletToDb, mapWalletFromDb,
  mapDebtToDb, mapDebtFromDb,
  mapRecurringToDb, mapRecurringFromDb,
  mapSavingsGoalToDb, mapSavingsGoalFromDb,
  mapMonthlySummaryToDb, mapMonthlySummaryFromDb,
  mapYearlySummaryToDb, mapYearlySummaryFromDb
} from '../utils/syncHelper';

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
  recurringTransactions: RecurringTransaction[];
  savingsGoals: SavingsGoal[];
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
  // Auth & Sync
  session: Session | null;
  authLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  syncData: () => Promise<boolean>;
  // Transactions
  addTransaction: (amount: number, type: TransactionType, categoryId: string, walletId: string, note: string, date: string) => void;
  updateTransaction: (id: string, amount: number, type: TransactionType, categoryId: string, walletId: string, note: string, date: string) => void;
  deleteTransaction: (id: string) => void;
  // Wallets
  addWallet: (name: string, type: 'cash' | 'online', balance: number, icon: string) => void;
  updateWalletBalance: (id: string, amount: number) => void;
  transferFunds: (fromId: string, toId: string, amount: number) => boolean;
  deleteWallet: (id: string) => void;
  // Categories
  addCategory: (name: string, color: string, icon: string, budget: number, type: TransactionType) => void;
  updateCategory: (id: string, name: string, color: string, icon: string, budget: number, type: TransactionType) => void;
  updateCategoryBudget: (id: string, budget: number) => void;
  updateCategoryColor: (id: string, color: string) => void;
  deleteCategory: (id: string) => void;
  // Debts
  addDebt: (name: string, amount: number, interestRate: number, termMonths: number, startDate: string, type: DebtType, repaymentMethod: RepaymentMethod, notes?: string, linkedCategoryId?: string) => void;
  updateDebt: (id: string, name: string, amount: number, interestRate: number, termMonths: number, startDate: string, type: DebtType, repaymentMethod: RepaymentMethod, notes?: string, linkedCategoryId?: string) => void;
  toggleDebtStatus: (id: string) => void;
  deleteDebt: (id: string) => void;
  // Recurring Transactions
  addRecurringTransaction: (amount: number, type: TransactionType, categoryId: string, walletId: string, note: string, frequency: RecurringFrequency, startDate: string, endDate?: string, totalOccurrences?: number) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  pauseRecurringTransaction: (id: string) => void;
  resumeRecurringTransaction: (id: string) => void;
  // Savings Goals
  addSavingsGoal: (name: string, icon: string, color: string, targetAmount: number, deadline?: string, notes?: string) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  depositToSavingsGoal: (goalId: string, walletId: string, amount: number) => void;
  withdrawFromSavingsGoal: (goalId: string, walletId: string, amount: number) => void;
  // Theme & Profile
  setTheme: (theme: 'light' | 'dark') => void;
  updateProfile: (name: string, avatarUrl: string, email?: string, gender?: 'male' | 'female') => void;
  resetData: () => void;

}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Ăn uống', icon: 'Utensils', color: '#8fae8d', budget: 0, type: 'expense' },
  { id: 'cat-2', name: 'Đi lại', icon: 'Car', color: '#57c5f7', budget: 0, type: 'expense' },
  { id: 'cat-3', name: 'Thuốc men', icon: 'HeartPulse', color: '#f36e6e', budget: 0, type: 'expense' },
  { id: 'cat-4', name: 'Học phí', icon: 'GraduationCap', color: '#9d7bf5', budget: 0, type: 'expense' },
  { id: 'cat-5', name: 'Giải trí', icon: 'Gamepad2', color: '#f78ce6', budget: 0, type: 'expense' },
  { id: 'cat-inc-1', name: 'Tiền lương', icon: 'Briefcase', color: '#34d399', budget: 0, type: 'income' },
  { id: 'cat-inc-2', name: 'Thưởng', icon: 'Gift', color: '#fbbf24', budget: 0, type: 'income' },
  { id: 'cat-inc-3', name: 'Đầu tư', icon: 'TrendingUp', color: '#38bdf8', budget: 0, type: 'income' },
  { id: 'cat-inc-4', name: 'Thu nhập khác', icon: 'PiggyBank', color: '#a78bfa', budget: 0, type: 'income' }
];

const defaultWallets: Wallet[] = [
  { id: 'wallet-cash', name: 'Tiền mặt', type: 'cash', balance: 0, icon: 'Wallet' }
];

const defaultDebts: Debt[] = [];
const defaultTransactions: Transaction[] = [];
const defaultRecurring: RecurringTransaction[] = [];
const defaultSavingsGoals: SavingsGoal[] = [];

const defaultUser: UserProfile = {
  name: 'Người dùng',
  avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack'
};

// ─── Helper: tính ngày thực thi tiếp theo ───────────────────────────────────
const getNextExecutionDate = (lastDate: string, frequency: RecurringFrequency): string => {
  const d = new Date(lastDate);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
  }
  return d.toISOString().split('T')[0];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [wallets, setWallets] = useState<Wallet[]>(defaultWallets);
  const [debts, setDebts] = useState<Debt[]>(defaultDebts);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(defaultRecurring);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(defaultSavingsGoals);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [yearlySummaries, setYearlySummaries] = useState<YearlySummary[]>([]);

  // Auth & Sync States
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [deletedRecords, setDeletedRecords] = useState<{ id: string; table: string; updatedAt: number }[]>([]);

  // Toast & Confirm state
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

  // Debt notification modal state
  const [debtNotifState, setDebtNotifState] = useState<{
    isOpen: boolean;
    urgentDebts: { debt: Debt; daysUntilPayment: number; nextPaymentDate: string }[];
    collectableDebts: { debt: Debt; dueDate: string }[];
  }>({ isOpen: false, urgentDebts: [], collectableDebts: [] });

  // ─── Load data from IndexedDB ─────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const keys = [
          { dbKey: 'ms_transactions', defaultVal: defaultTransactions, setter: setTransactions },
          { dbKey: 'ms_categories', defaultVal: defaultCategories, setter: setCategories },
          { dbKey: 'ms_wallets', defaultVal: defaultWallets, setter: setWallets },
          { dbKey: 'ms_debts', defaultVal: defaultDebts, setter: setDebts },
          { dbKey: 'ms_user', defaultVal: defaultUser, setter: setUser },
          { dbKey: 'ms_monthly_summaries', defaultVal: [], setter: setMonthlySummaries },
          { dbKey: 'ms_yearly_summaries', defaultVal: [], setter: setYearlySummaries },
          { dbKey: 'ms_recurring', defaultVal: defaultRecurring, setter: setRecurringTransactions },
          { dbKey: 'ms_savings_goals', defaultVal: defaultSavingsGoals, setter: setSavingsGoals },
          { dbKey: 'ms_deleted_records', defaultVal: [], setter: setDeletedRecords }
        ];

        // Theme loading
        let savedTheme = await db.get<'light' | 'dark'>('ms_theme', 'light');
        const localSavedTheme = localStorage.getItem('ms_theme');
        if (localSavedTheme && !localStorage.getItem('ms_indexeddb_migrated')) {
          savedTheme = localSavedTheme as 'light' | 'dark';
          await db.set('ms_theme', savedTheme);
        }
        setThemeState(savedTheme);

        let savedLastSynced = await db.get<number | null>('ms_last_synced_at', null);
        setLastSyncedAt(savedLastSynced);

        for (const item of keys) {
          let val: any = await db.get<any>(item.dbKey, null);

          if (val === null) {
            const localValStr = localStorage.getItem(item.dbKey);
            if (localValStr) {
              try {
                val = JSON.parse(localValStr);
                await db.set(item.dbKey, val);
              } catch {
                val = item.defaultVal;
              }
            } else {
              val = item.defaultVal;
            }
          }
          if (item.dbKey === 'ms_user' && val) {
            if (!val.gender) {
              const onboardedGender = localStorage.getItem('ms_onboarding_gender');
              if (onboardedGender === 'male' || onboardedGender === 'female') {
                val = { ...val, gender: onboardedGender };
                await db.set('ms_user', val);
              }
            }
          }
          item.setter(val);
        }

        localStorage.setItem('ms_indexeddb_migrated', 'true');
        const ourKeys = [
          'ms_transactions', 'ms_categories', 'ms_wallets', 'ms_debts',
          'ms_user', 'ms_theme', 'ms_monthly_summaries', 'ms_yearly_summaries',
          'ms_recurring', 'ms_savings_goals', 'ms_deleted_records'
        ];
        ourKeys.forEach(k => localStorage.removeItem(k));

      } catch (err) {
        console.error('Lỗi khi tải dữ liệu từ IndexedDB:', err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    loadData();
  }, []);

  // ─── Persist to IndexedDB ─────────────────────────────────────────────────
  useEffect(() => { if (!loading) db.set('ms_transactions', transactions); }, [transactions, loading]);
  useEffect(() => { if (!loading) db.set('ms_categories', categories); }, [categories, loading]);
  useEffect(() => { if (!loading) db.set('ms_wallets', wallets); }, [wallets, loading]);
  useEffect(() => { if (!loading) db.set('ms_debts', debts); }, [debts, loading]);
  useEffect(() => { if (!loading) db.set('ms_user', user); }, [user, loading]);
  useEffect(() => { if (!loading) db.set('ms_monthly_summaries', monthlySummaries); }, [monthlySummaries, loading]);
  useEffect(() => { if (!loading) db.set('ms_yearly_summaries', yearlySummaries); }, [yearlySummaries, loading]);
  useEffect(() => { if (!loading) db.set('ms_recurring', recurringTransactions); }, [recurringTransactions, loading]);
  useEffect(() => { if (!loading) db.set('ms_savings_goals', savingsGoals); }, [savingsGoals, loading]);
  useEffect(() => { if (!loading) db.set('ms_deleted_records', deletedRecords); }, [deletedRecords, loading]);
  useEffect(() => { if (!loading) db.set('ms_last_synced_at', lastSyncedAt); }, [lastSyncedAt, loading]);

  useEffect(() => {
    if (!loading) {
      db.set('ms_theme', theme);
      const root = window.document.documentElement;
      if (theme === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme, loading]);

  // ─── Listen for Supabase Auth state changes ───────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        setUser(prev => ({
          ...prev,
          email: session.user.email || prev.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || prev.name
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
      if (session) {
        setUser(prev => ({
          ...prev,
          email: session.user.email || prev.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || prev.name
        }));
      } else {
        setUser(prev => ({ ...prev, email: undefined }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ─── Listen for Online/Offline status ──────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      showToast('Đã khôi phục kết nối mạng! Bắt đầu đồng bộ...', 'info');
      syncData();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [session, transactions, categories, wallets, debts, recurringTransactions, savingsGoals, monthlySummaries, yearlySummaries, deletedRecords]);

  // ─── Auto-sync on successful sign-in ────────────────────────────────────────
  useEffect(() => {
    if (session && !loading) {
      syncData(session);
    }
  }, [session?.user?.id, loading]);

  // ─── AUTHENTICATION FUNCTIONS ──────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast('Đăng nhập thành công!', 'success');
      
      // Sync immediately after login
      setTimeout(() => syncData(data.session), 500);
      return { success: true };
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err);
      showToast(err.message || 'Đăng nhập thất bại.', 'error');
      return { success: false, error: err.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Lỗi đăng nhập Google:', err);
      showToast('Đăng nhập Google thất bại: ' + err.message, 'error');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      if (error) throw error;
      showToast('Đăng ký tài khoản thành công!', 'success');

      if (data.session) {
        await supabase.from('user_profiles').upsert({
          id: data.session.user.id,
          name: name.trim(),
          avatar_url: defaultUser.avatarUrl,
          email,
          gender: user.gender || localStorage.getItem('ms_onboarding_gender') || null,
          updated_at: Date.now()
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Lỗi đăng ký:', err);
      showToast(err.message || 'Đăng ký thất bại.', 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setLastSyncedAt(null);
      await db.remove('ms_last_synced_at');
      showToast('Đã đăng xuất tài khoản.', 'info');
    } catch (err: any) {
      console.error('Lỗi đăng xuất:', err);
      showToast('Không thể đăng xuất.', 'error');
    }
  };

  // ─── CLOUD DATA SYNCHRONIZATION FUNCTION ──────────────────────────────────
  const syncData = async (activeSession = session): Promise<boolean> => {
    if (!activeSession) return false;
    if (!window.navigator.onLine) {
      showToast('Thiết bị đang ngoại tuyến. Sẽ đồng bộ khi có mạng.', 'info');
      return false;
    }

    setIsSyncing(true);
    const userId = activeSession.user.id;
    const now = Date.now();

    try {
      // --- Helper to sync a standard table ---
      const syncTable = async <T extends { id: string; updatedAt?: number; pendingSync?: boolean }>({
        tableName,
        localItems,
        setLocalItems,
        mapToDb,
        mapFromDb,
        deletedTableKey
      }: {
        tableName: string;
        localItems: T[];
        setLocalItems: React.Dispatch<React.SetStateAction<T[]>>;
        mapToDb: (item: T, uid: string) => any;
        mapFromDb: (row: any) => T;
        deletedTableKey: string;
      }) => {
        // A. Upload changes
        const pendingUpload = localItems.filter(item => item.pendingSync);
        if (pendingUpload.length > 0) {
          const dbRows = pendingUpload.map(item => mapToDb(item, userId));
          const { error: uploadError } = await supabase
            .from(tableName)
            .upsert(dbRows);
          
          if (uploadError) throw uploadError;

          setLocalItems(prev => prev.map(item => {
            if (pendingUpload.some(p => p.id === item.id)) {
              return { ...item, pendingSync: false };
            }
            return item;
          }));
        }

        // B. Upload deletions
        const pendingDeletions = deletedRecords.filter(r => r.table === deletedTableKey);
        if (pendingDeletions.length > 0) {
          const deletePromises = pendingDeletions.map(async (r) => {
            const { error: deleteError } = await supabase
              .from(tableName)
              .update({ is_deleted: true, updated_at: r.updatedAt })
              .eq('id', r.id)
              .eq('user_id', userId);
            if (deleteError) throw deleteError;
          });
          await Promise.all(deletePromises);

          setDeletedRecords(prev => prev.filter(r => !(r.table === deletedTableKey && pendingDeletions.some(pd => pd.id === r.id))));
        }

        // C. Download changes
        const localMaxUpdated = localItems.reduce((max, item) => Math.max(max, item.updatedAt || 0), 0);
        
        const { data: cloudRows, error: downloadError } = await supabase
          .from(tableName)
          .select('*')
          .eq('user_id', userId)
          .gt('updated_at', localMaxUpdated);

        if (downloadError) throw downloadError;

        if (cloudRows && cloudRows.length > 0) {
          let updatedLocalList = [...localItems];

          cloudRows.forEach(row => {
            const remoteItem = mapFromDb(row);

            if (row.is_deleted) {
              updatedLocalList = updatedLocalList.filter(item => item.id !== remoteItem.id);
            } else {
              const localIndex = updatedLocalList.findIndex(item => item.id === remoteItem.id);
              if (localIndex !== -1) {
                const localItem = updatedLocalList[localIndex];
                if ((remoteItem.updatedAt || 0) > (localItem.updatedAt || 0)) {
                  updatedLocalList[localIndex] = { ...remoteItem, pendingSync: false };
                }
              } else {
                updatedLocalList.push({ ...remoteItem, pendingSync: false });
              }
            }
          });

          setLocalItems(updatedLocalList);
        }
      };

      // Sync 6 core tables
      await syncTable({
        tableName: 'wallets',
        localItems: wallets,
        setLocalItems: setWallets,
        mapToDb: mapWalletToDb,
        mapFromDb: mapWalletFromDb,
        deletedTableKey: 'wallets'
      });

      await syncTable({
        tableName: 'categories',
        localItems: categories,
        setLocalItems: setCategories,
        mapToDb: mapCategoryToDb,
        mapFromDb: mapCategoryFromDb,
        deletedTableKey: 'categories'
      });

      await syncTable({
        tableName: 'transactions',
        localItems: transactions,
        setLocalItems: setTransactions,
        mapToDb: mapTransactionToDb,
        mapFromDb: mapTransactionFromDb,
        deletedTableKey: 'transactions'
      });

      await syncTable({
        tableName: 'debts',
        localItems: debts,
        setLocalItems: setDebts,
        mapToDb: mapDebtToDb,
        mapFromDb: mapDebtFromDb,
        deletedTableKey: 'debts'
      });

      await syncTable({
        tableName: 'recurring_transactions',
        localItems: recurringTransactions,
        setLocalItems: setRecurringTransactions,
        mapToDb: mapRecurringToDb,
        mapFromDb: mapRecurringFromDb,
        deletedTableKey: 'recurring'
      });

      await syncTable({
        tableName: 'savings_goals',
        localItems: savingsGoals,
        setLocalItems: setSavingsGoals,
        mapToDb: mapSavingsGoalToDb,
        mapFromDb: mapSavingsGoalFromDb,
        deletedTableKey: 'savings_goals'
      });

      // Sync summaries
      const syncSummaries = async () => {
        // Upload Ms
        const pendingMs = monthlySummaries.filter(m => m.pendingSync);
        if (pendingMs.length > 0) {
          const rows = pendingMs.map(m => mapMonthlySummaryToDb(m, userId));
          const { error } = await supabase.from('monthly_summaries').upsert(rows);
          if (error) throw error;
          setMonthlySummaries(prev => prev.map(m => pendingMs.some(p => p.monthId === m.monthId) ? { ...m, pendingSync: false } : m));
        }

        // Upload deleted Ms
        const pendingMsDeletions = deletedRecords.filter(r => r.table === 'monthly_summaries');
        if (pendingMsDeletions.length > 0) {
          const deletePromises = pendingMsDeletions.map(async (r) => {
            const { error: deleteError } = await supabase
              .from('monthly_summaries')
              .update({ is_deleted: true, updated_at: r.updatedAt })
              .eq('id', r.id)
              .eq('user_id', userId);
            if (deleteError) throw deleteError;
          });
          await Promise.all(deletePromises);
          setDeletedRecords(prev => prev.filter(r => !(r.table === 'monthly_summaries' && pendingMsDeletions.some(pd => pd.id === r.id))));
        }

        // Download Ms
        const localMsMax = monthlySummaries.reduce((max, m) => Math.max(max, m.updatedAt || 0), 0);
        const { data: cloudMs, error: errMs } = await supabase.from('monthly_summaries').select('*').eq('user_id', userId).gt('updated_at', localMsMax);
        if (errMs) throw errMs;
        if (cloudMs && cloudMs.length > 0) {
          let updatedMs = [...monthlySummaries];
          cloudMs.forEach(row => {
            const remoteItem = mapMonthlySummaryFromDb(row);
            if (row.is_deleted) {
              updatedMs = updatedMs.filter(m => m.monthId !== remoteItem.monthId);
            } else {
              const idx = updatedMs.findIndex(m => m.monthId === remoteItem.monthId);
              if (idx !== -1) {
                if ((remoteItem.updatedAt || 0) > (updatedMs[idx].updatedAt || 0)) {
                  updatedMs[idx] = { ...remoteItem, pendingSync: false };
                }
              } else {
                updatedMs.push({ ...remoteItem, pendingSync: false });
              }
            }
          });
          setMonthlySummaries(updatedMs.sort((a, b) => b.monthId.localeCompare(a.monthId)));
        }

        // Upload Ys
        const pendingYs = yearlySummaries.filter(y => y.pendingSync);
        if (pendingYs.length > 0) {
          const rows = pendingYs.map(y => mapYearlySummaryToDb(y, userId));
          const { error } = await supabase.from('yearly_summaries').upsert(rows);
          if (error) throw error;
          setYearlySummaries(prev => prev.map(y => pendingYs.some(p => p.yearId === y.yearId) ? { ...y, pendingSync: false } : y));
        }

        const localYsMax = yearlySummaries.reduce((max, y) => Math.max(max, y.updatedAt || 0), 0);
        const { data: cloudYs, error: errYs } = await supabase.from('yearly_summaries').select('*').eq('user_id', userId).gt('updated_at', localYsMax);
        if (errYs) throw errYs;
        if (cloudYs && cloudYs.length > 0) {
          let updatedYs = [...yearlySummaries];
          cloudYs.forEach(row => {
            const remoteItem = mapYearlySummaryFromDb(row);
            if (row.is_deleted) {
              updatedYs = updatedYs.filter(y => y.yearId !== remoteItem.yearId);
            } else {
              const idx = updatedYs.findIndex(y => y.yearId === remoteItem.yearId);
              if (idx !== -1) {
                if ((remoteItem.updatedAt || 0) > (updatedYs[idx].updatedAt || 0)) {
                  updatedYs[idx] = { ...remoteItem, pendingSync: false };
                }
              } else {
                updatedYs.push({ ...remoteItem, pendingSync: false });
              }
            }
          });
          setYearlySummaries(updatedYs);
        }
      };

      await syncSummaries();

      // Profile sync
      const { data: cloudProfile, error: profileErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileErr && profileErr.code !== 'PGRST116') throw profileErr;

      const localProfileUpdated = (user as any).updatedAt || 0;
      if (cloudProfile) {
        const remoteProfile = {
          name: cloudProfile.name,
          avatarUrl: cloudProfile.avatar_url,
          email: cloudProfile.email,
          gender: cloudProfile.gender
        };
        if (cloudProfile.updated_at > localProfileUpdated) {
          setUser({ ...remoteProfile, updatedAt: cloudProfile.updated_at } as any);
        } else if (localProfileUpdated > cloudProfile.updated_at) {
          await supabase.from('user_profiles').upsert({
            id: userId,
            name: user.name,
            avatar_url: user.avatarUrl,
            email: user.email || null,
            gender: user.gender || null,
            updated_at: localProfileUpdated
          });
        }
      } else {
        await supabase.from('user_profiles').upsert({
          id: userId,
          name: user.name,
          avatar_url: user.avatarUrl,
          email: user.email || null,
          gender: user.gender || null,
          updated_at: localProfileUpdated || now
        });
      }

      // Theme sync
      const { data: cloudThemeRow, error: themeErr } = await supabase
        .from('app_theme')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (themeErr && themeErr.code !== 'PGRST116') throw themeErr;

      const localThemeUpdated = (theme as any).updatedAt || 0;
      if (cloudThemeRow) {
        if (cloudThemeRow.updated_at > localThemeUpdated) {
          setThemeState(cloudThemeRow.theme);
        } else if (localThemeUpdated > cloudThemeRow.updated_at) {
          await supabase.from('app_theme').upsert({
            user_id: userId,
            theme,
            updated_at: localThemeUpdated
          });
        }
      } else {
        await supabase.from('app_theme').upsert({
          user_id: userId,
          theme,
          updated_at: now
        });
      }

      setLastSyncedAt(now);
      showToast('Đồng bộ dữ liệu thành công!', 'success');
      return true;
    } catch (err: any) {
      console.error('Lỗi khi đồng bộ đám mây:', err);
      showToast('Lỗi đồng bộ dữ liệu: ' + (err.message || 'Mất kết nối.'), 'error');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };


  // ─── Auto-execute Recurring Transactions on app open ─────────────────────
  useEffect(() => {
    if (loading) return;

    const today = new Date().toISOString().split('T')[0];
    let newTransactions: Transaction[] = [];
    let updatedRecurring = [...recurringTransactions];
    let executedCount = 0;

    updatedRecurring = updatedRecurring.map(rt => {
      if (rt.status !== 'active') return rt;

      // Kiểm tra endDate – nếu đã qua endDate thì mark completed
      if (rt.endDate && today > rt.endDate) {
        return { ...rt, status: 'completed' as const };
      }

      // Kiểm tra totalOccurrences – nếu đã đủ số lần thì mark completed
      if (rt.totalOccurrences && rt.executedCount >= rt.totalOccurrences) {
        return { ...rt, status: 'completed' as const };
      }

      // Xác định ngày bắt đầu kiểm tra
      const checkFrom = rt.lastExecutedDate
        ? getNextExecutionDate(rt.lastExecutedDate, rt.frequency)
        : rt.startDate;

      // Chưa tới ngày startDate
      if (checkFrom > today) return rt;

      // Tạo tất cả transactions từ checkFrom đến today
      let currentDate = checkFrom;
      let updatedRt = { ...rt };

      while (currentDate <= today) {
        // Kiểm tra endDate và totalOccurrences trước khi tạo
        if (updatedRt.endDate && currentDate > updatedRt.endDate) break;
        if (updatedRt.totalOccurrences && updatedRt.executedCount >= updatedRt.totalOccurrences) {
          updatedRt = { ...updatedRt, status: 'completed' as const };
          break;
        }

        const wallet = wallets.find(w => w.id === rt.walletId);
        if (!wallet) break;

        const cat = categories.find(c => c.id === rt.categoryId);
        let categoryName = '';
        if (cat) {
          categoryName = cat.name;
        } else if (rt.categoryId === 'transfer') {
          categoryName = 'Chuyển khoản';
        } else if (rt.categoryId === 'savings') {
          categoryName = 'Tiết kiệm';
        }

        newTransactions.push({
          id: `tx-rc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          amount: rt.amount,
          type: rt.type,
          categoryId: rt.categoryId,
          categoryName,
          walletId: rt.walletId,
          date: currentDate,
          note: rt.note,
          recurringId: rt.id
        });

        updatedRt = {
          ...updatedRt,
          lastExecutedDate: currentDate,
          executedCount: updatedRt.executedCount + 1
        };
        executedCount++;

        // Kiểm tra lại sau khi tăng executedCount
        if (updatedRt.totalOccurrences && updatedRt.executedCount >= updatedRt.totalOccurrences) {
          updatedRt = { ...updatedRt, status: 'completed' as const };
          break;
        }

        currentDate = getNextExecutionDate(currentDate, rt.frequency);
      }

      return updatedRt;
    });

    if (newTransactions.length > 0) {
      // Update transactions
      setTransactions(prev => [...newTransactions, ...prev]);

      // Update wallet balances
      setWallets(prev => {
        let updated = [...prev];
        newTransactions.forEach(tx => {
          updated = updated.map(w => {
            if (w.id !== tx.walletId) return w;
            return {
              ...w,
              balance: tx.type === 'income' ? w.balance + tx.amount : w.balance - tx.amount
            };
          });
        });
        return updated;
      });

      // Update recurring
      setRecurringTransactions(updatedRecurring);

      setTimeout(() => {
        showToast(`Đã tự động ghi ${executedCount} giao dịch định kỳ!`, 'info');
      }, 1200);
    } else {
      // Vẫn cần update nếu có recurring được mark completed
      const hasChanges = updatedRecurring.some((rt, i) => rt.status !== recurringTransactions[i]?.status);
      if (hasChanges) setRecurringTransactions(updatedRecurring);
    }
  }, [loading]);

  // ─── Debt Notification on app open ───────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const lastShown = localStorage.getItem('ms_debt_notif_last_shown');
    if (lastShown === todayStr) return; // Mỗi ngày chỉ hiện 1 lần

    const activeDebts = debts.filter(d => d.status === 'active');
    if (activeDebts.length === 0) return;

    const urgentDebts: { debt: Debt; daysUntilPayment: number; nextPaymentDate: string }[] = [];
    const collectableDebts: { debt: Debt; dueDate: string }[] = [];

    activeDebts.forEach(debt => {
      const startDate = new Date(debt.startDate);

      if (debt.type === 'to_pay') {
        // Tính ngày thanh toán tiếp theo dựa trên startDate + số tháng đã qua
        const monthsElapsed = (today.getFullYear() - startDate.getFullYear()) * 12
          + (today.getMonth() - startDate.getMonth());

        // Ngày thanh toán tháng này hoặc tháng sau
        const nextPaymentDate = new Date(startDate);
        nextPaymentDate.setMonth(startDate.getMonth() + Math.max(monthsElapsed, 0) + 1);

        // Nếu ngày thanh toán đã qua trong tháng này, check tháng sau
        const thisMonthPayment = new Date(startDate);
        thisMonthPayment.setMonth(startDate.getMonth() + monthsElapsed + 1);
        if (thisMonthPayment <= today) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }

        // Kiểm tra nếu chưa vượt quá tổng kỳ hạn
        const totalEndDate = new Date(startDate);
        totalEndDate.setMonth(startDate.getMonth() + debt.termMonths);
        if (thisMonthPayment > totalEndDate) return;

        const daysUntil = Math.ceil((thisMonthPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 10) {
          urgentDebts.push({
            debt,
            daysUntilPayment: daysUntil,
            nextPaymentDate: thisMonthPayment.toISOString().split('T')[0]
          });
        }
      } else {
        // to_collect: ngày đáo hạn = startDate + termMonths
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + debt.termMonths);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        // Thông báo khi đã đến hoặc quá hạn thu hồi
        if (dueDateStr <= todayStr) {
          collectableDebts.push({ debt, dueDate: dueDateStr });
        }
      }
    });

    if (urgentDebts.length > 0 || collectableDebts.length > 0) {
      setTimeout(() => {
        setDebtNotifState({ isOpen: true, urgentDebts, collectableDebts });
      }, 1500);
      localStorage.setItem('ms_debt_notif_last_shown', todayStr);
    }
  }, [loading, debts]);

  // ─── Auto-compact old months ──────────────────────────────────────────────
  useEffect(() => {
    const currentMonthId = new Date().toISOString().substring(0, 7);
    const olderMonths = Array.from(new Set(
      transactions
        .map(t => t.date.substring(0, 7))
        .filter(m => m < currentMonthId && m.match(/^\d{4}-\d{2}$/))
    ));

    if (olderMonths.length > 0) {
      olderMonths.forEach(m => compactMonthData(m));
      setTimeout(() => {
        showToast(`Đã tự động lưu báo cáo và tối ưu bộ nhớ cho các tháng cũ: ${olderMonths.join(', ')}!`, 'info');
      }, 1000);
    }
  }, []);

  // ─── Toast ────────────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const confirm = (title: string, message: string): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({ isOpen: true, title, message, resolve });
    });
  };

  const handleConfirmResolve = (val: boolean) => {
    if (confirmState.resolve) confirmState.resolve(val);
    setConfirmState({ isOpen: false, title: '', message: '', resolve: null });
  };

  // ─── Transactions ─────────────────────────────────────────────────────────
  const addTransaction = (
    amount: number, type: TransactionType, categoryId: string,
    walletId: string, note: string, date: string
  ) => {
    // Validate
    if (!amount || amount <= 0) { showToast('Số tiền phải lớn hơn 0.', 'error'); return; }
    if (!categoryId) { showToast('Vui lòng chọn danh mục.', 'error'); return; }
    const walletExists = wallets.some(w => w.id === walletId);
    if (!walletExists) { showToast('Ví không tồn tại.', 'error'); return; }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { showToast('Ngày không hợp lệ.', 'error'); return; }

    const cat = categories.find(c => c.id === categoryId);
    let categoryName = '';
    if (cat) {
      categoryName = cat.name;
    } else if (categoryId === 'transfer') {
      categoryName = 'Chuyển khoản';
    } else if (categoryId === 'savings') {
      categoryName = 'Tiết kiệm';
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      amount,
      type,
      categoryId,
      categoryName,
      walletId,
      date,
      note: note.trim() || (type === 'income' ? 'Thu nhập khác' : 'Chi tiêu khác'),
      updatedAt: Date.now(),
      pendingSync: true
    };

    setTransactions(prev => [newTx, ...prev]);
    setWallets(prev => prev.map(w => {
      if (w.id !== walletId) return w;
      return { ...w, balance: type === 'income' ? w.balance + amount : w.balance - amount, updatedAt: Date.now(), pendingSync: true };
    }));
  };

  const updateTransaction = (
    id: string, amount: number, type: TransactionType,
    categoryId: string, walletId: string, note: string, date: string
  ) => {
    const oldTx = transactions.find(t => t.id === id);
    if (!oldTx) { showToast('Giao dịch không tồn tại.', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Số tiền phải lớn hơn 0.', 'error'); return; }
    if (!categoryId) { showToast('Vui lòng chọn danh mục.', 'error'); return; }
    const walletExists = wallets.some(w => w.id === walletId);
    if (!walletExists) { showToast('Ví không tồn tại.', 'error'); return; }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { showToast('Ngày không hợp lệ.', 'error'); return; }

    const cat = categories.find(c => c.id === categoryId);
    let categoryName = '';
    if (cat) {
      categoryName = cat.name;
    } else if (categoryId === 'transfer') {
      categoryName = 'Chuyển khoản';
    } else if (categoryId === 'savings') {
      categoryName = 'Tiết kiệm';
    }

    // Revert old wallet balance
    let updatedWallets = wallets.map(w => {
      if (w.id !== oldTx.walletId) return w;
      return { ...w, balance: oldTx.type === 'income' ? w.balance - oldTx.amount : w.balance + oldTx.amount, updatedAt: Date.now(), pendingSync: true };
    });

    // Apply new wallet balance
    updatedWallets = updatedWallets.map(w => {
      if (w.id !== walletId) return w;
      const currentBalance = w.balance;
      return { ...w, balance: type === 'income' ? currentBalance + amount : currentBalance - amount, updatedAt: Date.now(), pendingSync: true };
    });

    setWallets(updatedWallets);
    setTransactions(prev => prev.map(t => t.id === id ? {
      ...t, id, amount, type, categoryId, categoryName, walletId, date,
      note: note.trim() || (type === 'income' ? 'Thu nhập khác' : 'Chi tiêu khác'),
      updatedAt: Date.now(),
      pendingSync: true
    } : t));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) { showToast('Giao dịch không tồn tại.', 'error'); return; }

    setTransactions(prev => prev.filter(t => t.id !== id));
    setDeletedRecords(prev => [...prev, { id, table: 'transactions', updatedAt: Date.now() }]);
    setWallets(prev => prev.map(w => {
      if (w.id !== tx.walletId) return w;
      return { ...w, balance: tx.type === 'income' ? w.balance - tx.amount : w.balance + tx.amount, updatedAt: Date.now(), pendingSync: true };
    }));
  };

  // ─── Wallets ──────────────────────────────────────────────────────────────
  const addWallet = (name: string, type: 'cash' | 'online', balance: number, icon: string) => {
    if (!name.trim()) { showToast('Tên ví không được để trống.', 'error'); return; }
    if (balance < 0) { showToast('Số dư ban đầu không được âm.', 'error'); return; }
    if (!icon) { showToast('Vui lòng chọn icon cho ví.', 'error'); return; }

    if (type === 'cash') {
      const existingCash = wallets.find(w => w.type === 'cash');
      if (existingCash) {
        setWallets(prev => prev.map(w => w.type === 'cash' ? { ...w, name, balance: w.balance + balance, updatedAt: Date.now(), pendingSync: true } : w));
        return;
      }
    }

    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      name: name.trim(),
      type,
      balance,
      icon,
      updatedAt: Date.now(),
      pendingSync: true
    };
    setWallets(prev => [...prev, newWallet]);
  };

  const updateWalletBalance = (id: string, amount: number) => {
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) { showToast('Ví không tồn tại.', 'error'); return; }
    if (amount < 0) { showToast('Số dư không được âm.', 'error'); return; }
    setWallets(prev => prev.map(w => w.id === id ? { ...w, balance: amount, updatedAt: Date.now(), pendingSync: true } : w));
  };

  const transferFunds = (fromId: string, toId: string, amount: number): boolean => {
    if (fromId === toId) { showToast('Không thể chuyển tiền trong cùng một ví.', 'error'); return false; }
    if (!amount || amount <= 0) { showToast('Số tiền chuyển phải lớn hơn 0.', 'error'); return false; }
    const fromW = wallets.find(w => w.id === fromId);
    const toW = wallets.find(w => w.id === toId);
    if (!fromW || !toW) { showToast('Ví không tồn tại.', 'error'); return false; }
    if (fromW.balance < amount) { showToast('Số dư ví không đủ để chuyển.', 'error'); return false; }

    setWallets(prev => prev.map(w => {
      if (w.id === fromId) return { ...w, balance: w.balance - amount, updatedAt: Date.now(), pendingSync: true };
      if (w.id === toId) return { ...w, balance: w.balance + amount, updatedAt: Date.now(), pendingSync: true };
      return w;
    }));

    const newTxFrom: Transaction = {
      id: `tx-tf-${Date.now()}-1`,
      amount,
      type: 'expense',
      categoryId: 'transfer',
      categoryName: 'Chuyển khoản',
      walletId: fromId,
      date: new Date().toISOString().split('T')[0],
      note: `Chuyển tiền đến ${toW.name}`,
      updatedAt: Date.now(),
      pendingSync: true
    };

    const newTxTo: Transaction = {
      id: `tx-tf-${Date.now()}-2`,
      amount,
      type: 'income',
      categoryId: 'transfer',
      categoryName: 'Chuyển khoản',
      walletId: toId,
      date: new Date().toISOString().split('T')[0],
      note: `Nhận tiền từ ${fromW.name}`,
      updatedAt: Date.now(),
      pendingSync: true
    };

    setTransactions(prev => [newTxFrom, newTxTo, ...prev]);
    return true;
  };

  const deleteWallet = (id: string) => {
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) { showToast('Ví không tồn tại.', 'error'); return; }
    if (wallet.type === 'cash') { showToast('Không thể xóa ví tiền mặt.', 'error'); return; }
    
    setWallets(prev => prev.filter(w => w.id !== id));
    setDeletedRecords(prev => [...prev, { id, table: 'wallets', updatedAt: Date.now() }]);

    const txsInWallet = transactions.filter(t => t.walletId === id);
    setTransactions(prev => prev.filter(t => t.walletId !== id));
    setDeletedRecords(prev => [
      ...prev,
      ...txsInWallet.map(t => ({ id: t.id, table: 'transactions', updatedAt: Date.now() }))
    ]);
  };

  // ─── Categories ───────────────────────────────────────────────────────────
  const addCategory = (name: string, color: string, icon: string, budget: number, type: TransactionType) => {
    if (!name.trim()) { showToast('Tên danh mục không được để trống.', 'error'); return; }
    if (budget < 0) { showToast('Ngân sách không được âm.', 'error'); return; }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      color,
      icon,
      budget,
      type,
      updatedAt: Date.now(),
      pendingSync: true
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, name: string, color: string, icon: string, budget: number, type: TransactionType) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) { showToast('Danh mục không tồn tại.', 'error'); return; }
    if (!name.trim()) { showToast('Tên danh mục không được để trống.', 'error'); return; }
    if (budget < 0) { showToast('Ngân sách không được âm.', 'error'); return; }

    setCategories(prev => prev.map(c => c.id === id ? {
      ...c,
      name: name.trim(),
      color,
      icon,
      budget,
      type,
      updatedAt: Date.now(),
      pendingSync: true
    } : c));
  };

  const updateCategoryBudget = (id: string, budget: number) => {
    if (budget < 0) { showToast('Ngân sách không được âm.', 'error'); return; }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, budget, updatedAt: Date.now(), pendingSync: true } : c));
  };

  const updateCategoryColor = (id: string, color: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, color, updatedAt: Date.now(), pendingSync: true } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeletedRecords(prev => [
      ...prev,
      { id, table: 'categories', updatedAt: Date.now() }
    ]);

    // Gỡ liên kết của những debts trỏ tới category bị xóa
    setDebts(prev => prev.map(d => d.linkedCategoryId === id
      ? { ...d, linkedCategoryId: undefined, updatedAt: Date.now(), pendingSync: true }
      : d
    ));

    showToast('Đã xóa danh mục thành công!', 'success');
  };

  // ─── Debts ────────────────────────────────────────────────────────────────
  const addDebt = (
    name: string, amount: number, interestRate: number, termMonths: number,
    startDate: string, type: DebtType, repaymentMethod: RepaymentMethod, notes?: string,
    linkedCategoryId?: string
  ) => {
    if (!name.trim()) { showToast('Tên khoản nợ không được để trống.', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Số tiền phải lớn hơn 0.', 'error'); return; }
    if (interestRate < 0) { showToast('Lãi suất không được âm.', 'error'); return; }
    if (!termMonths || termMonths <= 0) { showToast('Kỳ hạn phải lớn hơn 0 tháng.', 'error'); return; }
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) { showToast('Ngày bắt đầu không hợp lệ.', 'error'); return; }

    const newDebt: Debt = {
      id: `debt-${Date.now()}`,
      name: name.trim(),
      amount,
      interestRate,
      termMonths,
      startDate,
      type,
      status: 'active',
      repaymentMethod,
      notes: notes?.trim(),
      linkedCategoryId: linkedCategoryId || undefined,
      updatedAt: Date.now(),
      pendingSync: true
    };
    setDebts(prev => [newDebt, ...prev]);
  };

  const updateDebt = (
    id: string, name: string, amount: number, interestRate: number, termMonths: number,
    startDate: string, type: DebtType, repaymentMethod: RepaymentMethod, notes?: string,
    linkedCategoryId?: string
  ) => {
    if (!name.trim()) { showToast('Tên khoản nợ không được để trống.', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Số tiền phải lớn hơn 0.', 'error'); return; }
    if (interestRate < 0) { showToast('Lãi suất không được âm.', 'error'); return; }
    if (!termMonths || termMonths <= 0) { showToast('Kỳ hạn phải lớn hơn 0 tháng.', 'error'); return; }
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) { showToast('Ngày bắt đầu không hợp lệ.', 'error'); return; }

    setDebts(prev => prev.map(d => d.id === id ? {
      ...d,
      name: name.trim(),
      amount,
      interestRate,
      termMonths,
      startDate,
      type,
      repaymentMethod,
      notes: notes?.trim(),
      linkedCategoryId: linkedCategoryId || undefined,
      updatedAt: Date.now(),
      pendingSync: true
    } : d));
  };

  const toggleDebtStatus = (id: string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) { showToast('Khoản nợ không tồn tại.', 'error'); return; }
    const newStatus = debt.status === 'active' ? 'paid' : 'active';
    
    setDebts(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, updatedAt: Date.now(), pendingSync: true } : d));

    if (newStatus === 'paid' && debt.linkedCategoryId) {
      deleteCategory(debt.linkedCategoryId);
    }
  };

  const deleteDebt = (id: string) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) { showToast('Khoản nợ không tồn tại.', 'error'); return; }
    setDebts(prev => prev.filter(d => d.id !== id));
    setDeletedRecords(prev => [...prev, { id, table: 'debts', updatedAt: Date.now() }]);
  };

  // ─── Recurring Transactions ───────────────────────────────────────────────
  const addRecurringTransaction = (
    amount: number, type: TransactionType, categoryId: string,
    walletId: string, note: string, frequency: RecurringFrequency,
    startDate: string, endDate?: string, totalOccurrences?: number
  ) => {
    if (!amount || amount <= 0) { showToast('Số tiền phải lớn hơn 0.', 'error'); return; }
    if (!categoryId) { showToast('Vui lòng chọn danh mục.', 'error'); return; }
    const walletExists = wallets.some(w => w.id === walletId);
    if (!walletExists) { showToast('Ví không tồn tại.', 'error'); return; }
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) { showToast('Ngày bắt đầu không hợp lệ.', 'error'); return; }
    if (endDate && endDate <= startDate) { showToast('Ngày kết thúc phải sau ngày bắt đầu.', 'error'); return; }
    if (totalOccurrences !== undefined && totalOccurrences <= 0) { showToast('Số lần lặp phải lớn hơn 0.', 'error'); return; }
    if (!note.trim()) { showToast('Vui lòng nhập ghi chú cho giao dịch định kỳ.', 'error'); return; }

    const newRt: RecurringTransaction = {
      id: `rc-${Date.now()}`,
      amount,
      type,
      categoryId,
      walletId,
      note: note.trim(),
      frequency,
      startDate,
      endDate,
      totalOccurrences,
      executedCount: 0,
      status: 'active',
      lastExecutedDate: undefined,
      updatedAt: Date.now(),
      pendingSync: true
    };
    setRecurringTransactions(prev => [newRt, ...prev]);
    showToast('Đã tạo giao dịch định kỳ mới!', 'success');
  };

  const updateRecurringTransaction = (id: string, updates: Partial<RecurringTransaction>) => {
    const rt = recurringTransactions.find(r => r.id === id);
    if (!rt) { showToast('Giao dịch định kỳ không tồn tại.', 'error'); return; }
    if (updates.amount !== undefined && updates.amount <= 0) { showToast('Số tiền phải lớn hơn 0.', 'error'); return; }
    if (updates.endDate && updates.startDate && updates.endDate <= (updates.startDate || rt.startDate)) {
      showToast('Ngày kết thúc phải sau ngày bắt đầu.', 'error'); return;
    }
    setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: Date.now(), pendingSync: true } : r));
  };

  const deleteRecurringTransaction = (id: string) => {
    const rt = recurringTransactions.find(r => r.id === id);
    if (!rt) { showToast('Giao dịch định kỳ không tồn tại.', 'error'); return; }
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    setDeletedRecords(prev => [...prev, { id, table: 'recurring', updatedAt: Date.now() }]);
  };

  const pauseRecurringTransaction = (id: string) => {
    const rt = recurringTransactions.find(r => r.id === id);
    if (!rt) { showToast('Giao dịch định kỳ không tồn tại.', 'error'); return; }
    if (rt.status !== 'active') { showToast('Chỉ có thể tạm dừng giao dịch đang hoạt động.', 'error'); return; }
    setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, status: 'paused', updatedAt: Date.now(), pendingSync: true } : r));
    showToast('Đã tạm dừng giao dịch định kỳ.', 'info');
  };

  const resumeRecurringTransaction = (id: string) => {
    const rt = recurringTransactions.find(r => r.id === id);
    if (!rt) { showToast('Giao dịch định kỳ không tồn tại.', 'error'); return; }
    if (rt.status !== 'paused') { showToast('Chỉ có thể tiếp tục giao dịch đang tạm dừng.', 'error'); return; }
    setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, status: 'active', updatedAt: Date.now(), pendingSync: true } : r));
    showToast('Đã tiếp tục giao dịch định kỳ.', 'success');
  };

  // ─── Savings Goals ────────────────────────────────────────────────────────
  const addSavingsGoal = (
    name: string, icon: string, color: string,
    targetAmount: number, deadline?: string, notes?: string
  ) => {
    if (!name.trim()) { showToast('Tên mục tiêu không được để trống.', 'error'); return; }
    if (!targetAmount || targetAmount <= 0) { showToast('Số tiền mục tiêu phải lớn hơn 0.', 'error'); return; }
    if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) { showToast('Hạn chót không hợp lệ.', 'error'); return; }

    const newGoal: SavingsGoal = {
      id: `sg-${Date.now()}`,
      name: name.trim(),
      icon,
      color,
      targetAmount,
      currentAmount: 0,
      deadline,
      notes: notes?.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: Date.now(),
      pendingSync: true
    };
    setSavingsGoals(prev => [newGoal, ...prev]);
    showToast('Đã tạo heo đất tiết kiệm mới!', 'success');
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    const goal = savingsGoals.find(g => g.id === id);
    if (!goal) { showToast('Mục tiêu tiết kiệm không tồn tại.', 'error'); return; }
    if (updates.targetAmount !== undefined && updates.targetAmount <= 0) {
      showToast('Số tiền mục tiêu phải lớn hơn 0.', 'error'); return;
    }
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: Date.now(), pendingSync: true } : g));
  };

  const deleteSavingsGoal = (id: string) => {
    const goal = savingsGoals.find(g => g.id === id);
    if (!goal) { showToast('Mục tiêu tiết kiệm không tồn tại.', 'error'); return; }
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
    setDeletedRecords(prev => [...prev, { id, table: 'savings_goals', updatedAt: Date.now() }]);
  };

  const depositToSavingsGoal = (goalId: string, walletId: string, amount: number) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    const wallet = wallets.find(w => w.id === walletId);
    if (!goal) { showToast('Mục tiêu tiết kiệm không tồn tại.', 'error'); return; }
    if (!wallet) { showToast('Ví không tồn tại.', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Số tiền phải lớn hơn 0.', 'error'); return; }
    if (wallet.balance < amount) { showToast('Số dư ví không đủ.', 'error'); return; }
    const remaining = goal.targetAmount - goal.currentAmount;
    if (amount > remaining) { showToast(`Bạn chỉ cần nạp thêm ${new Intl.NumberFormat('vi-VN').format(remaining)}đ để hoàn thành mục tiêu.`, 'info'); return; }

    // Trừ ví
    setWallets(prev => prev.map(w => w.id === walletId ? { ...w, balance: w.balance - amount, updatedAt: Date.now(), pendingSync: true } : w));
    // Cộng vào goal
    setSavingsGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newAmount = g.currentAmount + amount;
      return { ...g, currentAmount: newAmount, updatedAt: Date.now(), pendingSync: true };
    }));

    // Ghi transaction
    setTransactions(prev => [{
      id: `tx-sg-${Date.now()}`,
      amount,
      type: 'expense',
      categoryId: 'savings',
      categoryName: 'Tiết kiệm',
      walletId,
      date: new Date().toISOString().split('T')[0],
      note: `Tiết kiệm: ${goal.name}`,
      updatedAt: Date.now(),
      pendingSync: true
    }, ...prev]);

    const newTotal = goal.currentAmount + amount;
    if (newTotal >= goal.targetAmount) {
      showToast(`🎉 Chúc mừng! Bạn đã hoàn thành mục tiêu "${goal.name}"!`, 'success');
    } else {
      showToast(`Đã nạp ${new Intl.NumberFormat('vi-VN').format(amount)}đ vào "${goal.name}"!`, 'success');
    }
  };

  const withdrawFromSavingsGoal = (goalId: string, walletId: string, amount: number) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    const wallet = wallets.find(w => w.id === walletId);
    if (!goal) { showToast('Mục tiêu tiết kiệm không tồn tại.', 'error'); return; }
    if (!wallet) { showToast('Ví không tồn tại.', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Số tiền phải lớn hơn 0.', 'error'); return; }
    if (amount > goal.currentAmount) { showToast('Số tiền rút vượt quá số dư trong heo đất.', 'error'); return; }

    setWallets(prev => prev.map(w => w.id === walletId ? { ...w, balance: w.balance + amount, updatedAt: Date.now(), pendingSync: true } : w));
    setSavingsGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount - amount, updatedAt: Date.now(), pendingSync: true } : g));

    setTransactions(prev => [{
      id: `tx-sw-${Date.now()}`,
      amount,
      type: 'income',
      categoryId: 'savings',
      categoryName: 'Tiết kiệm',
      walletId,
      date: new Date().toISOString().split('T')[0],
      note: `Rút từ heo đất: ${goal.name}`,
      updatedAt: Date.now(),
      pendingSync: true
    }, ...prev]);

    showToast(`Đã rút ${new Intl.NumberFormat('vi-VN').format(amount)}đ từ "${goal.name}" về ví!`, 'info');
  };

  // ─── Theme & Profile ──────────────────────────────────────────────────────
  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    localStorage.setItem('ms_theme_updated_at', Date.now().toString());
  };

  const updateProfile = (name: string, avatarUrl: string, email?: string, gender?: 'male' | 'female') => {
    if (!name.trim()) { showToast('Tên không được để trống.', 'error'); return; }
    setUser(prev => ({
      ...prev,
      name: name.trim(),
      avatarUrl,
      email,
      gender: gender !== undefined ? gender : prev.gender,
      updatedAt: Date.now()
    }) as any);
  };

  // ─── Generate Email HTML ──────────────────────────────────────────────────
  const generateEmailHTML = (summary: MonthlySummary): string => {
    const formatVND = (amount: number) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const monthStr = summary.monthId.split('-')[1];
    const yearStr = summary.monthId.split('-')[0];

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
          <div style="background-color: #6f8d6d; padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; opacity: 0.8;">Báo cáo tài chính tháng ${monthStr}/${yearStr}</div>
            <h1 style="font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Money Saver</h1>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 15px; color: #27272a; margin-top: 0; margin-bottom: 20px; line-height: 1.5;">
              Xin chào <strong>${user.name}</strong>, dưới đây là báo cáo tổng kết tháng ${monthStr}/${yearStr}.
            </p>
            <div style="background-color: #f1f6f0; border: 1px solid #d8e5d3; border-radius: 18px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #6f8d6d; margin-bottom: 16px;">
                ${formatVND(summary.totalIncome - summary.totalExpense)}
              </div>
              <div style="display: flex; justify-content: space-around; border-top: 1px dashed #cddcc9; padding-top: 12px;">
                <div>
                  <span style="font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block;">Thu nhập</span>
                  <span style="font-size: 14px; font-weight: bold; color: #10b981;">${formatVND(summary.totalIncome)}</span>
                </div>
                <div>
                  <span style="font-size: 10px; color: #71717a; text-transform: uppercase; font-weight: bold; display: block;">Chi tiêu</span>
                  <span style="font-size: 14px; font-weight: bold; color: #ef4444;">${formatVND(summary.totalExpense)}</span>
                </div>
              </div>
            </div>
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 18px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 12px; color: #78350f; margin: 0; line-height: 1.6; font-style: italic;">
                "${summary.aiComment}"
              </p>
            </div>
            <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 24px;">
              <thead>
                <tr style="border-bottom: 2px solid #e4e4e7;">
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #71717a;">Danh mục</th>
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #71717a;">Ngân sách</th>
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #71717a;">Thực tế</th>
                  <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #71717a;">Trạng thái</th>
                </tr>
              </thead>
              <tbody>${categoriesRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  // ─── Compact Month Data ───────────────────────────────────────────────────
  const compactMonthData = (monthId: string): MonthlySummary | null => {
    const monthTxs = transactions.filter(t => t.date.startsWith(monthId));
    if (monthTxs.length === 0) return null;

    const totalIncome = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const categoriesMap: { [catId: string]: { name: string; budget: number; spent: number } } = {};

    // Group transactions by categoryId bottom-up
    monthTxs.forEach(t => {
      if (t.type !== 'expense') return;
      const catId = t.categoryId;
      const liveCat = categories.find(c => c.id === catId);
      const name = liveCat ? liveCat.name : (t.categoryName || 'Danh mục đã xóa');
      const budget = liveCat ? liveCat.budget : 0;

      if (!categoriesMap[catId]) {
        categoriesMap[catId] = { name, budget, spent: 0 };
      }
      categoriesMap[catId].spent += t.amount;
    });

    // Also include any categories that had a budget set, even if they had 0 spending in this month
    categories.forEach(cat => {
      if (cat.type === 'expense' && cat.budget > 0 && !categoriesMap[cat.id]) {
        categoriesMap[cat.id] = { name: cat.name, budget: cat.budget, spent: 0 };
      }
    });

    let overBudgetCats: string[] = [];
    let safeCats: string[] = [];
    Object.values(categoriesMap).forEach(cat => {
      if (cat.budget > 0) {
        if (cat.spent > cat.budget) overBudgetCats.push(cat.name);
        else safeCats.push(cat.name);
      }
    });

    let aiComment = totalExpense > totalIncome
      ? `Tháng này bạn đang chi tiêu vượt thu nhập (${new Intl.NumberFormat('vi-VN').format(totalExpense - totalIncome)} đ). `
      : `Tuyệt vời! Bạn đã tích lũy được ${new Intl.NumberFormat('vi-VN').format(totalIncome - totalExpense)} đ trong tháng này. `;

    if (overBudgetCats.length > 0) {
      aiComment += `Bạn đã chi vượt hạn mức ở: ${overBudgetCats.join(', ')}. Hãy thắt chặt vào tháng sau!`;
    } else if (safeCats.length > 0) {
      aiComment += `Kiểm soát ngân sách tốt ở: ${safeCats.join(', ')}. Tiếp tục duy trì!`;
    } else {
      aiComment += `Hãy đặt hạn mức chi tiêu hàng tháng để kiểm soát dòng tiền tốt hơn!`;
    }

    const newSummary: MonthlySummary = { monthId, totalIncome, totalExpense, categories: categoriesMap, aiComment, updatedAt: Date.now(), pendingSync: true };

    setMonthlySummaries(prev => {
      const filtered = prev.filter(s => s.monthId !== monthId);
      return [...filtered, newSummary].sort((a, b) => b.monthId.localeCompare(a.monthId));
    });

    setTransactions(prev => {
      const remaining = prev.filter(t => !t.date.startsWith(monthId));
      const deletedTxs = prev.filter(t => t.date.startsWith(monthId));
      setDeletedRecords(d => [
        ...d,
        ...deletedTxs.map(t => ({ id: t.id, table: 'transactions', updatedAt: Date.now() }))
      ]);
      return remaining;
    });
    return newSummary;
  };

  // ─── Send Email Report ────────────────────────────────────────────────────
  const sendEmailJSReport = async (summary: MonthlySummary): Promise<boolean> => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || localStorage.getItem('ms_emailjs_service_id') || '';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || localStorage.getItem('ms_emailjs_template_id') || '';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || localStorage.getItem('ms_emailjs_public_key') || '';
    const toEmail = user.email || '';

    if (!serviceId || !templateId || !publicKey || !toEmail) return false;

    const htmlReport = generateEmailHTML(summary);

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // ─── Reset Data ───────────────────────────────────────────────────────────
  const resetData = () => {
    localStorage.clear();
    db.clear();
    setTransactions(defaultTransactions);
    setCategories(defaultCategories);
    setWallets(defaultWallets);
    setDebts(defaultDebts);
    setRecurringTransactions(defaultRecurring);
    setSavingsGoals(defaultSavingsGoals);
    setUser(defaultUser);
    setThemeState('light');
    setMonthlySummaries([]);
    setYearlySummaries([]);
  };

  // ─── Loading Screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#f7faf6] dark:bg-zinc-950 flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4 text-center p-6 animate-scale-up">
          <div className="w-20 h-20 bg-[#6f8d6d]/10 text-[#6f8d6d] dark:bg-[#6f8d6d]/20 dark:text-[#8fae8d] rounded-[2rem] flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8fae8d]/20 to-transparent"></div>
            <WalletIcon size={36} strokeWidth={1.5} className="animate-pulse" />
          </div>
          <div className="space-y-1.5 mt-2">
            <h1 className="text-xl font-extrabold font-vietnam tracking-tight text-zinc-800 dark:text-zinc-100">
              Money Saver
            </h1>
            <p className="text-xs font-semibold font-vietnam text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 size={12} className="animate-spin text-[#6f8d6d] dark:text-[#8fae8d]" />
              Đang bảo mật và nạp dữ liệu...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      transactions, categories, wallets, debts, recurringTransactions, savingsGoals,
      user, theme, toasts, monthlySummaries, yearlySummaries,
      compactMonthData, sendEmailJSReport, generateEmailHTML,
      showToast, confirm,
      session, authLoading, isSyncing, lastSyncedAt, login, loginWithGoogle, register, logout, syncData,
      addTransaction, updateTransaction, deleteTransaction,
      addWallet, updateWalletBalance, transferFunds, deleteWallet,
      addCategory, updateCategory, updateCategoryBudget, updateCategoryColor, deleteCategory,
      addDebt, updateDebt, toggleDebtStatus, deleteDebt,
      addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction,
      pauseRecurringTransaction, resumeRecurringTransaction,
      addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, depositToSavingsGoal, withdrawFromSavingsGoal,
      setTheme, updateProfile, resetData
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <ConfirmModal state={confirmState} onResolve={handleConfirmResolve} />
      <DebtNotificationModal
        state={debtNotifState}
        onClose={() => setDebtNotifState(prev => ({ ...prev, isOpen: false }))}
      />
    </AppContext.Provider>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────
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
          bgClass = 'bg-white/95 dark:bg-zinc-900/95';
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

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal: React.FC<{
  state: { isOpen: boolean; title: string; message: string };
  onResolve: (val: boolean) => void;
}> = ({ state, onResolve }) => {
  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => onResolve(false)} />
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)] space-y-4 z-10 text-center animate-scale-up">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100">{state.title}</h3>
          <p className="text-xs font-vietnam text-zinc-500 dark:text-zinc-400 leading-relaxed">{state.message}</p>
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

// ─── Debt Notification Modal ──────────────────────────────────────────────────
const DebtNotificationModal: React.FC<{
  state: {
    isOpen: boolean;
    urgentDebts: { debt: import('../types').Debt; daysUntilPayment: number; nextPaymentDate: string }[];
    collectableDebts: { debt: import('../types').Debt; dueDate: string }[];
  };
  onClose: () => void;
}> = ({ state, onClose }) => {
  if (!state.isOpen) return null;
  const formatVND = (a: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(a);
  const formatDate = (s: string) => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden animate-slide-up z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/15 to-rose-500/10 dark:from-amber-500/10 dark:to-rose-500/5 px-5 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-lg">
                🔔
              </div>
              <div>
                <h3 className="text-sm font-bold font-vietnam text-zinc-800 dark:text-zinc-100">Nhắc nhở tài chính</h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-vietnam">Cập nhật hôm nay</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Urgent Debts (to_pay) */}
          {state.urgentDebts.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <h4 className="text-[11px] font-bold font-vietnam text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Khoản nợ sắp đến hạn ({state.urgentDebts.length})
                </h4>
              </div>
              {state.urgentDebts.map(({ debt, daysUntilPayment, nextPaymentDate }) => (
                <div key={debt.id} className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200 leading-snug">{debt.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-vietnam shrink-0 ${
                      daysUntilPayment === 0
                        ? 'bg-rose-500 text-white'
                        : daysUntilPayment <= 3
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                    }`}>
                      {daysUntilPayment === 0 ? 'Hôm nay!' : `Còn ${daysUntilPayment} ngày`}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-vietnam">
                    Ngày thanh toán: <strong className="text-zinc-700 dark:text-zinc-300">{formatDate(nextPaymentDate)}</strong>
                  </p>
                  {debt.notes && (
                    <p className="text-[10px] text-zinc-400 italic font-vietnam">{debt.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Collectable Debts (to_collect) */}
          {state.collectableDebts.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">💰</span>
                <h4 className="text-[11px] font-bold font-vietnam text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Cần thu hồi khoản vay ({state.collectableDebts.length})
                </h4>
              </div>
              {state.collectableDebts.map(({ debt, dueDate }) => (
                <div key={debt.id} className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold font-vietnam text-zinc-800 dark:text-zinc-200">{debt.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold font-vietnam bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shrink-0">
                      Đến hạn thu hồi
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-vietnam">
                    Số tiền gốc: <strong className="text-emerald-600 dark:text-emerald-400">{formatVND(debt.amount)}</strong>
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-vietnam">
                    Đáo hạn: <strong className="text-zinc-700 dark:text-zinc-300">{formatDate(dueDate)}</strong>
                  </p>
                  {debt.notes && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-vietnam font-semibold">
                      💬 Hãy liên hệ: {debt.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#6f8d6d] hover:bg-[#5b755a] text-white text-xs font-bold font-vietnam rounded-2xl transition-all shadow-sm cursor-pointer"
          >
            Đã xem, đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
