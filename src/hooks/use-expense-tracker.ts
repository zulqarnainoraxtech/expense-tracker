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
import {
  fetchExpensesApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
  fetchIncomeApi,
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
  const [currentMonth, setCurrentMonth] = useState<string>(() => getCurrentMonthKey());
  const [data, setData] = useState<ExpenseTrackerData>({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from MongoDB Atlas on mount, falling back gracefully to localStorage if offline
  useEffect(() => {
    let isMounted = true;

    async function initializeData() {
      // 1. Initial fast display from localStorage
      const localData = getStoredData();
      if (isMounted && Object.keys(localData).length > 0) {
        setData(localData);
      }

      // 2. Fetch fresh source-of-truth from MongoDB Atlas
      try {
        const dbData = await fetchAllSyncDataApi();
        if (!isMounted) return;

        // If DB has data, load it into state and cache in localStorage
        if (Object.keys(dbData).length > 0) {
          setData(dbData);
          saveStoredData(dbData);
        } else if (Object.keys(localData).length > 0) {
          // If DB is brand new/empty but user had existing local data, migrate local data to Atlas
          await syncAllDataToApi(localData).catch(console.error);
        }
      } catch (err) {
        console.warn("Could not connect to MongoDB Atlas backend, using local cache:", err);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    }

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update in-memory state and local cache
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

  // CRUD for Expenses (Database + Local Store)
  const addExpense = useCallback(
    async (expenseData: Omit<Expense, "id" | "createdAt">) => {
      // Optimistic temporary item
      const tempId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}`;
      const tempExpense: Expense = {
        ...expenseData,
        id: tempId,
        createdAt: new Date().toISOString(),
      };

      const targetMonth = getMonthKeyFromDate(tempExpense.date);

      updateStore((prev) => {
        const existingMonth = getMonthData(prev, targetMonth);
        return {
          ...prev,
          [targetMonth]: {
            ...existingMonth,
            expenses: [tempExpense, ...existingMonth.expenses],
          },
        };
      });

      // Save to MongoDB Atlas via API
      try {
        const created = await createExpenseApi(expenseData);
        // Replace optimistic item with server MongoDB document
        updateStore((prev) => {
          const existingMonth = getMonthData(prev, targetMonth);
          return {
            ...prev,
            [targetMonth]: {
              ...existingMonth,
              expenses: existingMonth.expenses.map((e) => (e.id === tempId ? created : e)),
            },
          };
        });
        return created;
      } catch (err) {
        console.error("Failed to persist expense to MongoDB Atlas:", err);
        return tempExpense;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStore, currentMonth]
  );

  const updateExpense = useCallback(
    async (id: string, updated: Partial<Omit<Expense, "id" | "createdAt">>) => {
      updateStore((prev) => {
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

      // Call database update if ID is a valid MongoDB ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        await updateExpenseApi(id, updated).catch(console.error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStore, currentMonth]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
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

      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        await deleteExpenseApi(id).catch(console.error);
      }
    },
    [updateStore]
  );

  // CRUD for Income (Database + Local Store)
  const addIncome = useCallback(
    async (incomeData: Omit<Income, "id" | "createdAt">) => {
      const tempId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `inc-${Date.now()}`;
      const tempIncome: Income = {
        ...incomeData,
        id: tempId,
        createdAt: new Date().toISOString(),
      };

      const targetMonth = getMonthKeyFromDate(tempIncome.date);

      updateStore((prev) => {
        const existingMonth = getMonthData(prev, targetMonth);
        return {
          ...prev,
          [targetMonth]: {
            ...existingMonth,
            income: [tempIncome, ...existingMonth.income],
          },
        };
      });

      try {
        const created = await createIncomeApi(incomeData);
        updateStore((prev) => {
          const existingMonth = getMonthData(prev, targetMonth);
          return {
            ...prev,
            [targetMonth]: {
              ...existingMonth,
              income: existingMonth.income.map((i) => (i.id === tempId ? created : i)),
            },
          };
        });
        return created;
      } catch (err) {
        console.error("Failed to persist income to MongoDB Atlas:", err);
        return tempIncome;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStore, currentMonth]
  );

  const updateIncome = useCallback(
    async (id: string, updated: Partial<Omit<Income, "id" | "createdAt">>) => {
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

      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        await updateIncomeApi(id, updated).catch(console.error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStore, currentMonth]
  );

  const deleteIncome = useCallback(
    async (id: string) => {
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

      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        await deleteIncomeApi(id).catch(console.error);
      }
    },
    [updateStore]
  );

  // Budget management
  const setBudget = useCallback(
    async (amount: number | undefined) => {
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

      if (amount !== undefined) {
        await saveBudgetApi(currentMonth, amount).catch(console.error);
      }
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
    async (jsonContent: unknown) => {
      const validation = validateImportData(jsonContent);
      if (!validation.isValid || !validation.data) {
        return { success: false, error: validation.error || "Invalid file format." };
      }

      setIsSyncing(true);
      try {
        await syncAllDataToApi(validation.data);
        updateStore(() => validation.data!);
        return { success: true };
      } catch (err) {
        console.error("Failed to sync imported backup to database:", err);
        // Still save locally even if network fails
        updateStore(() => validation.data!);
        return { success: true };
      } finally {
        setIsSyncing(false);
      }
    },
    [updateStore]
  );

  return {
    isLoaded,
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
