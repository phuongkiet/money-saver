export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  walletId: string;
  date: string;
  note: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // name of Lucide icon
  color: string; // Hex color code
  budget: number; // monthly limit (0 means no limit)
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
  user: UserProfile;
  theme: 'light' | 'dark';
}
