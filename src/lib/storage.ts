import { ExpenseTrackerData, MonthlyData } from "@/types/expense";

export const STORAGE_KEY = "expense-tracker-data";

/**
 * Safely retrieves all expense tracker data from localStorage.
 * Returns an empty object if running on the server or if stored data is empty/corrupt.
 */
export function getStoredData(): ExpenseTrackerData {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      console.warn("Invalid data structure in localStorage, returning empty data.");
      return {};
    }

    // Validate that monthly keys contain valid objects
    const cleaned: ExpenseTrackerData = {};
    for (const [monthKey, value] of Object.entries(parsed)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const valObj = value as Record<string, unknown>;
        cleaned[monthKey] = {
          income: Array.isArray(valObj.income) ? (valObj.income as MonthlyData["income"]) : [],
          expenses: Array.isArray(valObj.expenses) ? (valObj.expenses as MonthlyData["expenses"]) : [],
          budget: typeof valObj.budget === "number" ? valObj.budget : undefined,
        };
      }
    }

    return cleaned;
  } catch (error) {
    console.error("Failed to parse expense tracker data from localStorage:", error);
    return {};
  }
}

/**
 * Saves all tracker data to localStorage.
 */
export function saveStoredData(data: ExpenseTrackerData): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save expense tracker data to localStorage:", error);
    return false;
  }
}

/**
 * Retrieves data for a specific month (e.g. "2026-10").
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
 * Validates external JSON data before importing.
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
