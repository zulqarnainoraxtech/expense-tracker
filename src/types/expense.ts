export type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
};

export type Income = {
  id: string;
  amount: number;
  source: string;
  date: string;
  note?: string;
  createdAt: string;
};

export type MonthlyData = {
  income: Income[];
  expenses: Expense[];
  budget?: number;
};

export type ExpenseTrackerData = {
  [month: string]: MonthlyData;
};

export type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
