"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Expense,
  Income,
  MonthlyData,
  ExpenseTrackerData,
} from "@/types/expense";
import {
  getStoredData,
  saveStoredData,
  getMonthData,
  validateImportData,
} from "@/lib/storage";

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMonthDisplay(monthKey: string): string {
  try {
    const [year, month] = monthKey.split("-").map(Number);
    if (!year || !month) return monthKey;
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return monthKey;
  }
}

export function useExpenseTracker() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<string>(() => getCurrentMonthKey());
  const [data, setData] = useState<ExpenseTrackerData>({});

  // Safe client-side hydration
  useEffect(() => {
    const stored = getStoredData();
    setData(stored);
    setIsLoaded(true);
  }, []);

  // Write changes to storage
  const updateStore = useCallback((updater: (prev: ExpenseTrackerData) => ExpenseTrackerData) => {
    setData((prev) => {
      const next = updater(prev);
      saveStoredData(next);
      return next;
    });
  }, []);

  // Navigation handlers
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((curr) => {
      const [year, month] = curr.split("-").map(Number);
      const date = new Date(year, month - 1 - 1, 1);
      const nextY = date.getFullYear();
      const nextM = String(date.getMonth() + 1).padStart(2, "0");
      return `${nextY}-${nextM}`;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((curr) => {
      const [year, month] = curr.split("-").map(Number);
      const date = new Date(year, month - 1 + 1, 1);
      const nextY = date.getFullYear();
      const nextM = String(date.getMonth() + 1).padStart(2, "0");
      return `${nextY}-${nextM}`;
    });
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setCurrentMonth(getCurrentMonthKey());
  }, []);

  // Current month slice
  const monthData: MonthlyData = useMemo(() => {
    return getMonthData(data, currentMonth);
  }, [data, currentMonth]);

  const expenses = monthData.expenses;
  const income = monthData.income;
  const budget = monthData.budget;

  // Dynamically calculated metrics
  const totalIncome = useMemo(() => {
    return income.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  }, [income]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  }, [expenses]);

  const balance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    if (expenses.length === 0) return [];

    const map = new Map<string, { total: number; count: number }>();
    for (const exp of expenses) {
      const cat = exp.category || "Other";
      const existing = map.get(cat) || { total: 0, count: 0 };
      map.set(cat, {
        total: existing.total + (Number(exp.amount) || 0),
        count: existing.count + 1,
      });
    }

    const items = Array.from(map.entries()).map(([category, stats]) => {
      const percentage =
        totalExpenses > 0 ? (stats.total / totalExpenses) * 100 : 0;
      return {
        category,
        total: stats.total,
        percentage: Math.round(percentage * 10) / 10,
        count: stats.count,
      };
    });

    // Sort descending by highest spending
    return items.sort((a, b) => b.total - a.total);
  }, [expenses, totalExpenses]);

  // Budget calculations
  const budgetRemaining = budget !== undefined ? budget - totalExpenses : undefined;
  const budgetPercentage =
    budget && budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;
  const isOverBudget = budget !== undefined && totalExpenses > budget;

  // Helper to extract the month key from a date string (YYYY-MM-DD -> YYYY-MM)
  const getMonthKeyFromDate = (dateStr: string) => {
    if (/^\d{4}-\d{2}/.test(dateStr)) {
      return dateStr.slice(0, 7);
    }
    return currentMonth;
  };

  // CRUD for Expenses
  const addExpense = useCallback(
    (expenseData: Omit<Expense, "id" | "createdAt">) => {
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}-${Math.random()}`;
      const newExpense: Expense = {
        ...expenseData,
        id,
        createdAt: new Date().toISOString(),
      };

      const targetMonth = getMonthKeyFromDate(newExpense.date);

      updateStore((prev) => {
        const existingMonth = getMonthData(prev, targetMonth);
        return {
          ...prev,
          [targetMonth]: {
            ...existingMonth,
            expenses: [newExpense, ...existingMonth.expenses],
          },
        };
      });

      return newExpense;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStore, currentMonth]
  );

  const updateExpense = useCallback(
    (id: string, updated: Partial<Omit<Expense, "id" | "createdAt">>) => {
      updateStore((prev) => {
        // Find in current data
        let foundExpense: Expense | undefined;
        let originalMonth = currentMonth;

        for (const [mKey, mVal] of Object.entries(prev)) {
          const match = mVal.expenses.find((e) => e.id === id);
          if (match) {
            foundExpense = match;
            originalMonth = mKey;
            break;
          }
        }

        if (!foundExpense) return prev;

        const merged: Expense = {
          ...foundExpense,
          ...updated,
        };

        const targetMonth = getMonthKeyFromDate(merged.date);

        // If target month is the same
        if (targetMonth === originalMonth) {
          const monthObj = getMonthData(prev, originalMonth);
          return {
            ...prev,
            [originalMonth]: {
              ...monthObj,
              expenses: monthObj.expenses.map((e) => (e.id === id ? merged : e)),
            },
          };
        } else {
          // Moved to different month
          const srcMonthObj = getMonthData(prev, originalMonth);
          const destMonthObj = getMonthData(prev, targetMonth);

          return {
            ...prev,
            [originalMonth]: {
              ...srcMonthObj,
              expenses: srcMonthObj.expenses.filter((e) => e.id !== id),
            },
            [targetMonth]: {
              ...destMonthObj,
              expenses: [merged, ...destMonthObj.expenses],
            },
          };
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStore, currentMonth]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      updateStore((prev) => {
        const next = { ...prev };
        let modified = false;

        for (const [mKey, mVal] of Object.entries(next)) {
          if (mVal.expenses.some((e) => e.id === id)) {
            next[mKey] = {
              ...mVal,
              expenses: mVal.expenses.filter((e) => e.id !== id),
            };
            modified = true;
            break;
          }
        }

        return modified ? next : prev;
      });
    },
    [updateStore]
  );

  // CRUD for Income
  const addIncome = useCallback(
    (incomeData: Omit<Income, "id" | "createdAt">) => {
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `inc-${Date.now()}-${Math.random()}`;
      const newIncome: Income = {
        ...incomeData,
        id,
        createdAt: new Date().toISOString(),
      };

      const targetMonth = getMonthKeyFromDate(newIncome.date);

      updateStore((prev) => {
        const existingMonth = getMonthData(prev, targetMonth);
        return {
          ...prev,
          [targetMonth]: {
            ...existingMonth,
            income: [newIncome, ...existingMonth.income],
          },
        };
      });

      return newIncome;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStore, currentMonth]
  );

  const updateIncome = useCallback(
    (id: string, updated: Partial<Omit<Income, "id" | "createdAt">>) => {
      updateStore((prev) => {
        let foundIncome: Income | undefined;
        let originalMonth = currentMonth;

        for (const [mKey, mVal] of Object.entries(prev)) {
          const match = mVal.income.find((i) => i.id === id);
          if (match) {
            foundIncome = match;
            originalMonth = mKey;
            break;
          }
        }

        if (!foundIncome) return prev;

        const merged: Income = {
          ...foundIncome,
          ...updated,
        };

        const targetMonth = getMonthKeyFromDate(merged.date);

        if (targetMonth === originalMonth) {
          const monthObj = getMonthData(prev, originalMonth);
          return {
            ...prev,
            [originalMonth]: {
              ...monthObj,
              income: monthObj.income.map((i) => (i.id === id ? merged : i)),
            },
          };
        } else {
          const srcMonthObj = getMonthData(prev, originalMonth);
          const destMonthObj = getMonthData(prev, targetMonth);

          return {
            ...prev,
            [originalMonth]: {
              ...srcMonthObj,
              income: srcMonthObj.income.filter((i) => i.id !== id),
            },
            [targetMonth]: {
              ...destMonthObj,
              income: [merged, ...destMonthObj.income],
            },
          };
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStore, currentMonth]
  );

  const deleteIncome = useCallback(
    (id: string) => {
      updateStore((prev) => {
        const next = { ...prev };
        let modified = false;

        for (const [mKey, mVal] of Object.entries(next)) {
          if (mVal.income.some((i) => i.id === id)) {
            next[mKey] = {
              ...mVal,
              income: mVal.income.filter((i) => i.id !== id),
            };
            modified = true;
            break;
          }
        }

        return modified ? next : prev;
      });
    },
    [updateStore]
  );

  // Budget management
  const setBudget = useCallback(
    (amount: number | undefined) => {
      updateStore((prev) => {
        const existingMonth = getMonthData(prev, currentMonth);
        return {
          ...prev,
          [currentMonth]: {
            ...existingMonth,
            budget: amount,
          },
        };
      });
    },
    [updateStore, currentMonth]
  );

  // Backup / Restore
  const exportBackupJSON = useCallback(() => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `expense-tracker-backup-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  const importBackupJSON = useCallback(
    (jsonContent: unknown) => {
      const validation = validateImportData(jsonContent);
      if (!validation.isValid || !validation.data) {
        return { success: false, error: validation.error || "Invalid file format." };
      }

      updateStore(() => validation.data!);
      return { success: true };
    },
    [updateStore]
  );

  return {
    isLoaded,
    currentMonth,
    setCurrentMonth,
    displayMonth: formatMonthDisplay(currentMonth),
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    monthData,
    expenses,
    income,
    budget,
    totalIncome,
    totalExpenses,
    balance,
    categoryBreakdown,
    budgetRemaining,
    budgetPercentage,
    isOverBudget,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    setBudget,
    exportBackupJSON,
    importBackupJSON,
  };
}
