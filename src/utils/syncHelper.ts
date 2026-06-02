// Mapper utility to convert camelCase local structures to snake_case Supabase structures and vice versa.

import type {
  Transaction, Category, Wallet, Debt,
  RecurringTransaction, SavingsGoal, MonthlySummary, YearlySummary
} from '../types';

// Helper to convert keys from snake_case to camelCase
export const snakeToCamel = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (typeof obj === 'object') {
    const n: any = {};
    Object.keys(obj).forEach(k => {
      const camelKey = k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      n[camelKey] = snakeToCamel(obj[k]);
    });
    return n;
  }
  return obj;
};

// Helper to convert keys from camelCase to snake_case
export const camelToSnake = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (typeof obj === 'object') {
    const n: any = {};
    Object.keys(obj).forEach(k => {
      const snakeKey = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      n[snakeKey] = camelToSnake(obj[k]);
    });
    return n;
  }
  return obj;
};

// --- TRANSACTION MAPPER ---
export const mapTransactionToDb = (tx: Transaction, userId: string) => ({
  id: tx.id,
  user_id: userId,
  amount: tx.amount,
  type: tx.type,
  category_id: tx.categoryId,
  wallet_id: tx.walletId,
  date: tx.date,
  note: tx.note,
  recurring_id: tx.recurringId || null,
  updated_at: tx.updatedAt || Date.now(),
  is_deleted: tx.isDeleted || false
});

export const mapTransactionFromDb = (row: any): Transaction => ({
  id: row.id,
  amount: Number(row.amount),
  type: row.type,
  categoryId: row.category_id,
  walletId: row.wallet_id,
  date: row.date,
  note: row.note,
  recurringId: row.recurring_id || undefined,
  updatedAt: Number(row.updated_at),
  isDeleted: row.is_deleted
});

// --- CATEGORY MAPPER ---
export const mapCategoryToDb = (cat: Category, userId: string) => ({
  id: cat.id,
  user_id: userId,
  name: cat.name,
  icon: cat.icon,
  color: cat.color,
  budget: cat.budget,
  type: cat.type,
  updated_at: cat.updatedAt || Date.now(),
  is_deleted: cat.isDeleted || false
});

export const mapCategoryFromDb = (row: any): Category => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  budget: Number(row.budget),
  type: row.type,
  updatedAt: Number(row.updated_at),
  isDeleted: row.is_deleted
});

// --- WALLET MAPPER ---
export const mapWalletToDb = (w: Wallet, userId: string) => ({
  id: w.id,
  user_id: userId,
  name: w.name,
  type: w.type,
  balance: w.balance,
  icon: w.icon,
  updated_at: w.updatedAt || Date.now(),
  is_deleted: w.isDeleted || false
});

export const mapWalletFromDb = (row: any): Wallet => ({
  id: row.id,
  name: row.name,
  type: row.type,
  balance: Number(row.balance),
  icon: row.icon,
  updatedAt: Number(row.updated_at),
  isDeleted: row.is_deleted
});

// --- DEBT MAPPER ---
export const mapDebtToDb = (d: Debt, userId: string) => ({
  id: d.id,
  user_id: userId,
  name: d.name,
  amount: d.amount,
  interest_rate: d.interestRate,
  term_months: d.termMonths,
  start_date: d.startDate,
  type: d.type,
  status: d.status,
  repayment_method: d.repaymentMethod,
  notes: d.notes || null,
  updated_at: d.updatedAt || Date.now(),
  is_deleted: d.isDeleted || false
});

export const mapDebtFromDb = (row: any): Debt => ({
  id: row.id,
  name: row.name,
  amount: Number(row.amount),
  interestRate: Number(row.interest_rate),
  termMonths: Number(row.term_months),
  startDate: row.start_date,
  type: row.type,
  status: row.status,
  repaymentMethod: row.repayment_method,
  notes: row.notes || undefined,
  updatedAt: Number(row.updated_at),
  isDeleted: row.is_deleted
});

// --- RECURRING TRANSACTION MAPPER ---
export const mapRecurringToDb = (rt: RecurringTransaction, userId: string) => ({
  id: rt.id,
  user_id: userId,
  amount: rt.amount,
  type: rt.type,
  category_id: rt.categoryId,
  wallet_id: rt.walletId,
  note: rt.note,
  frequency: rt.frequency,
  start_date: rt.startDate,
  end_date: rt.endDate || null,
  last_executed_date: rt.lastExecutedDate || null,
  total_occurrences: rt.totalOccurrences || null,
  executed_count: rt.executedCount,
  status: rt.status,
  updated_at: rt.updatedAt || Date.now(),
  is_deleted: rt.isDeleted || false
});

export const mapRecurringFromDb = (row: any): RecurringTransaction => ({
  id: row.id,
  amount: Number(row.amount),
  type: row.type,
  categoryId: row.category_id,
  walletId: row.wallet_id,
  note: row.note,
  frequency: row.frequency,
  startDate: row.start_date,
  endDate: row.end_date || undefined,
  lastExecutedDate: row.last_executed_date || undefined,
  totalOccurrences: row.total_occurrences || undefined,
  executedCount: Number(row.executed_count),
  status: row.status,
  updatedAt: Number(row.updated_at),
  isDeleted: row.is_deleted
});

// --- SAVINGS GOAL MAPPER ---
export const mapSavingsGoalToDb = (sg: SavingsGoal, userId: string) => ({
  id: sg.id,
  user_id: userId,
  name: sg.name,
  icon: sg.icon,
  color: sg.color,
  target_amount: sg.targetAmount,
  current_amount: sg.currentAmount,
  deadline: sg.deadline || null,
  notes: sg.notes || null,
  created_at: sg.createdAt,
  updated_at: sg.updatedAt || Date.now(),
  is_deleted: sg.isDeleted || false
});

export const mapSavingsGoalFromDb = (row: any): SavingsGoal => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  targetAmount: Number(row.target_amount),
  currentAmount: Number(row.current_amount),
  deadline: row.deadline || undefined,
  notes: row.notes || undefined,
  createdAt: row.created_at,
  updatedAt: Number(row.updated_at),
  isDeleted: row.is_deleted
});

// --- MONTHLY SUMMARY MAPPER ---
export const mapMonthlySummaryToDb = (ms: MonthlySummary, userId: string) => ({
  id: `${userId}:${ms.monthId}`,
  user_id: userId,
  month_id: ms.monthId,
  total_income: ms.totalIncome,
  total_expense: ms.totalExpense,
  categories: ms.categories,
  ai_comment: ms.aiComment,
  updated_at: ms.updatedAt || Date.now(),
  is_deleted: ms.isDeleted || false
});

export const mapMonthlySummaryFromDb = (row: any): MonthlySummary => ({
  monthId: row.month_id,
  totalIncome: Number(row.total_income),
  totalExpense: Number(row.total_expense),
  categories: row.categories,
  aiComment: row.ai_comment,
  updatedAt: Number(row.updated_at),
  isDeleted: row.is_deleted
});

// --- YEARLY SUMMARY MAPPER ---
export const mapYearlySummaryToDb = (ys: YearlySummary, userId: string) => ({
  id: `${userId}:${ys.yearId}`,
  user_id: userId,
  year_id: ys.yearId,
  total_income: ys.totalIncome,
  total_expense: ys.totalExpense,
  updated_at: ys.updatedAt || Date.now(),
  is_deleted: ys.isDeleted || false
});

export const mapYearlySummaryFromDb = (row: any): YearlySummary => ({
  yearId: row.year_id,
  totalIncome: Number(row.total_income),
  totalExpense: Number(row.total_expense),
  updatedAt: Number(row.updated_at),
  isDeleted: row.is_deleted
});
