export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  walletId: string;
  date: string;
  note: string;
  recurringId?: string; // link về recurring transaction gốc
}

export interface Category {
  id: string;
  name: string;
  icon: string; // name of Lucide icon
  color: string; // Hex color code
  budget: number; // monthly limit (0 means no limit)
  type: TransactionType; // 'income' or 'expense'
}

export type WalletType = 'cash' | 'online';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  icon: string; // name of Lucide icon
}

export type DebtType = 'to_pay' | 'to_collect'; // nợ phải trả | nợ thu hồi (cho vay)
export type RepaymentMethod = 'emi' | 'reducing_balance'; // trả đều EMI | dư nợ giảm dần

export interface Debt {
  id: string;
  name: string;
  amount: number; // Số tiền gốc
  interestRate: number; // Lãi suất năm (%)
  termMonths: number; // Kỳ hạn (tháng)
  startDate: string; // Ngày bắt đầu
  type: DebtType;
  status: 'active' | 'paid';
  repaymentMethod: RepaymentMethod;
  notes?: string;
}

// --- Recurring Transactions ---
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';
export type RecurringStatus = 'active' | 'paused' | 'completed';

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  walletId: string;
  note: string;
  frequency: RecurringFrequency;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD – nếu có thì hết ngày này sẽ tự completed
  lastExecutedDate?: string; // YYYY-MM-DD – ngày cuối cùng đã tạo transaction
  totalOccurrences?: number; // giới hạn số lần (dùng cho kịch bản n tháng)
  executedCount: number; // số lần đã thực thi
  status: RecurringStatus;
}

// --- Savings Goals ---
export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  email?: string;
}

export interface MonthlySummary {
  monthId: string; // e.g. "2026-05"
  totalIncome: number;
  totalExpense: number;
  categories: {
    [catId: string]: {
      name: string;
      budget: number;
      spent: number;
    }
  };
  aiComment: string;
}

export interface YearlySummary {
  yearId: string; // e.g. "2026"
  totalIncome: number;
  totalExpense: number;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  debts: Debt[];
  recurringTransactions: RecurringTransaction[];
  savingsGoals: SavingsGoal[];
  user: UserProfile;
  theme: 'light' | 'dark';
}
