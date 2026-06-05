export interface Syncable {
  updatedAt?: number;
  isDeleted?: boolean;
  pendingSync?: boolean;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction extends Syncable {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string; // Tên category lưu tại thời điểm tạo transaction (snapshot)
  walletId: string;
  date: string;
  note: string;
  recurringId?: string; // link về recurring transaction gốc
}

export interface Category extends Syncable {
  id: string;
  name: string;
  icon: string; // name of Lucide icon
  color: string; // Hex color code
  budget: number; // monthly limit (0 means no limit)
  type: TransactionType; // 'income' or 'expense'
}

export type WalletType = 'cash' | 'online';

export interface Wallet extends Syncable {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  icon: string; // name of Lucide icon
}

export type DebtType = 'to_pay' | 'to_collect'; // nợ phải trả | nợ thu hồi (cho vay)
export type RepaymentMethod = 'emi' | 'reducing_balance'; // trả đều EMI | dư nợ giảm dần

export interface Debt extends Syncable {
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
  linkedCategoryId?: string; // Link đến category nợ/vay liên kết
}

// --- Recurring Transactions ---
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly';
export type RecurringStatus = 'active' | 'paused' | 'completed';

export interface RecurringTransaction extends Syncable {
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
export interface SavingsGoal extends Syncable {
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
  gender?: 'male' | 'female';
}


export interface MonthlySummary extends Syncable {
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

export interface YearlySummary extends Syncable {
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

// === Companion App Data Models ===

export interface PartnerBasicInfo {
  nickname: string;
  birthday: string; // YYYY-MM-DD
  shirtSize: string;
  pantsSize: string;
  ringSize: string;
  notes: string;
  updatedAt?: number;
  pendingSync?: boolean;
}

export interface PartnerPreference {
  id: string;
  category: 'game' | 'sport' | 'book' | 'food' | 'music' | 'movie' | 'travel' | 'hobby' | 'other';
  content: string;
  updatedAt?: number;
  pendingSync?: boolean;
}

export interface PartnerDislike {
  id: string;
  category: 'food' | 'drink' | 'topic' | 'behavior' | 'place' | 'other';
  content: string;
  updatedAt?: number;
  pendingSync?: boolean;
}

export type AppointmentCategory = 'date' | 'anniversary' | 'health' | 'movie' | 'travel' | 'other';

export interface PartnerAppointment {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location?: string;
  category: AppointmentCategory;
  notes?: string;
  isCompleted?: boolean;
  updatedAt?: number;
  pendingSync?: boolean;
}

export interface SpecialDate {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD (e.g. 2020-10-15) or MM-DD
  isRecurring: boolean; // lặp lại hằng năm
  notes?: string;
  updatedAt?: number;
  pendingSync?: boolean;
}

export interface GiftIdea {
  id: string;
  name: string;
  price?: number;
  priority: 'high' | 'medium' | 'low';
  link?: string;
  isPurchased: boolean;
  notes?: string;
  updatedAt?: number;
  pendingSync?: boolean;
}

export interface CycleEntry {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  mood?: 'happy' | 'neutral' | 'sad' | 'irritable' | 'anxious';
  symptoms?: ('cramps' | 'bloating' | 'headache' | 'fatigue' | 'acne' | 'tender_breasts')[];
  notes?: string;
}

export interface MenstrualData {
  avgCycleLength: number; // default 28
  avgPeriodLength: number; // default 5
  isIrregular: boolean;
  cycleLog: CycleEntry[];
  dailyLog: DailyEntry[];
  // Legacy / Compatibility fields
  lastPeriodDate?: string;
  cycleLength?: number;
  periodLength?: number;
  updatedAt?: number;
  pendingSync?: boolean;
}


