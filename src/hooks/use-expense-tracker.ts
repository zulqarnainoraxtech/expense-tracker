"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Expense,
  Income,
  MonthlyData,
  ExpenseTrackerData,
} from "@/types/expense";
import {
  clearLegacyLocalStorage,
  getMonthData,
  validateImportData,
} from "@/lib/storage";
import {
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
  createIncomeApi,
  updateIncomeApi,
  deleteIncomeApi,
  saveBudgetApi,
  fetchAllSyncDataApi,
  syncAllDataToApi,
} from "@/lib/api-client";

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
  const [dbError, setDbError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(() => getCurrentMonthKey());
  const [data, setData] = useState<ExpenseTrackerData>({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Clear any legacy localStorage and load exclusively from MongoDB Atlas
  const loadDatabaseData = useCallback(async () => {
    setIsLoaded(false);
    setDbError(null);

    // Delete any old localStorage data to ensure no offline/stale cache is used
    clearLegacyLocalStorage();

    try {
      const dbData = await fetchAllSyncDataApi();
      setData(dbData || {});
      setDbError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect to database";
      console.error("Database connection error:", message);
      setDbError(message);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

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

    return items.sort((a, b) => b.total - a.total);
  }, [expenses, totalExpenses]);

  // Budget calculations
  const budgetRemaining = budget !== undefined ? budget - totalExpenses : undefined;
  const budgetPercentage =
    budget && budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;
  const isOverBudget = budget !== undefined && totalExpenses > budget;

  const getMonthKeyFromDate = (dateStr: string) => {
    if (/^\d{4}-\d{2}/.test(dateStr)) {
      return dateStr.slice(0, 7);
    }
    return currentMonth;
  };

  // CRUD for Expenses (Database only)
  const addExpense = useCallback(
    async (expenseData: Omit<Expense, "id" | "createdAt">) => {
      // Direct call to MongoDB Atlas API
      const created = await createExpenseApi(expenseData);
      const targetMonth = getMonthKeyFromDate(created.date);

      setData((prev) => {
        const existingMonth = getMonthData(prev, targetMonth);
        return {
          ...prev,
          [targetMonth]: {
            ...existingMonth,
            expenses: [created, ...existingMonth.expenses.filter((e) => e.id !== created.id)],
          },
        };
      });

      return created;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentMonth]
  );

  const updateExpense = useCallback(
    async (id: string, updated: Partial<Omit<Expense, "id" | "createdAt">>) => {
      const saved = await updateExpenseApi(id, updated);

      setData((prev) => {
        let originalMonth = currentMonth;
        for (const [mKey, mVal] of Object.entries(prev)) {
          if (mVal.expenses.some((e) => e.id === id)) {
            originalMonth = mKey;
            break;
          }
        }

        const targetMonth = getMonthKeyFromDate(saved.date);

        if (targetMonth === originalMonth) {
          const monthObj = getMonthData(prev, originalMonth);
          return {
            ...prev,
            [originalMonth]: {
              ...monthObj,
              expenses: monthObj.expenses.map((e) => (e.id === id ? saved : e)),
            },
          };
        } else {
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
              expenses: [saved, ...destMonthObj.expenses.filter((e) => e.id !== id)],
            },
          };
        }
      });

      return saved;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentMonth]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await deleteExpenseApi(id);

      setData((prev) => {
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
    []
  );

  // CRUD for Income (Database only)
  const addIncome = useCallback(
    async (incomeData: Omit<Income, "id" | "createdAt">) => {
      const created = await createIncomeApi(incomeData);
      const targetMonth = getMonthKeyFromDate(created.date);

      setData((prev) => {
        const existingMonth = getMonthData(prev, targetMonth);
        return {
          ...prev,
          [targetMonth]: {
            ...existingMonth,
            income: [created, ...existingMonth.income.filter((i) => i.id !== created.id)],
          },
        };
      });

      return created;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentMonth]
  );

  const updateIncome = useCallback(
    async (id: string, updated: Partial<Omit<Income, "id" | "createdAt">>) => {
      const saved = await updateIncomeApi(id, updated);

      setData((prev) => {
        let originalMonth = currentMonth;
        for (const [mKey, mVal] of Object.entries(prev)) {
          if (mVal.income.some((i) => i.id === id)) {
            originalMonth = mKey;
            break;
          }
        }

        const targetMonth = getMonthKeyFromDate(saved.date);

        if (targetMonth === originalMonth) {
          const monthObj = getMonthData(prev, originalMonth);
          return {
            ...prev,
            [originalMonth]: {
              ...monthObj,
              income: monthObj.income.map((i) => (i.id === id ? saved : i)),
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
              income: [saved, ...destMonthObj.income.filter((i) => i.id !== id)],
            },
          };
        }
      });

      return saved;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentMonth]
  );

  const deleteIncome = useCallback(
    async (id: string) => {
      await deleteIncomeApi(id);

      setData((prev) => {
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
    []
  );

  // Budget management (Database only)
  const setBudget = useCallback(
    async (amount: number | undefined) => {
      if (amount !== undefined) {
        await saveBudgetApi(currentMonth, amount);
      }

      setData((prev) => {
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
    [currentMonth]
  );

  // Backup / Restore (Backed by Database)
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
    async (jsonContent: unknown) => {
      const validation = validateImportData(jsonContent);
      if (!validation.isValid || !validation.data) {
        return { success: false, error: validation.error || "Invalid file format." };
      }

      setIsSyncing(true);
      try {
        await syncAllDataToApi(validation.data);
        const freshData = await fetchAllSyncDataApi();
        setData(freshData || {});
        return { success: true };
      } catch (err) {
        console.error("Failed to sync imported backup to database:", err);
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to sync backup to MongoDB",
        };
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  return {
    isLoaded,
    dbError,
    refreshData: loadDatabaseData,
    isSyncing,
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
