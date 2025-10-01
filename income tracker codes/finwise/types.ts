export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category_id: string;
  date: string;
  created_at: string;
  categories: { name: string } | null; // For joined data
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}

export enum FilterType {
    All = 'all',
    Income = 'income',
    Expense = 'expense'
}

// FIX: Export NegativeBalanceBehavior enum to resolve import error.
export enum NegativeBalanceBehavior {
    Warn = 'warn',
    Block = 'block',
    Allow = 'allow'
}
