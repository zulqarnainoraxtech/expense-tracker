import { ExpenseTrackerData, MonthlyData } from "@/types/expense";

export const STORAGE_KEY = "expense-tracker-data";

/**
 * Removes any legacy or stale data stored in localStorage so that
 * all data is strictly fetched from and stored in MongoDB Atlas.
 */
export function clearLegacyLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Could not clear legacy localStorage item:", error);
  }
}

/**
 * Retrieves data for a specific month (e.g. "2026-10") from in-memory state.
 */
export function getMonthData(data: ExpenseTrackerData, monthKey: string): MonthlyData {
  const existing = data[monthKey];
  if (existing) {
    return {
      income: Array.isArray(existing.income) ? existing.income : [],
      expenses: Array.isArray(existing.expenses) ? existing.expenses : [],
      budget: existing.budget,
    };
  }

  return {
    income: [],
    expenses: [],
    budget: undefined,
  };
}

/**
 * Validates external JSON data before importing to MongoDB.
 */
export function validateImportData(jsonContent: unknown): { isValid: boolean; data?: ExpenseTrackerData; error?: string } {
  if (!jsonContent || typeof jsonContent !== "object" || Array.isArray(jsonContent)) {
    return { isValid: false, error: "Root element must be a valid JSON object." };
  }

  const result: ExpenseTrackerData = {};
  const entries = Object.entries(jsonContent as Record<string, unknown>);

  for (const [key, value] of entries) {
    // Check key format YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(key)) {
      return {
        isValid: false,
        error: `Invalid month key "${key}". Expected format: YYYY-MM (e.g. 2026-10).`,
      };
    }

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { isValid: false, error: `Invalid monthly data structure for "${key}".` };
    }

    const m = value as Record<string, unknown>;
    const expenses = Array.isArray(m.expenses) ? m.expenses : [];
    const income = Array.isArray(m.income) ? m.income : [];
    const budget = typeof m.budget === "number" ? m.budget : undefined;

    result[key] = {
      income: income as MonthlyData["income"],
      expenses: expenses as MonthlyData["expenses"],
      budget,
    };
  }

  return { isValid: true, data: result };
}
